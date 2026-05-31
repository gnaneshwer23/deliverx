"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  BarChart3,
  Brain,
  BrainCircuit,
  CheckSquare,
  Cpu,
  FileText,
  FolderKanban,
  Gauge,
  GitBranch,
  Globe2,
  LayoutDashboard,
  MessageSquare,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  Target,
  Telescope,
  Users,
} from "lucide-react";
import { DxLogo } from "@/components/dx/dx-logo";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { UserMenu } from "@/components/dx/user-menu";
import { dxClass } from "@/lib/dx-theme";

const core = [
  { href: "/workspace/assistant", label: "AI Workspace", icon: Cpu, id: "ws" },
  { href: "/workspace/dashboard", label: "Command Centre", icon: LayoutDashboard, id: "dash" },
];

const workspace = [
  { href: "/project/new", label: "New project", icon: Plus, id: "newproj" },
  { href: "/project/new?mode=chat", label: "Guided setup (chat)", icon: MessageSquare, id: "chatproj" },
  { href: "/workspace/projects", label: "Projects", icon: FolderKanban, id: "proj" },
  { href: "/workspace/tasks", label: "Tasks", icon: CheckSquare, id: "task" },
  { href: "/workspace/team", label: "Team & Gov", icon: Users, id: "team" },
];

const intelligence = [
  { href: "/workspace/alerts", label: "Alert Queue", icon: Brain, id: "alert" },
  { href: "/workspace/meetings", label: "Meetings", icon: MessageSquare, id: "meet" },
  { href: "/workspace/benefits", label: "Benefits", icon: Target, id: "ben" },
  { href: "/workspace/capacity", label: "Capacity", icon: Gauge, id: "cap" },
  { href: "/workspace/twin", label: "Digital Twin", icon: Telescope, id: "twin" },
  { href: "/workspace/global", label: "Global Intel", icon: Globe2, id: "global" },
  { href: "/workspace/coordination", label: "Coordination", icon: BrainCircuit, id: "coord" },
  { href: "/workspace/documents", label: "Documents", icon: FileText, id: "docs" },
  { href: "/workspace/reports", label: "Reports", icon: BarChart3, id: "rep" },
  { href: "/workspace/executive", label: "Executive", icon: LayoutDashboard, id: "exec" },
  { href: "/workspace/portfolio", label: "Portfolio", icon: FolderKanban, id: "port" },
];

const governance = [
  { href: "/workspace/raid", label: "RAID Log", icon: Shield, id: "raid" },
  { href: "/workspace/decisions", label: "Decisions", icon: GitBranch, id: "dec" },
  { href: "/workspace/changes", label: "Changes", icon: RefreshCw, id: "cr" },
  { href: "/workspace/governance/approvals", label: "Approvals", icon: Shield, id: "appr" },
];

function NavSection({
  label,
  items,
  pathname,
}: {
  label: string;
  items: { href: string; label: string; icon: typeof Cpu; id: string }[];
  pathname: string;
}) {
  return (
    <div className="py-3.5">
      <div className="mb-1 px-3.5 font-[family-name:var(--font-dx-mono)] text-[7px] uppercase tracking-[0.2em] text-[#A8A89E]">
        {label}
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const active =
          pathname === item.href ||
          (item.href !== "/workspace/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`flex items-center gap-2 border-l-2 px-3.5 py-1.5 text-[13px] transition ${
              active
                ? "border-[#1C4A2E] bg-[#EEF5F1] text-[#1C4A2E]"
                : "border-transparent text-[#6B6B64] hover:bg-[#F7F7F2] hover:text-[#0D0D0B]"
            }`}
          >
            <Icon size={14} className={active ? "opacity-100" : "opacity-65"} />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed bottom-0 left-0 top-[var(--dx-navh)] z-40 flex w-[var(--dx-sbw)] flex-col overflow-y-auto border-r border-[#E4E4DC] bg-white">
      <div className="flex-1">
        <NavSection label="Core" items={core} pathname={pathname} />
        <NavSection label="Workspace" items={workspace} pathname={pathname} />
        <NavSection label="Intelligence" items={intelligence} pathname={pathname} />
        <NavSection label="Governance" items={governance} pathname={pathname} />
      </div>
      <div className="border-t border-[#E4E4DC] py-2.5">
        <Link
          href="/workspace/settings"
          className="flex items-center gap-2 px-3.5 py-1.5 text-[12px] text-[#6B6B64] hover:text-[#1C4A2E]"
        >
          <Settings size={14} /> Settings
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 px-3.5 py-1.5 text-[12px] text-[#A8A89E] hover:text-[#6B6B64]"
        >
          ← Back to site
        </Link>
        <div className="px-3.5 py-1.5">
          <SignOutButton
            showIcon
            className="flex items-center gap-2 text-[12px] text-[#6B6B64] hover:text-[#C0392B] disabled:opacity-60"
          />
        </div>
      </div>
    </aside>
  );
}

function NavSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed) router.push(`/workspace/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={onSubmit} className="relative hidden max-w-[340px] flex-1 md:block">
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A8A89E]">
        <Brain size={13} />
      </span>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search projects, tasks, docs…"
        className="w-full border border-[#E4E4DC] bg-[#F7F7F2] py-1.5 pl-8 pr-3 text-[13px] outline-none focus:border-[#1C4A2E]"
      />
    </form>
  );
}

export function AppNav({
  userEmail,
  orgName,
}: {
  userEmail?: string | null;
  orgName?: string | null;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-[var(--dx-navh)] items-center gap-3 border-b border-[#E4E4DC] bg-white px-4 md:px-5">
      <div className="mr-1 border-r border-[#E4E4DC] pr-3">
        <DxLogo href="/workspace/dashboard" showTag />
      </div>

      <NavSearch />

      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/workspace/alerts"
          className={`${dxClass.btnGhost} hidden px-3 py-1.5 text-[9px] sm:inline-flex`}
        >
          Alerts
        </Link>
        <Link href="/project/new" className={`${dxClass.btnGhost} hidden px-3 py-1.5 text-[9px] md:inline-flex`}>
          <Plus size={12} /> New project
        </Link>
        <Link href="/workspace/assistant" className={`${dxClass.btnSm} hidden sm:inline-flex`}>
          <Cpu size={12} /> AI Assistant
        </Link>
        <div className="hidden h-5 w-px bg-[#E4E4DC] sm:block" />
        <UserMenu userEmail={userEmail} orgName={orgName} />
      </div>
    </header>
  );
}
