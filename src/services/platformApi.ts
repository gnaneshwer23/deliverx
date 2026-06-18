import { createHash, randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { throwIfMissingTable } from "@/lib/db-errors";
import { getTwinStateForOrg } from "./twin";
import { emitPlatformEvent, listPlatformWebhookDeliveries } from "./platformWebhooks";

export const DEFAULT_PLATFORM_SCOPES = [
  "read:projects",
  "read:health",
  "read:twin",
  "read:agents",
  "read:learning",
  "read:webhooks",
  "write:tasks",
] as const;

export type OrgApiKeyRow = {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

function generateRawKey(): { raw: string; prefix: string } {
  const suffix = randomBytes(24).toString("base64url");
  const raw = `dx_live_${suffix}`;
  return { raw, prefix: raw.slice(0, 12) };
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
  return { supabase, orgId: profile.organisation_id as string, userId: user.id };
}

export async function listOrgApiKeys(): Promise<OrgApiKeyRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("org_api_keys")
    .select("id, name, key_prefix, scopes, last_used_at, revoked_at, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") return [];
    throwIfMissingTable(error, "org_api_keys");
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    keyPrefix: String(row.key_prefix),
    scopes: (row.scopes as string[]) ?? [],
    lastUsedAt: row.last_used_at ? String(row.last_used_at) : null,
    revokedAt: row.revoked_at ? String(row.revoked_at) : null,
    createdAt: String(row.created_at),
  }));
}

export async function createOrgApiKey(name: string): Promise<{ key: OrgApiKeyRow; secret: string }> {
  const { supabase, orgId, userId } = await getOrgContext();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Key name required");

  const { raw, prefix } = generateRawKey();
  const { data, error } = await supabase
    .from("org_api_keys")
    .insert({
      organisation_id: orgId,
      name: trimmed,
      key_prefix: prefix,
      key_hash: hashApiKey(raw),
      created_by: userId,
      scopes: [...DEFAULT_PLATFORM_SCOPES],
    })
    .select("id, name, key_prefix, scopes, last_used_at, revoked_at, created_at")
    .single();

  if (error) {
    throwIfMissingTable(error, "org_api_keys");
    throw error;
  }

  return {
    secret: raw,
    key: {
      id: String(data.id),
      name: String(data.name),
      keyPrefix: String(data.key_prefix),
      scopes: (data.scopes as string[]) ?? [],
      lastUsedAt: null,
      revokedAt: null,
      createdAt: String(data.created_at),
    },
  };
}

export async function revokeOrgApiKey(keyId: string): Promise<void> {
  const { supabase } = await getOrgContext();
  const { error } = await supabase
    .from("org_api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", keyId);

  if (error) throw error;
}

export type PlatformAuthContext = {
  orgId: string;
  keyId: string;
  scopes: string[];
};

export async function authenticatePlatformRequest(
  req: Request,
): Promise<PlatformAuthContext | null> {
  const header = req.headers.get("authorization")?.trim();
  if (!header?.startsWith("Bearer ")) return null;

  const rawKey = header.slice("Bearer ".length).trim();
  if (!rawKey.startsWith("dx_live_")) return null;

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  const prefix = rawKey.slice(0, 12);
  const hash = hashApiKey(rawKey);

  const { data, error } = await admin
    .from("org_api_keys")
    .select("id, organisation_id, scopes, revoked_at")
    .eq("key_prefix", prefix)
    .eq("key_hash", hash)
    .maybeSingle();

  if (error || !data || data.revoked_at) return null;

  await admin
    .from("org_api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);

  return {
    orgId: String(data.organisation_id),
    keyId: String(data.id),
    scopes: (data.scopes as string[]) ?? [],
  };
}

export function hasPlatformScope(scopes: string[], scope: string): boolean {
  return scopes.includes(scope);
}

export async function listPlatformProjects(orgId: string) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .select("id, name, status, goal, delivery_type, updated_at")
    .eq("organisation_id", orgId)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data ?? [];
}

export async function getPlatformTwinSummary(orgId: string) {
  const admin = createAdminClient();
  const state = await getTwinStateForOrg(orgId, admin);
  return {
    capturedAt: state.capturedAt,
    portfolioHealth: state.portfolio.health,
    portfolioStability: state.portfolio.stability,
    failureProbability: state.portfolio.failureProbability,
    projectCount: state.projects.length,
    programmeCount: state.programmes.length,
    systemMetrics: state.systemMetrics,
    predictions: state.predictions,
  };
}

export async function getPlatformAgentActivity(orgId: string, limit = 20) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("agent_activity_events")
    .select(
      "id, project_id, agent_role, event_type, message, human_review_required, created_at, projects!inner(name)",
    )
    .eq("organisation_id", orgId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === "42P01") return [];
    throw error;
  }

  return (data ?? []).map((row) => {
    const projects = row.projects as { name?: string } | { name?: string }[] | null;
    const projectName = Array.isArray(projects)
      ? (projects[0]?.name ?? "Project")
      : (projects?.name ?? "Project");
    return {
      id: String(row.id),
      projectId: String(row.project_id),
      projectName,
      agentRole: String(row.agent_role),
      eventType: String(row.event_type),
      message: String(row.message),
      humanReviewRequired: Boolean(row.human_review_required),
      createdAt: String(row.created_at),
    };
  });
}

export async function getPlatformLearningSummary(orgId: string) {
  const admin = createAdminClient();

  const [lessonsRes, varianceRes, qualityRes] = await Promise.all([
    admin
      .from("structured_lessons")
      .select("id", { count: "exact", head: true })
      .eq("organisation_id", orgId),
    admin
      .from("estimate_variance_records")
      .select("id", { count: "exact", head: true })
      .eq("organisation_id", orgId),
    admin
      .from("proposal_quality_scores")
      .select("quality_score")
      .eq("organisation_id", orgId)
      .limit(100),
  ]);

  const qualityRows = qualityRes.data ?? [];
  const scores = qualityRows.map((row) => Number(row.quality_score));
  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : null;

  return {
    lessonsCount: lessonsRes.count ?? 0,
    estimateVarianceCount: varianceRes.count ?? 0,
    proposalQualityAverage: averageScore,
    proposalSampleCount: scores.length,
  };
}

export async function createPlatformTask(
  orgId: string,
  input: {
    projectId: string;
    title: string;
    description?: string;
    priority?: "low" | "medium" | "high" | "critical";
  },
) {
  const admin = createAdminClient();
  const title = input.title.trim();
  if (!title) throw new Error("title is required");

  const { data: project, error: projectError } = await admin
    .from("projects")
    .select("id, name")
    .eq("id", input.projectId)
    .eq("organisation_id", orgId)
    .maybeSingle();

  if (projectError) throw projectError;
  if (!project) throw new Error("Project not found");

  const { data, error } = await admin
    .from("tasks")
    .insert({
      organisation_id: orgId,
      project_id: input.projectId,
      title,
      description: input.description?.trim() || null,
      status: "todo",
      priority: input.priority ?? "medium",
    })
    .select("id, project_id, title, description, status, priority, created_at")
    .single();

  if (error) throw error;

  const task = {
    id: String(data.id),
    projectId: String(data.project_id),
    projectName: String(project.name),
    title: String(data.title),
    description: data.description ? String(data.description) : null,
    status: String(data.status),
    priority: String(data.priority),
    createdAt: String(data.created_at),
  };

  void emitPlatformEvent(orgId, "task.created", {
    taskId: task.id,
    projectId: task.projectId,
    projectName: task.projectName,
    title: task.title,
    priority: task.priority,
    source: "platform_api",
  }).catch(() => undefined);

  return task;
}

export async function getPlatformWebhookDeliveries(orgId: string, limit = 20) {
  return listPlatformWebhookDeliveries(orgId, limit);
}
