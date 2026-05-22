import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  action,
  className,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-slate-300 p-12 text-center",
        className,
      )}
    >
      <p className="font-medium text-slate-700">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      ) : null}
      {action ?? (actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62]"
        >
          {actionLabel}
        </Link>
      ) : null)}
    </div>
  );
}
