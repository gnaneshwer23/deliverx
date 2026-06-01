import { NextResponse } from "next/server";
import { getLandingPageContent } from "@/services/landing";

export const dynamic = "force-dynamic";

/** Public marketing content for landing and embeds */
export async function GET() {
  const content = await getLandingPageContent();
  return NextResponse.json(content, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
