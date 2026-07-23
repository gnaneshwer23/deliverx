"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, type ComponentProps, type MouseEvent, type ReactNode } from "react";

type BtnVariant = "primary" | "ghost" | "primaryLg" | "ghostLg" | "ctaLight" | "ctaOutline";

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-xl text-[0.8125rem] font-medium whitespace-nowrap transition duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70";

const variants: Record<BtnVariant, string> = {
  primary: `${base} border border-[var(--mkt-green-m,#2D7048)] bg-[var(--mkt-green-l)] px-[18px] py-2 text-white hover:bg-[#2D7048] hover:shadow-[0_0_0_1px_rgba(61,150,96,.18),0_8px_32px_rgba(61,150,96,.12)] hover:-translate-y-px`,
  ghost: `${base} border border-[var(--mkt-border-l)] bg-transparent px-[18px] py-2 text-[var(--mkt-text2)] hover:border-[var(--mkt-border-l)] hover:bg-[var(--mkt-s3)] hover:text-[var(--mkt-text1)]`,
  primaryLg: `${base} border border-[#2D7048] bg-[var(--mkt-green-l)] px-7 py-[13px] text-[0.9375rem] text-white hover:bg-[#2D7048] hover:shadow-[0_0_0_1px_rgba(61,150,96,.18),0_8px_32px_rgba(61,150,96,.12)] hover:-translate-y-0.5`,
  ghostLg: `${base} border border-[var(--mkt-border-l)] bg-[var(--mkt-s1)] px-7 py-[13px] text-[0.9375rem] text-[var(--mkt-text2)] hover:border-[var(--mkt-border-l)] hover:bg-[var(--mkt-s3)] hover:text-[var(--mkt-text1)] hover:shadow-[var(--dx-shadow-sm)]`,
  ctaLight: `${base} rounded-[10px] border-none bg-white px-7 py-[13px] text-[0.9375rem] text-[var(--mkt-green)] hover:bg-white/90 hover:shadow-[0_8px_24px_rgba(0,0,0,.2)] hover:-translate-y-0.5`,
  ctaOutline: `${base} rounded-[10px] border border-white/30 bg-transparent px-7 py-[13px] text-[0.9375rem] text-white hover:border-white/50 hover:bg-white/8`,
};

const HOVER_PREFETCH_PATHS = new Set([
  "/signup",
  "/login",
  "/signup?product=xperience",
  "/signup?product=launchpad",
  "/signup?product=launchpad&intent=roles",
  "/xperience",
  "/launchpad",
  "/deliverx",
]);

function isNativeHref(href: string) {
  return (
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("http://") ||
    href.startsWith("https://")
  );
}

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

export function MarketingButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
  onClick,
  onMouseEnter,
  ...props
}: ComponentProps<typeof Link> & { variant?: BtnVariant; children: ReactNode }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const classes = `${variants[variant]} ${className}`;

  const prefetchOnHover = useCallback(() => {
    if (typeof href === "string" && HOVER_PREFETCH_PATHS.has(href)) {
      void router.prefetch(href);
    }
  }, [href, router]);

  const handleMouseEnter = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      prefetchOnHover();
      onMouseEnter?.(event);
    },
    [onMouseEnter, prefetchOnHover],
  );

  const handleClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (pending) {
        event.preventDefault();
        return;
      }
      if (!isModifiedClick(event)) {
        setPending(true);
      }
      onClick?.(event);
    },
    [onClick, pending],
  );

  if (typeof href === "string" && isNativeHref(href)) {
    const { prefetch: _prefetch, ...anchorProps } = props as ComponentProps<"a"> & {
      prefetch?: boolean;
    };
    return (
      <a
        href={href}
        className={classes}
        aria-busy={pending || undefined}
        aria-disabled={pending || undefined}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        {...anchorProps}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      prefetch={false}
      className={classes}
      aria-busy={pending || undefined}
      aria-disabled={pending || undefined}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </Link>
  );
}
