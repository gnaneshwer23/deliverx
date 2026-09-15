import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createPortfolioShare,
  listPortfolioShares,
  revokePortfolioShare,
} from "@/lib/verified-portfolio/store";
import {
  describeShareControl,
  expiryFromWindowDays,
  isPortfolioShareControlsEnabled,
} from "@/lib/verified-portfolio/share-controls";
import type { ConfidentialFieldKey, PortfolioShare } from "@/lib/verified-portfolio/types";

type Params = Promise<{ id: string }>;

export const dynamic = "force-dynamic";

/**
 * Flag OFF -> the whole owner-facing surface is unavailable: the panel is hidden
 * and this API 404s with a disabled payload, with no redeploy and no change to
 * existing public share behaviour.
 */
function disabledResponse() {
  return NextResponse.json(
    {
      error: "not_found",
      enabled: false,
      notice:
        "Portfolio share controls are off. Set DELIVERX_PORTFOLIO_SHARE_CONTROLS=on to enable.",
    },
    { status: 404 },
  );
}

function toViewList(shares: PortfolioShare[]) {
  const now = new Date();
  return shares.map((share) => describeShareControl(share, now));
}

export async function GET(_request: Request, { params }: { params: Params }) {
  if (!isPortfolioShareControlsEnabled()) return disabledResponse();

  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const shares = await listPortfolioShares(supabase, user.id, id);
    return NextResponse.json({ enabled: true, shares: toViewList(shares) });
  } catch (error) {
    console.error("[vpp] share list failed", error);
    return NextResponse.json({ error: "Could not load shares" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Params }) {
  if (!isPortfolioShareControlsEnabled()) return disabledResponse();

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

  // An explicit ISO expiry wins; otherwise derive one from a chosen day window.
  let expiresAt: string | null = null;
  if (typeof body.expiresAt === "string" && body.expiresAt.trim()) {
    const parsed = new Date(body.expiresAt);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ error: "Invalid expiresAt" }, { status: 400 });
    }
    expiresAt = parsed.toISOString();
  } else if (body.expiresInDays != null) {
    const days = Number(body.expiresInDays);
    if (!Number.isFinite(days) || days < 0) {
      return NextResponse.json({ error: "Invalid expiresInDays" }, { status: 400 });
    }
    expiresAt = expiryFromWindowDays(days);
  }

  try {
    const share = await createPortfolioShare(supabase, user.id, {
      entryId: id,
      label: typeof body.label === "string" ? body.label : undefined,
      hiddenFields: Array.isArray(body.hiddenFields)
        ? (body.hiddenFields as ConfidentialFieldKey[])
        : undefined,
      expiresAt,
    });
    return NextResponse.json(
      { enabled: true, share: describeShareControl(share) },
      { status: 201 },
    );
  } catch (error) {
    console.error("[vpp] share create failed", error);
    return NextResponse.json({ error: "Could not create share" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  if (!isPortfolioShareControlsEnabled()) return disabledResponse();

  await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const shareId = new URL(request.url).searchParams.get("shareId")?.trim();
  if (!shareId) return NextResponse.json({ error: "shareId required" }, { status: 400 });

  try {
    await revokePortfolioShare(supabase, user.id, shareId);
    return NextResponse.json({ enabled: true, ok: true });
  } catch (error) {
    console.error("[vpp] share revoke failed", error);
    return NextResponse.json({ error: "Could not revoke share" }, { status: 500 });
  }
}
