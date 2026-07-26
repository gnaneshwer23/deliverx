import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createCheckoutSession,
  isCheckoutReady,
  type ProductSku,
} from "@/lib/billing";

const SKUS = new Set<ProductSku>(["experience", "launchpad", "professional"]);

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCheckoutReady()) {
    return NextResponse.json(
      { error: "Checkout is not configured. Stripe price IDs are required." },
      { status: 503 },
    );
  }

  let body: { sku?: string };
  try {
    body = (await req.json()) as { sku?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sku = body.sku?.trim() as ProductSku | undefined;
  if (!sku || !SKUS.has(sku)) {
    return NextResponse.json(
      { error: "sku must be experience | launchpad | professional" },
      { status: 400 },
    );
  }

  try {
    const admin = createAdminClient();
    const session = await createCheckoutSession({
      admin,
      userId: user.id,
      email: user.email,
      sku,
    });
    return NextResponse.json({
      ok: true,
      url: session.url,
      sessionId: session.sessionId,
    });
  } catch (error) {
    console.error("[billing/checkout]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 },
    );
  }
}
