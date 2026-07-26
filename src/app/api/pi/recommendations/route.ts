import { NextResponse } from "next/server";
import { assertPiAccess } from "@/lib/access/gate";
import {
  isRecommendationSmEnabled,
  listRecommendations,
  markRecommendationsViewed,
  RecommendationNotFoundError,
  RecommendationTransitionError,
  syncRecommendationsFromLatestSnapshot,
} from "@/lib/recommendations";
import type { RecommendationAction } from "@/lib/recommendations";
import { transitionRecommendation } from "@/lib/recommendations";
import { createClient } from "@/lib/supabase/server";
import { emitPilotKpi } from "@/lib/analytics/server";
import { enforcePiApiRateLimit } from "@/services/piApiRateLimit";

const USER_ACTIONS: readonly RecommendationAction[] = [
  "viewed",
  "accepted",
  "dismissed",
  "completed",
];

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      supabase,
      user: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const rateLimited = await enforcePiApiRateLimit(user.id);
  if (rateLimited) {
    return { supabase, user: null, response: rateLimited };
  }

  const gate = assertPiAccess({
    userId: user.id,
    email: user.email,
    surface: "recommendations",
  });
  if (!gate.allowed) {
    return {
      supabase,
      user: null,
      response: NextResponse.json({ error: gate.reason }, { status: 403 }),
    };
  }
  return { supabase, user, response: null };
}

export async function GET() {
  const { supabase, user, response } = await requireUser();
  if (!user) return response;

  if (!isRecommendationSmEnabled()) {
    return NextResponse.json({
      ok: true,
      enabled: false,
      recommendations: [],
      capabilityAssigned: false,
    });
  }

  try {
    await syncRecommendationsFromLatestSnapshot(supabase, user.id);
    const recommendations = await listRecommendations(supabase, user.id);
    return NextResponse.json({
      ok: true,
      enabled: true,
      recommendations,
      capabilityAssigned: false,
    });
  } catch (error) {
    console.error("[pi/recommendations] list failed", error);
    return NextResponse.json(
      { error: "Could not load recommendations" },
      { status: 500 },
    );
  }
}

/** Explicit refresh — re-sync from the latest capability snapshot (idempotent). */
export async function POST() {
  const { supabase, user, response } = await requireUser();
  if (!user) return response;

  if (!isRecommendationSmEnabled()) {
    return NextResponse.json(
      { error: "Recommendations are not enabled for this pilot." },
      { status: 403 },
    );
  }

  try {
    const { created } = await syncRecommendationsFromLatestSnapshot(supabase, user.id);
    const recommendations = await listRecommendations(supabase, user.id);
    return NextResponse.json({
      ok: true,
      enabled: true,
      created,
      recommendations,
      capabilityAssigned: false,
    });
  } catch (error) {
    console.error("[pi/recommendations] refresh failed", error);
    return NextResponse.json(
      { error: "Could not refresh recommendations" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const { supabase, user, response } = await requireUser();
  if (!user) return response;

  if (!isRecommendationSmEnabled()) {
    return NextResponse.json(
      { error: "Recommendations are not enabled for this pilot." },
      { status: 403 },
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

  const value = body as {
    recommendationId?: unknown;
    recommendationIds?: unknown;
    action?: unknown;
    surface?: unknown;
  };
  const surface =
    value.surface === "profile" || value.surface === "career" ? value.surface : "unknown";

  const action = typeof value.action === "string" ? value.action : "";
  if (!USER_ACTIONS.includes(action as RecommendationAction)) {
    return NextResponse.json(
      { error: "action must be one of viewed, accepted, dismissed, completed" },
      { status: 400 },
    );
  }

  // Bulk viewed marker for surfaces (generated → viewed only; idempotent).
  if (action === "viewed" && Array.isArray(value.recommendationIds)) {
    const ids = value.recommendationIds.filter(
      (id): id is string => typeof id === "string" && id.length > 0,
    );
    if (!ids.length) {
      return NextResponse.json({ error: "recommendationIds is empty" }, { status: 400 });
    }
    try {
      const updated = await markRecommendationsViewed(supabase, user.id, ids);
      if (updated > 0) {
        await emitPilotKpi("recommendation_viewed", { surface, count: updated });
      }
      return NextResponse.json({ ok: true, updated, capabilityAssigned: false });
    } catch (error) {
      console.error("[pi/recommendations] mark viewed failed", error);
      return NextResponse.json(
        { error: "Could not update recommendations" },
        { status: 500 },
      );
    }
  }

  if (typeof value.recommendationId !== "string" || !value.recommendationId) {
    return NextResponse.json({ error: "recommendationId required" }, { status: 400 });
  }

  try {
    const result = await transitionRecommendation(supabase, {
      userId: user.id,
      recommendationId: value.recommendationId,
      to: action as RecommendationAction,
    });
    if (action === "accepted" && !result.idempotent) {
      await emitPilotKpi("recommendation_accepted", { surface });
    }
    return NextResponse.json({
      ok: true,
      recommendation: result.record,
      idempotent: result.idempotent,
      capabilityAssigned: false,
    });
  } catch (error) {
    if (error instanceof RecommendationNotFoundError) {
      return NextResponse.json({ error: "Recommendation not found" }, { status: 404 });
    }
    if (error instanceof RecommendationTransitionError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("[pi/recommendations] transition failed", error);
    return NextResponse.json(
      { error: "Could not update recommendation" },
      { status: 500 },
    );
  }
}
