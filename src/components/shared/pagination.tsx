import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const DEFAULT_PAGE_SIZE = 25;

export function Pagination({
  page,
  totalPages,
  totalItems,
  buildHref,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const safePage = Math.max(0, Math.min(page, totalPages - 1));

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
      <span>
        Page {safePage + 1} of {totalPages} · {totalItems} items
      </span>
      <div className="flex items-center gap-2">
        {safePage > 0 ? (
          <Link
            href={buildHref(safePage - 1)}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50"
          >
            <ChevronLeft size={14} /> Previous
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md border border-slate-100 px-3 py-1.5 text-slate-300">
            <ChevronLeft size={14} /> Previous
          </span>
        )}
        {safePage < totalPages - 1 ? (
          <Link
            href={buildHref(safePage + 1)}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50"
          >
            Next <ChevronRight size={14} />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md border border-slate-100 px-3 py-1.5 text-slate-300">
            Next <ChevronRight size={14} />
          </span>
        )}
      </div>
    </div>
  );
}

export function parsePageParam(raw: string | undefined): number {
  const n = Number(raw ?? "0");
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

export function totalPages(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}
