import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertPiAccess } from "@/lib/access/gate";
import { DELETE_CONFIRM_PHRASE, requestAndDeletePersonPi } from "@/lib/pi-privacy";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gate = assertPiAccess({
    userId: user.id,
    email: user.email,
    surface: "privacy",
  });
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  if (!user.email) {
    return NextResponse.json(
      { error: "Account email is required for password re-authentication." },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const data = body as {
    password?: string;
    confirmPhrase?: string;
    deleteAuthUser?: boolean;
  };

  try {
    const { request: privacyRequest, result } = await requestAndDeletePersonPi(supabase, {
      userId: user.id,
      email: user.email,
      password: data.password ?? "",
      confirmPhrase: data.confirmPhrase ?? "",
      deleteAuthUser: data.deleteAuthUser,
    });

    return NextResponse.json({
      ok: true,
      request: privacyRequest,
      result,
      confirmPhraseRequired: DELETE_CONFIRM_PHRASE,
      capabilityAssigned: false,
      note: "Person PI data purged. Privacy request tombstone retained. Shared framework catalogue untouched.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    const status =
      message.includes("Re-authentication") || message.includes("Confirmation phrase")
        ? 400
        : 500;
    console.error("[privacy/delete] failed", error);
    return NextResponse.json({ error: message }, { status });
  }
}
