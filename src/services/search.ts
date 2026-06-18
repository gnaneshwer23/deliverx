import { createClient } from "@/lib/supabase/server";
import { searchOrgMemory } from "@/services/projectMemoryRag";

export type SearchResultItem = {
  id: string;
  type: "project" | "task" | "raid" | "document" | "memory";
  title: string;
  subtitle: string;
  href: string;
  similarity?: number | null;
};

export type WorkspaceSearchResults = {
  query: string;
  items: SearchResultItem[];
};

function projectNameFromJoin(projects: unknown): string {
  if (Array.isArray(projects)) {
    const first = projects[0] as { name?: string } | undefined;
    return first?.name ?? "Project";
  }
  if (projects && typeof projects === "object" && "name" in projects) {
    return String((projects as { name?: string }).name ?? "Project");
  }
  return "Project";
}

export async function searchWorkspace(
  query: string,
  limitPerType = 8,
): Promise<WorkspaceSearchResults> {
  const q = query.trim();
  if (!q) return { query: q, items: [] };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const safe = q.replace(/[%_,]/g, " ").trim();
  const pattern = `%${safe}%`;

  const [projects, tasks, raid, documents, memoryHits] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, status")
      .or(`name.ilike.${pattern},goal.ilike.${pattern}`)
      .limit(limitPerType),
    supabase
      .from("tasks")
      .select("id, title, status, project_id, projects!inner(name)")
      .or(`title.ilike.${pattern},description.ilike.${pattern}`)
      .limit(limitPerType),
    supabase
      .from("raid_items")
      .select("id, title, type, status, project_id, projects!inner(name)")
      .or(`title.ilike.${pattern},description.ilike.${pattern}`)
      .limit(limitPerType),
    supabase
      .from("documents")
      .select("id, title, project_id, projects!inner(name)")
      .or(`title.ilike.${pattern},content_text.ilike.${pattern}`)
      .limit(limitPerType),
    searchOrgMemory(q, limitPerType).catch(() => []),
  ]);

  const items: SearchResultItem[] = [];

  for (const p of projects.data ?? []) {
    items.push({
      id: p.id as string,
      type: "project",
      title: p.name as string,
      subtitle: `Project · ${p.status}`,
      href: `/project/${p.id}`,
    });
  }

  for (const t of tasks.data ?? []) {
    const projName = projectNameFromJoin(t.projects);
    items.push({
      id: t.id as string,
      type: "task",
      title: t.title as string,
      subtitle: `Task · ${projName} · ${t.status}`,
      href: `/project/${t.project_id}/tasks/${t.id}`,
    });
  }

  for (const r of raid.data ?? []) {
    const projName = projectNameFromJoin(r.projects);
    items.push({
      id: r.id as string,
      type: "raid",
      title: r.title as string,
      subtitle: `${r.type} · ${projName}`,
      href: `/project/${r.project_id}/raid`,
    });
  }

  for (const d of documents.data ?? []) {
    const projName = projectNameFromJoin(d.projects);
    items.push({
      id: d.id as string,
      type: "document",
      title: (d.title as string) || "Document",
      subtitle: `Document · ${projName}`,
      href: `/project/${d.project_id}/documents`,
    });
  }

  for (const hit of memoryHits) {
    const excerpt = hit.content.replace(/\s+/g, " ").trim().slice(0, 80);
    items.push({
      id: hit.id,
      type: "memory",
      title: hit.title ?? `${hit.sourceType.replace(/_/g, " ")} memory`,
      subtitle: `Memory · ${hit.projectName} · ${excerpt}${excerpt.length >= 80 ? "…" : ""}`,
      href: `/project/${hit.projectId}/traceability`,
      similarity: hit.similarity,
    });
  }

  items.sort((a, b) => {
    const simA = a.similarity ?? -1;
    const simB = b.similarity ?? -1;
    if (simA !== simB) return simB - simA;
    return a.title.localeCompare(b.title);
  });

  return { query: q, items };
}
