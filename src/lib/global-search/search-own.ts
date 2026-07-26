import type { SupabaseClient } from "@supabase/supabase-js";
import { SEARCH_CATALOGUE } from "@/lib/global-search/catalogue";
import { filterCatalogue } from "@/lib/global-search/filter";
import type { SearchHit } from "@/lib/global-search/types";

const DEFAULT_LIMIT = 8;

function sanitizePattern(query: string): string {
  return query.replace(/[%_,]/g, " ").trim();
}

/**
 * Own-resource search. Every DB query is explicitly scoped to `userId`
 * (defence in depth beyond RLS). Never accepts a target user other than self.
 */
export async function searchOwnResources(
  supabase: SupabaseClient,
  userId: string,
  query: string,
  limitPerType = DEFAULT_LIMIT,
): Promise<SearchHit[]> {
  const ownerId = userId.trim();
  if (!ownerId) {
    throw new Error("userId is required for self-only search");
  }

  const q = query.trim();
  if (!q) return [];

  const safe = sanitizePattern(q);
  if (!safe) return [];
  const pattern = `%${safe}%`;

  const [evidence, projects, artefacts, enrolments] = await Promise.all([
    supabase
      .from("pi_evidence_records")
      .select("id, title, summary, category")
      .eq("user_id", ownerId)
      .or(`title.ilike.${pattern},summary.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(limitPerType),
    supabase
      .from("projects")
      .select("id, name, status")
      .eq("created_by", ownerId)
      .or(`name.ilike.${pattern},goal.ilike.${pattern}`)
      .order("updated_at", { ascending: false })
      .limit(limitPerType),
    supabase
      .from("artefacts")
      .select("id, title, kind")
      .eq("user_id", ownerId)
      .ilike("title", pattern)
      .order("created_at", { ascending: false })
      .limit(limitPerType),
    supabase
      .from("xperience_enrolments")
      .select("id, company_name, status, day")
      .eq("user_id", ownerId)
      .ilike("company_name", pattern)
      .order("created_at", { ascending: false })
      .limit(limitPerType),
  ]);

  const items: SearchHit[] = [];

  for (const row of evidence.data ?? []) {
    items.push({
      id: `evidence-${row.id}`,
      kind: "evidence",
      title: (row.title as string) || "Evidence record",
      description: String(row.summary ?? row.category ?? "Your evidence").slice(0, 140),
      href: "/profile/evidence",
    });
  }

  for (const row of projects.data ?? []) {
    items.push({
      id: `project-${row.id}`,
      kind: "project",
      title: (row.name as string) || "Project",
      description: `Your project · ${row.status ?? "active"}`,
      href: `/project/${row.id}`,
    });
  }

  for (const row of artefacts.data ?? []) {
    items.push({
      id: `artefact-${row.id}`,
      kind: "artefact",
      title: (row.title as string) || "Artefact",
      description: `Your artefact · ${row.kind ?? "document"}`,
      href: "/profile",
    });
  }

  for (const row of enrolments.data ?? []) {
    items.push({
      id: `enrolment-${row.id}`,
      kind: "enrolment",
      title: (row.company_name as string) || "Experience enrolment",
      description: `Experience · day ${row.day ?? "—"} · ${row.status ?? "active"}`,
      href: "/experience/app",
    });
  }

  return items;
}

export function searchCatalogueHits(query: string, limit = 12): SearchHit[] {
  return filterCatalogue(SEARCH_CATALOGUE, query).slice(0, limit);
}

export async function runGlobalSearch(
  supabase: SupabaseClient,
  userId: string,
  query: string,
): Promise<SearchHit[]> {
  const q = query.trim();
  const destinations = searchCatalogueHits(q, q ? 10 : 14);
  if (!q) return destinations;

  const resources = await searchOwnResources(supabase, userId, q);
  // Destinations / help first, then own resources — no third-party data.
  return [...destinations, ...resources];
}
