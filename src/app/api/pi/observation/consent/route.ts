import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertPiAccess } from "@/lib/access/gate";
import {
  getWorkspaceObservationConsent,
  setWorkspaceObservationConsent,
  WORKSPACE_OBSERVATION_CONSENT_COPY,
} from "@/lib/workspace-observation";
import { parseWorkspaceProjectParam } from "@/lib/professional-workspace/project-context";

export async function GET(request: Request) {
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
    surface: "workspace_observation",
  });
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  const url = new URL(request.url);
  const parsed = parseWorkspaceProjectParam(url.searchParams.get("project"));

  const consent = await getWorkspaceObservationConsent(
    supabase,
    user.id,
    parsed ? { kind: parsed.kind, id: parsed.id } : null,
  );

  return NextResponse.json({
    ok: true,
    allowed: consent.allowed,
    global: consent.global,
    project: consent.project,
    effective: consent.effective,
    copy: WORKSPACE_OBSERVATION_CONSENT_COPY,
    capabilityAssigned: false,
  });
}

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
    surface: "workspace_observation",
  });
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
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
    consented?: boolean;
    scope?: "global" | "project";
    project?: string;
  };

  if (typeof data.consented !== "boolean") {
    return NextResponse.json({ error: "consented boolean required" }, { status: 400 });
  }

  const parsed = parseWorkspaceProjectParam(data.project ?? null);
  const scope = data.scope ?? (parsed ? "project" : "global");

  try {
    const record = await setWorkspaceObservationConsent(supabase, {
      userId: user.id,
      consented: data.consented,
      scope,
      project: parsed ? { kind: parsed.kind, id: parsed.id } : null,
    });
    return NextResponse.json({
      ok: true,
      consent: record,
      copy: WORKSPACE_OBSERVATION_CONSENT_COPY,
      capabilityAssigned: false,
    });
  } catch (error) {
    console.error("[observation-consent] failed", error);
    return NextResponse.json({ error: "Could not update consent" }, { status: 500 });
  }
}
