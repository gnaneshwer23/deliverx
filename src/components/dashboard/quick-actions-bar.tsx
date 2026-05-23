import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  CheckSquare,
  ClipboardList,
  Command,
  Cpu,
  FileBarChart2,
  GitBranch,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
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
  { href: "/workspace/pmo", label: "PMO view", icon: Command, roles: ["pm", "executive"] },
  { href: "/workspace/twin", label: "Digital twin", icon: Cpu, roles: ["pm", "executive"] },
  { href: "/workspace/portfolio", label: "Portfolio", icon: ClipboardList, roles: ["pm", "executive"] },
  { href: "/workspace/coordination", label: "Coordination", icon: Calendar, roles: ["executive"] },
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
