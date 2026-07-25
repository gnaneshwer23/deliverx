import { NextResponse } from "next/server";
import {
  loadRecentSnapshotClaims,
  toPortfolioCapabilityClaims,
} from "@/lib/capability-engine/snapshot-claims";
import { createClient } from "@/lib/supabase/server";
import {
  createPortfolioEntryFromEvidence,
  listPortfolioEntries,
  listUserEvidenceForPortfolio,
} from "@/lib/verified-portfolio/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [entries, evidence, snapshotPack] = await Promise.all([
      listPortfolioEntries(supabase, user.id),
      listUserEvidenceForPortfolio(supabase, user.id),
      loadRecentSnapshotClaims(supabase, user.id, 1),
    ]);
    const capabilityClaims = snapshotPack.latest
      ? toPortfolioCapabilityClaims(snapshotPack.latest, { requireCitations: false })
      : [];
    return NextResponse.json({
      entries,
      evidence,
      capabilityClaims,
      snapshotId: snapshotPack.latest?.snapshotId ?? null,
      readinessSignal: snapshotPack.latest?.readiness ?? null,
      capabilityAssigned: false,
    });
  } catch (error) {
    console.error("[vpp] list failed", error);
    return NextResponse.json({ error: "Could not load portfolio" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    title?: string;
    targetRole?: string;
    evidenceIds?: string[];
    userNotes?: Record<string, unknown>;
  };

  const title = String(data.title ?? "").trim();
  const evidenceIds = Array.isArray(data.evidenceIds)
    ? data.evidenceIds.map(String)
    : [];
  if (!title || evidenceIds.length === 0) {
    return NextResponse.json(
      { error: "title and evidenceIds required — every claim must link to evidence" },
      { status: 400 },
    );
  }

  try {
    const entry = await createPortfolioEntryFromEvidence(supabase, user.id, {
      title,
      targetRole: data.targetRole ?? null,
      evidenceIds,
      userNotes: data.userNotes as Parameters<
        typeof createPortfolioEntryFromEvidence
      >[2]["userNotes"],
    });
    return NextResponse.json({
      entry,
      deliverxVerified: entry.deliverxVerified,
      notice:
        "Entry compiled from evidence. AI summary is packaging only — not DeliverX verification.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "create_failed";
    if (message === "evidence_required") {
      return NextResponse.json({ error: "Select at least one evidence item" }, { status: 400 });
    }
    console.error("[vpp] create failed", error);
    return NextResponse.json({ error: "Could not create entry" }, { status: 500 });
  }
}
