"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Brain, Compass, Menu, Plus, X } from "lucide-react";
import { HELM_NAME } from "@/config/helm-copilot";
import { useAiDrawer } from "@/components/dx/ai-drawer-context";
import { DxLogo } from "@/components/dx/dx-logo";
import { UserMenu } from "@/components/dx/user-menu";
import { AlertBellDropdown } from "@/components/dx/alert-bell-dropdown";
import type { DeliveryAlert } from "@/services/alerts";
import { dxClass } from "@/lib/dx-theme";

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
        className="w-full rounded-lg border border-[var(--dx-rul)] bg-[var(--dx-srf)] py-1.5 pl-8 pr-3 text-[13px] outline-none focus:border-[#1C4A2E] focus:ring-2 focus:ring-[#1C4A2E]/10"
      />
    </form>
  );
}

export function AppNav({
  userEmail,
  orgName,
  pendingApprovals = 0,
  alerts = [],
  alertCount = 0,
  showMobileNavToggle = false,
  mobileNavOpen = false,
  onToggleMobileNav,
}: {
  userEmail?: string | null;
  orgName?: string | null;
  pendingApprovals?: number;
  alerts?: DeliveryAlert[];
  alertCount?: number;
  showMobileNavToggle?: boolean;
  mobileNavOpen?: boolean;
  onToggleMobileNav?: () => void;
}) {
  const { toggleDrawer } = useAiDrawer();

  return (
    <header className={`fixed inset-x-0 top-0 z-50 flex h-[var(--dx-navh)] items-center gap-2 ${dxClass.navBar} px-3 md:gap-3 md:px-5`}>
      {showMobileNavToggle ? (
        <button
          type="button"
          aria-expanded={mobileNavOpen}
          aria-controls="workspace-mobile-nav"
          onClick={onToggleMobileNav}
          className="flex size-10 shrink-0 items-center justify-center border border-[#E4E4DC] text-[#6B6B64] transition hover:border-[#1C4A2E] hover:text-[#1C4A2E] lg:hidden"
        >
          {mobileNavOpen ? (
            <X size={18} aria-hidden />
          ) : (
            <Menu size={18} aria-hidden />
          )}
          <span className="sr-only">{mobileNavOpen ? "Close menu" : "Open menu"}</span>
        </button>
      ) : null}

      <div className={`shrink-0 border-r border-[#E4E4DC] pr-3 ${showMobileNavToggle ? "" : "mr-1"}`}>
        <DxLogo href="/workspace/dashboard" showTag />
      </div>

      <NavSearch />

      <div className="ml-auto flex items-center gap-2">
        <AlertBellDropdown alerts={alerts} unreadCount={alertCount} />
        <Link
          href="/workspace/alerts"
          className={`${dxClass.btnGhost} relative hidden px-3 py-1.5 text-[9px] lg:inline-flex`}
        >
          Alerts
        </Link>
        <Link
          href="/workspace/proposals"
          className={`${dxClass.btnGhost} relative hidden px-3 py-1.5 text-[9px] sm:inline-flex`}
        >
          AI review
          {pendingApprovals > 0 ? (
            <span className="absolute -right-1 -top-1 min-w-[16px] rounded-full bg-[#B7620A] px-1 text-center font-[family-name:var(--font-dx-mono)] text-[8px] font-medium leading-4 text-white">
              {pendingApprovals > 99 ? "99+" : pendingApprovals}
            </span>
          ) : null}
        </Link>
        <Link href="/project/new" className={`${dxClass.btnGhost} hidden px-3 py-1.5 text-[9px] md:inline-flex`}>
          <Plus size={12} /> New project
        </Link>
        <button
          type="button"
          onClick={toggleDrawer}
          className={`${dxClass.btnSm} hidden sm:inline-flex`}
        >
          <Compass size={12} /> Ask {HELM_NAME}
        </button>
        <Link
          href="/workspace/assistant"
          className={`${dxClass.btnGhost} hidden px-2 py-1.5 text-[8px] lg:inline-flex`}
          title="Open full AI workspace"
        >
          Full view
        </Link>
        <div className="hidden h-5 w-px bg-[#E4E4DC] sm:block" />
        <UserMenu userEmail={userEmail} orgName={orgName} />
      </div>
    </header>
  );
}
