import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { listRaidItems, type RaidItemType } from "@/services/governance";
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

type Params = Promise<{ id: string }>;
type Search = Promise<{ type?: string }>;

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
  const { type: typeFilter } = await searchParams;

  const filterType =
    typeFilter && typeFilter !== "all" ? (typeFilter as RaidItemType) : undefined;
  const items = await listRaidItems(id, filterType);

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
            t.value === "all" ? `/project/${id}/raid` : `/project/${id}/raid?type=${t.value}`;
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
            </div>
          )}
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">New RAID item</h2>
          <RaidForm projectId={id} defaultType={filterType ?? "risk"} />
        </div>
      </div>
    </main>
  );
}
