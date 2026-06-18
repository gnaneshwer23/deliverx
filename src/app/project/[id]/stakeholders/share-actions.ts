"use server";

import { revalidatePath } from "next/cache";
import {
  createStakeholderShareLink,
  revokeStakeholderShareLink,
} from "@/services/stakeholderShare";

export type ShareActionState = {
  ok: boolean;
  error?: string;
  shareUrl?: string;
  linkId?: string;
  label?: string;
  expiresAt?: string;
};

export async function createStakeholderShareAction(
  _prev: ShareActionState,
  formData: FormData,
): Promise<ShareActionState> {
  try {
    const projectId = String(formData.get("projectId") ?? "").trim();
    if (!projectId) return { ok: false, error: "Project is required." };

    const link = await createStakeholderShareLink({
      projectId,
      label: String(formData.get("label") ?? "").trim() || undefined,
      recipientEmail: String(formData.get("recipientEmail") ?? "").trim() || undefined,
    });

    revalidatePath(`/project/${projectId}/stakeholders`);

    return {
      ok: true,
      shareUrl: link.shareUrl,
      linkId: link.id,
      label: link.label ?? undefined,
      expiresAt: link.expires_at,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not create share link",
    };
  }
}

export async function revokeStakeholderShareAction(
  _prev: ShareActionState,
  formData: FormData,
): Promise<ShareActionState> {
  try {
    const linkId = String(formData.get("linkId") ?? "").trim();
    const projectId = String(formData.get("projectId") ?? "").trim();
    if (!linkId) return { ok: false, error: "Link is required." };

    await revokeStakeholderShareLink(linkId);
    if (projectId) revalidatePath(`/project/${projectId}/stakeholders`);

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not revoke link",
    };
  }
}
