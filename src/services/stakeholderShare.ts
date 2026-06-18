/**
 * Stakeholder share links — magic-link CRUD + external read-only snapshots.
 */

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { throwIfMissingTable } from "@/lib/db-errors";
import { buildShareUrl } from "@/lib/share-url";
import { loadProjectSignals } from "./projectSignals";
import {
  computeDeliveryConfidence,
  computeProjectHealth,
} from "./intelligenceEngine";
import {
  computeDeliveryForecast,
  parseTimelineToDate,
  type ForecastContext,
} from "./forecastEngine";
import {
  buildRaidSummary,
  isShareLinkExpired,
  sanitizeReportExcerpt,
  type ExternalRaidRow,
  type ExternalStakeholderView,
} from "./stakeholderShareEngine";

export type StakeholderShareLinkRow = {
  id: string;
  organisation_id: string;
  project_id: string;
  token: string;
  label: string | null;
  recipient_name: string | null;
  recipient_email: string | null;
  status: "active" | "revoked" | "expired";
  expires_at: string;
  created_by: string | null;
  last_viewed_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
};

export type StakeholderShareLinkWithUrl = StakeholderShareLinkRow & {
  shareUrl: string;
};

async function getOrgContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id, role")
    .single();

  if (!profile?.organisation_id) throw new Error("No organisation");

  return {
    supabase,
    userId: user.id,
    orgId: profile.organisation_id as string,
    userRole: profile.role as string | null,
  };
}

function mapShareLink(row: Record<string, unknown>): StakeholderShareLinkRow {
  return {
    id: String(row.id),
    organisation_id: String(row.organisation_id),
    project_id: String(row.project_id),
    token: String(row.token),
    label: row.label ? String(row.label) : null,
    recipient_name: row.recipient_name ? String(row.recipient_name) : null,
    recipient_email: row.recipient_email ? String(row.recipient_email) : null,
    status: row.status as StakeholderShareLinkRow["status"],
    expires_at: String(row.expires_at),
    created_by: row.created_by ? String(row.created_by) : null,
    last_viewed_at: row.last_viewed_at ? String(row.last_viewed_at) : null,
    view_count: Number(row.view_count ?? 0),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function assertCanManageShares(role: string | null) {
  if (role !== "pm" && role !== "executive") {
    throw new Error("Only PMs and executives can manage stakeholder share links.");
  }
}

export async function listStakeholderShareLinks(
  projectId: string,
): Promise<StakeholderShareLinkWithUrl[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("stakeholder_share_links")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") return [];
    throwIfMissingTable(error, "stakeholder_share_links");
    throw error;
  }

  return (data ?? []).map((row) => {
    const link = mapShareLink(row as Record<string, unknown>);
    return { ...link, shareUrl: buildShareUrl(link.token) };
  });
}

export async function createStakeholderShareLink(input: {
  projectId: string;
  label?: string;
  recipientName?: string;
  recipientEmail?: string;
  expiresInDays?: number;
}): Promise<StakeholderShareLinkWithUrl> {
  const { supabase, userId, orgId, userRole } = await getOrgContext();
  assertCanManageShares(userRole);

  const days = input.expiresInDays ?? 30;
  const expiresAt = new Date(Date.now() + days * 86_400_000).toISOString();

  const { data, error } = await supabase
    .from("stakeholder_share_links")
    .insert({
      organisation_id: orgId,
      project_id: input.projectId,
      label: input.label?.trim() || null,
      recipient_name: input.recipientName?.trim() || null,
      recipient_email: input.recipientEmail?.trim() || null,
      status: "active",
      expires_at: expiresAt,
      created_by: userId,
    })
    .select("*")
    .single();

  if (error) {
    throwIfMissingTable(error, "stakeholder_share_links");
    throw error;
  }

  const link = mapShareLink(data as Record<string, unknown>);
  return { ...link, shareUrl: buildShareUrl(link.token) };
}

export async function revokeStakeholderShareLink(linkId: string) {
  const { supabase, userRole } = await getOrgContext();
  assertCanManageShares(userRole);

  const { error } = await supabase
    .from("stakeholder_share_links")
    .update({ status: "revoked", updated_at: new Date().toISOString() })
    .eq("id", linkId);

  if (error) throw error;
}

async function loadForecastContextAdmin(
  projectId: string,
  admin: ReturnType<typeof createAdminClient>,
): Promise<ForecastContext> {
  const [{ data: project }, { data: milestones }] = await Promise.all([
    admin.from("projects").select("timeline").eq("id", projectId).maybeSingle(),
    admin
      .from("milestones")
      .select("title, target_date, status")
      .eq("project_id", projectId)
      .order("target_date", { ascending: true }),
  ]);

  const rows = milestones ?? [];
  const open = rows.filter((m) => m.status !== "completed");
  const dated = open
    .filter((m) => m.target_date)
    .sort((a, b) => String(a.target_date).localeCompare(String(b.target_date)));

  if (dated.length > 0) {
    const anchor = dated[dated.length - 1];
    return {
      baselineDate: anchor.target_date as string,
      anchorLabel: anchor.title as string,
      openMilestoneCount: open.length,
    };
  }

  const parsed = parseTimelineToDate(project?.timeline ?? null);
  if (parsed) {
    return {
      baselineDate: parsed,
      anchorLabel: project?.timeline?.trim()
        ? `Timeline (${project.timeline.trim()})`
        : "Estimated completion",
      openMilestoneCount: open.length,
    };
  }

  return {
    baselineDate: null,
    anchorLabel: "Estimated completion",
    openMilestoneCount: open.length,
  };
}

export async function buildExternalStakeholderView(
  projectId: string,
): Promise<ExternalStakeholderView> {
  const admin = createAdminClient();

  const { data: project, error: projectErr } = await admin
    .from("projects")
    .select("name, status, goal, timeline, delivery_type, organisations(name)")
    .eq("id", projectId)
    .single();

  if (projectErr || !project) {
    throw new Error("Project not found");
  }

  const orgName =
    (project.organisations as { name?: string } | null)?.name ?? "Organisation";

  const [signals, forecastContext, milestonesRes, raidRes, alignmentRes, reportRes] =
    await Promise.all([
      loadProjectSignals(projectId, admin),
      loadForecastContextAdmin(projectId, admin),
      admin
        .from("milestones")
        .select("title, target_date, status, confidence_score")
        .eq("project_id", projectId)
        .order("target_date", { ascending: true, nullsFirst: false }),
      admin
        .from("raid_items")
        .select("type, title, severity")
        .eq("project_id", projectId)
        .eq("status", "open")
        .order("severity", { ascending: false })
        .limit(8),
      admin
        .from("alignment_scores")
        .select("score, factors, computed_at")
        .eq("project_id", projectId)
        .order("computed_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from("reports")
        .select("title, content, published_at")
        .eq("project_id", projectId)
        .eq("review_status", "published")
        .order("published_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const health = computeProjectHealth(signals);
  const confidence = computeDeliveryConfidence(signals);
  const forecast = computeDeliveryForecast(signals, forecastContext);

  const topRisks = (raidRes.data ?? []).map(
    (r): ExternalRaidRow => ({
      type: String(r.type),
      title: String(r.title),
      severity: String(r.severity),
    }),
  );

  const allRaidRes = await admin
    .from("raid_items")
    .select("type")
    .eq("project_id", projectId)
    .eq("status", "open");

  const raidItems = (allRaidRes.data ?? []).map((r) => ({
    type: String(r.type),
    title: "",
    severity: "medium",
  }));

  const latestReport = reportRes.data
    ? {
        title: String(reportRes.data.title),
        excerpt: sanitizeReportExcerpt(String(reportRes.data.content ?? "")),
        publishedAt: String(reportRes.data.published_at ?? new Date().toISOString()),
      }
    : null;

  return {
    projectName: String(project.name),
    organisationName: orgName,
    status: String(project.status),
    goal: project.goal ? String(project.goal) : null,
    timeline: project.timeline ? String(project.timeline) : null,
    deliveryType: project.delivery_type ? String(project.delivery_type) : null,
    health: {
      score: health.score,
      tier: health.tier,
      trend: health.trend,
      factors: health.factors.slice(0, 4),
    },
    confidence: {
      score: confidence.score,
      tier: confidence.tier,
      summary: confidence.explanation,
    },
    alignment: {
      score: alignmentRes.data ? Number(alignmentRes.data.score) : null,
      factors: (alignmentRes.data?.factors as string[] | undefined)?.slice(0, 4) ?? [],
      computedAt: alignmentRes.data?.computed_at
        ? String(alignmentRes.data.computed_at)
        : null,
    },
    forecast: {
      prediction: forecast.prediction,
      expectedDate: forecast.expectedDate,
      confidence: forecast.confidence,
      trend: forecast.trend,
      delayDays: forecast.delayDays,
      anchorLabel: forecast.anchorLabel,
    },
    milestones: (milestonesRes.data ?? []).map((m) => ({
      title: String(m.title),
      targetDate: m.target_date ? String(m.target_date) : null,
      status: String(m.status),
      confidenceScore: Number(m.confidence_score ?? 0),
    })),
    topRisks,
    raidSummary: buildRaidSummary(raidItems),
    latestReport,
    generatedAt: new Date().toISOString(),
  };
}

export type ShareLinkAccess =
  | { ok: true; link: StakeholderShareLinkRow; view: ExternalStakeholderView }
  | { ok: false; reason: "not_found" | "revoked" | "expired" };

export async function getStakeholderShareByToken(token: string): Promise<ShareLinkAccess> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("stakeholder_share_links")
    .select("*")
    .eq("token", token.trim())
    .maybeSingle();

  if (error || !data) {
    return { ok: false, reason: "not_found" };
  }

  const link = mapShareLink(data as Record<string, unknown>);

  if (link.status === "revoked") {
    return { ok: false, reason: "revoked" };
  }

  if (link.status === "expired" || isShareLinkExpired(link.expires_at)) {
    if (link.status === "active") {
      await admin
        .from("stakeholder_share_links")
        .update({ status: "expired", updated_at: new Date().toISOString() })
        .eq("id", link.id);
    }
    return { ok: false, reason: "expired" };
  }

  await admin
    .from("stakeholder_share_links")
    .update({
      view_count: link.view_count + 1,
      last_viewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", link.id);

  const view = await buildExternalStakeholderView(link.project_id);
  return { ok: true, link, view };
}
