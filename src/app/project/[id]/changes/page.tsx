import { GitPullRequest } from "lucide-react";
import { listChangeRequests } from "@/services/governance";
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
import { ChangeForm } from "./change-form";

type Params = Promise<{ id: string }>;

export default async function ProjectChangesPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const changes = await listChangeRequests(id);

  return (
    <main className="p-6">
      <PageHeader
        title="Change log"
        description="Track scope and delivery change requests."
        icon={GitPullRequest}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {changes.length === 0 ? (
            <EmptyState title="No changes yet" description="Log the first change request." />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50 text-slate-500">
                  <TableRow>
                    <TableHead className="px-4">Title</TableHead>
                    <TableHead className="px-4">Status</TableHead>
                    <TableHead className="px-4">Impact</TableHead>
                    <TableHead className="px-4">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {changes.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="px-4 font-medium">{c.title}</TableCell>
                      <TableCell className="px-4">
                        <StatusBadge status={c.status} />
                      </TableCell>
                      <TableCell className="max-w-xs truncate px-4 text-slate-600">
                        {c.impact ?? "—"}
                      </TableCell>
                      <TableCell className="px-4 text-slate-500">
                        {new Date(c.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">New change</h2>
          <ChangeForm projectId={id} />
        </div>
      </div>
    </main>
  );
}
