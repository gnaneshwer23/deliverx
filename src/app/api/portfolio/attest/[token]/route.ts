import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  AttestationError,
  getAttestorViewByToken,
  isAttestationDecision,
  isAttestationRelationship,
  submitAttestation,
} from "@/lib/external-attestation";

export const dynamic = "force-dynamic";

type Params = Promise<{ token: string }>;

export async function GET(_request: Request, { params }: { params: Params }) {
  const { token } = await params;
  try {
    const view = await getAttestorViewByToken(token);
    return NextResponse.json({ view });
  } catch (error) {
    if (error instanceof AttestationError) {
      const status =
        error.code === "expired"
          ? 410
          : error.code === "forbidden"
            ? 403
            : 404;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }
    console.error("[attest] get failed", error);
    return NextResponse.json({ error: "Unavailable" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Params }) {
  const { token } = await params;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const decisionRaw = String(body.decision ?? "");
  if (!isAttestationDecision(decisionRaw)) {
    return NextResponse.json(
      { error: "decision must be confirm or dispute" },
      { status: 400 },
    );
  }
  const relationshipRaw = String(body.attestorRelationship ?? "");
  if (!isAttestationRelationship(relationshipRaw)) {
    return NextResponse.json(
      { error: "attestorRelationship is required" },
      { status: 400 },
    );
  }

  let actorUserId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    actorUserId = user?.id ?? null;
  } catch {
    actorUserId = null;
  }

  try {
    const result = await submitAttestation(token, {
      decision: decisionRaw,
      attestorDisplayName: String(body.attestorDisplayName ?? ""),
      attestorRelationship: relationshipRaw,
      attestorOrganisation:
        typeof body.attestorOrganisation === "string"
          ? body.attestorOrganisation
          : null,
      statement: String(body.statement ?? ""),
      actorUserId,
    });
    return NextResponse.json({
      ok: true,
      decision: result.attestation.decision,
      deliverxVerified: result.deliverxVerified,
      // Never echo attestor PII back beyond decision ack
      attestationId: result.attestation.id,
      evidenceId: result.attestation.evidenceId,
      reviewCaseId: result.attestation.reviewCaseId,
      notice:
        result.attestation.decision === "confirm"
          ? "Attestation recorded on the Evidence Ledger. Capability scores are unchanged."
          : "Dispute recorded. A review case was opened. Verified badge remains off.",
    });
  } catch (error) {
    if (error instanceof AttestationError) {
      const status =
        error.code === "self_attest" || error.code === "forbidden"
          ? 403
          : error.code === "expired"
            ? 410
            : error.code === "already_decided"
              ? 409
              : error.code === "not_found"
                ? 404
                : 400;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }
    console.error("[attest] submit failed", error);
    return NextResponse.json({ error: "Submit failed" }, { status: 500 });
  }
}
