import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { constructStripeEvent, processStripeWebhookEvent } from "@/lib/billing";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;
  try {
    event = constructStripeEvent(rawBody, signature);
  } catch (error) {
    console.warn("[billing/webhook] signature rejected", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid signature" },
      { status: 400 },
    );
  }

  try {
    const admin = createAdminClient();
    const result = await processStripeWebhookEvent({
      admin,
      event,
      rawBody,
    });
    if (!result.ok) {
      return NextResponse.json(
        result,
        { status: 500 },
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("[billing/webhook] processing failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook failed" },
      { status: 500 },
    );
  }
}
