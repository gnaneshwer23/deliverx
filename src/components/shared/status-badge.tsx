import { cn } from "@/lib/utils";

const VARIANTS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  active: "bg-emerald-100 text-emerald-700",
  paused: "bg-amber-100 text-amber-700",
  completed: "bg-teal-100 text-teal-700",
  archived: "bg-slate-200 text-slate-500",
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-emerald-100 text-emerald-700",
  expired: "bg-slate-200 text-slate-500",
  blocked: "bg-rose-100 text-rose-700",
  done: "bg-emerald-100 text-emerald-700",
  todo: "bg-slate-100 text-slate-600",
  in_progress: "bg-sky-100 text-sky-700",
  planned: "bg-slate-100 text-slate-600",
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-rose-100 text-rose-700",
  open: "bg-amber-100 text-amber-700",
  mitigated: "bg-amber-100 text-amber-700",
  closed: "bg-slate-200 text-slate-500",
  proposed: "bg-sky-100 text-sky-700",
  rejected: "bg-rose-100 text-rose-700",
  superseded: "bg-slate-200 text-slate-500",
  submitted: "bg-indigo-100 text-indigo-700",
  scheduled: "bg-sky-100 text-sky-700",
  cancelled: "bg-slate-200 text-slate-500",
  implemented: "bg-emerald-100 text-emerald-700",
  revoked: "bg-rose-100 text-rose-700",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const key = status.toLowerCase().replace(/\s+/g, "_");
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        VARIANTS[key] ?? VARIANTS.draft,
        className,
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
