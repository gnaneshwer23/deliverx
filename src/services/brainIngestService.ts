/**
 * Slice E — Brain ingest: storage upload → AI classify → review queue.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { detectExtractableKind, extractTextFromBuffer } from "@/lib/documents/extractText";
import { isOpenAiConfigured } from "@/lib/ai/config";
import { AiConfigError } from "@/lib/ai/anthropic";
import {
  classifyBrainDocument,
  isBrainClassificationConfigured,
  type BrainClassification,
} from "@/services/aiBrainClassification";
import {
  createBrainDocument,
  getBrainDocument,
  updateBrainDocument,
  type BrainDocumentRow,
} from "@/services/brainDocumentService";
import { createPlaybook } from "@/services/playbookService";
import { listOrgProjects } from "@/services/delivery";
import {
  brainDocumentReviewToImpactDrafts,
  emitLoopPropagation,
} from "@/services/loopEventPropagation";

const BUCKET = "brain-documents";
const MAX_BYTES = 12 * 1024 * 1024;

export type BrainIngestHealth = {
  storageConfigured: boolean;
  aiConfigured: boolean;
  ready: boolean;
  message: string;
};

export type BrainIngestResult = {
  document: BrainDocumentRow;
  classification: BrainClassification | null;
  aiConfigured: boolean;
  textExtracted: boolean;
};

export type BrainReviewAction = "accept" | "edit" | "discard";

async function getOrgContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.organisation_id) throw new Error("No organisation");
  return {
    supabase,
    orgId: String(profile.organisation_id),
    userId: user.id,
    role: profile.role as string | null,
  };
}

export function getBrainIngestHealth(): BrainIngestHealth {
  const aiConfigured = isBrainClassificationConfigured();
  const storageConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );

  if (!storageConfigured) {
    return {
      storageConfigured: false,
      aiConfigured,
      ready: false,
      message: "Storage not configured — set Supabase URL and service role key.",
    };
  }

  if (!aiConfigured) {
    return {
      storageConfigured: true,
      aiConfigured: false,
      ready: true,
      message: "Upload works — set OPENAI_API_KEY for AI classification suggestions.",
    };
  }

  return {
    storageConfigured: true,
    aiConfigured: true,
    ready: true,
    message: "Upload and AI classification ready.",
  };
}

async function resolvePropagationProjectId(): Promise<string | null> {
  const projects = await listOrgProjects().catch(() => []);
  return projects[0]?.id ?? null;
}

export async function ingestBrainDocument(file: File): Promise<BrainIngestResult> {
  if (file.size > MAX_BYTES) {
    throw new Error("File must be under 12 MB.");
  }

  const kind = detectExtractableKind(file.name);
  if (!kind) {
    throw new Error("Unsupported file type. Upload PDF, DOCX, TXT, MD, or CSV.");
  }

  const { orgId } = await getOrgContext();
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const storagePath = `${orgId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const admin = createAdminClient();
  const { error: uploadErr } = await admin.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (uploadErr) {
    throw new Error(
      uploadErr.message.includes("Bucket not found")
        ? "Brain storage bucket missing — apply migration 0060_brain_storage.sql."
        : uploadErr.message,
    );
  }

  let extractedText = "";
  let textExtracted = false;
  try {
    extractedText = await extractTextFromBuffer(buffer, file.name);
    textExtracted = extractedText.trim().length > 0;
  } catch {
    textExtracted = false;
  }

  const document = await createBrainDocument({
    title: file.name,
    sourceType: "upload",
    storagePath,
  });

  let classification: BrainClassification | null = null;
  const aiConfigured = isOpenAiConfigured();

  if (aiConfigured && textExtracted) {
    try {
      classification = await classifyBrainDocument({
        title: file.name,
        text: extractedText,
      });
      await updateBrainDocument(document.id, {
        status: "review",
        classification: {
          ...classification,
          extractedCharCount: extractedText.length,
          aiConfigured: true,
        },
      });
    } catch (err) {
      if (!(err instanceof AiConfigError)) {
        await updateBrainDocument(document.id, {
          status: "review",
          classification: {
            summary: "Classification failed — review manually.",
            documentType: "other",
            confidence: 0,
            personaRelevance: ["pm"],
            suggestedActions: [],
            error: err instanceof Error ? err.message : "Classification failed",
          },
        });
      }
    }
  } else {
    await updateBrainDocument(document.id, {
      status: "review",
      classification: {
        documentType: "other",
        confidence: 0,
        summary: aiConfigured
          ? "No extractable text — review manually."
          : "AI not configured — upload saved for manual review.",
        personaRelevance: ["pm"],
        suggestedActions: aiConfigured
          ? ["Review document manually"]
          : ["Configure OPENAI_API_KEY to enable classification"],
        aiConfigured,
        extractedCharCount: extractedText.length,
      },
    });
  }

  const refreshed = (await getBrainDocument(document.id)) ?? document;

  return {
    document: refreshed,
    classification,
    aiConfigured,
    textExtracted,
  };
}

export async function resolveBrainDocumentReview(input: {
  documentId: string;
  action: BrainReviewAction;
  editedClassification?: BrainClassification;
}): Promise<BrainDocumentRow> {
  const doc = await getBrainDocument(input.documentId);
  if (!doc) throw new Error("Document not found");
  if (doc.status !== "review") {
    throw new Error("Document is not awaiting review.");
  }

  if (input.action === "discard") {
    return updateBrainDocument(doc.id, { status: "archived" });
  }

  const classification =
    input.action === "edit" && input.editedClassification
      ? input.editedClassification
      : (doc.classification as BrainClassification);

  const documentType =
    typeof classification.documentType === "string"
      ? classification.documentType
      : "other";
  const summary =
    typeof classification.summary === "string"
      ? classification.summary
      : doc.title;

  const updated = await updateBrainDocument(doc.id, {
    status: "classified",
    classification: {
      ...doc.classification,
      ...classification,
      reviewedAt: new Date().toISOString(),
      reviewAction: input.action,
    },
  });

  await createPlaybook({
    name: `${documentType}: ${doc.title}`,
    content: {
      summary,
      documentType,
      personaRelevance: classification.personaRelevance ?? [],
      suggestedActions: classification.suggestedActions ?? [],
      sourceDocumentId: doc.id,
    },
    sourceDocumentId: doc.id,
  }).catch(() => {
    /* playbooks table optional in some envs */
  });

  const projectId = await resolvePropagationProjectId();
  if (projectId) {
    void emitLoopPropagation({
      projectId,
      actionType: "brain_document_accepted",
      entityType: "brain_document",
      entityId: doc.id,
      drafts: brainDocumentReviewToImpactDrafts({
        title: doc.title,
        documentType,
        action: input.action,
        personaRelevance: classification.personaRelevance ?? [],
      }),
      syncNarrativeThreads: false,
    });
  }

  return updated;
}
