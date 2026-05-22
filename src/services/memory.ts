/**
 * Memory façade — persistence + orchestration.
 *
 * The high-level entry points the rest of the app uses. Pure engines
 * live alongside (memoryEngine, playbookGenerator, projectSimilarity);
 * this module is the thin layer that talks to Supabase.
 */

import { createClient } from "@/lib/supabase/server";
import { loadProjectSignals } from "./projectSignals";
import {
  extractProjectInsights,
  type InsightCandidate,
} from "./memoryEngine";
import {
  generatePlaybook,
  type PlaybookDraft,
} from "./playbookGenerator";

// ---------------------------------------------------------------------------
// Types mirroring the DB
// ---------------------------------------------------------------------------

export type MemoryRow = {
  id: string;
  organisation_id: string;
  project_id: string | null;
  type: "risk_pattern" | "lesson" | "success_pattern" | "governance";
  insight: string;
  confidence: number;
  tags: string[];
  created_at: string;
};

export type PlaybookRow = {
  id: string;
  organisation_id: string;
  name: string;
  description: string | null;
  industry: string | null;
  delivery_type: string | null;
  structure: {
    workstreams?: string[];
    milestones?: string[];
  };
  governance: string[];
  source_project_ids: string[];
  created_at: string;
};

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function listMemory(opts: { projectId?: string; limit?: number } = {}) {
  const supabase = await createClient();
  let q = supabase
    .from("organisational_memory")
    .select("*")
    .order("created_at", { ascending: false });

  if (opts.projectId) q = q.eq("project_id", opts.projectId);
  if (opts.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as MemoryRow[];
}

export async function searchMemory(query: string) {
  const supabase = await createClient();
  const trimmed = query.trim();
  if (!trimmed) return listMemory({ limit: 50 });

  const lower = trimmed.toLowerCase();

  // Try tag overlap first (exact tag match), then fall back to text search.
  const { data: tagged } = await supabase
    .from("organisational_memory")
    .select("*")
    .overlaps("tags", [lower])
    .order("created_at", { ascending: false });

  const { data: textual } = await supabase
    .from("organisational_memory")
    .select("*")
    .ilike("insight", `%${trimmed}%`)
    .order("created_at", { ascending: false });

  const seen = new Set<string>();
  const out: MemoryRow[] = [];
  for (const row of [...(tagged ?? []), ...(textual ?? [])] as MemoryRow[]) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }
  return out;
}

export async function listPlaybooks() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("playbooks")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PlaybookRow[];
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

async function getContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id")
    .single();
  if (!profile?.organisation_id) throw new Error("No organisation");

  return { supabase, userId: user.id, orgId: profile.organisation_id as string };
}

export async function saveInsights(
  projectId: string,
  insights: InsightCandidate[],
) {
  if (insights.length === 0) return [];
  const { supabase, userId, orgId } = await getContext();

  const rows = insights.map((i) => ({
    organisation_id: orgId,
    project_id: projectId,
    type: i.type,
    insight: i.insight,
    confidence: i.confidence,
    tags: i.tags,
    created_by: userId,
  }));

  const { data, error } = await supabase
    .from("organisational_memory")
    .insert(rows)
    .select("*");

  if (error) throw error;
  return (data ?? []) as MemoryRow[];
}

export async function savePlaybook(draft: PlaybookDraft) {
  const { supabase, userId, orgId } = await getContext();

  const { data, error } = await supabase
    .from("playbooks")
    .insert({
      organisation_id: orgId,
      name: draft.name,
      description: draft.description,
      industry: draft.industry,
      delivery_type: draft.deliveryType,
      structure: draft.structure,
      governance: draft.governance,
      source_project_ids: draft.sourceProjectIds,
      created_by: userId,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as PlaybookRow;
}

export async function applyPlaybook(playbookId: string, projectId: string) {
  const { supabase } = await getContext();

  const { data: project, error } = await supabase
    .from("projects")
    .update({ applied_playbook_id: playbookId })
    .eq("id", projectId)
    .select("id, name, applied_playbook_id")
    .single();

  if (error) throw error;
  return project;
}

// ---------------------------------------------------------------------------
// Closure loop
// ---------------------------------------------------------------------------

export async function onProjectClose(
  projectId: string,
  opts: { force?: boolean } = {},
) {
  const { supabase } = await getContext();

  const { data: project, error } = await supabase
    .from("projects")
    .select("id, name, delivery_type, closure_processed_at")
    .eq("id", projectId)
    .single();

  if (error || !project) throw error ?? new Error("Project not found");

  if (project.closure_processed_at && !opts.force) {
    const { data: existingPlaybook } = await supabase
      .from("playbooks")
      .select("*")
      .contains("source_project_ids", [projectId])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: existingInsights } = await supabase
      .from("organisational_memory")
      .select("*")
      .eq("project_id", projectId);

    return {
      insights: (existingInsights ?? []) as MemoryRow[],
      playbook: (existingPlaybook as PlaybookRow | null) ?? {
        id: "",
        organisation_id: "",
        name: `${project.name} playbook`,
        description: null,
        industry: null,
        delivery_type: project.delivery_type,
        structure: {},
        governance: [],
        source_project_ids: [projectId],
        created_at: project.closure_processed_at,
      },
      skipped: true as const,
    };
  }

  const { data: org } = await supabase
    .from("users")
    .select("organisations(industry)")
    .single();

  const industry =
    (org?.organisations as { industry?: string } | null)?.industry ?? null;

  const signals = await loadProjectSignals(projectId);

  const insights = extractProjectInsights(signals, {
    industry,
    deliveryType: project.delivery_type ?? null,
    name: project.name,
  });

  const savedInsights = await saveInsights(projectId, insights);

  const draft = generatePlaybook([
    {
      id: project.id,
      name: project.name,
      industry,
      deliveryType: project.delivery_type ?? null,
    },
  ]);

  const playbook = await savePlaybook(draft);

  await supabase
    .from("projects")
    .update({ closure_processed_at: new Date().toISOString() })
    .eq("id", projectId);

  return { insights: savedInsights, playbook, skipped: false as const };
}
