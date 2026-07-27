import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/auth";
import { requireOrgAdmin } from "@/lib/brain/require-org-admin";
import type { BrainClassification } from "@/services/aiBrainClassification";
import {
  resolveBrainDocumentReview,
  type BrainReviewAction,
} from "@/services/brainIngestService";

export const maxDuration = 30;

type ReviewPayload = {
  documentId?: string;
  action?: BrainReviewAction;
  editedClassification?: BrainClassification;
};

export async function POST(req: Request) {
  try {
    await requireOrgAdmin();
  } catch (err) {
    return apiErrorResponse(err);
  }

  let body: ReviewPayload;
  try {
    body = (await req.json()) as ReviewPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { documentId, action, editedClassification } = body;
  if (!documentId || !action || !["accept", "edit", "discard"].includes(action)) {
    return NextResponse.json({ error: "documentId and action required" }, { status: 400 });
  }

  if (action === "edit" && !editedClassification) {
    return NextResponse.json(
      { error: "editedClassification required for edit action" },
      { status: 400 },
    );
  }

  try {
    const document = await resolveBrainDocumentReview({
      documentId,
      action,
      editedClassification,
    });
    return NextResponse.json({ ok: true, document });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Review failed";
    const status =
      message === "Not authenticated"
        ? 401
        : message.includes("admin")
          ? 403
          : message.includes("not found")
            ? 404
            : 422;
    return NextResponse.json({ error: message }, { status });
  }
}
