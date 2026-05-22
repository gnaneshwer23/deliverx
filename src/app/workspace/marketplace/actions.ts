"use server";

import { revalidatePath } from "next/cache";
import { shareMarketplaceAsset } from "@/services/coordination";

export type ShareState = { ok: boolean; error?: string };

export async function shareAssetAction(
  _prev: ShareState,
  formData: FormData,
): Promise<ShareState> {
  const title = String(formData.get("title") ?? "").trim();
  const assetType = String(formData.get("asset_type") ?? "playbook") as
    | "playbook"
    | "governance_template"
    | "risk_library"
    | "delivery_framework";
  const description = String(formData.get("description") ?? "").trim() || undefined;
  const isPublic = formData.get("is_public") === "true";

  if (!title) return { ok: false, error: "Title is required." };

  try {
    await shareMarketplaceAsset({
      assetType,
      title,
      description,
      isPublic,
    });
    revalidatePath("/workspace/marketplace");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to share asset",
    };
  }
}
