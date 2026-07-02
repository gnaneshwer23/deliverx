import type { ReactNode } from "react";
import { MarketingBadge } from "@/components/marketing/marketing-badge";
import type { RoleDashboard } from "@/lib/marketing/landing-data";

export function RolePreviewChrome({
  role,
  accentBorder,
  children,
}: {
  role: RoleDashboard;
  accentBorder?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="mkt-card overflow-hidden shadow-[0_12px_40px_rgba(15,23,42,0.08)] transition duration-400"
      style={{ borderColor: accentBorder ?? `${role.accent}55` }}
      role="img"
      aria-label={`Example ${role.title} dashboard preview`}
    >
      <div className="flex h-[38px] items-center gap-2 border-b border-[var(--mkt-border)] bg-[var(--mkt-s2)] px-3.5">
        <span className="size-[9px] rounded-full bg-[#FF5F57]" aria-hidden />
        <span className="size-[9px] rounded-full bg-[#FFBD2E]" aria-hidden />
        <span className="size-[9px] rounded-full bg-[#28CA41]" aria-hidden />
        <span className="ml-2 text-[0.6875rem] font-medium text-[var(--mkt-text3)]">{role.title}</span>
        <MarketingBadge tone="badge-n" className="ml-auto !text-[0.6rem]">
          Example dashboard
        </MarketingBadge>
        <MarketingBadge tone="badge-g" className="!text-[0.6rem]">
          {role.badge}
        </MarketingBadge>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export function PreviewLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[var(--mkt-text3)]">
      {children}
    </p>
  );
}

export function PreviewCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-[var(--mkt-border)] bg-[var(--mkt-s2)] ${className}`}
    >
      {children}
    </div>
  );
}
