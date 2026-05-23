import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { dxClass } from "@/lib/dx-theme";

export function DashboardSection({
  title,
  href,
  children,
  className,
}: {
  title: string;
  href?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${dxClass.cardPad} ${className ?? ""}`}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-[0.18em] text-[#6B6B64]">
          {title}
        </h2>
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-0.5 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-[0.06em] text-[#1C4A2E] hover:text-[#2D7048]"
          >
            View all <ArrowUpRight size={12} />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}
