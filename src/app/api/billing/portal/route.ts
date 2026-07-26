import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createBillingPortalSession, isBillingConfigured } from "@/lib/billing";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isBillingConfigured()) {
    return NextResponse.json(
      { error: "Billing portal is not configured (STRIPE_SECRET_KEY missing)." },
      { status: 503 },
    );
  }

  try {
    const admin = createAdminClient();
    const portal = await createBillingPortalSession({
      admin,
      userId: user.id,
      email: user.email,
    });
    return NextResponse.json({ ok: true, url: portal.url });
  } catch (error) {
    console.error("[billing/portal]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Portal failed" },
      { status: 500 },
    );
  }
}
