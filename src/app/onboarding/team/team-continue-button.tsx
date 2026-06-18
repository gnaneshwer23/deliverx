"use client";

import { useTransition } from "react";
import { completeTeamGatewayAction } from "./actions";
import { dxClass } from "@/lib/dx-theme";

export function TeamContinueButton({ projectId }: { projectId: string | null }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className={`${dxClass.btnPrimary} flex-1`}
      onClick={() => startTransition(() => completeTeamGatewayAction(projectId))}
    >
      {pending ? "Continuing…" : "Finish gateway →"}
    </button>
  );
}
