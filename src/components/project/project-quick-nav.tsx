import Link from "next/link";
import {
  Calendar,
  CheckSquare,
  FileBarChart2,
  GitBranch,
  MessageSquare,
  Scale,
  ShieldAlert,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

const LINKS = [
  { href: "tasks", label: "Tasks", icon: CheckSquare },
  { href: "meetings", label: "Meetings", icon: Calendar },
  { href: "decisions", label: "Decisions", icon: Scale },
  { href: "raid", label: "RAID", icon: ShieldAlert },
  { href: "standups", label: "Standups", icon: Users },
  { href: "reports", label: "Reports", icon: FileBarChart2 },
  { href: "traceability", label: "Traceability", icon: GitBranch },
  { href: "workstreams", label: "Workstreams", icon: MessageSquare },
];

export function ProjectQuickNav({ projectId }: { projectId: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {LINKS.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={`/project/${projectId}/${link.href}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-[#0F766E]/40 hover:text-[#0F766E]"
          >
            <Icon size={13} />
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}

export function ProjectGovernanceCard({
  title,
  href,
  children,
  empty,
}: {
  title: string;
  href: string;
  children: ReactNode;
  empty?: boolean;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <Link href={href} className="text-xs font-medium text-[#0F766E] hover:underline">
          {empty ? "Add" : "View all"} →
        </Link>
      </div>
      {children}
    </section>
  );
}
