import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertPiAccess } from "@/lib/access/gate";
import {
  listPrivacyRequests,
  requestAndBuildExport,
  assertExportNoCrossUserLeak,
} from "@/lib/pi-privacy";

export async function GET() {
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

  try {
    const requests = await listPrivacyRequests(supabase, user.id);
    return NextResponse.json({ ok: true, requests });
  } catch (error) {
    console.error("[privacy/export] list failed", error);
    return NextResponse.json({ error: "Could not list privacy requests" }, { status: 500 });
  }
}

export async function POST() {
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

  try {
    const { request, export: exportDoc } = await requestAndBuildExport(supabase, {
      userId: user.id,
      email: user.email,
    });
    assertExportNoCrossUserLeak(exportDoc, user.id);
    return NextResponse.json({
      ok: true,
      request,
      export: exportDoc,
      capabilityAssigned: false,
    });
  } catch (error) {
    console.error("[privacy/export] failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Export failed" },
      { status: 500 },
    );
  }
}
