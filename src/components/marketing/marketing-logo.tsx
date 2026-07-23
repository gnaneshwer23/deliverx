"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { mktClass } from "@/lib/marketing/landing-theme";

function normalizePath(path: string) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

export function MarketingLogo({
  href = "/",
  light = false,
}: {
  href?: string;
  light?: boolean;
}) {
  const pathname = usePathname();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const targetPath = normalizePath(href);
    const currentPath = normalizePath(pathname);
    if (targetPath !== currentPath) return;

    if (window.location.hash || window.scrollY > 0) {
      event.preventDefault();
      window.history.pushState(null, "", href);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="mr-auto flex items-center gap-2.5 no-underline"
    >
      <span
        className={`flex size-[30px] shrink-0 items-center justify-center rounded-[7px] ${
          light ? "bg-white/15" : "bg-[var(--mkt-green)]"
        }`}
        aria-hidden
      >
        <svg
          viewBox="0 0 14 14"
          className="size-3.5 stroke-white fill-none stroke-2 [stroke-linecap:round]"
        >
          <path d="M1 7h12M7 1v12M2 2l10 10M12 2L2 12" />
        </svg>
      </span>
      <span
        className={`${mktClass.serif} text-lg tracking-[-0.01em] ${
          light ? "text-white" : "text-[var(--mkt-text1)]"
        }`}
      >
        DeliverX
      </span>
    </Link>
  );
}
