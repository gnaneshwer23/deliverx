"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
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
  BrainCircuit,
  Store,
  Globe2,
  Sparkles,
  MessageSquare,
  Search,
} from "lucide-react";
import {
  SidebarNavLinks,
  SidebarNavSection,
  type SidebarNavItem,
} from "@/components/workspace/sidebar-nav-section";

const coreNav: SidebarNavItem[] = [
  { href: "/workspace/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workspace/assistant", label: "Assistant", icon: Sparkles },
  { href: "/workspace/search", label: "Search", icon: Search },
  { href: "/workspace/projects", label: "Projects", icon: FolderKanban },
  { href: "/workspace/tasks", label: "Tasks", icon: ListChecks },
  { href: "/workspace/standups", label: "Standups", icon: MessageSquare },
  { href: "/workspace/governance", label: "Governance", icon: ShieldCheck },
  { href: "/workspace/reports", label: "Reports", icon: FileBarChart2 },
];

const advancedNav: SidebarNavItem[] = [
  { href: "/workspace/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/workspace/programmes", label: "Programmes", icon: Layers },
  { href: "/workspace/pmo", label: "PMO Dashboard", icon: Command },
  { href: "/workspace/twin", label: "Digital Twin", icon: Telescope },
  { href: "/workspace/memory", label: "Organisational Memory", icon: Brain },
  { href: "/workspace/playbooks", label: "Playbooks", icon: BookOpen },
  { href: "/workspace/benchmarking", label: "Benchmarking", icon: Gauge },
  { href: "/workspace/coordination", label: "Coordination", icon: BrainCircuit },
  { href: "/workspace/marketplace", label: "Marketplace", icon: Store },
  { href: "/workspace/global", label: "Global Intelligence", icon: Globe2 },
];

export function WorkspaceSidebar({
  orgName,
  userEmail,
}: {
  orgName?: string | null;
  userEmail?: string | null;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-[#0a0e14] p-6 md:flex">
      <Link
        href="/workspace/dashboard"
        className="font-[family-name:var(--font-display)] text-xl tracking-tight text-[#f8f6f2]"
      >
        DeliverX
      </Link>
      <div className="mt-1 truncate text-[11px] uppercase tracking-[0.15em] text-[#9ca3af]">
        {orgName ?? "Workspace"}
      </div>

      <nav className="mt-8 flex flex-col gap-1 text-sm">
        <SidebarNavLinks items={coreNav} pathname={pathname} />
        <SidebarNavSection
          label="Advanced"
          items={advancedNav}
          pathname={pathname}
          defaultOpen={false}
        />
      </nav>

      <div className="mt-auto flex flex-col gap-3 border-t border-white/10 pt-4 text-xs">
        <Link
          href="/workspace/settings"
          className="flex items-center gap-2 text-[#9ca3af] transition hover:text-[#6ee7c7]"
        >
          <Settings size={14} /> Settings
        </Link>
        <div className="truncate text-[#6b7280]" title={userEmail ?? undefined}>
          {userEmail}
        </div>
      </div>
    </aside>
  );
}
