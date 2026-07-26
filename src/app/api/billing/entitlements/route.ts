import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listActiveEntitlements, isCheckoutReady, isBillingEnforceOn } from "@/lib/billing";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const entitlements = await listActiveEntitlements(supabase, user.id);
    return NextResponse.json({
      ok: true,
      entitlements,
      checkoutReady: isCheckoutReady(),
      enforce: isBillingEnforceOn(),
    });
  } catch (error) {
    console.error("[billing/entitlements]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list entitlements" },
      { status: 500 },
    );
  }
}
