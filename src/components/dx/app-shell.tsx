"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Settings } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { AiDrawer } from "@/components/dx/ai-drawer";
import { AiDrawerProvider } from "@/components/dx/ai-drawer-context";
import { AppNav } from "@/components/dx/app-nav";
import type { DeliveryAlert } from "@/services/alerts";
import {
  workspaceDeliveryNav,
  workspaceEcosystemNav,
  workspaceGovernanceNav,
  workspaceIntelligenceNav,
  type WorkspaceNavItem,
} from "@/config/workspace-nav";
import { partitionCoreNav } from "@/lib/mission-nav";
import type { MissionPersonaId } from "@/lib/mission-nav";

function NavLink({
  item,
  pathname,
  pendingApprovals = 0,
  missionBadgeCount = 0,
  prominent = false,
}: {
  item: WorkspaceNavItem;
  pathname: string;
  pendingApprovals?: number;
  missionBadgeCount?: number;
  prominent?: boolean;
}) {
  const Icon = item.icon;
  const hrefPath = item.href.split("?")[0] ?? item.href;
  const active =
    pathname === item.href ||
    pathname === hrefPath ||
    (hrefPath !== "/workspace/dashboard" && pathname.startsWith(hrefPath));
  const propBadge = item.id === "prop" && pendingApprovals > 0 ? pendingApprovals : undefined;
  const missionBadge = missionBadgeCount > 0 ? missionBadgeCount : undefined;
  const badge = propBadge ?? missionBadge;

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-2 border-l-2 px-3.5 py-1.5 text-[13px] transition ${
        active
          ? "border-[#1C4A2E] bg-[#EEF5F1] text-[#1C4A2E]"
          : prominent
            ? "border-transparent font-medium text-[#2C2C28] hover:bg-[#F7F7F2] hover:text-[#0D0D0B]"
            : "border-transparent text-[#6B6B64] hover:bg-[#F7F7F2] hover:text-[#0D0D0B]"
      }`}
    >
      <Icon size={14} className={active ? "opacity-100" : "opacity-65"} />
      <span className="flex-1">{item.label}</span>
      {prominent && !active ? (
        <span className="rounded bg-[#EEF5F1] px-1.5 py-0.5 font-[family-name:var(--font-dx-mono)] text-[7px] uppercase tracking-wide text-[#1C4A2E]">
          You
        </span>
      ) : null}
      {badge && badge > 0 ? (
        <span className="min-w-[18px] rounded-full bg-[#B7620A] px-1.5 py-0.5 text-center font-[family-name:var(--font-dx-mono)] text-[9px] font-medium text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </Link>
  );
}

function NavSection({
  label,
  items,
  pathname,
  pendingApprovals = 0,
  missionBadgeCounts,
}: {
  label: string;
  items: WorkspaceNavItem[];
  pathname: string;
  pendingApprovals?: number;
  missionBadgeCounts?: Partial<Record<MissionPersonaId, number>>;
}) {
  return (
    <div className="py-3.5">
      <div className="mb-1 px-3.5 font-[family-name:var(--font-dx-mono)] text-[7px] uppercase tracking-[0.2em] text-[#A8A89E]">
        {label}
      </div>
      {items.map((item) => (
        <NavLink
          key={item.id}
          item={item}
          pathname={pathname}
          pendingApprovals={pendingApprovals}
          missionBadgeCount={missionBadgeCounts?.[item.id as MissionPersonaId] ?? 0}
        />
      ))}
    </div>
  );
}

function CoreNavSection({
  userRole,
  pathname,
  pendingApprovals = 0,
  missionBadgeCounts,
}: {
  userRole?: string | null;
  pathname: string;
  pendingApprovals?: number;
  missionBadgeCounts?: Partial<Record<MissionPersonaId, number>>;
}) {
  const [showOtherMissions, setShowOtherMissions] = useState(false);
  const { fixedCore, primaryMission, otherMissions } = partitionCoreNav(userRole);
  const otherMissionPendingTotal = otherMissions.reduce(
    (sum, item) => sum + (missionBadgeCounts?.[item.id as MissionPersonaId] ?? 0),
    0,
  );

  return (
    <div className="py-3.5">
      <div className="mb-1 px-3.5 font-[family-name:var(--font-dx-mono)] text-[7px] uppercase tracking-[0.2em] text-[#A8A89E]">
        Core
      </div>
      {fixedCore.map((item) => (
        <NavLink key={item.id} item={item} pathname={pathname} pendingApprovals={pendingApprovals} />
      ))}
      {primaryMission ? (
        <NavLink
          item={primaryMission}
          pathname={pathname}
          pendingApprovals={pendingApprovals}
          missionBadgeCount={missionBadgeCounts?.[primaryMission.id as MissionPersonaId] ?? 0}
          prominent
        />
      ) : null}
      {otherMissions.length > 0 ? (
        <div className="mt-1">
          <button
            type="button"
            onClick={() => setShowOtherMissions((open) => !open)}
            className="flex w-full items-center gap-1.5 px-3.5 py-1 text-[11px] text-[#A8A89E] hover:text-[#6B6B64]"
          >
            {showOtherMissions ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            Other mission controls
            <span className="font-[family-name:var(--font-dx-mono)] text-[9px]">
              ({otherMissions.length})
            </span>
            {otherMissionPendingTotal > 0 ? (
              <span className="ml-auto min-w-[18px] rounded-full bg-[#B7620A] px-1.5 py-0.5 text-center font-[family-name:var(--font-dx-mono)] text-[9px] font-medium text-white">
                {otherMissionPendingTotal > 99 ? "99+" : otherMissionPendingTotal}
              </span>
            ) : null}
          </button>
          {showOtherMissions
            ? otherMissions.map((item) => (
                <NavLink
                  key={item.id}
                  item={item}
                  pathname={pathname}
                  pendingApprovals={pendingApprovals}
                  missionBadgeCount={missionBadgeCounts?.[item.id as MissionPersonaId] ?? 0}
                />
              ))
            : null}
        </div>
      ) : null}
    </div>
  );
}

export function AppSidebar({
  pendingApprovals = 0,
  userRole,
  missionBadgeCounts,
}: {
  pendingApprovals?: number;
  userRole?: string | null;
  missionBadgeCounts?: Partial<Record<MissionPersonaId, number>>;
}) {
  const pathname = usePathname();

  return (
    <aside className="fixed bottom-0 left-0 top-[var(--dx-navh)] z-40 flex w-[var(--dx-sbw)] flex-col overflow-y-auto border-r border-[#E4E4DC] bg-white">
      <div className="flex-1">
        <CoreNavSection
          userRole={userRole}
          pathname={pathname}
          pendingApprovals={pendingApprovals}
          missionBadgeCounts={missionBadgeCounts}
        />
        <NavSection label="Workspace" items={workspaceDeliveryNav} pathname={pathname} />
        <NavSection
          label="Intelligence"
          items={workspaceIntelligenceNav}
          pathname={pathname}
          pendingApprovals={pendingApprovals}
        />
        <NavSection label="Ecosystem" items={workspaceEcosystemNav} pathname={pathname} />
        <NavSection label="Governance" items={workspaceGovernanceNav} pathname={pathname} />
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

export function AppShell({
  children,
  assistantProjects = [],
  userEmail,
  orgName,
  userRole,
  pendingApprovals = 0,
  missionBadgeCounts,
  showSidebar = true,
  alerts = [],
  alertCount = 0,
}: {
  children: ReactNode;
  assistantProjects?: Array<{ id: string; name: string }>;
  userEmail?: string | null;
  orgName?: string | null;
  userRole?: string | null;
  pendingApprovals?: number;
  missionBadgeCounts?: Partial<Record<MissionPersonaId, number>>;
  showSidebar?: boolean;
  alerts?: DeliveryAlert[];
  alertCount?: number;
}) {
  return (
    <AiDrawerProvider>
      <AppNav
        userEmail={userEmail}
        orgName={orgName}
        pendingApprovals={pendingApprovals}
        alerts={alerts}
        alertCount={alertCount}
      />
      {showSidebar ? (
        <AppSidebar
          pendingApprovals={pendingApprovals}
          userRole={userRole}
          missionBadgeCounts={missionBadgeCounts}
        />
      ) : null}
      <AiDrawer projects={assistantProjects} />
      {children}
    </AiDrawerProvider>
  );
}

export { AppNav } from "./app-nav";
