import { NextResponse } from "next/server";
import { aiRouteError } from "@/lib/api/ai-route";
import { requireProjectAccess } from "@/lib/api/auth";
import { generateDeliveryNarratorScript } from "@/services/deliveryNarrator";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await requireProjectAccess(id);
    const briefing = await generateDeliveryNarratorScript(id);
    return NextResponse.json({ ok: true, briefing });
  } catch (err) {
    return aiRouteError(err);
  }
}
