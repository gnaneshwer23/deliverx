import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertPiAccess } from "@/lib/access/gate";
import {
  ensureInterventionsForGaps,
  listActiveInterventions,
  transitionIntervention,
  InvalidInterventionTransitionError,
} from "@/lib/workspace-observation";
import { enforcePiApiRateLimit } from "@/services/piApiRateLimit";
import {
  invalidTransitionResponse,
  piErrorResponse,
  PI_ERROR_CODE,
} from "@/lib/api/pi-errors";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized", code: PI_ERROR_CODE.unauthorized },
      { status: 401 },
    );
  }

  const rateLimited = await enforcePiApiRateLimit(user.id);
  if (rateLimited) return rateLimited;

  const gate = assertPiAccess({
    userId: user.id,
    email: user.email,
    surface: "profile",
  });
  if (!gate.allowed) {
    return NextResponse.json(
      { error: gate.reason, code: PI_ERROR_CODE.forbidden },
      { status: 403 },
    );
  }

  try {
    // Prefer existing; if gaps + workspace evidence exist, offer new ones.
    const { data: latestSnap } = await supabase
      .from("pi_capability_snapshots")
      .select("id, score_run_id, profile")
      .eq("user_id", user.id)
      .order("captured_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const profile = (latestSnap?.profile ?? {}) as {
      gaps?: string[];
    };
    const gaps = Array.isArray(profile.gaps) ? profile.gaps : [];

    const { count: workspaceEvidenceCount } = await supabase
      .from("pi_evidence_records")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("source_type", "workspace_observation");

    const { data: recentEvidence } = await supabase
      .from("pi_evidence_records")
      .select("id")
      .eq("user_id", user.id)
      .eq("source_type", "workspace_observation")
      .order("captured_at", { ascending: false })
      .limit(8);

    const interventions =
      gaps.length > 0 && (workspaceEvidenceCount ?? 0) > 0
        ? await ensureInterventionsForGaps(supabase, {
            userId: user.id,
            gaps,
            evidenceIds: (recentEvidence ?? []).map((e) => e.id as string),
            workspaceEvidenceCount: workspaceEvidenceCount ?? 0,
            sourceSnapshotId: (latestSnap?.id as string | undefined) ?? null,
            sourceScoreRunId: (latestSnap?.score_run_id as string | undefined) ?? null,
          })
        : await listActiveInterventions(supabase, user.id);

    return NextResponse.json({
      ok: true,
      interventions,
      capabilityAssigned: false,
    });
  } catch (error) {
    console.error("[interventions] list failed", error);
    return piErrorResponse(
      500,
      "Could not load interventions. Please try again.",
      PI_ERROR_CODE.server,
    );
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized", code: PI_ERROR_CODE.unauthorized },
      { status: 401 },
    );
  }

  const rateLimited = await enforcePiApiRateLimit(user.id);
  if (rateLimited) return rateLimited;

  const gate = assertPiAccess({
    userId: user.id,
    email: user.email,
    surface: "profile",
  });
  if (!gate.allowed) {
    return NextResponse.json(
      { error: gate.reason, code: PI_ERROR_CODE.forbidden },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return piErrorResponse(400, "Invalid JSON", PI_ERROR_CODE.badRequest);
  }
  if (!body || typeof body !== "object") {
    return piErrorResponse(400, "Invalid body", PI_ERROR_CODE.badRequest);
  }

  const data = body as {
    interventionId?: string;
    action?: "accepted" | "dismissed" | "completed";
  };

  if (!data.interventionId || !data.action) {
    return piErrorResponse(
      400,
      "interventionId and action required",
      PI_ERROR_CODE.badRequest,
    );
  }
  if (!["accepted", "dismissed", "completed"].includes(data.action)) {
    return piErrorResponse(400, "invalid action", PI_ERROR_CODE.badRequest);
  }

  try {
    const intervention = await transitionIntervention(supabase, {
      userId: user.id,
      interventionId: data.interventionId,
      to: data.action,
    });
    return NextResponse.json({
      ok: true,
      intervention,
      capabilityAssigned: false,
    });
  } catch (error) {
    if (error instanceof InvalidInterventionTransitionError) {
      return invalidTransitionResponse(error.from, error.to, "intervention");
    }
    if (error instanceof Error && error.message === "Intervention not found") {
      return piErrorResponse(404, "Intervention not found", PI_ERROR_CODE.notFound);
    }
    console.error("[interventions] transition failed", error);
    return piErrorResponse(
      500,
      "Could not update intervention. Please try again.",
      PI_ERROR_CODE.server,
    );
  }
}
