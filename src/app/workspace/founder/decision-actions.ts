"use server";

import { revalidatePath } from "next/cache";
import { resolveApproval } from "@/services/approvals";
import { escalateOrgDecision, resolveOrgDecision } from "@/services/governance";

export async function founderResolveDecisionAction(
  id: string,
  status: "approved" | "rejected",
) {
  await resolveOrgDecision(id, status);
  revalidatePath("/workspace/founder");
  revalidatePath("/workspace/governance/approvals");
  revalidatePath("/workspace/alerts");
}

export async function founderResolveApprovalAction(
  id: string,
  status: "approved" | "rejected",
) {
  await resolveApproval(id, status);
  revalidatePath("/workspace/founder");
  revalidatePath("/workspace/governance/approvals");
  revalidatePath("/workspace/alerts");
}

export async function founderEscalateDecisionAction(id: string) {
  await escalateOrgDecision(id);
  revalidatePath("/workspace/founder");
  revalidatePath("/workspace/governance/approvals");
  revalidatePath("/workspace/alerts");
}
