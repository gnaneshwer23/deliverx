"use server";

import { revalidatePath } from "next/cache";
import { createPortfolio } from "@/services/portfolio";

export async function createPortfolioAction(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) {
    return { error: "Portfolio name is required" };
  }
  const description = ((formData.get("description") as string) || "").trim() || null;
  try {
    await createPortfolio({ name, description });
    revalidatePath("/workspace/portfolio");
    return { ok: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to create portfolio",
    };
  }
}
