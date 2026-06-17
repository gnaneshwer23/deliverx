"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { WeeklyStatusReportSummary } from "@/services/deliveryPmReports";
import { dxClass } from "@/lib/dx-theme";

const ragDot: Record<string, string> = {
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-rose-500",
};

export function DeliveryStatusReportsPanel({
  projectId,
  reports,
}: {
  projectId?: string;
  reports: WeeklyStatusReportSummary[];
}) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);

  async function generateReport() {
    if (!projectId) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/project/${projectId}/delivery/status-report`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      toast.success(`Status report saved — ${data.ragStatus.toUpperCase()}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E4DC] px-6 py-4">
        <h3 className={`${dxClass.display} text-lg`}>Weekly status reports</h3>
        {projectId ? (
          <button
            type="button"
            onClick={generateReport}
            disabled={generating}
            className={`${dxClass.btnPrimary} inline-flex items-center gap-2 text-[10px]`}
          >
            {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            {generating ? "Generating…" : "Generate this week"}
          </button>
        ) : null}
      </div>
      <ul className="divide-y divide-[#F0F0E8]">
        {reports.length ? (
          reports.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 px-6 py-3 text-sm">
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${ragDot[r.ragStatus]}`} />
                <span className="font-medium">{r.title}</span>
              </div>
              <span className="text-xs text-[#A8A89E]">
                {new Date(r.generatedAt).toLocaleDateString()} · {r.reviewStatus}
              </span>
            </li>
          ))
        ) : (
          <li className="px-6 py-4 text-sm text-[#6B6B64]">
            Generate a weekly RAG status report from live delivery signals.
          </li>
        )}
      </ul>
    </div>
  );
}
