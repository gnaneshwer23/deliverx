/**
 * Final assessment session store — start / next / respond.
 * Includes a mandatory transfer task in a different industry than Experience.
 * Never writes capability levels; evidence append happens on complete.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { resolvePublishedFrameworkPin } from "@/lib/admin-framework/rubric-bridge";
import {
  normaliseRubricResolveSource,
  type RubricResolveSource,
} from "@/lib/capability-engine/rubric-resolve-policy";
import { loadFinalAssessmentCatalog } from "@/lib/pi-assessment/catalog";
import {
  getSessionForUser,
  listSessionItems,
} from "@/lib/pi-assessment/session";
import { selectFinalSessionItems } from "@/lib/pi-assessment/transfer-catalog";
import {
  BASELINE_FRAMEWORK_SLUG,
  BASELINE_FRAMEWORK_VERSION,
  DEFAULT_MAX_FINAL_ITEMS,
  FINAL_MODEL_ID,
  FINAL_MODEL_VERSION,
  FINAL_PROMPT_VERSION,
  MIN_FINAL_RESPONSES,
  MIN_TRANSFER_RESPONSES,
  type AssessmentItemKind,
  type AssessmentItemRow,
  type AssessmentItemStatus,
  type AssessmentSessionRow,
  type AssessmentSessionStatus,
  type TransferIndustry,
} from "@/lib/pi-assessment/types";
import { loadActiveExperiencePlan } from "@/lib/experience-planner";

function mapSession(row: Record<string, unknown>): AssessmentSessionRow {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    kind: (row.kind as AssessmentSessionRow["kind"]) ?? "final",
    status: row.status as AssessmentSessionStatus,
    frameworkVersionId: (row.framework_version_id as string) ?? null,
    frameworkSlug: (row.framework_slug as string) ?? BASELINE_FRAMEWORK_SLUG,
    frameworkVersion: (row.framework_version as string) ?? BASELINE_FRAMEWORK_VERSION,
    targetRole: (row.target_role as string) ?? null,
    targetSeniority: (row.target_seniority as string) ?? null,
    promptVersion: (row.prompt_version as string) ?? FINAL_PROMPT_VERSION,
    modelId: (row.model_id as string) ?? null,
    modelVersion: (row.model_version as string) ?? null,
    maxItems: (row.max_items as number) ?? DEFAULT_MAX_FINAL_ITEMS,
    scoreRunId: (row.score_run_id as string) ?? null,
    experiencePlanId: (row.experience_plan_id as string) ?? null,
    experienceEnrolmentId: (row.experience_enrolment_id as string) ?? null,
    growthReportId: (row.growth_report_id as string) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    startedAt: row.started_at as string,
    completedAt: (row.completed_at as string) ?? null,
  };
}

function mapItem(row: Record<string, unknown>): AssessmentItemRow {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    sortOrder: (row.sort_order as number) ?? 0,
    itemKind: row.item_kind as AssessmentItemKind,
    slug: row.slug as string,
    title: row.title as string,
    prompt: (row.prompt as string) ?? "",
    competencyCodes: (row.competency_codes as string[]) ?? [],
    indicatorCodes: (row.indicator_codes as string[]) ?? [],
    catalogRef: (row.catalog_ref as string) ?? null,
    payload: (row.payload as Record<string, unknown>) ?? {},
    selectionReason: (row.selection_reason as string) ?? null,
    status: row.status as AssessmentItemStatus,
    presentedAt: (row.presented_at as string) ?? null,
  };
}

export async function findActiveFinalSession(
  supabase: SupabaseClient,
  userId: string,
): Promise<AssessmentSessionRow | null> {
  const { data, error } = await supabase
    .from("pi_assessment_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("kind", "final")
    .in("status", ["started", "in_progress"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return mapSession(data as Record<string, unknown>);
}

export type StartFinalInput = {
  userId: string;
  targetRole?: string | null;
  targetSeniority?: string | null;
  frameworkSlug?: string;
  frameworkVersion?: string;
  resume?: boolean;
  preferredTransferIndustry?: TransferIndustry | null;
};

export type StartFinalResult = {
  session: AssessmentSessionRow;
  resumed: boolean;
  catalogSource: RubricResolveSource;
  currentItem: AssessmentItemRow | null;
  experienceIndustry: string | null;
  transferIndustry: TransferIndustry | null;
};

export async function startFinalSession(
  supabase: SupabaseClient,
  input: StartFinalInput,
): Promise<StartFinalResult> {
  if (input.resume !== false) {
    const existing = await findActiveFinalSession(supabase, input.userId);
    if (existing) {
      const current = await ensureCurrentFinalItem(supabase, existing);
      return {
        session: existing,
        resumed: true,
        catalogSource: normaliseRubricResolveSource(existing.metadata.catalogSource),
        currentItem: current,
        experienceIndustry: (existing.metadata.experienceIndustry as string) ?? null,
        transferIndustry:
          (existing.metadata.transferIndustry as TransferIndustry) ?? null,
      };
    }
  }

  const experiencePlan = await loadActiveExperiencePlan(supabase, input.userId).catch(
    () => null,
  );
  const experienceIndustry = experiencePlan?.industry ?? null;

  const frameworkSlug = input.frameworkSlug ?? BASELINE_FRAMEWORK_SLUG;
  const frameworkVersion = input.frameworkVersion ?? BASELINE_FRAMEWORK_VERSION;
  const pin = await resolvePublishedFrameworkPin(supabase, {
    frameworkSlug,
    version: frameworkVersion,
  });

  const { items: catalog, source: catalogSource } = await loadFinalAssessmentCatalog(
    supabase,
    {
      frameworkVersionId: pin?.frameworkVersionId ?? null,
      frameworkSlug,
    },
  );

  const selected = selectFinalSessionItems({
    catalog,
    experienceIndustry,
    preferredTransferIndustry: input.preferredTransferIndustry,
  });

  const { data: sessionRow, error: sessionError } = await supabase
    .from("pi_assessment_sessions")
    .insert({
      user_id: input.userId,
      kind: "final",
      status: "started",
      framework_version_id: pin?.frameworkVersionId ?? null,
      framework_slug: pin?.frameworkSlug ?? frameworkSlug,
      framework_version: pin?.version ?? frameworkVersion,
      target_role: input.targetRole ?? experiencePlan?.targetRole ?? null,
      target_seniority:
        input.targetSeniority ?? experiencePlan?.targetSeniority ?? null,
      prompt_version: FINAL_PROMPT_VERSION,
      model_id: FINAL_MODEL_ID,
      model_version: FINAL_MODEL_VERSION,
      max_items: Math.min(DEFAULT_MAX_FINAL_ITEMS, selected.items.length),
      experience_plan_id:
        experiencePlan && experiencePlan.id !== "ephemeral" ? experiencePlan.id : null,
      experience_enrolment_id: experiencePlan?.enrolmentId ?? null,
      metadata: {
        catalogSource,
        experienceIndustry: selected.experienceIndustry,
        transferIndustry: selected.transferIndustry,
        transferSlug: selected.items.find((i) => i.kind === "transfer")?.slug ?? null,
        note: "Final assessment observations become Evidence Ledger records — not silent capability assignment. Transfer industry differs from Experience.",
        capabilityAssigned: false,
        plannedSlugs: selected.items.map((i) => i.slug),
      },
    })
    .select("*")
    .single();

  if (sessionError || !sessionRow) {
    throw new Error(sessionError?.message ?? "Failed to create final assessment session");
  }

  const session = mapSession(sessionRow as Record<string, unknown>);

  // Pre-insert the full planned item set (deterministic ceremony).
  for (let i = 0; i < selected.items.length; i += 1) {
    const item = selected.items[i]!;
    const { error: itemError } = await supabase.from("pi_assessment_items").insert({
      session_id: session.id,
      sort_order: i,
      item_kind: item.kind,
      slug: item.slug,
      title: item.title,
      prompt: item.prompt,
      competency_codes: item.competencyCodes,
      indicator_codes: item.indicatorCodes,
      catalog_ref: item.catalogRef ?? null,
      payload: {
        acceptsUpload: item.acceptsUpload ?? false,
        cfKind: item.cfKind ?? null,
        industry: item.industry ?? null,
        phase: "final",
        transfer: item.kind === "transfer",
      },
      selection_reason: item.selectionReason,
      status: i === 0 ? "presented" : "pending",
      presented_at: i === 0 ? new Date().toISOString() : null,
    });
    if (itemError) throw itemError;
  }

  const current = await ensureCurrentFinalItem(supabase, session);
  return {
    session,
    resumed: false,
    catalogSource,
    currentItem: current,
    experienceIndustry: selected.experienceIndustry,
    transferIndustry: selected.transferIndustry,
  };
}

async function ensureCurrentFinalItem(
  supabase: SupabaseClient,
  session: AssessmentSessionRow,
): Promise<AssessmentItemRow | null> {
  const items = await listSessionItems(supabase, session.id);
  const presented = items.find((i) => i.status === "presented");
  if (presented) return presented;
  const pending = items.find((i) => i.status === "pending");
  if (!pending) return null;

  const { data, error } = await supabase
    .from("pi_assessment_items")
    .update({
      status: "presented",
      presented_at: new Date().toISOString(),
    })
    .eq("id", pending.id)
    .select("*")
    .single();
  if (error) throw error;

  if (session.status === "started") {
    await supabase
      .from("pi_assessment_sessions")
      .update({ status: "in_progress" })
      .eq("id", session.id);
  }

  return mapItem(data as Record<string, unknown>);
}

export type NextFinalResult = {
  session: AssessmentSessionRow;
  currentItem: AssessmentItemRow | null;
  answeredCount: number;
  transferAnswered: boolean;
  itemCount: number;
  canComplete: boolean;
  done: boolean;
  experienceIndustry: string | null;
  transferIndustry: TransferIndustry | null;
};

export async function getNextFinalItem(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
): Promise<NextFinalResult> {
  const session = await getSessionForUser(supabase, userId, sessionId);
  if (!session || session.kind !== "final") throw new Error("Final session not found");

  const items = await listSessionItems(supabase, session.id);
  const answered = items.filter((i) => i.status === "answered");
  const transferAnswered = answered.some((i) => i.itemKind === "transfer");
  const meta = session.metadata;

  if (session.status === "completed") {
    return {
      session,
      currentItem: null,
      answeredCount: answered.length,
      transferAnswered,
      itemCount: items.length,
      canComplete: true,
      done: true,
      experienceIndustry: (meta.experienceIndustry as string) ?? null,
      transferIndustry: (meta.transferIndustry as TransferIndustry) ?? null,
    };
  }

  const current = await ensureCurrentFinalItem(supabase, session);
  const answeredCount = answered.length;
  const canComplete =
    answeredCount >= MIN_FINAL_RESPONSES &&
    answered.filter((i) => i.itemKind === "transfer").length >= MIN_TRANSFER_RESPONSES;

  return {
    session: (await getSessionForUser(supabase, userId, sessionId)) ?? session,
    currentItem: current,
    answeredCount,
    transferAnswered,
    itemCount: items.length,
    canComplete,
    done: !current && answeredCount > 0,
    experienceIndustry: (meta.experienceIndustry as string) ?? null,
    transferIndustry: (meta.transferIndustry as TransferIndustry) ?? null,
  };
}

export type RespondFinalInput = {
  userId: string;
  sessionId: string;
  itemId: string;
  responseText: string;
  responsePayload?: Record<string, unknown>;
  workSample?: {
    filename?: string;
    extractKind?: string;
    charCount?: number;
    extractedText?: string;
    storageRef?: string | null;
  };
};

export type RespondFinalResult = {
  session: AssessmentSessionRow;
  item: AssessmentItemRow;
  responseId: string;
  nextItem: AssessmentItemRow | null;
  answeredCount: number;
  transferAnswered: boolean;
  canComplete: boolean;
  done: boolean;
};

export async function respondToFinalItem(
  supabase: SupabaseClient,
  input: RespondFinalInput,
): Promise<RespondFinalResult> {
  const text = input.responseText.trim();
  if (text.length < 20) {
    throw new Error("Response too short — share a concrete professional answer (min 20 characters).");
  }
  if (text.length > 20000) {
    throw new Error("Response too long (max 20,000 characters).");
  }

  const session = await getSessionForUser(supabase, input.userId, input.sessionId);
  if (!session || session.kind !== "final") throw new Error("Final session not found");
  if (session.status === "completed" || session.status === "abandoned") {
    throw new Error("Session is no longer active");
  }

  const { data: itemRow, error: itemError } = await supabase
    .from("pi_assessment_items")
    .select("*")
    .eq("id", input.itemId)
    .eq("session_id", session.id)
    .maybeSingle();
  if (itemError || !itemRow) throw new Error("Item not found");
  const item = mapItem(itemRow as Record<string, unknown>);
  if (item.status === "answered") {
    throw new Error("Item already answered");
  }

  const userContribution = {
    responseText: text,
    itemSlug: item.slug,
    itemKind: item.itemKind,
    competencyCodes: item.competencyCodes,
    indicatorCodes: item.indicatorCodes,
    industry: item.payload.industry ?? null,
    transfer: item.itemKind === "transfer",
    ...(input.workSample?.filename
      ? { workSampleFilename: input.workSample.filename }
      : {}),
  };

  const { data: responseRow, error: responseError } = await supabase
    .from("pi_assessment_responses")
    .upsert(
      {
        session_id: session.id,
        item_id: item.id,
        user_id: input.userId,
        response_text: text,
        response_payload: input.responsePayload ?? {},
        user_contribution: userContribution,
        ai_contribution: {
          selectionReason: item.selectionReason,
          promptVersion: session.promptVersion,
          note: "AI/system selected the item; user authored the response. No capability level assigned.",
        },
      },
      { onConflict: "item_id" },
    )
    .select("*")
    .single();

  if (responseError || !responseRow) {
    throw new Error(responseError?.message ?? "Failed to save response");
  }

  await supabase
    .from("pi_assessment_items")
    .update({ status: "answered" })
    .eq("id", item.id);

  if (input.workSample && (item.itemKind === "work_sample" || input.workSample.extractedText)) {
    await supabase.from("pi_work_samples").insert({
      session_id: session.id,
      item_id: item.id,
      user_id: input.userId,
      filename: input.workSample.filename ?? null,
      extract_kind: input.workSample.extractKind ?? null,
      char_count: input.workSample.charCount ?? text.length,
      storage_ref: input.workSample.storageRef ?? null,
      extracted_text: input.workSample.extractedText ?? text,
      response_id: responseRow.id as string,
    });
  }

  await supabase
    .from("pi_assessment_sessions")
    .update({ status: "in_progress" })
    .eq("id", session.id);

  const nextState = await getNextFinalItem(supabase, input.userId, session.id);
  return {
    session: nextState.session,
    item: { ...item, status: "answered" },
    responseId: responseRow.id as string,
    nextItem: nextState.currentItem,
    answeredCount: nextState.answeredCount,
    transferAnswered: nextState.transferAnswered,
    canComplete: nextState.canComplete || nextState.done,
    done: nextState.done,
  };
}
