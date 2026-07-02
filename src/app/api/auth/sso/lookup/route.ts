import { NextResponse, type NextRequest } from "next/server";
import { findSsoForEmail } from "@/services/orgSso";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")?.trim() ?? "";
  if (!email) {
    return NextResponse.json({ ssoAvailable: false });
  }

  try {
    const match = await findSsoForEmail(email);
    if (!match) {
      return NextResponse.json({ ssoAvailable: false }, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      });
    }

    return NextResponse.json({
      ssoAvailable: true,
      domain: match.domain,
      idpName: match.idpName,
      ssoRequired: match.ssoRequired,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json({ ssoAvailable: false });
  }
}
