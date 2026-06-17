/**
 * Notification delivery — Slack/Teams webhooks, email digests, reminders.
 */

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { throwIfMissingTable } from "@/lib/db-errors";
import { isEmailConfigured, sendEmail } from "@/lib/email/resend";
import {
  sendDailyDigestEmail,
  sendProposalAppliedEmail,
  sendReminderEmail,
} from "@/lib/email/notification-emails";
import type { ProposedActionRow } from "./proposedActions";
import {
  buildDigestSlackBlocks,
  buildProposalAppliedSlackBlocks,
  buildProposalAppliedTeamsCard,
  buildReminderSlackBlocks,
  proposalToNotificationContext,
  type DigestSection,
} from "./notificationEngine";

export type OrgNotificationSettings = {
  organisation_id: string;
  slack_webhook_url: string | null;
  teams_webhook_url: string | null;
  digest_enabled: boolean;
  digest_recipients: string[];
  notify_on_proposal_apply: boolean;
  notify_on_pending_reminder: boolean;
  reminder_threshold_hours: number;
  updated_at: string;
};

export type NotificationDeliveryRow = {
  id: string;
  organisation_id: string;
  project_id: string | null;
  channel: "slack" | "teams" | "email";
  kind: "proposal_applied" | "daily_digest" | "reminder" | "calendar";
  status: string;
  payload: Record<string, unknown>;
  error: string | null;
  created_at: string;
};

function mapSettings(row: Record<string, unknown>): OrgNotificationSettings {
  return {
    organisation_id: String(row.organisation_id),
    slack_webhook_url: row.slack_webhook_url ? String(row.slack_webhook_url) : null,
    teams_webhook_url: row.teams_webhook_url ? String(row.teams_webhook_url) : null,
    digest_enabled: Boolean(row.digest_enabled ?? true),
    digest_recipients: Array.isArray(row.digest_recipients)
      ? row.digest_recipients.map(String)
      : [],
    notify_on_proposal_apply: Boolean(row.notify_on_proposal_apply ?? true),
    notify_on_pending_reminder: Boolean(row.notify_on_pending_reminder ?? true),
    reminder_threshold_hours: Number(row.reminder_threshold_hours ?? 48),
    updated_at: String(row.updated_at),
  };
}

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.VERCEL_URL?.trim()?.replace(/^/, "https://") ||
    "http://localhost:3000"
  );
}

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

export async function getOrgNotificationSettings(): Promise<OrgNotificationSettings | null> {
  const { supabase, orgId } = await getOrgContext();
  const { data, error } = await supabase
    .from("org_notification_settings")
    .select("*")
    .eq("organisation_id", orgId)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") return null;
    throwIfMissingTable(error, "org_notification_settings");
    throw error;
  }

  return data ? mapSettings(data as Record<string, unknown>) : null;
}

export async function saveOrgNotificationSettings(input: {
  slackWebhookUrl?: string | null;
  teamsWebhookUrl?: string | null;
  digestEnabled?: boolean;
  digestRecipients?: string[];
  notifyOnProposalApply?: boolean;
  notifyOnPendingReminder?: boolean;
  reminderThresholdHours?: number;
}): Promise<OrgNotificationSettings> {
  const { supabase, orgId } = await getOrgContext();

  const row = {
    organisation_id: orgId,
    slack_webhook_url: input.slackWebhookUrl?.trim() || null,
    teams_webhook_url: input.teamsWebhookUrl?.trim() || null,
    digest_enabled: input.digestEnabled ?? true,
    digest_recipients: (input.digestRecipients ?? []).map((e) => e.trim()).filter(Boolean),
    notify_on_proposal_apply: input.notifyOnProposalApply ?? true,
    notify_on_pending_reminder: input.notifyOnPendingReminder ?? true,
    reminder_threshold_hours: input.reminderThresholdHours ?? 48,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("org_notification_settings")
    .upsert(row, { onConflict: "organisation_id" })
    .select("*")
    .single();

  if (error) {
    throwIfMissingTable(error, "org_notification_settings");
    throw error;
  }

  return mapSettings(data as Record<string, unknown>);
}

async function logDelivery(input: {
  orgId: string;
  projectId?: string | null;
  channel: NotificationDeliveryRow["channel"];
  kind: NotificationDeliveryRow["kind"];
  status: "sent" | "failed" | "skipped";
  payload?: Record<string, unknown>;
  error?: string | null;
  admin?: ReturnType<typeof createAdminClient>;
}) {
  const client = input.admin ?? createAdminClient();
  await client.from("notification_deliveries").insert({
    organisation_id: input.orgId,
    project_id: input.projectId ?? null,
    channel: input.channel,
    kind: input.kind,
    status: input.status,
    payload: input.payload ?? {},
    error: input.error ?? null,
  });
}

async function postSlack(webhookUrl: string, body: Record<string, unknown>): Promise<void> {
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(detail.slice(0, 200) || `Slack webhook failed (${res.status})`);
  }
}

async function postTeams(webhookUrl: string, body: Record<string, unknown>): Promise<void> {
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(detail.slice(0, 200) || `Teams webhook failed (${res.status})`);
  }
}

export async function notifyProposalApplied(
  proposal: ProposedActionRow,
  applyResult: Record<string, unknown>,
  orgId: string,
): Promise<{ sent: number; skipped: number }> {
  const admin = createAdminClient();
  const { data: settingsRow } = await admin
    .from("org_notification_settings")
    .select("*")
    .eq("organisation_id", orgId)
    .maybeSingle();

  const settings = settingsRow ? mapSettings(settingsRow as Record<string, unknown>) : null;
  if (!settings?.notify_on_proposal_apply) {
    return { sent: 0, skipped: 1 };
  }

  const { data: project } = await admin
    .from("projects")
    .select("name")
    .eq("id", proposal.project_id)
    .single();

  const appUrl = appBaseUrl();
  const ctx = proposalToNotificationContext(
    proposal,
    applyResult,
    project?.name ?? "Project",
    appUrl,
  );

  const kind: NotificationDeliveryRow["kind"] =
    proposal.action_type === "calendar_event" ? "calendar" : "proposal_applied";

  let sent = 0;

  if (settings.slack_webhook_url) {
    try {
      await postSlack(
        settings.slack_webhook_url,
        buildProposalAppliedSlackBlocks(ctx) as Record<string, unknown>,
      );
      await logDelivery({
        orgId,
        projectId: proposal.project_id,
        channel: "slack",
        kind,
        status: "sent",
        payload: { proposalId: proposal.id, title: proposal.title },
        admin,
      });
      sent++;
    } catch (err) {
      await logDelivery({
        orgId,
        projectId: proposal.project_id,
        channel: "slack",
        kind,
        status: "failed",
        error: err instanceof Error ? err.message : "Slack failed",
        admin,
      });
    }
  }

  if (settings.teams_webhook_url) {
    try {
      await postTeams(
        settings.teams_webhook_url,
        buildProposalAppliedTeamsCard(ctx) as Record<string, unknown>,
      );
      await logDelivery({
        orgId,
        projectId: proposal.project_id,
        channel: "teams",
        kind,
        status: "sent",
        payload: { proposalId: proposal.id, title: proposal.title },
        admin,
      });
      sent++;
    } catch (err) {
      await logDelivery({
        orgId,
        projectId: proposal.project_id,
        channel: "teams",
        kind,
        status: "failed",
        error: err instanceof Error ? err.message : "Teams failed",
        admin,
      });
    }
  }

  const recipients = settings.digest_recipients.filter(Boolean);
  if (recipients.length > 0 && isEmailConfigured()) {
    const result = await sendProposalAppliedEmail({ ctx, recipients });
    await logDelivery({
      orgId,
      projectId: proposal.project_id,
      channel: "email",
      kind,
      status: result.sent ? "sent" : "failed",
      error: result.sent ? null : result.reason,
      admin,
    });
    if (result.sent) sent++;
  }

  return { sent, skipped: sent === 0 ? 1 : 0 };
}

async function buildDigestSections(orgId: string): Promise<DigestSection[]> {
  const admin = createAdminClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [impactRes, proposalsRes, projectsRes] = await Promise.all([
    admin
      .from("delivery_impact_events")
      .select("id, message, target_role, projects!inner(name)")
      .eq("organisation_id", orgId)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(8),
    admin
      .from("proposed_actions")
      .select("id, title, action_type, projects!inner(name)")
      .eq("organisation_id", orgId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(8),
    admin.from("projects").select("id, name").eq("organisation_id", orgId).limit(20),
  ]);

  const impactItems = (impactRes.data ?? []).map((row) => {
    const r = row as unknown as {
      message: string;
      target_role: string;
      projects: { name: string } | { name: string }[];
    };
    const projectName = Array.isArray(r.projects) ? r.projects[0]?.name : r.projects.name;
    return `${projectName ?? "Project"} · ${r.target_role}: ${r.message}`;
  });

  const proposalItems = (proposalsRes.data ?? []).map((row) => {
    const r = row as unknown as {
      title: string;
      action_type: string;
      projects: { name: string } | { name: string }[];
    };
    const projectName = Array.isArray(r.projects) ? r.projects[0]?.name : r.projects.name;
    return `${projectName ?? "Project"} · ${r.action_type.replace(/_/g, " ")}: ${r.title}`;
  });

  const projectCount = (projectsRes.data ?? []).length;

  return [
    { title: "Dashboard updates (24h)", items: impactItems },
    { title: "Pending approvals", items: proposalItems },
    {
      title: "Portfolio",
      items: projectCount > 0 ? [`${projectCount} active project(s)`] : [],
    },
  ];
}

async function buildReminderItems(orgId: string, thresholdHours: number): Promise<string[]> {
  const admin = createAdminClient();
  const threshold = new Date(Date.now() - thresholdHours * 60 * 60 * 1000).toISOString();

  const { data } = await admin
    .from("proposed_actions")
    .select("title, created_at, projects!inner(name)")
    .eq("organisation_id", orgId)
    .eq("status", "pending")
    .lte("created_at", threshold)
    .order("created_at", { ascending: true })
    .limit(10);

  return (data ?? []).map((row) => {
    const r = row as unknown as { title: string; projects: { name: string } | { name: string }[] };
    const projectName = Array.isArray(r.projects) ? r.projects[0]?.name : r.projects.name;
    return `${projectName ?? "Project"}: ${r.title} (awaiting approval)`;
  });
}

export async function runDailyDigestForOrg(orgId: string, orgName: string): Promise<number> {
  const admin = createAdminClient();
  const { data: settingsRow } = await admin
    .from("org_notification_settings")
    .select("*")
    .eq("organisation_id", orgId)
    .maybeSingle();

  const settings = settingsRow ? mapSettings(settingsRow as Record<string, unknown>) : null;
  if (!settings?.digest_enabled) return 0;

  const sections = await buildDigestSections(orgId);
  const hasContent = sections.some((s) => s.items.length > 0);
  if (!hasContent) return 0;

  const appUrl = appBaseUrl();
  let sent = 0;

  if (settings.slack_webhook_url) {
    try {
      await postSlack(
        settings.slack_webhook_url,
        buildDigestSlackBlocks(orgName, sections, appUrl) as Record<string, unknown>,
      );
      await logDelivery({
        orgId,
        channel: "slack",
        kind: "daily_digest",
        status: "sent",
        admin,
      });
      sent++;
    } catch (err) {
      await logDelivery({
        orgId,
        channel: "slack",
        kind: "daily_digest",
        status: "failed",
        error: err instanceof Error ? err.message : "Slack digest failed",
        admin,
      });
    }
  }

  if (settings.teams_webhook_url) {
    const text = sections
      .filter((s) => s.items.length > 0)
      .map((s) => `**${s.title}**\n${s.items.map((i) => `- ${i}`).join("\n")}`)
      .join("\n\n");

    try {
      await postTeams(settings.teams_webhook_url, {
        "@type": "MessageCard",
        summary: `Daily digest — ${orgName}`,
        themeColor: "0F766E",
        title: `DeliverX daily digest — ${orgName}`,
        text,
        potentialAction: [
          { type: "Action.OpenUrl", title: "Open workspace", url: appUrl },
        ],
      });
      await logDelivery({
        orgId,
        channel: "teams",
        kind: "daily_digest",
        status: "sent",
        admin,
      });
      sent++;
    } catch (err) {
      await logDelivery({
        orgId,
        channel: "teams",
        kind: "daily_digest",
        status: "failed",
        error: err instanceof Error ? err.message : "Teams digest failed",
        admin,
      });
    }
  }

  const recipients = settings.digest_recipients.filter(Boolean);
  if (recipients.length > 0 && isEmailConfigured()) {
    const result = await sendDailyDigestEmail({ orgName, sections, recipients, appUrl });
    await logDelivery({
      orgId,
      channel: "email",
      kind: "daily_digest",
      status: result.sent ? "sent" : "failed",
      error: result.sent ? null : result.reason,
      admin,
    });
    if (result.sent) sent++;
  }

  return sent;
}

export async function runRemindersForOrg(orgId: string, orgName: string): Promise<number> {
  const admin = createAdminClient();
  const { data: settingsRow } = await admin
    .from("org_notification_settings")
    .select("*")
    .eq("organisation_id", orgId)
    .maybeSingle();

  const settings = settingsRow ? mapSettings(settingsRow as Record<string, unknown>) : null;
  if (!settings?.notify_on_pending_reminder) return 0;

  const items = await buildReminderItems(orgId, settings.reminder_threshold_hours);
  if (items.length === 0) return 0;

  const appUrl = appBaseUrl();
  let sent = 0;

  if (settings.slack_webhook_url) {
    try {
      await postSlack(
        settings.slack_webhook_url,
        buildReminderSlackBlocks(orgName, items, appUrl) as Record<string, unknown>,
      );
      await logDelivery({
        orgId,
        channel: "slack",
        kind: "reminder",
        status: "sent",
        admin,
      });
      sent++;
    } catch (err) {
      await logDelivery({
        orgId,
        channel: "slack",
        kind: "reminder",
        status: "failed",
        error: err instanceof Error ? err.message : "Slack reminder failed",
        admin,
      });
    }
  }

  if (settings.teams_webhook_url) {
    try {
      await postTeams(settings.teams_webhook_url, {
        "@type": "MessageCard",
        summary: "Approval reminders",
        themeColor: "C0392B",
        title: `DeliverX reminders — ${orgName}`,
        text: items.map((i) => `- ${i}`).join("\n"),
        potentialAction: [
          {
            type: "Action.OpenUrl",
            title: "Review approvals",
            url: `${appUrl}/workspace/approvals`,
          },
        ],
      });
      await logDelivery({
        orgId,
        channel: "teams",
        kind: "reminder",
        status: "sent",
        admin,
      });
      sent++;
    } catch (err) {
      await logDelivery({
        orgId,
        channel: "teams",
        kind: "reminder",
        status: "failed",
        error: err instanceof Error ? err.message : "Teams reminder failed",
        admin,
      });
    }
  }

  const recipients = settings.digest_recipients.filter(Boolean);
  if (recipients.length > 0 && isEmailConfigured()) {
    const result = await sendReminderEmail({ orgName, items, recipients, appUrl });
    await logDelivery({
      orgId,
      channel: "email",
      kind: "reminder",
      status: result.sent ? "sent" : "failed",
      error: result.sent ? null : result.reason,
      admin,
    });
    if (result.sent) sent++;
  }

  return sent;
}

export async function runNotificationCron(): Promise<{
  digests: number;
  reminders: number;
  orgs: number;
}> {
  const admin = createAdminClient();
  const { data: orgs } = await admin.from("organisations").select("id, name");

  let digests = 0;
  let reminders = 0;

  for (const org of orgs ?? []) {
    const orgId = String(org.id);
    const orgName = String(org.name ?? "Organisation");
    digests += await runDailyDigestForOrg(orgId, orgName);
    reminders += await runRemindersForOrg(orgId, orgName);
  }

  return { digests, reminders, orgs: orgs?.length ?? 0 };
}

export async function listRecentNotificationDeliveries(
  limit = 10,
): Promise<NotificationDeliveryRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("notification_deliveries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === "42P01") return [];
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    organisation_id: String(row.organisation_id),
    project_id: row.project_id ? String(row.project_id) : null,
    channel: row.channel as NotificationDeliveryRow["channel"],
    kind: row.kind as NotificationDeliveryRow["kind"],
    status: String(row.status),
    payload: (row.payload as Record<string, unknown>) ?? {},
    error: row.error ? String(row.error) : null,
    created_at: String(row.created_at),
  }));
}

export async function sendTestNotification(): Promise<{ ok: boolean; message: string }> {
  const { supabase, orgId } = await getOrgContext();
  const settings = await getOrgNotificationSettings();

  if (!settings?.slack_webhook_url && !settings?.teams_webhook_url) {
    return { ok: false, message: "Configure a Slack or Teams webhook first." };
  }

  const { data: org } = await supabase
    .from("organisations")
    .select("name")
    .eq("id", orgId)
    .single();

  const orgName = org?.name ?? "Organisation";
  const appUrl = appBaseUrl();
  const testSections: DigestSection[] = [
    { title: "Test", items: ["DeliverX notifications are configured correctly."] },
  ];

  if (settings.slack_webhook_url) {
    await postSlack(
      settings.slack_webhook_url,
      buildDigestSlackBlocks(orgName, testSections, appUrl) as Record<string, unknown>,
    );
  }
  if (settings.teams_webhook_url) {
    await postTeams(settings.teams_webhook_url, {
      "@type": "MessageCard",
      title: "DeliverX test notification",
      text: "Notifications are configured correctly.",
    });
  }

  return { ok: true, message: "Test notification sent." };
}
