import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseCandidateProfile } from "@/lib/xperience/parse-profile";
import { saveOnboardingProfile } from "@/lib/xperience/store";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const profile = parseCandidateProfile({
    ...(typeof body === "object" && body ? body : {}),
    email:
      (typeof body === "object" &&
        body &&
        "email" in body &&
        typeof (body as { email?: unknown }).email === "string" &&
        (body as { email: string }).email) ||
      user.email,
  });

  if (!profile) {
    return NextResponse.json({ error: "Invalid profile" }, { status: 400 });
  }

  try {
    const result = await saveOnboardingProfile(supabase, user, profile);
    return NextResponse.json({
      ...result,
      status: result.status.toLowerCase(),
    });
  } catch (error) {
    console.error("Xperience onboarding failed", error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
