import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { listEstimationPacks } from "@/services/estimationPacks";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await requireProjectAccess(id);
    const packs = await listEstimationPacks(id);
    return NextResponse.json({ packs });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
