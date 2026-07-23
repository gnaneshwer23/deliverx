import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getXperienceSession } from "@/lib/xperience/store";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const session = await getXperienceSession(supabase, user.id);
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const name =
    (typeof meta?.name === "string" && meta.name) ||
    [session.profile?.first_name, session.profile?.last_name].filter(Boolean).join(" ") ||
    null;

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      name,
      product: typeof meta?.product === "string" ? meta.product : null,
    },
    profile: session.profile,
    enrolment: session.enrolment,
  });
}
