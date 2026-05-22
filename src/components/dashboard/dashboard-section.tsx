import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { sovereignClass } from "@/lib/sovereign-theme";

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
    <section className={`${sovereignClass.card} p-5 ${className ?? ""}`}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className={sovereignClass.sectionTitle}>{title}</h2>
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-0.5 text-xs font-medium uppercase tracking-[0.1em] text-[#4b5563] transition hover:text-[#0a0e14]"
          >
            View all <ArrowUpRight size={12} />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}
