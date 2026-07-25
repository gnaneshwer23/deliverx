import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CalendarClock,
  CheckSquare,
  FileText,
  Gavel,
  Inbox,
  LayoutDashboard,
  Lightbulb,
  MessageSquare,
  Scale,
  Sparkles,
  Users,
  UserCircle2,
} from "lucide-react";
import {
  PROFESSIONAL_WORKSPACE_MODULES,
  type WorkspaceModuleId,
} from "@/lib/professional-workspace/modules";
import type { WorkspaceNavItem } from "@/config/workspace-nav";

const MODULE_ICONS: Record<WorkspaceModuleId, LucideIcon> = {
  overview: LayoutDashboard,
  team: Users,
  stakeholders: UserCircle2,
  inbox: Inbox,
  meetings: MessageSquare,
  tasks: CheckSquare,
  artefacts: FileText,
  decisions: Gavel,
  risks: AlertTriangle,
  timeline: CalendarClock,
  insights: Lightbulb,
  coach: Sparkles,
  evidence: Scale,
};

/** Primary Professional Workspace IA — multidisciplinary work modules. */
export const professionalWorkspaceNav: WorkspaceNavItem[] = PROFESSIONAL_WORKSPACE_MODULES.map(
  (m) => ({
    href: m.href,
    label: m.label,
    icon: MODULE_ICONS[m.id],
    id: `pw-${m.id}`,
  }),
);

export { MODULE_ICONS };
