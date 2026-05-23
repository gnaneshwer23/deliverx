"use server";

import { revalidatePath } from "next/cache";
import {
  createInvitation,
  revokeInvitation,
  type InvitationRow,
} from "@/services/invitations";

export type InviteState = {
  ok: boolean;
  error?: string;
  inviteUrl?: string;
  email?: string;
};

export async function sendInviteAction(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const email = String(formData.get("email") ?? "");
  const role = String(formData.get("role") ?? "team_member") as InvitationRow["role"];

  try {
    const { inviteUrl } = await createInvitation({ email, role });
    revalidatePath("/onboarding/invite");
    revalidatePath("/workspace/team");
    return { ok: true, inviteUrl, email: email.trim().toLowerCase() };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to send invitation",
    };
  }
}

export async function revokeInviteAction(id: string) {
  try {
    await revokeInvitation(id);
    revalidatePath("/onboarding/invite");
    revalidatePath("/workspace/team");
    return { ok: true as const };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Failed to revoke",
    };
  }
}
