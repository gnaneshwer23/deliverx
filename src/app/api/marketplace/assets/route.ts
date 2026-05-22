import { NextResponse } from "next/server";
import { listMarketplaceAssets } from "@/services/coordination";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const assetType = url.searchParams.get("type") as
    | "playbook"
    | "governance_template"
    | "risk_library"
    | "delivery_framework"
    | null;

  try {
    const assets = await listMarketplaceAssets({
      assetType: assetType ?? undefined,
    });
    return NextResponse.json({ assets });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
