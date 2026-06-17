/**
 * Project RAG memory — sync delivery artifacts into pgvector and semantic search.
 */

import { createClient } from "@/lib/supabase/server";
import { throwIfMissingTable } from "@/lib/db-errors";
import { embedTexts, OpenAiConfigError } from "@/lib/ai/openai";
import { formatRagContextBlock, splitTextIntoChunks } from "@/lib/ai/text-chunks";
import { getActiveCharter } from "./charter";
import { listApprovedRequirements } from "./baRequirements";
import { listDecisions, listMeetings, listRaidItems } from "./governance";
import { listMemory } from "./memory";

export type ProjectMemorySourceType =
  | "business_case"
  | "charter"
  | "requirement"
  | "meeting"
  | "decision"
  | "raid"
  | "lesson"
  | "report";

export type ProjectMemoryHit = {
  id: string;
  sourceType: ProjectMemorySourceType;
  sourceId: string | null;
  title: string | null;
  content: string;
  similarity: number | null;
};

export type OrgMemoryHit = ProjectMemoryHit & {
  projectId: string;
  projectName: string;
};

type MemoryChunkDraft = {
  sourceType: ProjectMemorySourceType;
  sourceId: string | null;
  title: string | null;
  content: string;
  chunkIndex: number;
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

function expandDrafts(
  sourceType: ProjectMemorySourceType,
  sourceId: string | null,
  title: string | null,
  body: string,
): MemoryChunkDraft[] {
  const trimmed = body.trim();
  if (!trimmed) return [];

  return splitTextIntoChunks(trimmed).map((content, chunkIndex) => ({
    sourceType,
    sourceId,
    title,
    content,
    chunkIndex,
  }));
}

async function collectProjectMemoryDrafts(projectId: string): Promise<MemoryChunkDraft[]> {
  const { supabase } = await getOrgContext();
  const drafts: MemoryChunkDraft[] = [];

  const [bcReview, charter, requirements, meetings, decisions, raid, lessons] =
    await Promise.all([
      supabase
        .from("business_case_reviews")
        .select("id, brief_excerpt, report, recommendation")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      getActiveCharter(projectId).catch(() => null),
      listApprovedRequirements(projectId).catch(() => []),
      listMeetings(projectId).catch(() => []),
      listDecisions(projectId).catch(() => []),
      listRaidItems(projectId).catch(() => []),
      listMemory({ projectId, limit: 40 }).catch(() => []),
    ]);

  if (bcReview.data) {
    const report = bcReview.data.report as Record<string, unknown> | null;
    const summary =
      typeof report?.executiveSummary === "string"
        ? report.executiveSummary
        : bcReview.data.brief_excerpt;
    drafts.push(
      ...expandDrafts(
        "business_case",
        bcReview.data.id as string,
        `Business case (${bcReview.data.recommendation})`,
        String(summary ?? ""),
      ),
    );
  }

  if (charter?.content) {
    drafts.push(
      ...expandDrafts("charter", charter.id, "Project charter", charter.content),
    );
  }

  for (const req of requirements) {
    drafts.push(
      ...expandDrafts(
        "requirement",
        req.id,
        `${req.req_code} — ${req.title}`,
        `${req.title}\n\n${req.description ?? ""}`,
      ),
    );
  }

  for (const m of meetings) {
    const body = [m.summary, m.ai_summary, m.transcript, m.notes].filter(Boolean).join("\n\n");
    if (body.trim()) {
      drafts.push(...expandDrafts("meeting", m.id, m.title, body));
    }
  }

  for (const d of decisions) {
    drafts.push(
      ...expandDrafts(
        "decision",
        d.id,
        d.title,
        [d.context, d.outcome].filter(Boolean).join("\n\n"),
      ),
    );
  }

  for (const r of raid) {
    drafts.push(
      ...expandDrafts(
        "raid",
        r.id,
        `${r.type}: ${r.title}`,
        [r.description, r.mitigation].filter(Boolean).join("\n\n"),
      ),
    );
  }

  for (const lesson of lessons) {
    drafts.push(
      ...expandDrafts("lesson", lesson.id, lesson.type, lesson.insight),
    );
  }

  const { data: reports } = await supabase
    .from("reports")
    .select("id, title, content, review_status")
    .eq("project_id", projectId)
    .eq("review_status", "published")
    .order("updated_at", { ascending: false })
    .limit(8);

  for (const rep of reports ?? []) {
    if (rep.content) {
      drafts.push(
        ...expandDrafts(
          "report",
          rep.id as string,
          rep.title as string,
          String(rep.content),
        ),
      );
    }
  }

  return drafts;
}

export async function syncProjectMemory(projectId: string): Promise<{
  chunks: number;
  skipped?: boolean;
}> {
  const drafts = await collectProjectMemoryDrafts(projectId);
  if (drafts.length === 0) return { chunks: 0 };

  const { supabase, orgId } = await getOrgContext();

  let vectors: number[][] = [];
  try {
    vectors = await embedTexts(drafts.map((d) => d.content));
  } catch (err) {
    if (err instanceof OpenAiConfigError) {
      return { chunks: 0, skipped: true };
    }
    throw err;
  }

  const { error: delErr } = await supabase
    .from("project_memory_chunks")
    .delete()
    .eq("project_id", projectId);

  if (delErr) {
    throwIfMissingTable(delErr, "project_memory_chunks");
    throw delErr;
  }

  const rows = drafts.map((draft, index) => ({
    organisation_id: orgId,
    project_id: projectId,
    source_type: draft.sourceType,
    source_id: draft.sourceId,
    title: draft.title,
    content: draft.content,
    chunk_index: draft.chunkIndex,
    embedding: vectors[index],
  }));

  const { error: insErr } = await supabase.from("project_memory_chunks").insert(rows);
  if (insErr) {
    throwIfMissingTable(insErr, "project_memory_chunks");
    throw insErr;
  }

  return { chunks: rows.length };
}

export async function searchProjectMemory(
  projectId: string,
  query: string,
  limit = 8,
  sourceTypes?: ProjectMemorySourceType[],
): Promise<ProjectMemoryHit[]> {
  const trimmed = query.trim();
  if (!trimmed) return listRecentProjectMemory(projectId, limit);

  const { supabase } = await getOrgContext();

  try {
    const [queryVector] = await embedTexts([trimmed.slice(0, 6000)]);
    const { data, error } = await supabase.rpc("match_project_memory_chunks", {
      p_project_id: projectId,
      p_query_embedding: queryVector,
      p_match_count: limit,
      p_source_types: sourceTypes ?? null,
    });

    if (error) {
      throwIfMissingTable(error, "project_memory_chunks");
      throw error;
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id),
      sourceType: row.source_type as ProjectMemorySourceType,
      sourceId: row.source_id ? String(row.source_id) : null,
      title: row.title ? String(row.title) : null,
      content: String(row.content),
      similarity: row.similarity != null ? Number(row.similarity) : null,
    }));
  } catch (err) {
    if (err instanceof OpenAiConfigError) {
      return searchProjectMemoryText(projectId, trimmed, limit);
    }
    throw err;
  }
}

async function searchProjectMemoryText(
  projectId: string,
  query: string,
  limit: number,
): Promise<ProjectMemoryHit[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("project_memory_chunks")
    .select("id, source_type, source_id, title, content")
    .eq("project_id", projectId)
    .ilike("content", `%${query.slice(0, 200)}%`)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    throwIfMissingTable(error, "project_memory_chunks");
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    sourceType: row.source_type as ProjectMemorySourceType,
    sourceId: row.source_id ? String(row.source_id) : null,
    title: row.title ? String(row.title) : null,
    content: String(row.content),
    similarity: null,
  }));
}

export async function searchOrgMemory(
  query: string,
  limit = 8,
): Promise<OrgMemoryHit[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const { supabase } = await getOrgContext();

  try {
    const [queryVector] = await embedTexts([trimmed.slice(0, 6000)]);
    const { data, error } = await supabase.rpc("match_org_memory_chunks", {
      p_query_embedding: queryVector,
      p_match_count: limit,
      p_source_types: null,
    });

    if (error) {
      if (error.code === "42883") {
        return searchOrgMemoryText(trimmed, limit);
      }
      throwIfMissingTable(error, "project_memory_chunks");
      throw error;
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id),
      projectId: String(row.project_id),
      projectName: String(row.project_name ?? "Project"),
      sourceType: row.source_type as ProjectMemorySourceType,
      sourceId: row.source_id ? String(row.source_id) : null,
      title: row.title ? String(row.title) : null,
      content: String(row.content),
      similarity: row.similarity != null ? Number(row.similarity) : null,
    }));
  } catch (err) {
    if (err instanceof OpenAiConfigError) {
      return searchOrgMemoryText(trimmed, limit);
    }
    throw err;
  }
}

async function searchOrgMemoryText(query: string, limit: number): Promise<OrgMemoryHit[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("project_memory_chunks")
    .select("id, project_id, source_type, source_id, title, content, projects!inner(name)")
    .ilike("content", `%${query.slice(0, 200)}%`)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    throwIfMissingTable(error, "project_memory_chunks");
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
      sourceType: row.source_type as ProjectMemorySourceType,
      sourceId: row.source_id ? String(row.source_id) : null,
      title: row.title ? String(row.title) : null,
      content: String(row.content),
      similarity: null,
    };
  });
}

export async function listRecentProjectMemory(
  projectId: string,
  limit = 8,
): Promise<ProjectMemoryHit[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("project_memory_chunks")
    .select("id, source_type, source_id, title, content")
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === "42P01") return [];
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    sourceType: row.source_type as ProjectMemorySourceType,
    sourceId: row.source_id ? String(row.source_id) : null,
    title: row.title ? String(row.title) : null,
    content: String(row.content),
    similarity: null,
  }));
}

export async function getProjectMemoryStats(projectId: string): Promise<{
  totalChunks: number;
  bySource: Record<string, number>;
}> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("project_memory_chunks")
    .select("source_type")
    .eq("project_id", projectId);

  if (error) {
    if (error.code === "42P01") return { totalChunks: 0, bySource: {} };
    throw error;
  }

  const bySource: Record<string, number> = {};
  for (const row of data ?? []) {
    const key = String(row.source_type);
    bySource[key] = (bySource[key] ?? 0) + 1;
  }

  return { totalChunks: data?.length ?? 0, bySource };
}

export async function buildProjectRagContext(
  projectId: string,
  question: string,
  limit = 6,
): Promise<string> {
  let hits = await searchProjectMemory(projectId, question, limit).catch(() => []);
  if (hits.length === 0) {
    hits = await listRecentProjectMemory(projectId, limit).catch(() => []);
  }
  return formatRagContextBlock(
    hits.map((h) => ({
      sourceType: h.sourceType,
      title: h.title,
      content: h.content,
      similarity: h.similarity ?? undefined,
    })),
  );
}

export async function enrichAssistantContext(
  projectId: string,
  question: string,
  existingContext?: string,
): Promise<string> {
  const rag = await buildProjectRagContext(projectId, question).catch(() => "");
  const parts = [existingContext?.trim(), rag.trim()].filter(Boolean);
  const combined = parts.join("\n\n");
  return combined.slice(0, 8000);
}
