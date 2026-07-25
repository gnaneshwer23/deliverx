import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  AttestationError,
  createAttestationRequest,
  listAttestationRequests,
  listAttestationsForEntry,
  revokeAttestationRequest,
} from "@/lib/external-attestation";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function GET(_request: Request, { params }: { params: Params }) {
  const { id: entryId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [requests, attestations] = await Promise.all([
      listAttestationRequests(supabase, user.id, entryId),
      listAttestationsForEntry(supabase, user.id, entryId),
    ]);
    return NextResponse.json({
      requests,
      attestations: attestations.map((a) => ({
        id: a.id,
        requestId: a.requestId,
        decision: a.decision,
        attestorRelationship: a.attestorRelationship,
        // Never return attestor display name / org / statement on list APIs to reduce leak surface
        evidenceId: a.evidenceId,
        reviewCaseId: a.reviewCaseId,
        createdAt: a.createdAt,
      })),
      verifiedMeaning:
        "DeliverX Verified lights only after an external attestor confirms a specific claim (externally_attested + externally_verified).",
    });
  } catch (error) {
    console.error("[attestation] list failed", error);
    return NextResponse.json({ error: "Failed to list attestations" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Params }) {
  const { id: entryId } = await params;
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

  const action = String(body.action ?? "request");

  try {
    if (action === "request") {
      const attestationRequest = await createAttestationRequest(supabase, user.id, {
        entryId,
        claimLabel: String(body.claimLabel ?? ""),
        claimField: typeof body.claimField === "string" ? body.claimField : undefined,
        claimSummary:
          typeof body.claimSummary === "string" ? body.claimSummary : undefined,
        relationshipHint:
          typeof body.relationshipHint === "string" ? body.relationshipHint : null,
        consentToShare: body.consentToShare === true,
        shareId: typeof body.shareId === "string" ? body.shareId : null,
        expiresInDays:
          typeof body.expiresInDays === "number" ? body.expiresInDays : undefined,
      });
      return NextResponse.json({ request: attestationRequest }, { status: 201 });
    }

    if (action === "revoke") {
      const requestId = String(body.requestId ?? "");
      if (!requestId) {
        return NextResponse.json({ error: "requestId required" }, { status: 400 });
      }
      await revokeAttestationRequest(supabase, user.id, requestId);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    if (error instanceof AttestationError) {
      const status =
        error.code === "consent_required" || error.code === "invalid"
          ? 400
          : error.code === "not_found"
            ? 404
            : error.code === "forbidden"
              ? 403
              : 400;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }
    console.error("[attestation] action failed", error);
    return NextResponse.json({ error: "Attestation action failed" }, { status: 500 });
  }
}
