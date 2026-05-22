import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FolderKanban, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status, delivery_type, created_at, closure_processed_at")
    .order("created_at", { ascending: false });

  return (
    <main className="p-8">
      <PageHeader
        title="Projects"
        description="All delivery initiatives in your organisation."
        icon={FolderKanban}
        actions={
          <Link
            href="/project/new"
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62]"
          >
            <Plus size={16} /> New project
          </Link>
        }
      />

      {!projects?.length ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start tracking delivery intelligence."
          actionLabel="Create project"
          actionHref="/project/new"
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50 text-slate-500">
              <TableRow>
                <TableHead className="px-4">Name</TableHead>
                <TableHead className="px-4">Status</TableHead>
                <TableHead className="px-4">Type</TableHead>
                <TableHead className="px-4">Created</TableHead>
                <TableHead className="px-4">Insights</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.id} className="hover:bg-slate-50/50">
                  <TableCell className="px-4">
                    <Link
                      href={`/project/${p.id}`}
                      className="font-medium text-[#0F766E] hover:underline"
                    >
                      {p.name}
                    </Link>
                  </TableCell>
                  <TableCell className="px-4">
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="px-4 text-slate-600">
                    {p.delivery_type ?? "—"}
                  </TableCell>
                  <TableCell className="px-4 text-slate-500">
                    {new Date(p.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-4 text-slate-500">
                    {p.closure_processed_at ? "Extracted" : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  );
}
