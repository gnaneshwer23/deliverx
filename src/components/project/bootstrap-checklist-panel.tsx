import Link from "next/link";
import { CheckCircle2, CircleDashed, AlertTriangle } from "lucide-react";
import {
  buildBootstrapChecklistItems,
  type BootstrapChecklistItem,
  type BootstrapChecklistItemStatus,
} from "@/lib/bootstrap-checklist";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import { dxClass } from "@/lib/dx-theme";

const STATUS_ICON: Record<BootstrapChecklistItemStatus, typeof CheckCircle2> = {
  ready: CheckCircle2,
  pending: CircleDashed,
  warning: AlertTriangle,
  skipped: CircleDashed,
};

const STATUS_TONE: Record<BootstrapChecklistItemStatus, string> = {
  ready: "text-[#1C4A2E]",
  pending: "text-[#8B6914]",
  warning: "text-[#B8860B]",
  skipped: "text-[#6B6B64]",
};

export function BootstrapChecklistPanel({
  summary,
  bootstrappedAt,
  demoThreadsEnabled,
}: {
  summary: ProjectBootstrapSummary;
  bootstrappedAt?: string | null;
  demoThreadsEnabled?: boolean;
}) {
  const items = buildBootstrapChecklistItems(summary, { demoThreadsEnabled });
  if (items.length === 0) return null;

  const readyCount = items.filter((item) => item.status === "ready").length;
  const pendingCount = items.filter((item) => item.status === "pending").length;

  return (
    <div
      className={`${dxClass.card} border-[#C6DDD0] bg-[#FAFAF5] px-4 py-4 text-sm`}
      data-testid="bootstrap-checklist"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-[#0D0D0B]">Post-GO bootstrap checklist</p>
          <p className="mt-1 text-xs text-[#6B6B64]">
            Live counts from your GO decision
            {bootstrappedAt
              ? ` · ${new Date(bootstrappedAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}`
              : ""}
          </p>
        </div>
        <p className="text-xs text-[#6B6B64]">
          {readyCount} ready · {pendingCount} pending review
        </p>
      </div>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <ChecklistRow key={item.id} item={item} />
        ))}
      </ul>

      {pendingCount > 0 ? (
        <p className="mt-4 text-xs text-[#6B6B64]">
          Review AI-generated outputs in{" "}
          <Link href="/workspace/proposals" className="font-medium text-[#1C4A2E] underline">
            AI output review
          </Link>{" "}
          to apply structure and unlock live loop panels.
        </p>
      ) : null}
    </div>
  );
}

function ChecklistRow({ item }: { item: BootstrapChecklistItem }) {
  const Icon = STATUS_ICON[item.status];

  return (
    <li className="flex items-start gap-2 rounded border border-[#E4E4DC] bg-white px-3 py-2">
      <Icon size={14} className={`mt-0.5 shrink-0 ${STATUS_TONE[item.status]}`} aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          {item.href ? (
            <Link href={item.href} className="font-medium text-[#1C4A2E] hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-[#0D0D0B]">{item.label}</span>
          )}
          <span className="tabular-nums text-[#0D0D0B]">{item.count}</span>
        </div>
        {item.detail ? <p className="mt-0.5 text-xs text-[#6B6B64]">{item.detail}</p> : null}
      </div>
    </li>
  );
}
