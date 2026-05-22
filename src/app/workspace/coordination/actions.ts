"use server";

import { revalidatePath } from "next/cache";
import { createPartner } from "@/services/coordination";

export type PartnerState = { ok: boolean; error?: string };

export async function createPartnerAction(
  _prev: PartnerState,
  formData: FormData,
): Promise<PartnerState> {
  const name = String(formData.get("name") ?? "").trim();
  const partnerType = String(formData.get("partner_type") ?? "vendor") as
    | "client"
    | "vendor"
    | "consulting_partner";

  if (!name) return { ok: false, error: "Partner name is required." };

  try {
    await createPartner({ name, partnerType });
    revalidatePath("/workspace/coordination");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to add partner",
    };
  }
}
