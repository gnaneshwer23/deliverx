import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildCareerIntelligenceSnapshot } from "@/lib/career-intelligence/context";
import { appendEvidence } from "@/lib/evidence-ledger/append";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const snapshot = await buildCareerIntelligenceSnapshot(supabase, user.id);
    return NextResponse.json({
      ...snapshot,
      capabilityAssigned: false,
      notice:
        snapshot.readinessSource === "score_run"
          ? "Career Intelligence packages PI profile + ScoreRun + evidence + portfolio. It does not assign capability."
          : snapshot.readinessSource === "mixed"
            ? "Career Intelligence mixes ScoreRun projections with labelled evidence-coverage heuristics for thin roles. Percentages are not capability levels."
            : "Career Intelligence packages PI profile + evidence + portfolio. Run ScoreRun for engine-backed readiness. It does not assign capability.",
    });
  } catch (error) {
    console.error("[career] snapshot failed", error);
    return NextResponse.json({ error: "Could not build career intelligence" }, { status: 500 });
  }
}

/** Interview Lab observation + application tracker writes */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = String(body.action ?? "");

  try {
    if (action === "interview_session") {
      const focus = String(body.focus ?? "Interview prep").trim();
      const notes = String(body.notes ?? "").trim();
      const evidenceIds = Array.isArray(body.evidenceIds)
        ? body.evidenceIds.map(String)
        : [];

      await supabase.from("launchpad_artefacts").insert({
        user_id: user.id,
        artefact_type: "mock_interview",
        title: `Interview Lab · ${focus}`,
        status: "ready",
        content: {
          focus,
          notes,
          evidenceIds,
          capabilityAssigned: false,
        },
      });

      let ledgerEvidenceId: string | null = null;
      try {
        const ledger = await appendEvidence(supabase, {
          userId: user.id,
          sourceType: "launchpad_interview",
          category: "communication",
          title: `Interview Lab: ${focus}`,
          summary: notes.slice(0, 240) || "Interview preparation session",
          rawContent: {
            focus,
            notes,
            evidenceIds,
            note: "Observation of interview prep — not a capability assignment",
          },
          idempotencyKey: `career-interview:${user.id}:${Date.now()}`,
          confidentiality: "private",
          consentStatus: "analysis_allowed",
          provenance: {
            actorType: "user",
            actorUserId: user.id,
            userContribution: { focus, notes, evidenceIds },
            aiContribution: {},
          },
        });
        ledgerEvidenceId = ledger.evidenceId;
      } catch (err) {
        console.error("[career] interview ledger write failed", err);
      }

      await supabase.from("career_activities").insert({
        user_id: user.id,
        module_id: "interview",
        activity_type: "interview_session",
        title: focus,
        payload: { evidenceIds, ledgerEvidenceId },
      });

      return NextResponse.json({
        ok: true,
        ledgerEvidenceId,
        capabilityAssigned: false,
      });
    }

    if (action === "track_application") {
      const company = String(body.company ?? "").trim();
      const roleTitle = String(body.roleTitle ?? "").trim();
      if (!company || !roleTitle) {
        return NextResponse.json({ error: "company and roleTitle required" }, { status: 400 });
      }
      const { data, error } = await supabase
        .from("career_applications")
        .insert({
          user_id: user.id,
          company,
          role_title: roleTitle,
          status: String(body.status ?? "saved"),
          opportunity_id: typeof body.opportunityId === "string" ? body.opportunityId : null,
          notes: typeof body.notes === "string" ? body.notes : null,
          gaps_noted: Array.isArray(body.gaps) ? body.gaps : [],
          evidence_cited: Array.isArray(body.evidenceCited) ? body.evidenceCited : [],
        })
        .select("*")
        .single();
      if (error) throw error;
      return NextResponse.json({ application: data, capabilityAssigned: false });
    }

    if (action === "list_applications") {
      const { data } = await supabase
        .from("career_applications")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      return NextResponse.json({ applications: data ?? [] });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[career] action failed", error);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
