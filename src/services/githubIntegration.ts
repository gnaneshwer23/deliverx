/**
 * GitHub integration — settings, sync, PR/task links.
 */

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { throwIfMissingTable } from "@/lib/db-errors";
import {
  fetchOpenPullRequests,
  fetchRecentWorkflowRuns,
  verifyGitHubCredentials,
} from "./githubApi";
import {
  buildHealthFromCi,
  computePrDashboardStats,
  mapPullRequestsToLinks,
  parseGitHubPrUrl,
  summarizeCiFromWorkflows,
  type GitHubCiSummary,
} from "./githubIntegrationEngine";

export type OrgIntegrationSettings = {
  organisation_id: string;
  provider: "github";
  github_token: string | null;
  github_webhook_secret: string | null;
  enabled: boolean;
  last_sync_at: string | null;
  updated_at: string;
};

export type ProjectIntegrationSettings = {
  project_id: string;
  organisation_id: string;
  github_owner: string | null;
  github_repo: string | null;
  enabled: boolean;
  last_sync_at: string | null;
  updated_at: string;
};

export type ExternalTaskLinkRow = {
  id: string;
  organisation_id: string;
  project_id: string;
  task_id: string | null;
  provider: "github";
  link_type: string;
  external_id: string;
  external_url: string;
  title: string | null;
  status: string | null;
  metadata: Record<string, unknown>;
  synced_at: string;
};

export type GitHubProjectSnapshot = {
  openPullRequests: ExternalTaskLinkRow[];
  ci: GitHubCiSummary;
  openPrCount: number;
  lastSyncAt: string | null;
  configured: boolean;
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

function mapOrgIntegration(row: Record<string, unknown>): OrgIntegrationSettings {
  return {
    organisation_id: String(row.organisation_id),
    provider: "github",
    github_token: row.github_token ? String(row.github_token) : null,
    github_webhook_secret: row.github_webhook_secret
      ? String(row.github_webhook_secret)
      : null,
    enabled: Boolean(row.enabled),
    last_sync_at: row.last_sync_at ? String(row.last_sync_at) : null,
    updated_at: String(row.updated_at),
  };
}

function mapProjectIntegration(row: Record<string, unknown>): ProjectIntegrationSettings {
  return {
    project_id: String(row.project_id),
    organisation_id: String(row.organisation_id),
    github_owner: row.github_owner ? String(row.github_owner) : null,
    github_repo: row.github_repo ? String(row.github_repo) : null,
    enabled: Boolean(row.enabled ?? true),
    last_sync_at: row.last_sync_at ? String(row.last_sync_at) : null,
    updated_at: String(row.updated_at),
  };
}

function mapExternalLink(row: Record<string, unknown>): ExternalTaskLinkRow {
  return {
    id: String(row.id),
    organisation_id: String(row.organisation_id),
    project_id: String(row.project_id),
    task_id: row.task_id ? String(row.task_id) : null,
    provider: "github",
    link_type: String(row.link_type),
    external_id: String(row.external_id),
    external_url: String(row.external_url),
    title: row.title ? String(row.title) : null,
    status: row.status ? String(row.status) : null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    synced_at: String(row.synced_at),
  };
}

export async function getOrgIntegrationSettings(): Promise<OrgIntegrationSettings | null> {
  const { supabase, orgId } = await getOrgContext();
  const { data, error } = await supabase
    .from("org_integrations")
    .select("*")
    .eq("organisation_id", orgId)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") return null;
    throwIfMissingTable(error, "org_integrations");
    throw error;
  }

  return data ? mapOrgIntegration(data as Record<string, unknown>) : null;
}

export async function saveOrgIntegrationSettings(input: {
  githubToken?: string | null;
  githubWebhookSecret?: string | null;
  enabled?: boolean;
}): Promise<OrgIntegrationSettings> {
  const { supabase, orgId } = await getOrgContext();

  const row = {
    organisation_id: orgId,
    provider: "github" as const,
    github_token: input.githubToken?.trim() || null,
    github_webhook_secret: input.githubWebhookSecret?.trim() || null,
    enabled: input.enabled ?? Boolean(input.githubToken?.trim()),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("org_integrations")
    .upsert(row, { onConflict: "organisation_id" })
    .select("*")
    .single();

  if (error) {
    throwIfMissingTable(error, "org_integrations");
    throw error;
  }

  return mapOrgIntegration(data as Record<string, unknown>);
}

export async function getProjectIntegrationSettings(
  projectId: string,
): Promise<ProjectIntegrationSettings | null> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("project_integrations")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") return null;
    throw error;
  }

  return data ? mapProjectIntegration(data as Record<string, unknown>) : null;
}

export async function saveProjectIntegrationSettings(input: {
  projectId: string;
  githubOwner: string;
  githubRepo: string;
  enabled?: boolean;
}): Promise<ProjectIntegrationSettings> {
  const { supabase, orgId } = await getOrgContext();

  const row = {
    project_id: input.projectId,
    organisation_id: orgId,
    github_owner: input.githubOwner.trim(),
    github_repo: input.githubRepo.trim(),
    enabled: input.enabled ?? true,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("project_integrations")
    .upsert(row, { onConflict: "project_id" })
    .select("*")
    .single();

  if (error) {
    throwIfMissingTable(error, "project_integrations");
    throw error;
  }

  return mapProjectIntegration(data as Record<string, unknown>);
}

async function logSync(input: {
  orgId: string;
  projectId: string;
  kind: string;
  status: "ok" | "failed";
  summary?: Record<string, unknown>;
  error?: string;
}) {
  const admin = createAdminClient();
  await admin.from("integration_sync_log").insert({
    organisation_id: input.orgId,
    project_id: input.projectId,
    provider: "github",
    kind: input.kind,
    status: input.status,
    summary: input.summary ?? {},
    error: input.error ?? null,
  });
}

export async function syncGitHubProject(projectId: string): Promise<GitHubProjectSnapshot> {
  const { supabase, orgId } = await getOrgContext();

  const [orgSettings, projectSettings] = await Promise.all([
    getOrgIntegrationSettings(),
    getProjectIntegrationSettings(projectId),
  ]);

  if (!orgSettings?.github_token || !projectSettings?.github_owner || !projectSettings.github_repo) {
    return {
      openPullRequests: [],
      ci: summarizeCiFromWorkflows([]),
      openPrCount: 0,
      lastSyncAt: null,
      configured: false,
    };
  }

  const owner = projectSettings.github_owner;
  const repo = projectSettings.github_repo;
  const token = orgSettings.github_token;

  try {
    const [prs, runs] = await Promise.all([
      fetchOpenPullRequests({ owner, repo, token }),
      fetchRecentWorkflowRuns({ owner, repo, token }),
    ]);

    const prLinks = mapPullRequestsToLinks(prs);
    const now = new Date().toISOString();

    for (const link of prLinks) {
      await supabase.from("external_task_links").upsert(
        {
          organisation_id: orgId,
          project_id: projectId,
          provider: "github",
          link_type: link.link_type,
          external_id: link.external_id,
          external_url: link.external_url,
          title: link.title,
          status: link.status,
          metadata: link.metadata,
          synced_at: now,
        },
        { onConflict: "project_id,provider,link_type,external_id" },
      );
    }

    const ci = summarizeCiFromWorkflows(runs);

    await supabase.from("external_task_links").upsert(
      {
        organisation_id: orgId,
        project_id: projectId,
        provider: "github",
        link_type: "ci_summary",
        external_id: "latest",
        external_url: ci.workflowUrl ?? "",
        title: `CI: ${ci.buildStatus}`,
        status: ci.buildStatus.toLowerCase(),
        metadata: ci,
        synced_at: now,
      },
      { onConflict: "project_id,provider,link_type,external_id" },
    );

    await supabase
      .from("project_integrations")
      .update({ last_sync_at: now, updated_at: now })
      .eq("project_id", projectId);

    await supabase
      .from("org_integrations")
      .update({ last_sync_at: now, updated_at: now })
      .eq("organisation_id", orgId);

    await logSync({
      orgId,
      projectId,
      kind: "github_sync",
      status: "ok",
      summary: { openPrs: prLinks.length, ciStatus: ci.buildStatus },
    });

    const { data: stored } = await supabase
      .from("external_task_links")
      .select("*")
      .eq("project_id", projectId)
      .eq("link_type", "pull_request")
      .order("synced_at", { ascending: false })
      .limit(20);

    return {
      openPullRequests: (stored ?? []).map((r) =>
        mapExternalLink(r as Record<string, unknown>),
      ),
      ci,
      openPrCount: prLinks.length,
      lastSyncAt: now,
      configured: true,
    };
  } catch (err) {
    await logSync({
      orgId,
      projectId,
      kind: "github_sync",
      status: "failed",
      error: err instanceof Error ? err.message : "Sync failed",
    });
    throw err;
  }
}

export async function getGitHubProjectSnapshot(
  projectId: string,
): Promise<GitHubProjectSnapshot> {
  const { supabase } = await getOrgContext();

  const [orgSettings, projectSettings, linksRes, ciRes] = await Promise.all([
    getOrgIntegrationSettings(),
    getProjectIntegrationSettings(projectId),
    supabase
      .from("external_task_links")
      .select("*")
      .eq("project_id", projectId)
      .eq("link_type", "pull_request")
      .order("synced_at", { ascending: false })
      .limit(20),
    supabase
      .from("external_task_links")
      .select("*")
      .eq("project_id", projectId)
      .eq("link_type", "ci_summary")
      .eq("external_id", "latest")
      .maybeSingle(),
  ]);

  const configured = Boolean(
    orgSettings?.github_token &&
      projectSettings?.github_owner &&
      projectSettings?.github_repo,
  );

  const openPullRequests = (linksRes.data ?? []).map((r) =>
    mapExternalLink(r as Record<string, unknown>),
  );

  const ciRow = ciRes.data as Record<string, unknown> | null;
  const ci =
    (ciRow?.metadata as GitHubCiSummary | undefined) ?? summarizeCiFromWorkflows([]);

  return {
    openPullRequests,
    ci,
    openPrCount: openPullRequests.length,
    lastSyncAt: projectSettings?.last_sync_at ?? null,
    configured,
  };
}

export async function getGitHubCiForProject(projectId: string): Promise<GitHubCiSummary> {
  const snapshot = await getGitHubProjectSnapshot(projectId);
  if (!snapshot.configured) return summarizeCiFromWorkflows([]);

  const orgSettings = await getOrgIntegrationSettings();
  const projectSettings = await getProjectIntegrationSettings(projectId);
  if (!orgSettings?.github_token || !projectSettings?.github_owner || !projectSettings?.github_repo) {
    return summarizeCiFromWorkflows([]);
  }

  try {
    const runs = await fetchRecentWorkflowRuns({
      owner: projectSettings.github_owner,
      repo: projectSettings.github_repo,
      token: orgSettings.github_token,
    });
    return summarizeCiFromWorkflows(runs);
  } catch {
    return snapshot.ci;
  }
}

export async function linkTaskToGitHubPr(input: {
  projectId: string;
  taskId: string;
  prUrl: string;
}): Promise<ExternalTaskLinkRow> {
  const parsed = parseGitHubPrUrl(input.prUrl);
  if (!parsed) throw new Error("Invalid GitHub pull request URL");

  const { supabase, orgId } = await getOrgContext();

  const { data, error } = await supabase
    .from("external_task_links")
    .upsert(
      {
        organisation_id: orgId,
        project_id: input.projectId,
        task_id: input.taskId,
        provider: "github",
        link_type: "pull_request",
        external_id: String(parsed.number),
        external_url: input.prUrl.trim(),
        title: `PR #${parsed.number}`,
        status: "linked",
        metadata: { owner: parsed.owner, repo: parsed.repo },
        synced_at: new Date().toISOString(),
      },
      { onConflict: "project_id,provider,link_type,external_id" },
    )
    .select("*")
    .single();

  if (error) throw error;
  return mapExternalLink(data as Record<string, unknown>);
}

export async function listTaskExternalLinks(taskId: string): Promise<ExternalTaskLinkRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("external_task_links")
    .select("*")
    .eq("task_id", taskId)
    .order("synced_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") return [];
    throw error;
  }

  return (data ?? []).map((r) => mapExternalLink(r as Record<string, unknown>));
}

export async function testGitHubConnection(input: {
  owner: string;
  repo: string;
  token: string;
}): Promise<{ ok: boolean; message: string }> {
  const result = await verifyGitHubCredentials(input);
  return result.ok
    ? { ok: true, message: `Connected to ${result.repoName}` }
    : { ok: false, message: result.error ?? "Connection failed" };
}

export { buildHealthFromCi, computePrDashboardStats };
