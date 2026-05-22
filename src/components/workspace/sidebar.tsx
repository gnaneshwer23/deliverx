"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  GitBranch,
  ListChecks,
  ShieldCheck,
  FileBarChart2,
  Settings,
  Brain,
  BookOpen,
  Gauge,
  Briefcase,
  Layers,
  Command,
  Telescope,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  soon?: boolean;
  section?: "core" | "orchestration" | "intelligence" | "delivery";
};

const nav: NavItem[] = [
  { href: "/workspace/dashboard", label: "Dashboard", icon: LayoutDashboard, section: "core" },
  { href: "/workspace/dashboard", label: "Projects", icon: FolderKanban, section: "core" },
  { href: "/workspace/portfolio", label: "Portfolio", icon: Briefcase, section: "orchestration" },
  { href: "/workspace/programmes", label: "Programmes", icon: Layers, section: "orchestration" },
  { href: "/workspace/pmo", label: "PMO Dashboard", icon: Command, section: "orchestration" },
  { href: "/workspace/twin", label: "Digital Twin", icon: Telescope, section: "orchestration" },
  { href: "/workspace/memory", label: "Organisational Memory", icon: Brain, section: "intelligence" },
  { href: "/workspace/playbooks", label: "Playbooks", icon: BookOpen, section: "intelligence" },
  { href: "/workspace/benchmarking", label: "Benchmarking", icon: Gauge, section: "intelligence" },
  { href: "/workspace/workstreams", label: "Workstreams", icon: GitBranch, soon: true, section: "delivery" },
  { href: "/workspace/tasks", label: "Tasks", icon: ListChecks, soon: true, section: "delivery" },
  { href: "/workspace/governance", label: "Governance", icon: ShieldCheck, soon: true, section: "delivery" },
  { href: "/workspace/reports", label: "Reports", icon: FileBarChart2, soon: true, section: "delivery" },
];

const SECTION_LABEL: Record<NonNullable<NavItem["section"]>, string> = {
  core: "",
  orchestration: "Orchestration",
  intelligence: "Intelligence",
  delivery: "Delivery",
};

export function WorkspaceSidebar({
  orgName,
  userEmail,
}: {
  orgName?: string | null;
  userEmail?: string | null;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-white p-6 md:flex">
      <Link href="/workspace/dashboard" className="text-xl font-bold tracking-tight">
        DeliverX
      </Link>
      <div className="mt-1 truncate text-xs text-slate-500">{orgName ?? "Workspace"}</div>

      <nav className="mt-8 flex flex-col gap-1 text-sm">
        {nav.map((item, idx) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/workspace/dashboard" && pathname.startsWith(item.href + "/"));
          const prevSection = idx > 0 ? nav[idx - 1].section : undefined;
          const showHeader =
            item.section &&
            item.section !== prevSection &&
            SECTION_LABEL[item.section];
          return (
            <div key={`${item.href}-${item.label}`}>
              {showHeader ? (
                <div className="mt-4 mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {SECTION_LABEL[item.section!]}
                </div>
              ) : null}
              <Link
                href={item.soon ? "#" : item.href}
                aria-disabled={item.soon}
                className={`group flex items-center gap-2 rounded-md px-2 py-1.5 transition ${
                  active
                    ? "bg-[#0F766E]/10 font-semibold text-[#0F766E]"
                    : item.soon
                      ? "text-slate-400"
                      : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon size={16} />
                <span className="flex-1">{item.label}</span>
                {item.soon ? (
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                    Soon
                  </span>
                ) : null}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 border-t pt-4 text-xs">
        <Link
          href="/workspace/settings"
          className="flex items-center gap-2 text-slate-600 hover:text-[#0F766E]"
        >
          <Settings size={14} /> Settings
        </Link>
        <div className="truncate text-slate-500" title={userEmail ?? undefined}>
          {userEmail}
        </div>
      </div>
    </aside>
  );
}
