import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type BtnVariant = "primary" | "ghost" | "primaryLg" | "ghostLg" | "ctaLight" | "ctaOutline";

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-xl text-[0.8125rem] font-medium whitespace-nowrap transition duration-200";

const variants: Record<BtnVariant, string> = {
  primary: `${base} border border-[var(--mkt-green-m,#2D7048)] bg-[var(--mkt-green-l)] px-[18px] py-2 text-white hover:bg-[#2D7048] hover:shadow-[0_0_0_1px_rgba(61,150,96,.18),0_8px_32px_rgba(61,150,96,.12)] hover:-translate-y-px`,
  ghost: `${base} border border-[var(--mkt-border-l)] bg-transparent px-[18px] py-2 text-[var(--mkt-text2)] hover:border-[var(--mkt-border-l)] hover:bg-[var(--mkt-s3)] hover:text-[var(--mkt-text1)]`,
  primaryLg: `${base} border border-[#2D7048] bg-[var(--mkt-green-l)] px-7 py-[13px] text-[0.9375rem] text-white hover:bg-[#2D7048] hover:shadow-[0_0_0_1px_rgba(61,150,96,.18),0_8px_32px_rgba(61,150,96,.12)] hover:-translate-y-0.5`,
  ghostLg: `${base} border border-[var(--mkt-border-l)] bg-[var(--mkt-s1)] px-7 py-[13px] text-[0.9375rem] text-[var(--mkt-text2)] hover:border-[var(--mkt-border-l)] hover:bg-[var(--mkt-s3)] hover:text-[var(--mkt-text1)] hover:shadow-[var(--dx-shadow-sm)]`,
  ctaLight: `${base} rounded-[10px] border-none bg-white px-7 py-[13px] text-[0.9375rem] text-[var(--mkt-green)] hover:bg-white/90 hover:shadow-[0_8px_24px_rgba(0,0,0,.2)] hover:-translate-y-0.5`,
  ctaOutline: `${base} rounded-[10px] border border-white/30 bg-transparent px-7 py-[13px] text-[0.9375rem] text-white hover:border-white/50 hover:bg-white/8`,
};

export function MarketingButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: BtnVariant; children: ReactNode }) {
  return (
    <Link href={href} className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
}
