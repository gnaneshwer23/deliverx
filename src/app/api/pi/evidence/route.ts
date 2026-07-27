import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { appendEvidence } from "@/lib/evidence-ledger/append";
import {
  defaultCategoryForSource,
  isPiEvidenceCategory,
  isPiEvidenceSourceType,
  type PiEvidenceCategory,
  type PiEvidenceSourceType,
} from "@/lib/evidence-ledger/types";
import { deriveEvidenceStrength } from "@/lib/verified-portfolio/types";
import { emitPilotKpi } from "@/lib/analytics/server";
import { enforcePiApiRateLimit } from "@/services/piApiRateLimit";
import {
  EVIDENCE_LIST_LIMIT,
  EVIDENCE_LIST_PROVENANCE_LIMIT,
  EVIDENCE_LIST_STATUS_TRANSITION_LIMIT,
} from "@/lib/evidence-ledger/query-limits";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rateLimited = await enforcePiApiRateLimit(user.id);
  if (rateLimited) return rateLimited;

  const { data: records, error } = await supabase
    .from("pi_evidence_records")
    .select(
      "id, source_type, category, title, summary, content_hash, confidentiality, consent_status, captured_at, created_at, source_record_type, source_record_id",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(EVIDENCE_LIST_LIMIT);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const ids = (records ?? []).map((r) => r.id as string);
  const statusById: Record<string, string> = {};
  const actorById: Record<string, string> = {};
  if (ids.length) {
    const [{ data: transitions }, { data: provenance }] = await Promise.all([
      supabase
        .from("pi_evidence_status_transitions")
        .select("evidence_id, to_status, created_at")
        .in("evidence_id", ids)
        .order("created_at", { ascending: false })
        .limit(EVIDENCE_LIST_STATUS_TRANSITION_LIMIT),
      supabase
        .from("pi_evidence_provenance")
        .select("evidence_id, actor_type")
        .in("evidence_id", ids)
        .limit(EVIDENCE_LIST_PROVENANCE_LIMIT),
    ]);
    for (const t of transitions ?? []) {
      const eid = t.evidence_id as string;
      if (!statusById[eid]) statusById[eid] = t.to_status as string;
    }
    for (const p of provenance ?? []) {
      actorById[p.evidence_id as string] = (p.actor_type as string) || "user";
    }
  }

  return NextResponse.json({
    evidence: (records ?? []).map((r) => {
      const status = statusById[r.id as string] ?? "observed";
      const actorType = actorById[r.id as string] ?? "user";
      const strength = deriveEvidenceStrength({
        id: r.id as string,
        title: r.title as string,
        sourceType: r.source_type as string,
        category: r.category as string,
        status,
        confidentiality: r.confidentiality as string,
        summary: r.summary as string,
        actorType,
      });
      return {
        ...r,
        status,
        actorType,
        strength,
      };
    }),
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rateLimited = await enforcePiApiRateLimit(user.id);
  if (rateLimited) return rateLimited;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sourceTypeRaw = String(body.sourceType ?? "");
  if (!isPiEvidenceSourceType(sourceTypeRaw)) {
    return NextResponse.json({ error: "Invalid sourceType" }, { status: 400 });
  }
  const sourceType = sourceTypeRaw as PiEvidenceSourceType;

  const categoryRaw = body.category ? String(body.category) : defaultCategoryForSource(sourceType);
  if (!isPiEvidenceCategory(categoryRaw)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  if (title.length < 2) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const rawContent =
    body.rawContent && typeof body.rawContent === "object"
      ? (body.rawContent as Record<string, unknown>)
      : {};

  const idempotencyKey =
    request.headers.get("idempotency-key") ||
    (typeof body.idempotencyKey === "string" ? body.idempotencyKey : null);

  const actorType =
    body.actorType === "ai" ||
    body.actorType === "system" ||
    body.actorType === "external_employer" ||
    body.actorType === "admin_attestor"
      ? body.actorType
      : "user";

  try {
    const result = await appendEvidence(supabase, {
      userId: user.id,
      sourceType,
      category: categoryRaw as PiEvidenceCategory,
      title,
      summary: typeof body.summary === "string" ? body.summary : "",
      rawContent,
      storageRef: typeof body.storageRef === "string" ? body.storageRef : null,
      sourceRecordType:
        typeof body.sourceRecordType === "string" ? body.sourceRecordType : null,
      sourceRecordId:
        typeof body.sourceRecordId === "string" ? body.sourceRecordId : null,
      confidentiality:
        body.confidentiality === "restricted" ||
        body.confidentiality === "shareable" ||
        body.confidentiality === "public"
          ? body.confidentiality
          : "private",
      consentStatus:
        body.consentStatus === "analysis_allowed" ||
        body.consentStatus === "share_restricted" ||
        body.consentStatus === "share_denied"
          ? body.consentStatus
          : "unknown",
      idempotencyKey,
      provenance: {
        actorType,
        actorUserId: user.id,
        userContribution:
          body.userContribution && typeof body.userContribution === "object"
            ? (body.userContribution as Record<string, unknown>)
            : { title },
        aiContribution:
          body.aiContribution && typeof body.aiContribution === "object"
            ? (body.aiContribution as Record<string, unknown>)
            : {},
        modelId: typeof body.modelId === "string" ? body.modelId : null,
        modelVersion: typeof body.modelVersion === "string" ? body.modelVersion : null,
        promptSlug: typeof body.promptSlug === "string" ? body.promptSlug : null,
        promptVersion: typeof body.promptVersion === "string" ? body.promptVersion : null,
        promptHash: typeof body.promptHash === "string" ? body.promptHash : null,
      },
    });

    if (!result.duplicate) {
      await emitPilotKpi("evidence_appended", {
        source_type: sourceType,
        category: categoryRaw,
        actor_type: actorType,
      });
    }

    return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "append_failed";
    console.error("[pi/evidence] append", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
