"use server";

import { redirect } from "next/navigation";
import { acceptInvitation } from "@/services/invitations";

export type AcceptInviteState = { ok: boolean; error?: string };

export async function acceptInviteAction(
  _prev: AcceptInviteState,
  formData: FormData,
): Promise<AcceptInviteState> {
  const token = String(formData.get("token") ?? "").trim();
  if (!token) {
    return { ok: false, error: "Invalid invitation link." };
  }

  try {
    await acceptInvitation(token);
    redirect("/workspace/dashboard");
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to accept invitation",
    };
  }
}
