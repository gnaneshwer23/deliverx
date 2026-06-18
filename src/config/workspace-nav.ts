import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Brain,
  BrainCircuit,
  CalendarClock,
  CheckSquare,
  Code2,
  Command,
  Cpu,
  Crown,
  FileText,
  FolderKanban,
  Gauge,
  GitBranch,
  Globe2,
  Kanban,
  Layers,
  LayoutDashboard,
  MessageSquare,
  NotebookPen,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Store,
  Target,
  Telescope,
  TrendingUp,
  Users,
} from "lucide-react";

export type WorkspaceNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  id: string;
};

export const workspaceCoreNav: WorkspaceNavItem[] = [
  { href: "/workspace/assistant", label: "AI Workspace", icon: Cpu, id: "ws" },
  { href: "/workspace/dashboard", label: "Command Centre", icon: LayoutDashboard, id: "dash" },
  { href: "/workspace/ba", label: "BA Mission Control", icon: NotebookPen, id: "ba" },
  { href: "/workspace/product", label: "Product Mission Control", icon: TrendingUp, id: "product" },
  { href: "/workspace/pm-mission", label: "PM Mission Control", icon: CalendarClock, id: "pm-mission" },
  { href: "/workspace/founder", label: "Founder Mission Control", icon: Crown, id: "founder" },
  { href: "/workspace/engineer", label: "Engineer Mission Control", icon: Code2, id: "engineer" },
  { href: "/workspace/scrum-mission", label: "Scrum Mission Control", icon: Kanban, id: "scrum" },
  { href: "/workspace/qa", label: "QA Mission Control", icon: ShieldCheck, id: "qa" },
];

export const workspaceDeliveryNav: WorkspaceNavItem[] = [
  { href: "/project/new", label: "New project", icon: Plus, id: "newproj" },
  { href: "/project/new?mode=chat", label: "Guided setup (chat)", icon: MessageSquare, id: "chatproj" },
  { href: "/workspace/projects", label: "Projects", icon: FolderKanban, id: "proj" },
  { href: "/workspace/tasks", label: "Tasks", icon: CheckSquare, id: "task" },
  { href: "/workspace/team", label: "Team & Gov", icon: Users, id: "team" },
  { href: "/workspace/search", label: "Search", icon: Search, id: "search" },
];

export const workspaceIntelligenceNav: WorkspaceNavItem[] = [
  { href: "/workspace/alerts", label: "Alert Queue", icon: Brain, id: "alert" },
  { href: "/workspace/proposals", label: "AI output review", icon: ShieldCheck, id: "prop" },
  { href: "/workspace/audit", label: "Responses audit", icon: Shield, id: "audit" },
  { href: "/workspace/meetings", label: "Meetings", icon: MessageSquare, id: "meet" },
  { href: "/workspace/benefits", label: "Benefits", icon: Target, id: "ben" },
  { href: "/workspace/capacity", label: "Capacity", icon: Gauge, id: "cap" },
  { href: "/workspace/intelligence", label: "Learning loop", icon: BrainCircuit, id: "learn" },
  { href: "/workspace/twin", label: "Digital Twin", icon: Telescope, id: "twin" },
  { href: "/workspace/global", label: "Global Intel", icon: Globe2, id: "global" },
  { href: "/workspace/coordination", label: "Coordination", icon: BrainCircuit, id: "coord" },
  { href: "/workspace/documents", label: "Documents", icon: FileText, id: "docs" },
  { href: "/workspace/reports", label: "Reports", icon: BarChart3, id: "rep" },
];

export const workspaceEcosystemNav: WorkspaceNavItem[] = [
  { href: "/workspace/portfolio", label: "Portfolio", icon: FolderKanban, id: "port" },
  { href: "/workspace/programmes", label: "Programmes", icon: Layers, id: "prog" },
  { href: "/workspace/pmo", label: "PMO Dashboard", icon: Command, id: "pmo" },
  { href: "/workspace/marketplace", label: "Marketplace", icon: Store, id: "market" },
  { href: "/workspace/playbooks", label: "Playbooks", icon: BookOpen, id: "play" },
  { href: "/workspace/memory", label: "Org Memory", icon: Brain, id: "memory" },
  { href: "/workspace/benchmarking", label: "Benchmarking", icon: Gauge, id: "bench" },
];

export const workspaceGovernanceNav: WorkspaceNavItem[] = [
  { href: "/workspace/raid", label: "RAID Log", icon: Shield, id: "raid" },
  { href: "/workspace/decisions", label: "Decisions", icon: GitBranch, id: "dec" },
  { href: "/workspace/changes", label: "Changes", icon: RefreshCw, id: "cr" },
  { href: "/workspace/governance/approvals", label: "Approvals", icon: Shield, id: "appr" },
];

export const workspaceNavSections = [
  { label: "Core", items: workspaceCoreNav },
  { label: "Workspace", items: workspaceDeliveryNav },
  { label: "Intelligence", items: workspaceIntelligenceNav },
  { label: "Ecosystem", items: workspaceEcosystemNav },
  { label: "Governance", items: workspaceGovernanceNav },
] as const;

export function allWorkspaceNavHrefs(): string[] {
  return workspaceNavSections.flatMap((section) => section.items.map((item) => item.href));
}
