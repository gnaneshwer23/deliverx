import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { runCapabilityEngine } from "@/lib/capability-engine/orchestrator";
import { persistCapabilityRun } from "@/lib/capability-engine/persist";
import type { EligibleEvidence } from "@/lib/capability-engine/types";
import {
  DEFAULT_RUBRIC_SLUG,
  DEFAULT_RUBRIC_VERSION,
} from "@/lib/capability-engine/types";
import { latestStatus } from "@/lib/evidence-ledger/append";

export const dynamic = "force-dynamic";

/**
 * Run Capability Engine for the authenticated user against their Evidence Ledger.
 * Returns user-facing explanations only (reasoning summaries) — no hidden CoT.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    targetRole?: string;
    targetSeniority?: string;
    rubricSlug?: string;
    rubricVersion?: string;
    persist?: boolean;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    // empty ok
  }

  const { data: records, error } = await supabase
    .from("pi_evidence_records")
    .select(
      "id, source_type, category, title, summary, content_hash, captured_at, raw_content",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const evidence: EligibleEvidence[] = [];
  for (const r of records ?? []) {
    const status = await latestStatus(supabase, r.id as string);
    const { data: prov } = await supabase
      .from("pi_evidence_provenance")
      .select(
        "actor_type, user_contribution, ai_contribution, model_id, model_version",
      )
      .eq("evidence_id", r.id)
      .maybeSingle();

    evidence.push({
      id: r.id as string,
      sourceType: r.source_type as string,
      category: r.category as string,
      title: r.title as string,
      summary: (r.summary as string) || "",
      capturedAt: (r.captured_at as string) || new Date().toISOString(),
      status,
      contentHash: r.content_hash as string,
      rawContent: (r.raw_content as Record<string, unknown>) || {},
      actorType: (prov?.actor_type as string) || "user",
      userContribution: (prov?.user_contribution as Record<string, unknown>) || {},
      aiContribution: (prov?.ai_contribution as Record<string, unknown>) || {},
      modelId: (prov?.model_id as string) || null,
      modelVersion: (prov?.model_version as string) || null,
    });
  }

  const { data: prior } = await supabase
    .from("pi_capability_snapshots")
    .select("profile")
    .eq("user_id", user.id)
    .order("captured_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const rubricSlug = body.rubricSlug ?? DEFAULT_RUBRIC_SLUG;
  const rubricVersion = body.rubricVersion ?? DEFAULT_RUBRIC_VERSION;

  const result = runCapabilityEngine({
    userId: user.id,
    evidence,
    targetRole: body.targetRole,
    targetSeniority: body.targetSeniority,
    rubricSlug,
    rubricVersion,
    previousSnapshot: (prior?.profile as never) ?? null,
  });

  let persisted: { scoreRunId: string; snapshotId: string | null } | null = null;
  if (body.persist !== false) {
    try {
      persisted = await persistCapabilityRun(supabase, {
        userId: user.id,
        targetRole: body.targetRole,
        targetSeniority: body.targetSeniority,
        rubricSlug,
        rubricVersion,
        result,
      });
    } catch (err) {
      console.error("[capability-engine] persist failed", err);
    }
  }

  // Strip anything beyond user-facing explanations
  return NextResponse.json({
    ok: result.ok,
    duplicate: result.duplicate,
    error: result.error,
    inputHash: result.inputHash,
    readiness: result.snapshot?.readiness ?? null,
    dimensions: result.snapshot?.dimensions ?? null,
    strengths: result.snapshot?.strengths ?? [],
    gaps: result.snapshot?.gaps ?? [],
    recommendations: result.snapshot?.recommendations ?? [],
    explanations: result.snapshot?.explanations ?? [],
    targetComparison: result.snapshot?.targetComparison ?? null,
    contradictions: (result.snapshot?.contradictions ?? []).map((c) => ({
      competencyId: c.competencyId,
      summary: c.summary,
      severity: c.severity,
      evidenceIds: c.evidenceIds,
    })),
    judgements: result.judgements.map((j) => ({
      competencyId: j.competencyId,
      indicatorId: j.indicatorId,
      levelProposed: j.levelProposed,
      evidenceReferences: j.evidenceReferences,
      reasoningSummary: j.reasoningSummary,
      counterEvidence: j.counterEvidence,
      confidence: j.confidence,
      limitations: j.limitations,
      modelVersion: j.modelVersion,
      promptVersion: j.promptVersion,
      rubricVersion: j.rubricVersion,
      reviewStatus: j.reviewStatus,
      intelligenceKinds: j.intelligenceKinds,
    })),
    reviewQueue: result.reviewQueue.map((r) => ({
      reason: r.reason,
      payload: r.payload,
    })),
    growth: result.growth,
    stepsCompleted: result.stepsCompleted,
    persisted,
  });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: snap, error } = await supabase
    .from("pi_capability_snapshots")
    .select("id, captured_at, profile, score_run_id")
    .eq("user_id", user.id)
    .order("captured_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!snap) return NextResponse.json({ snapshot: null });

  const profile = snap.profile as {
    explanations?: unknown;
    readiness?: number;
    strengths?: unknown;
    gaps?: unknown;
    recommendations?: unknown;
    dimensions?: unknown;
    targetComparison?: unknown;
  };

  return NextResponse.json({
    snapshotId: snap.id,
    scoreRunId: snap.score_run_id,
    capturedAt: snap.captured_at,
    readiness: profile.readiness,
    dimensions: profile.dimensions,
    strengths: profile.strengths,
    gaps: profile.gaps,
    recommendations: profile.recommendations,
    explanations: profile.explanations,
    targetComparison: profile.targetComparison,
  });
}
