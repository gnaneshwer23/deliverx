import { NextResponse } from "next/server";
import { recordReview, type AdaptiveReviewAction } from "@/services/adaptive";

type Payload = {
  projectId?: string;
  recommendationKey?: string;
  action?: AdaptiveReviewAction;
  originalActionText?: string;
  editedActionText?: string | null;
  rationale?: string | null;
};

const VALID: AdaptiveReviewAction[] = [
  "approved",
  "approved_with_edit",
  "rejected",
  "ignored",
];

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    projectId,
    recommendationKey,
    action,
    originalActionText,
    editedActionText,
    rationale,
  } = body;
  if (
    !projectId ||
    !recommendationKey ||
    !action ||
    !VALID.includes(action) ||
    !originalActionText
  ) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  try {
    const review = await recordReview({
      projectId,
      recommendationKey,
      action,
      originalActionText,
      editedActionText: editedActionText ?? null,
      rationale: rationale ?? null,
    });
    return NextResponse.json({ ok: true, review });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
