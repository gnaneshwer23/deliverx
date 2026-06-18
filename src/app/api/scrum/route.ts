import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/auth";
import { getScrumContext } from "@/services/scrumContext";

export async function GET() {
  try {
    const context = await getScrumContext();
    return NextResponse.json({ context });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
