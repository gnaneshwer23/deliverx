"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { dxClass } from "@/lib/dx-theme";
import { HONEST_KPI_EMPTY } from "@/lib/honest-kpi";
import type { RequirementRow } from "@/services/baRequirementEngine";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";

const baAccent = getMissionPersonaAccent("ba");

export function BaRequirementsRegisterPanel({
  requirements,
  projectId,
}: {
  requirements: RequirementRow[];
  projectId?: string;
}) {
  const href = projectId ? `/project/${projectId}/requirements` : "/workspace/ba";
  const preview = requirements.slice(0, 5);

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
              ? `${requirements.length} extracted — approve in AI Review Queue or requirements workspace`
              : "No requirements extracted yet"}
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
          Run AI extraction from the business case or upload requirements to populate this register.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--dx-rul)]">
          {preview.map((req) => (
            <li key={req.id} className="flex items-start justify-between gap-3 px-6 py-3">
              <div className="min-w-0">
                <p className="font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-wide text-[#6B6B64]">
                  {req.req_code?.trim() || HONEST_KPI_EMPTY}
                </p>
                <p className="mt-0.5 truncate text-sm font-medium text-[#2C2C28]">{req.title}</p>
              </div>
              <span className="shrink-0 rounded-full bg-[var(--dx-srf)] px-2 py-0.5 text-[10px] font-medium capitalize text-[#6B6B64]">
                {req.status.replace(/_/g, " ")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
