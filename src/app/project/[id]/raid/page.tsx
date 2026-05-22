import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listRaidItems, countRaidItems, type RaidItemType } from "@/services/governance";
import {
  DEFAULT_PAGE_SIZE,
  Pagination,
  parsePageParam,
  totalPages,
} from "@/components/shared/pagination";
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
import { RaidForm } from "./raid-form";
import { RaidAiPanel } from "./raid-ai-panel";

type Params = Promise<{ id: string }>;
type Search = Promise<{ type?: string; page?: string }>;

const TYPES: Array<{ value: RaidItemType | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "risk", label: "Risks" },
  { value: "assumption", label: "Assumptions" },
  { value: "issue", label: "Issues" },
  { value: "dependency", label: "Dependencies" },
];

export default async function ProjectRaidPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { id } = await params;
  const { type: typeFilter, page: pageRaw } = await searchParams;
  const page = parsePageParam(pageRaw);

  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", id)
    .single();

  const filterType =
    typeFilter && typeFilter !== "all" ? (typeFilter as RaidItemType) : undefined;

  const [items, total] = await Promise.all([
    listRaidItems(id, filterType, { page, pageSize: DEFAULT_PAGE_SIZE }),
    countRaidItems(id, filterType),
  ]);
  const pages = totalPages(total, DEFAULT_PAGE_SIZE);

  function buildHref(next: { type?: string; page?: number }) {
    const params = new URLSearchParams();
    const t = "type" in next ? next.type : typeFilter;
    const pg = "page" in next ? next.page : page;
    if (t && t !== "all") params.set("type", t);
    if (pg && pg > 0) params.set("page", String(pg));
    const q = params.toString();
    return q ? `/project/${id}/raid?${q}` : `/project/${id}/raid`;
  }

  return (
    <main className="p-6">
      <PageHeader
        title="RAID log"
        description="Risks, assumptions, issues, and dependencies."
        icon={ShieldAlert}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {TYPES.map((t) => {
          const href =
            t.value === "all"
              ? buildHref({ type: undefined, page: 0 })
              : buildHref({ type: t.value, page: 0 });
          const active =
            t.value === "all"
              ? !typeFilter || typeFilter === "all"
              : typeFilter === t.value;
          return (
            <Link
              key={t.value}
              href={href}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                active
                  ? "bg-[#0F766E] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {items.length === 0 ? (
            <EmptyState title="No RAID items" description="Log your first risk or issue." />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50 text-slate-500">
                  <TableRow>
                    <TableHead className="px-4">Title</TableHead>
                    <TableHead className="px-4">Type</TableHead>
                    <TableHead className="px-4">Severity</TableHead>
                    <TableHead className="px-4">Status</TableHead>
                    <TableHead className="px-4">Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-4 font-medium">{item.title}</TableCell>
                      <TableCell className="px-4 capitalize">{item.type}</TableCell>
                      <TableCell className="px-4">
                        <StatusBadge status={item.severity} />
                      </TableCell>
                      <TableCell className="px-4">
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className="px-4 text-slate-500">
                        {item.due_date
                          ? new Date(item.due_date).toLocaleDateString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                page={page}
                totalPages={pages}
                totalItems={total}
                buildHref={(p) => buildHref({ page: p })}
              />
            </div>
          )}
        </div>
        <div className="space-y-6">
          <RaidAiPanel projectId={id} projectName={project?.name ?? "Project"} />
          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-700">New RAID item</h2>
            <RaidForm projectId={id} defaultType={filterType ?? "risk"} />
          </div>
        </div>
      </div>
    </main>
  );
}
