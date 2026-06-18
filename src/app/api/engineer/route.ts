import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/auth";
import { getEngineerContext } from "@/services/engineerContext";

export async function GET() {
  try {
    const context = await getEngineerContext();
    return NextResponse.json({ context });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
