import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { appendStatusTransition, latestStatus } from "@/lib/evidence-ledger/append";
import { isPiEvidenceStatus } from "@/lib/evidence-ledger/types";
import {
  EVIDENCE_DETAIL_COMPETENCY_LINK_LIMIT,
  EVIDENCE_DETAIL_INTERPRETATION_LIMIT,
  EVIDENCE_DETAIL_STATUS_TRANSITION_LIMIT,
} from "@/lib/evidence-ledger/query-limits";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Ctx) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: record, error } = await supabase
    .from("pi_evidence_records")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [{ data: provenance }, { data: transitions }, { data: interpretations }, { data: links }] =
    await Promise.all([
      supabase.from("pi_evidence_provenance").select("*").eq("evidence_id", id).maybeSingle(),
      supabase
        .from("pi_evidence_status_transitions")
        .select("*")
        .eq("evidence_id", id)
        .order("created_at", { ascending: true })
        .limit(EVIDENCE_DETAIL_STATUS_TRANSITION_LIMIT),
      supabase
        .from("pi_evidence_interpretations")
        .select("*")
        .eq("evidence_id", id)
        .order("version", { ascending: true })
        .limit(EVIDENCE_DETAIL_INTERPRETATION_LIMIT),
      supabase
        .from("pi_evidence_competency_links")
        .select("*")
        .eq("evidence_id", id)
        .limit(EVIDENCE_DETAIL_COMPETENCY_LINK_LIMIT),
    ]);

  const status = await latestStatus(supabase, id);

  return NextResponse.json({
    record,
    status,
    provenance,
    transitions: transitions ?? [],
    interpretations: interpretations ?? [],
    competencyLinks: links ?? [],
  });
}

export async function POST(request: Request, context: Ctx) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: owned } = await supabase
    .from("pi_evidence_records")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: { action?: string; toStatus?: string; reason?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "challenge") {
    const reason = String(body.reason ?? "").trim();
    if (reason.length < 5) {
      return NextResponse.json({ error: "reason required" }, { status: 400 });
    }
    const { data: challenge, error } = await supabase
      .from("pi_evidence_challenges")
      .insert({
        evidence_id: id,
        user_id: user.id,
        reason,
        proposed_correction: {},
        status: "open",
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await appendStatusTransition(supabase, {
      evidenceId: id,
      userId: user.id,
      toStatus: "disputed",
      reason: `challenge:${challenge.id}`,
      actorType: "user",
    });

    await supabase.from("pi_domain_events").insert({
      event_type: "EvidenceChallenged",
      aggregate_type: "evidence",
      aggregate_id: id,
      user_id: user.id,
      payload: { challenge_id: challenge.id, evidence_id: id },
      schema_version: 1,
    });

    return NextResponse.json({ challengeId: challenge.id }, { status: 201 });
  }

  if (body.action === "transition") {
    const toStatus = String(body.toStatus ?? "");
    if (!isPiEvidenceStatus(toStatus)) {
      return NextResponse.json({ error: "Invalid toStatus" }, { status: 400 });
    }
    // Users may withdraw or request dispute; platform_verified requires attestor (later).
    if (toStatus === "platform_verified") {
      return NextResponse.json(
        { error: "platform_verified requires administrative attestation" },
        { status: 403 },
      );
    }
    const result = await appendStatusTransition(supabase, {
      evidenceId: id,
      userId: user.id,
      toStatus,
      reason: body.reason,
      actorType: "user",
    });
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
