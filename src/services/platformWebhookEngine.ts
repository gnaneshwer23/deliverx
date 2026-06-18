/**
 * Platform webhook engine — pure validation, payload shaping, and HMAC signing.
 */

import { createHmac } from "crypto";

export const PLATFORM_EVENT_TYPES = [
  "task.created",
  "proposal.applied",
  "report.published",
  "project.go_accepted",
] as const;

export type PlatformEventType = (typeof PLATFORM_EVENT_TYPES)[number];

export type PlatformWebhookPayload = {
  id: string;
  type: PlatformEventType;
  organisationId: string;
  occurredAt: string;
  data: Record<string, unknown>;
};

export function isValidWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function normalizeWebhookEvents(events: string[]): PlatformEventType[] {
  const allowed = new Set<string>(PLATFORM_EVENT_TYPES);
  return [...new Set(events.filter((e) => allowed.has(e)))] as PlatformEventType[];
}

export function buildPlatformEventPayload(input: {
  eventId: string;
  type: PlatformEventType;
  organisationId: string;
  data: Record<string, unknown>;
  occurredAt?: string;
}): PlatformWebhookPayload {
  return {
    id: input.eventId,
    type: input.type,
    organisationId: input.organisationId,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    data: input.data,
  };
}

export function signWebhookPayload(secret: string, body: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export function shouldDeliverEvent(
  endpointEvents: string[],
  eventType: PlatformEventType,
): boolean {
  if (endpointEvents.length === 0) return true;
  return endpointEvents.includes(eventType);
}

export function runPlatformWebhookEngineSmokeTest(): {
  ok: boolean;
  eventTypeCount: number;
  signatureLength: number;
} {
  const payload = buildPlatformEventPayload({
    eventId: "evt-1",
    type: "task.created",
    organisationId: "org-1",
    data: { taskId: "t-1", title: "Smoke test" },
  });
  const body = JSON.stringify(payload);
  const signature = signWebhookPayload("test-secret", body);

  return {
    ok:
      isValidWebhookUrl("https://hooks.example.com/deliverx") &&
      normalizeWebhookEvents(["task.created", "invalid"]).length === 1 &&
      shouldDeliverEvent(["task.created"], "task.created") &&
      signature.length === 64,
    eventTypeCount: PLATFORM_EVENT_TYPES.length,
    signatureLength: signature.length,
  };
}
