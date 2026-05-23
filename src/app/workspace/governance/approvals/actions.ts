"use server";

import { revalidatePath } from "next/cache";
import { resolveApproval } from "@/services/approvals";

export async function resolveApprovalAction(
  id: string,
  status: "approved" | "rejected",
) {
  await resolveApproval(id, status);
  revalidatePath("/workspace/governance/approvals");
  revalidatePath("/workspace/alerts");
  revalidatePath("/workspace/dashboard");
}
