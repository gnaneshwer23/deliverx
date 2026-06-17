"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  founderEscalateDecisionAction,
  founderResolveApprovalAction,
  founderResolveDecisionAction,
} from "@/app/workspace/founder/decision-actions";
import { dxClass } from "@/lib/dx-theme";
import type { FounderDecisionRow } from "@/services/founderEngine";

export function FounderDecisionActions({ row }: { row: FounderDecisionRow }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function resolve(status: "approved" | "rejected") {
    startTransition(async () => {
      if (row.kind === "approval") {
        await founderResolveApprovalAction(row.id, status);
      } else {
        await founderResolveDecisionAction(row.id, status);
      }
      router.refresh();
    });
  }

  function escalate() {
    if (row.kind !== "decision") return;
    startTransition(async () => {
      await founderEscalateDecisionAction(row.id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        type="button"
        disabled={pending}
        onClick={() => resolve("approved")}
        className={`${dxClass.btnPrimary} px-2 py-1 text-[10px]`}
      >
        Approve
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => resolve("rejected")}
        className={`${dxClass.btnGhost} px-2 py-1 text-[10px]`}
      >
        Reject
      </button>
      {row.kind === "decision" ? (
        <button
          type="button"
          disabled={pending}
          onClick={escalate}
          className="px-2 py-1 text-[10px] text-[#8B6914] hover:underline"
        >
          Escalate
        </button>
      ) : null}
    </div>
  );
}
