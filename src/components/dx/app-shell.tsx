"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Home, Settings, X } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { AiDrawer } from "@/components/dx/ai-drawer";
import { AiDrawerProvider } from "@/components/dx/ai-drawer-context";
import { AppNav } from "@/components/dx/app-nav";
import { ProductSuiteNav } from "@/components/dx/product-suite-shell";
import type { DeliveryAlert } from "@/services/alerts";
import { professionalWorkspaceNav } from "@/config/professional-workspace-nav";
import {
  workspaceDeliveryNav,
  workspaceEcosystemNav,
  workspaceGovernanceNav,
  workspaceIntelligenceNav,
  workspaceOrgAdminNav,
  type WorkspaceNavItem,
} from "@/config/workspace-nav";
import { isLegacyWorkspaceNavEnabled } from "@/config/workspace-nav-policy";
import { isOrgAdmin } from "@/lib/org-admin";
import { getMissionPersonaMeta } from "@/config/mission-persona-meta";
import { resolveRoleHomePath } from "@/config/role-home-routing";
import { partitionCoreNav } from "@/lib/mission-nav";
import type { MissionPersonaId } from "@/lib/mission-nav";
import {
  isPersonaHomeNavActive,
  isWorkspaceNavItemActive,
  shouldExpandOtherMissions,
} from "@/lib/nav-path";
import { dxClass } from "@/lib/dx-theme";

function NavLink({
  item,
  pathname,
  pendingApprovals = 0,
  missionBadgeCount = 0,
  prominent = false,
  userRole,
  onNavigate,
}: {
  item: WorkspaceNavItem;
  pathname: string;
  pendingApprovals?: number;
  missionBadgeCount?: number;
  prominent?: boolean;
  userRole?: string | null;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const active = isWorkspaceNavItemActive(item, pathname, userRole);
  const propBadge = item.id === "prop" && pendingApprovals > 0 ? pendingApprovals : undefined;
  const missionBadge = missionBadgeCount > 0 ? missionBadgeCount : undefined;
  const badge = propBadge ?? missionBadge;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={
        active
          ? dxClass.navLinkActive
          : prominent
            ? dxClass.navLinkProminent
            : dxClass.navLinkInactive
      }
    >
      <Icon size={16} className={active ? "text-[#1C4A2E]" : "opacity-60"} aria-hidden />
      <span className="flex-1">{item.label}</span>
      {prominent && !active ? (
        <span className="rounded bg-[#EEF5F1] px-1.5 py-0.5 font-[family-name:var(--font-dx-mono)] text-xs uppercase tracking-wide text-[#1C4A2E]">
          You
        </span>
      ) : null}
      {badge && badge > 0 ? (
        <span
          className="min-w-[20px] rounded-full bg-[#B7620A] px-1.5 py-0.5 text-center font-[family-name:var(--font-dx-mono)] text-xs font-medium text-white"
          aria-label={`${badge} pending items for ${item.label}`}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </Link>
  );
}

function PersonaHomeNavLink({
  userRole,
  pathname,
  onNavigate,
}: {
  userRole?: string | null;
  pathname: string;
  onNavigate?: () => void;
}) {
  const homeHref = resolveRoleHomePath(userRole);
  if (homeHref === "/workspace/dashboard") return null;

  const { primaryMission } = partitionCoreNav(userRole);
  if (!primaryMission) return null;

  const meta = getMissionPersonaMeta(primaryMission.id as MissionPersonaId);
  const active = isPersonaHomeNavActive(pathname, homeHref, userRole);

  return (
    <Link
      href={homeHref}
      onClick={onNavigate}
      data-testid="persona-home-nav"
      className={`mx-2 mb-2 flex items-center gap-2.5 rounded-[var(--dx-radius-md)] border px-3 py-2.5 text-[12px] transition ${
        active
          ? "border-[#C6DDD0] bg-[#EEF5F1] text-[#1C4A2E] shadow-[var(--dx-shadow-sm)]"
          : "border-[var(--dx-rul)] bg-white text-[#2C2C28] hover:border-[#C6DDD0] hover:bg-[#EEF5F1]"
      }`}
    >
      <Home size={14} className={active ? "text-[#1C4A2E]" : "text-[#6B6B64]"} aria-hidden />
      <span className="min-w-0 flex-1 truncate">
        <span className="block font-medium">{meta.roleLabel} home</span>
        <span className="block truncate text-[10px] text-[#6B6B64]">{meta.navLabel}</span>
      </span>
      <span className="rounded bg-[#EEF5F1] px-1.5 py-0.5 font-[family-name:var(--font-dx-mono)] text-xs uppercase tracking-wide text-[#1C4A2E]">
        You
      </span>
    </Link>
  );
}

function NavSection({
  label,
  items,
  pathname,
  pendingApprovals = 0,
  missionBadgeCounts,
  userRole,
  onNavigate,
}: {
  label: string;
  items: WorkspaceNavItem[];
  pathname: string;
  pendingApprovals?: number;
  missionBadgeCounts?: Partial<Record<MissionPersonaId, number>>;
  userRole?: string | null;
  onNavigate?: () => void;
}) {
  return (
    <div className="py-4">
      <div className={dxClass.navSectionLabel}>
        {label}
      </div>
      {items.map((item) => (
        <NavLink
          key={item.id}
          item={item}
          pathname={pathname}
          pendingApprovals={pendingApprovals}
          missionBadgeCount={missionBadgeCounts?.[item.id as MissionPersonaId] ?? 0}
          userRole={userRole}
          onNavigate={onNavigate}
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
  onNavigate,
}: {
  userRole?: string | null;
  pathname: string;
  pendingApprovals?: number;
  missionBadgeCounts?: Partial<Record<MissionPersonaId, number>>;
  onNavigate?: () => void;
}) {
  const { fixedCore, primaryMission, otherMissions } = partitionCoreNav(userRole);
  const [showOtherMissions, setShowOtherMissions] = useState(() =>
    shouldExpandOtherMissions(
      pathname,
      otherMissions.map((item) => item.id),
    ),
  );
  const otherMissionPendingTotal = otherMissions.reduce(
    (sum, item) => sum + (missionBadgeCounts?.[item.id as MissionPersonaId] ?? 0),
    0,
  );

  return (
    <div className="py-4">
      <div className={dxClass.navSectionLabel}>
        Core
      </div>
      <PersonaHomeNavLink userRole={userRole} pathname={pathname} onNavigate={onNavigate} />
      {fixedCore.map((item) => (
        <NavLink
          key={item.id}
          item={item}
          pathname={pathname}
          pendingApprovals={pendingApprovals}
          userRole={userRole}
          onNavigate={onNavigate}
        />
      ))}
      {primaryMission ? (
        <NavLink
          item={primaryMission}
          pathname={pathname}
          pendingApprovals={pendingApprovals}
          missionBadgeCount={missionBadgeCounts?.[primaryMission.id as MissionPersonaId] ?? 0}
          prominent
          userRole={userRole}
          onNavigate={onNavigate}
        />
      ) : null}
      {otherMissions.length > 0 ? (
        <div className="mt-1">
          <button
            type="button"
            onClick={() => setShowOtherMissions((open) => !open)}
            className="mx-2 flex w-[calc(100%-1rem)] items-center gap-1.5 rounded-[var(--dx-radius-sm)] px-3 py-1.5 text-[11px] text-[var(--dx-fnt)] transition hover:bg-[var(--dx-srf)] hover:text-[var(--dx-mut)]"
          >
            {showOtherMissions ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            Other mission controls
            <span className="font-[family-name:var(--font-dx-mono)] text-xs">
              ({otherMissions.length})
            </span>
            {otherMissionPendingTotal > 0 ? (
              <span
                className="ml-auto min-w-[20px] rounded-full bg-[#B7620A] px-1.5 py-0.5 text-center font-[family-name:var(--font-dx-mono)] text-xs font-medium text-white"
                aria-label={`${otherMissionPendingTotal} pending items in other mission controls`}
              >
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
                  userRole={userRole}
                  onNavigate={onNavigate}
                />
              ))
            : null}
        </div>
      ) : null}
    </div>
  );
}

function WorkspaceSidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="border-t border-[var(--dx-rul2)] py-3">
      <Link
        href="/settings/profile"
        onClick={onNavigate}
        className={`${dxClass.navLinkInactive} text-[12px]`}
      >
        <Settings size={16} /> Settings
      </Link>
      <Link
        href="/"
        onClick={onNavigate}
        className="mx-2 flex items-center gap-2.5 rounded-[var(--dx-radius-md)] px-3 py-2 text-[12px] text-[var(--dx-fnt)] transition hover:bg-[var(--dx-srf)] hover:text-[var(--dx-mut)]"
      >
        ← Back to site
      </Link>
      <div className="px-4 py-1">
        <SignOutButton
          showIcon
          className="flex items-center gap-2 text-[12px] text-[var(--dx-mut)] hover:text-[#C0392B] disabled:opacity-60"
        />
      </div>
    </div>
  );
}

function WorkspaceSidebarContent({
  pendingApprovals = 0,
  userRole,
  missionBadgeCounts,
  onNavigate,
}: {
  pendingApprovals?: number;
  userRole?: string | null;
  missionBadgeCounts?: Partial<Record<MissionPersonaId, number>>;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const showLegacyNav = isLegacyWorkspaceNavEnabled();

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <NavSection
          label="Professional Workspace"
          items={professionalWorkspaceNav}
          pathname={pathname}
          userRole={userRole}
          onNavigate={onNavigate}
        />
        {showLegacyNav ? (
          <>
            <CoreNavSection
              userRole={userRole}
              pathname={pathname}
              pendingApprovals={pendingApprovals}
              missionBadgeCounts={missionBadgeCounts}
              onNavigate={onNavigate}
            />
            <NavSection
              label="Delivery"
              items={workspaceDeliveryNav}
              pathname={pathname}
              userRole={userRole}
              onNavigate={onNavigate}
            />
            <NavSection
              label="Intelligence"
              items={workspaceIntelligenceNav}
              pathname={pathname}
              pendingApprovals={pendingApprovals}
              userRole={userRole}
              onNavigate={onNavigate}
            />
            <NavSection
              label="Ecosystem"
              items={workspaceEcosystemNav}
              pathname={pathname}
              userRole={userRole}
              onNavigate={onNavigate}
            />
            <NavSection
              label="Governance"
              items={workspaceGovernanceNav}
              pathname={pathname}
              userRole={userRole}
              onNavigate={onNavigate}
            />
          </>
        ) : null}
        {isOrgAdmin(userRole) ? (
          <NavSection
            label="Org admin"
            items={workspaceOrgAdminNav}
            pathname={pathname}
            userRole={userRole}
            onNavigate={onNavigate}
          />
        ) : null}
      </div>
      <WorkspaceSidebarFooter onNavigate={onNavigate} />
    </>
  );
}

function WorkspaceMobileNavDrawer({
  open,
  onClose,
  pendingApprovals = 0,
  userRole,
  missionBadgeCounts,
}: {
  open: boolean;
  onClose: () => void;
  pendingApprovals?: number;
  userRole?: string | null;
  missionBadgeCounts?: Partial<Record<MissionPersonaId, number>>;
}) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const nav = navRef.current;
    const focusable = nav?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKeyDown);
      document.getElementById("workspace-mobile-nav-trigger")?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation menu"
        className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />
      <nav
        ref={navRef}
        id="workspace-mobile-nav"
        aria-label="Workspace navigation"
        className="fixed inset-y-0 left-0 z-[60] flex w-[min(100%,var(--dx-sbw))] flex-col rounded-r-[var(--dx-radius-xl)] bg-white shadow-2xl lg:hidden"
        style={{ top: "var(--dx-navh)" }}
      >
        <div className="flex items-center justify-between border-b border-[#E4E4DC] px-3.5 py-2.5">
          <span className="font-[family-name:var(--font-dx-mono)] text-xs uppercase tracking-[0.12em] text-[#4B5563]">
            Navigation
          </span>
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={onClose}
            className="flex size-9 items-center justify-center border border-[#E4E4DC] text-[#6B6B64] transition hover:border-[#1C4A2E] hover:text-[#1C4A2E]"
          >
            <X size={16} aria-hidden />
          </button>
        </div>
        <div className="overflow-x-auto border-b border-[#E4E4DC] px-2 py-1">
          <ProductSuiteNav compact onNavigate={onClose} />
        </div>
        <WorkspaceSidebarContent
          pendingApprovals={pendingApprovals}
          userRole={userRole}
          missionBadgeCounts={missionBadgeCounts}
          onNavigate={onClose}
        />
      </nav>
    </>
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
  return (
    <aside className={`fixed bottom-0 left-0 top-[var(--dx-navh)] z-40 hidden w-[var(--dx-sbw)] flex-col ${dxClass.sidebar} lg:flex`}>
      <WorkspaceSidebarContent
        pendingApprovals={pendingApprovals}
        userRole={userRole}
        missionBadgeCounts={missionBadgeCounts}
      />
    </aside>
  );
}

function AppShellLayout({
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <a
        href="#app-main-content"
        className="fixed left-3 top-3 z-[100] -translate-y-24 rounded-md bg-[#0D0D0B] px-4 py-2 text-sm font-medium text-white transition focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#3D9660] focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <AppNav
        userEmail={userEmail}
        orgName={orgName}
        pendingApprovals={pendingApprovals}
        alerts={alerts}
        alertCount={alertCount}
        showMobileNavToggle={showSidebar}
        mobileNavOpen={mobileNavOpen}
        onToggleMobileNav={() => setMobileNavOpen((open) => !open)}
      />
      {showSidebar ? (
        <>
          <AppSidebar
            pendingApprovals={pendingApprovals}
            userRole={userRole}
            missionBadgeCounts={missionBadgeCounts}
          />
          <WorkspaceMobileNavDrawer
            open={mobileNavOpen}
            onClose={() => setMobileNavOpen(false)}
            pendingApprovals={pendingApprovals}
            userRole={userRole}
            missionBadgeCounts={missionBadgeCounts}
          />
        </>
      ) : null}
      <AiDrawer projects={assistantProjects} userRole={userRole} />
      <div id="app-main-content" tabIndex={-1}>
        {children}
      </div>
    </>
  );
}

export function AppShell(props: React.ComponentProps<typeof AppShellLayout>) {
  const pathname = usePathname();

  return (
    <AiDrawerProvider>
      <AppShellLayout key={pathname} {...props} />
    </AiDrawerProvider>
  );
}

export { AppNav } from "./app-nav";
