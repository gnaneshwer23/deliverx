import { NextResponse } from "next/server";
import { shareMarketplaceAsset } from "@/services/coordination";

type Payload = {
  assetType?: "playbook" | "governance_template" | "risk_library" | "delivery_framework";
  title?: string;
  description?: string;
  content?: Record<string, unknown>;
  isPublic?: boolean;
};

const VALID = [
  "playbook",
  "governance_template",
  "risk_library",
  "delivery_framework",
] as const;

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { assetType, title, description, content, isPublic } = body;
  if (!assetType || !title || !VALID.includes(assetType)) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  try {
    const asset = await shareMarketplaceAsset({
      assetType,
      title,
      description,
      content,
      isPublic,
    });
    return NextResponse.json({ ok: true, asset });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
