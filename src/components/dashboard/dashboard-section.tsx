import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

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
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className ?? ""}`}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-0.5 text-xs font-medium text-[#0F766E] hover:underline"
          >
            View all <ArrowUpRight size={12} />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}
