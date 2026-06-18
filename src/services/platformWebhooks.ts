/**
 * Platform webhooks façade — endpoint CRUD and outbound event delivery.
 */

import { randomBytes, randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { throwIfMissingTable } from "@/lib/db-errors";
import {
  buildPlatformEventPayload,
  isValidWebhookUrl,
  normalizeWebhookEvents,
  shouldDeliverEvent,
  signWebhookPayload,
  type PlatformEventType,
  type PlatformWebhookPayload,
} from "./platformWebhookEngine";

export type PlatformWebhookEndpointRow = {
  id: string;
  name: string;
  url: string;
  events: PlatformEventType[];
  enabled: boolean;
  createdAt: string;
};

export type PlatformWebhookDeliveryRow = {
  id: string;
  endpointId: string | null;
  eventType: PlatformEventType;
  status: string;
  responseCode: number | null;
  error: string | null;
  deliveredAt: string;
};

async function getOrgContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organisation_id) throw new Error("No organisation");
  return { supabase, orgId: profile.organisation_id as string };
}

function generateWebhookSecret(): string {
  return randomBytes(24).toString("base64url");
}

export async function listPlatformWebhookEndpoints(): Promise<PlatformWebhookEndpointRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("platform_webhook_endpoints")
    .select("id, name, url, events, enabled, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") return [];
    throwIfMissingTable(error, "platform_webhook_endpoints");
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    url: String(row.url),
    events: normalizeWebhookEvents((row.events as string[]) ?? []),
    enabled: Boolean(row.enabled),
    createdAt: String(row.created_at),
  }));
}

export async function createPlatformWebhookEndpoint(input: {
  name: string;
  url: string;
  events: string[];
}): Promise<{ endpoint: PlatformWebhookEndpointRow; secret: string }> {
  const { supabase, orgId } = await getOrgContext();
  const name = input.name.trim();
  const url = input.url.trim();
  if (!name) throw new Error("Webhook name required");
  if (!isValidWebhookUrl(url)) throw new Error("Valid https URL required");

  const secret = generateWebhookSecret();
  const events = normalizeWebhookEvents(input.events);

  const { data, error } = await supabase
    .from("platform_webhook_endpoints")
    .insert({
      organisation_id: orgId,
      name,
      url,
      secret,
      events,
    })
    .select("id, name, url, events, enabled, created_at")
    .single();

  if (error) {
    throwIfMissingTable(error, "platform_webhook_endpoints");
    throw error;
  }

  return {
    secret,
    endpoint: {
      id: String(data.id),
      name: String(data.name),
      url: String(data.url),
      events: normalizeWebhookEvents((data.events as string[]) ?? []),
      enabled: Boolean(data.enabled),
      createdAt: String(data.created_at),
    },
  };
}

export async function deletePlatformWebhookEndpoint(id: string): Promise<void> {
  const { supabase } = await getOrgContext();
  const { error } = await supabase.from("platform_webhook_endpoints").delete().eq("id", id);
  if (error) throw error;
}

async function recordDelivery(input: {
  orgId: string;
  endpointId: string;
  eventType: PlatformEventType;
  payload: PlatformWebhookPayload;
  status: "success" | "failed";
  responseCode?: number | null;
  error?: string | null;
}) {
  const admin = createAdminClient();
  await admin.from("platform_webhook_deliveries").insert({
    organisation_id: input.orgId,
    endpoint_id: input.endpointId,
    event_type: input.eventType,
    payload: input.payload,
    status: input.status,
    response_code: input.responseCode ?? null,
    error: input.error ?? null,
  });
}

async function deliverToEndpoint(
  endpoint: {
    id: string;
    url: string;
    secret: string;
    events: string[];
  },
  orgId: string,
  eventType: PlatformEventType,
  payload: PlatformWebhookPayload,
): Promise<void> {
  if (!shouldDeliverEvent(endpoint.events, eventType)) return;

  const body = JSON.stringify(payload);
  const signature = signWebhookPayload(endpoint.secret, body);

  try {
    const res = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-DeliverX-Event": eventType,
        "X-DeliverX-Signature": signature,
      },
      body,
    });

    await recordDelivery({
      orgId,
      endpointId: endpoint.id,
      eventType,
      payload,
      status: res.ok ? "success" : "failed",
      responseCode: res.status,
      error: res.ok ? null : `HTTP ${res.status}`,
    });
  } catch (err) {
    await recordDelivery({
      orgId,
      endpointId: endpoint.id,
      eventType,
      payload,
      status: "failed",
      error: err instanceof Error ? err.message : "Delivery failed",
    });
  }
}

export async function emitPlatformEvent(
  orgId: string,
  eventType: PlatformEventType,
  data: Record<string, unknown>,
): Promise<void> {
  const admin = createAdminClient();
  const { data: endpoints, error } = await admin
    .from("platform_webhook_endpoints")
    .select("id, url, secret, events")
    .eq("organisation_id", orgId)
    .eq("enabled", true);

  if (error) {
    if (error.code === "42P01") return;
    throw error;
  }

  if (!endpoints?.length) return;

  const eventId = randomUUID();
  const payload = buildPlatformEventPayload({
    eventId,
    type: eventType,
    organisationId: orgId,
    data,
  });

  await Promise.all(
    endpoints.map((endpoint) =>
      deliverToEndpoint(
        {
          id: String(endpoint.id),
          url: String(endpoint.url),
          secret: String(endpoint.secret),
          events: (endpoint.events as string[]) ?? [],
        },
        orgId,
        eventType,
        payload,
      ),
    ),
  );
}

export async function emitTaskCreatedEvent(
  orgId: string,
  input: {
    taskId: string;
    projectId: string;
    projectName: string;
    title: string;
    priority: string;
    source: string;
  },
): Promise<void> {
  await emitPlatformEvent(orgId, "task.created", {
    taskId: input.taskId,
    projectId: input.projectId,
    projectName: input.projectName,
    title: input.title,
    priority: input.priority,
    source: input.source,
  });
}

export async function emitReportPublishedEvent(
  orgId: string,
  input: {
    reportId: string;
    projectId: string;
    title: string;
    reviewStatus: string;
    stakeholderCount?: number;
    emailSent?: boolean;
    source: string;
  },
): Promise<void> {
  await emitPlatformEvent(orgId, "report.published", {
    reportId: input.reportId,
    projectId: input.projectId,
    title: input.title,
    reviewStatus: input.reviewStatus,
    stakeholderCount: input.stakeholderCount ?? 0,
    emailSent: input.emailSent ?? false,
    source: input.source,
  });
}

export async function emitProposalAppliedEvent(
  orgId: string,
  input: {
    proposalId: string;
    projectId: string;
    actionType: string;
    title: string;
    applyResult: Record<string, unknown>;
    source: string;
  },
): Promise<void> {
  await emitPlatformEvent(orgId, "proposal.applied", {
    proposalId: input.proposalId,
    projectId: input.projectId,
    actionType: input.actionType,
    title: input.title,
    applyResult: input.applyResult,
    source: input.source,
  });
}

export async function listPlatformWebhookDeliveries(
  orgId: string,
  limit = 20,
): Promise<PlatformWebhookDeliveryRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("platform_webhook_deliveries")
    .select("id, endpoint_id, event_type, status, response_code, error, delivered_at")
    .eq("organisation_id", orgId)
    .order("delivered_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === "42P01") return [];
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    endpointId: row.endpoint_id ? String(row.endpoint_id) : null,
    eventType: String(row.event_type) as PlatformEventType,
    status: String(row.status),
    responseCode: row.response_code != null ? Number(row.response_code) : null,
    error: row.error ? String(row.error) : null,
    deliveredAt: String(row.delivered_at),
  }));
}
