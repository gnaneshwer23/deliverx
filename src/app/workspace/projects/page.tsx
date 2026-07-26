import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
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
import {
  WorkspacePageHeader,
  WorkspaceProductShell,
} from "@/components/professional-workspace/workspace-product-shell";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status, delivery_type, created_at, closure_processed_at")
    .order("created_at", { ascending: false });

  return (
    <WorkspaceProductShell
      aside={
        <>
          <section>
            <h2>What matters</h2>
            <p style={{ marginTop: 8 }}>
              Delivery initiatives in your organisation. Open a project for workstreams, tasks, and
              meetings.
            </p>
          </section>
          <section>
            <h2>Related</h2>
            <ul className="pw-link-list" style={{ listStyle: "none", padding: 0 }}>
              <li>
                <Link href="/workspace">Workspace home</Link>
              </li>
              <li>
                <Link href="/project/new">Create delivery project</Link>
              </li>
            </ul>
          </section>
        </>
      }
    >
      <WorkspacePageHeader
        eyebrow="Professional Workspace · Projects"
        title="Projects"
        lead="All delivery initiatives in your organisation."
        actions={
          <Link href="/project/new" className="pw-button">
            New project
          </Link>
        }
        context={
          <div className="pw-context-card">
            <span>Projects</span>
            <strong>{projects?.length ?? 0}</strong>
            <small>Organisation list</small>
          </div>
        }
      />

      {!projects?.length ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start tracking delivery work."
          actionLabel="Create project"
          actionHref="/project/new"
        />
      ) : (
        <div className="pw-table-wrap">
          <Table>
            <TableHeader>
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
                <TableRow key={p.id}>
                  <TableCell className="px-4">
                    <Link href={`/project/${p.id}`}>{p.name}</Link>
                  </TableCell>
                  <TableCell className="px-4">
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="px-4">{p.delivery_type ?? "—"}</TableCell>
                  <TableCell className="px-4">
                    {new Date(p.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-4">
                    {p.closure_processed_at ? "Extracted" : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </WorkspaceProductShell>
  );
}
