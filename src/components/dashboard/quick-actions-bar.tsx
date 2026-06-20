import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  CalendarClock,
  CheckSquare,
  ClipboardList,
  Command,
  Cpu,
  Code2,
  Crown,
  FileBarChart2,
  GitBranch,
  Kanban,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { DELIVERY_PATTERNS_HREF, DELIVERY_PATTERNS_NAV_LABEL } from "@/lib/intelligence-nav-labels";
import type { UserRole } from "@/services/dashboard";

type Action = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: UserRole[];
};

const ACTIONS: Action[] = [
  { href: "/workspace/assistant", label: "Ask assistant", icon: Sparkles },
  { href: "/project/new", label: "New project", icon: GitBranch },
  { href: "/workspace/tasks", label: "Task inbox", icon: CheckSquare },
  { href: "/workspace/governance", label: "Governance", icon: ShieldCheck },
  { href: "/workspace/standups", label: "Standups", icon: Users },
  { href: "/workspace/reports", label: "Reports", icon: FileBarChart2 },
  { href: "/workspace/ba", label: "BA Mission Control", icon: NotebookPen, roles: ["ba", "pm"] },
  {
    href: "/workspace/product",
    label: "Product Mission Control",
    icon: TrendingUp,
    roles: ["product_manager", "pm", "executive"],
  },
  {
    href: "/workspace/pm-mission",
    label: "PM Mission Control",
    icon: CalendarClock,
    roles: ["pm", "executive"],
  },
  {
    href: "/workspace/engineer",
    label: "Engineer Mission Control",
    icon: Code2,
    roles: ["engineer", "team_member"],
  },
  {
    href: "/workspace/scrum-mission",
    label: "Scrum Mission Control",
    icon: Kanban,
    roles: ["scrum_master", "pm", "team_member"],
  },
  {
    href: "/workspace/qa",
    label: "QA Mission Control",
    icon: ShieldCheck,
    roles: ["qa", "pm", "team_member"],
  },
  {
    href: "/workspace/founder",
    label: "Founder Mission Control",
    icon: Crown,
    roles: ["executive"],
  },
  { href: "/workspace/pmo", label: "PMO view", icon: Command, roles: ["pm", "executive"] },
  { href: "/workspace/twin", label: "Digital twin", icon: Cpu, roles: ["pm", "executive"] },
  { href: "/workspace/portfolio", label: "Portfolio", icon: ClipboardList, roles: ["pm", "executive"] },
  { href: DELIVERY_PATTERNS_HREF, label: DELIVERY_PATTERNS_NAV_LABEL, icon: Calendar, roles: ["executive"] },
];

export function QuickActionsBar({ role }: { role: UserRole }) {
  const visible = ACTIONS.filter((a) => !a.roles || a.roles.includes(role));

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            className="inline-flex items-center gap-1.5 border border-[#E4E4DC] bg-white px-3 py-1.5 text-xs text-[#6B6B64] transition hover:border-[#1C4A2E] hover:text-[#0D0D0B]"
          >
            <Icon size={13} />
            {action.label}
          </Link>
        );
      })}
    </div>
  );
}
