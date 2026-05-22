import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  active: "bg-emerald-100 text-emerald-700",
  paused: "bg-amber-100 text-amber-700",
  completed: "bg-indigo-100 text-indigo-700",
  archived: "bg-slate-200 text-slate-500",
};

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status, delivery_type, created_at, closure_processed_at")
    .order("created_at", { ascending: false });

  return (
    <main className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <FolderKanban size={22} className="text-[#0F766E]" /> Projects
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            All delivery initiatives in your organisation.
          </p>
        </div>
        <Link
          href="/project/new"
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62]"
        >
          <Plus size={16} /> New project
        </Link>
      </div>

      {!projects?.length ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <p className="font-medium text-slate-700">No projects yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Create your first project to start tracking delivery intelligence.
          </p>
          <Link
            href="/project/new"
            className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62]"
          >
            Create project
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Insights</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/project/${p.id}`}
                      className="font-medium text-[#0F766E] hover:underline"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[p.status] ?? STATUS_STYLE.draft}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {p.delivery_type ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {p.closure_processed_at ? "Extracted" : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
