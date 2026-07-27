import { NextResponse } from "next/server";
import { recordAiReview } from "@/services/recommendations";

export const maxDuration = 30;

type ReviewPayload = {
  projectId?: string;
  id?: string;
  action?: "accept" | "ignore";
};

export async function POST(req: Request) {
  let body: ReviewPayload;
  try {
    body = (await req.json()) as ReviewPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { projectId, id, action } = body;
  if (!projectId || !id || !action || !["accept", "ignore"].includes(action)) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const review = await recordAiReview({
      projectId,
      recommendationId: id,
      action,
    });
    return NextResponse.json({ ok: true, review });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    const status = message === "Not authenticated" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
