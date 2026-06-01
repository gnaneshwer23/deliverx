import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ppClass } from "@/lib/policy-pilot-theme";

type PpBtnVariant = "primary" | "ghost" | "cream";

const styles: Record<PpBtnVariant, string> = {
  primary: ppClass.btnPrimary,
  ghost: ppClass.btnGhost,
  cream: ppClass.btnPrimaryOnCream,
};

export function PpButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: PpBtnVariant }) {
  return (
    <Link href={href} className={`${styles[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
}

export function PpTrustStrip({ light, className = "" }: { light?: boolean; className?: string }) {
  const badges = ["SOC2-ready", "GDPR", "EU residency", "Human-in-the-loop"];
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {badges.map((b) => (
        <span
          key={b}
          className={`rounded-full border px-3 py-1 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-[0.14em] ${
            light
              ? "border-[#0a0e14]/10 bg-white text-[#6B6B64]"
              : "border-white/10 bg-white/[0.04] text-white/50"
          }`}
        >
          {b}
        </span>
      ))}
    </div>
  );
}

export function PpArrowDivider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center font-[family-name:var(--font-dx-mono)] text-2xl text-[#6ee7c7] ${className}`}
      aria-hidden
    >
      →
    </div>
  );
}

export function PpSectionLabel({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <p className={dark ? ppClass.eyebrowDark : ppClass.eyebrow}>{children}</p>
  );
}
