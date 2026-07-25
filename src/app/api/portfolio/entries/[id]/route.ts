import { NextResponse } from "next/server";
import {
  loadRecentSnapshotClaims,
  toPortfolioCapabilityClaims,
} from "@/lib/capability-engine/snapshot-claims";
import { createClient } from "@/lib/supabase/server";
import {
  createPortfolioShare,
  createRoleVersion,
  getPortfolioEntry,
  listPortfolioShares,
  revokePortfolioShare,
  updatePortfolioEntry,
} from "@/lib/verified-portfolio/store";
import type { ConfidentialFieldKey } from "@/lib/verified-portfolio/types";
import { externalViewModel } from "@/lib/verified-portfolio/compile";
import { PORTFOLIO_EXPORT_REQUIREMENTS } from "@/lib/verified-portfolio/compile";

type Params = Promise<{ id: string }>;

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const entry = await getPortfolioEntry(supabase, user.id, id);
    const shares = await listPortfolioShares(supabase, user.id, id);
    const { latest } = await loadRecentSnapshotClaims(supabase, user.id, 1);
    const linkedIds = new Set(entry.evidenceLinks.map((l) => l.evidenceId));
    const ownerClaims = latest
      ? toPortfolioCapabilityClaims(latest, {
          allowedEvidenceIds: linkedIds.size ? linkedIds : null,
          requireCitations: linkedIds.size > 0,
        })
      : [];
    const shareableIds = new Set(
      entry.evidenceLinks
        .filter((l) => l.confidentiality === "shareable" || l.confidentiality === "public")
        .map((l) => l.evidenceId),
    );
    const preview = externalViewModel(entry, entry.hiddenFields, ownerClaims);
    return NextResponse.json({
      entry,
      shares,
      capabilityClaims: ownerClaims,
      externalPreview: preview,
      publicCapabilityClaimCount: ownerClaims.filter((c) =>
        c.evidenceCitations.some((e) => shareableIds.has(e.evidenceId)),
      ).length,
      exportRequirements: PORTFOLIO_EXPORT_REQUIREMENTS,
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function PATCH(request: Request, { params }: { params: Params }) {
  const { id } = await params;
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

  try {
    const entry = await updatePortfolioEntry(supabase, user.id, id, {
      title: typeof body.title === "string" ? body.title : undefined,
      targetRole: typeof body.targetRole === "string" ? body.targetRole : undefined,
      lifecycle: body.lifecycle as never,
      visibility: body.visibility as never,
      projectContext: typeof body.projectContext === "string" ? body.projectContext : undefined,
      userResponsibility:
        typeof body.userResponsibility === "string" ? body.userResponsibility : undefined,
      challenge: typeof body.challenge === "string" ? body.challenge : undefined,
      actions: typeof body.actions === "string" ? body.actions : undefined,
      decisions: typeof body.decisions === "string" ? body.decisions : undefined,
      artefacts: typeof body.artefacts === "string" ? body.artefacts : undefined,
      outcomes: typeof body.outcomes === "string" ? body.outcomes : undefined,
      reflection: typeof body.reflection === "string" ? body.reflection : undefined,
      narrative: typeof body.narrative === "string" ? body.narrative : undefined,
      aiSummary: typeof body.aiSummary === "string" ? body.aiSummary : undefined,
      hiddenFields: Array.isArray(body.hiddenFields)
        ? (body.hiddenFields as ConfidentialFieldKey[])
        : undefined,
      competenciesDemonstrated: Array.isArray(body.competenciesDemonstrated)
        ? (body.competenciesDemonstrated as string[])
        : undefined,
    });
    return NextResponse.json({ entry, deliverxVerified: entry.deliverxVerified });
  } catch (error) {
    console.error("[vpp] patch failed", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Params }) {
  const { id } = await params;
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
    if (action === "share") {
      const share = await createPortfolioShare(supabase, user.id, {
        entryId: id,
        label: typeof body.label === "string" ? body.label : undefined,
        versionId: typeof body.versionId === "string" ? body.versionId : null,
        hiddenFields: Array.isArray(body.hiddenFields)
          ? (body.hiddenFields as ConfidentialFieldKey[])
          : undefined,
        expiresAt: typeof body.expiresAt === "string" ? body.expiresAt : null,
      });
      return NextResponse.json({ share });
    }
    if (action === "revoke") {
      const shareId = String(body.shareId ?? "");
      if (!shareId) return NextResponse.json({ error: "shareId required" }, { status: 400 });
      await revokePortfolioShare(supabase, user.id, shareId);
      return NextResponse.json({ ok: true });
    }
    if (action === "role_version") {
      const roleLabel = String(body.roleLabel ?? "").trim();
      if (!roleLabel) {
        return NextResponse.json({ error: "roleLabel required" }, { status: 400 });
      }
      const version = await createRoleVersion(supabase, user.id, id, roleLabel);
      return NextResponse.json({ version });
    }
    if (action === "export") {
      const entry = await getPortfolioEntry(supabase, user.id, id);
      const preview = externalViewModel(entry, entry.hiddenFields);
      return NextResponse.json({
        format: "print_html_payload",
        requirements: PORTFOLIO_EXPORT_REQUIREMENTS,
        watermark: entry.deliverxVerified
          ? null
          : PORTFOLIO_EXPORT_REQUIREMENTS.watermarkWhenNotExternallyVerified,
        document: preview,
        notice: "PDF binary generation is queued for a later slice; print HTML payload is ready.",
      });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[vpp] action failed", error);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
