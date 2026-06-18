import Link from "next/link";
import {
  Archive,
  Calendar,
  CheckSquare,
  FileBarChart2,
  GitBranch,
  MessageSquare,
  Milestone,
  Scale,
  ShieldAlert,
  Target,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { projectQuickNavSegments, projectHref } from "@/config/project-nav";

const ICONS: Record<string, typeof CheckSquare> = {
  tasks: CheckSquare,
  milestones: Milestone,
  benefits: Target,
  meetings: Calendar,
  decisions: Scale,
  raid: ShieldAlert,
  changes: GitBranch,
  standups: Users,
  reports: FileBarChart2,
  closure: Archive,
  traceability: GitBranch,
  workstreams: MessageSquare,
};

const LABELS: Record<string, string> = {
  tasks: "Tasks",
  milestones: "Milestones",
  benefits: "Benefits",
  meetings: "Meetings",
  decisions: "Decisions",
  raid: "RAID",
  changes: "Changes",
  standups: "Standups",
  reports: "Reports",
  closure: "Closure",
  traceability: "Traceability",
  workstreams: "Workstreams",
};

export function ProjectQuickNav({ projectId }: { projectId: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {projectQuickNavSegments.map((segment) => {
        const Icon = ICONS[segment] ?? CheckSquare;
        return (
          <Link
            key={segment}
            href={projectHref(projectId, segment)}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-[#0F766E]/40 hover:text-[#0F766E]"
          >
            <Icon size={13} />
            {LABELS[segment] ?? segment}
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
