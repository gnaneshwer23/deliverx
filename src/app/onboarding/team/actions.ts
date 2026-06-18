"use server";

import { redirect } from "next/navigation";
import { completeGatewaySession } from "@/services/gatewayOnboarding";

export async function completeTeamGatewayAction(projectId: string | null) {
  try {
    await completeGatewaySession();
  } catch {
    /* optional until migration applied */
  }

  redirect(projectId ? `/project/${projectId}` : "/onboarding/complete");
}
