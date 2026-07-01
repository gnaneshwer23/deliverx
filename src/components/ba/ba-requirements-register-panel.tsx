"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { dxClass } from "@/lib/dx-theme";
import { HONEST_KPI_EMPTY } from "@/lib/honest-kpi";
import type { RequirementRow } from "@/services/baRequirementEngine";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";

const baAccent = getMissionPersonaAccent("ba");

export function BaRequirementsRegisterPanel({
  requirements: initialRequirements,
  projectId,
}: {
  requirements: RequirementRow[];
  projectId?: string;
}) {
  const router = useRouter();
  const [requirements, setRequirements] = useState(initialRequirements);
  const [busyId, setBusyId] = useState<string | null>(null);

  const href = projectId ? `/project/${projectId}/requirements` : "/workspace/ba";
  const preview = requirements.slice(0, 5);

  async function patchRequirement(
    requirementId: string,
    patch: { status?: string; title?: string; description?: string },
  ) {
    if (!projectId) return;
    setBusyId(requirementId);
    try {
      const res = await fetch(`/api/requirements/${requirementId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...patch, projectId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");

      setRequirements((prev) =>
        prev.map((req) => (req.id === requirementId ? { ...req, ...data.requirement } : req)),
      );
      toast.success(
        patch.status === "approved"
          ? "Requirement accepted — PM notified"
          : patch.status === "pending_clarification"
            ? "Marked for clarification"
            : "Requirement updated",
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  function editRequirement(req: RequirementRow) {
    const title = window.prompt("Edit requirement title", req.title);
    if (title == null || !title.trim()) return;
    void patchRequirement(req.id, { title: title.trim() });
  }

  return (
    <div
      className={`${dxClass.card} overflow-hidden border-t-2 p-0`}
      style={{ borderTopColor: baAccent.primary }}
      data-panel="ba-requirements-register"
    >
      <div className="flex items-center justify-between border-b border-[#E4E4DC] px-6 py-4">
        <div>
          <h3 className={`${dxClass.display} text-lg`}>Requirements register</h3>
          <p className="text-xs text-[#6B6B64]">
            {requirements.length > 0
              ? `${requirements.length} in database — accept to signal PM and engineering`
              : "No requirements seeded yet"}
          </p>
        </div>
        <Link
          href={href}
          className="inline-flex items-center gap-0.5 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.08em] text-[#1C4A2E]"
        >
          Open register
          <ArrowUpRight size={12} aria-hidden />
        </Link>
      </div>

      {preview.length === 0 ? (
        <p className="px-6 py-5 text-sm text-[#6B6B64]">
          Apply accepted items from the PM business case in the AI Review Queue to seed requirements
          rows here.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--dx-rul)]">
          {preview.map((req) => {
            const isBusy = busyId === req.id;
            const canAct = Boolean(projectId) && req.status !== "approved" && req.status !== "rejected";

            return (
              <li key={req.id} className="px-6 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-wide text-[#6B6B64]">
                      {req.req_code?.trim() || HONEST_KPI_EMPTY}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-medium text-[#2C2C28]">{req.title}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[var(--dx-srf)] px-2 py-0.5 text-[10px] font-medium capitalize text-[#6B6B64]">
                    {req.status.replace(/_/g, " ")}
                  </span>
                </div>

                {canAct ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void patchRequirement(req.id, { status: "approved" })}
                      className={`${dxClass.btnPrimary} px-2 py-1 text-[10px]`}
                    >
                      {isBusy ? <Loader2 size={12} className="animate-spin" /> : "Accept"}
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => editRequirement(req)}
                      className={`${dxClass.btnGhost} px-2 py-1 text-[10px]`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void patchRequirement(req.id, { status: "pending_clarification" })}
                      className={`${dxClass.btnGhost} px-2 py-1 text-[10px]`}
                    >
                      Clarify
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
