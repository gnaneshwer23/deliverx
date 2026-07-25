/**
 * Baseline assessment session store — start / next / respond.
 * Never writes capability levels; evidence append happens on complete.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { resolvePublishedFrameworkPin } from "@/lib/admin-framework/rubric-bridge";
import {
  normaliseRubricResolveSource,
  type RubricResolveSource,
} from "@/lib/capability-engine/rubric-resolve-policy";
import { loadAssessmentCatalog } from "@/lib/pi-assessment/catalog";
import { selectNextAssessmentItem } from "@/lib/pi-assessment/select";
import {
  BASELINE_FRAMEWORK_SLUG,
  BASELINE_FRAMEWORK_VERSION,
  BASELINE_MODEL_ID,
  BASELINE_MODEL_VERSION,
  BASELINE_PROMPT_VERSION,
  DEFAULT_MAX_BASELINE_ITEMS,
  type AssessmentItemKind,
  type AssessmentItemRow,
  type AssessmentItemStatus,
  type AssessmentSessionRow,
  type AssessmentSessionStatus,
} from "@/lib/pi-assessment/types";

function mapSession(row: Record<string, unknown>): AssessmentSessionRow {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    kind: (row.kind as AssessmentSessionRow["kind"]) ?? "baseline",
    status: row.status as AssessmentSessionStatus,
    frameworkVersionId: (row.framework_version_id as string) ?? null,
    frameworkSlug: (row.framework_slug as string) ?? BASELINE_FRAMEWORK_SLUG,
    frameworkVersion: (row.framework_version as string) ?? BASELINE_FRAMEWORK_VERSION,
    targetRole: (row.target_role as string) ?? null,
    targetSeniority: (row.target_seniority as string) ?? null,
    promptVersion: (row.prompt_version as string) ?? BASELINE_PROMPT_VERSION,
    modelId: (row.model_id as string) ?? null,
    modelVersion: (row.model_version as string) ?? null,
    maxItems: (row.max_items as number) ?? DEFAULT_MAX_BASELINE_ITEMS,
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

export async function findActiveBaselineSession(
  supabase: SupabaseClient,
  userId: string,
): Promise<AssessmentSessionRow | null> {
  const { data, error } = await supabase
    .from("pi_assessment_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("kind", "baseline")
    .in("status", ["started", "in_progress"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return mapSession(data as Record<string, unknown>);
}

export async function getSessionForUser(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
): Promise<AssessmentSessionRow | null> {
  const { data, error } = await supabase
    .from("pi_assessment_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return mapSession(data as Record<string, unknown>);
}

export async function listSessionItems(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<AssessmentItemRow[]> {
  const { data, error } = await supabase
    .from("pi_assessment_items")
    .select("*")
    .eq("session_id", sessionId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => mapItem(r as Record<string, unknown>));
}

export type StartBaselineInput = {
  userId: string;
  targetRole?: string | null;
  targetSeniority?: string | null;
  frameworkSlug?: string;
  frameworkVersion?: string;
  resume?: boolean;
};

export type StartBaselineResult = {
  session: AssessmentSessionRow;
  resumed: boolean;
  catalogSource: RubricResolveSource;
  currentItem: AssessmentItemRow | null;
};

export async function startBaselineSession(
  supabase: SupabaseClient,
  input: StartBaselineInput,
): Promise<StartBaselineResult> {
  if (input.resume !== false) {
    const existing = await findActiveBaselineSession(supabase, input.userId);
    if (existing) {
      const current = await ensureCurrentItem(supabase, existing);
      return {
        session: existing,
        resumed: true,
        catalogSource: normaliseRubricResolveSource(existing.metadata.catalogSource),
        currentItem: current,
      };
    }
  }

  const frameworkSlug = input.frameworkSlug ?? BASELINE_FRAMEWORK_SLUG;
  const frameworkVersion = input.frameworkVersion ?? BASELINE_FRAMEWORK_VERSION;
  const pin = await resolvePublishedFrameworkPin(supabase, {
    frameworkSlug,
    version: frameworkVersion,
  });

  const { items: catalog, source: catalogSource } = await loadAssessmentCatalog(supabase, {
    frameworkVersionId: pin?.frameworkVersionId ?? null,
    frameworkSlug,
  });

  const { data: sessionRow, error: sessionError } = await supabase
    .from("pi_assessment_sessions")
    .insert({
      user_id: input.userId,
      kind: "baseline",
      status: "started",
      framework_version_id: pin?.frameworkVersionId ?? null,
      framework_slug: pin?.frameworkSlug ?? frameworkSlug,
      framework_version: pin?.version ?? frameworkVersion,
      target_role: input.targetRole ?? null,
      target_seniority: input.targetSeniority ?? null,
      prompt_version: BASELINE_PROMPT_VERSION,
      model_id: BASELINE_MODEL_ID,
      model_version: BASELINE_MODEL_VERSION,
      max_items: DEFAULT_MAX_BASELINE_ITEMS,
      metadata: {
        catalogSource,
        note: "Baseline observations become Evidence Ledger records — not silent capability assignment.",
        capabilityAssigned: false,
      },
    })
    .select("*")
    .single();

  if (sessionError || !sessionRow) {
    throw new Error(sessionError?.message ?? "Failed to create baseline session");
  }

  const session = mapSession(sessionRow as Record<string, unknown>);
  const current = await presentNextItem(supabase, session, catalog);
  return { session, resumed: false, catalogSource, currentItem: current };
}

async function presentNextItem(
  supabase: SupabaseClient,
  session: AssessmentSessionRow,
  catalog: Awaited<ReturnType<typeof loadAssessmentCatalog>>["items"],
): Promise<AssessmentItemRow | null> {
  const items = await listSessionItems(supabase, session.id);
  const pending = items.find((i) => i.status === "pending" || i.status === "presented");
  if (pending) {
    if (pending.status === "pending") {
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
      return mapItem(data as Record<string, unknown>);
    }
    return pending;
  }

  const covered = new Set<string>();
  const answeredKinds = new Set<AssessmentItemKind>();
  const selectedSlugs = new Set(items.map((i) => i.slug));
  for (const item of items.filter((i) => i.status === "answered")) {
    for (const c of item.competencyCodes) covered.add(c);
    answeredKinds.add(item.itemKind);
  }

  const next = selectNextAssessmentItem({
    catalog,
    coveredCompetencies: covered,
    selectedSlugs,
    answeredKinds,
    maxItems: session.maxItems,
    currentItemCount: items.length,
  });
  if (!next) return null;

  const { data, error } = await supabase
    .from("pi_assessment_items")
    .insert({
      session_id: session.id,
      sort_order: items.length,
      item_kind: next.kind,
      slug: next.slug,
      title: next.title,
      prompt: next.prompt,
      competency_codes: next.competencyCodes,
      indicator_codes: next.indicatorCodes,
      catalog_ref: next.catalogRef ?? null,
      payload: {
        acceptsUpload: next.acceptsUpload ?? false,
        cfKind: next.cfKind ?? null,
      },
      selection_reason: next.selectionReason,
      status: "presented",
      presented_at: new Date().toISOString(),
    })
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

async function ensureCurrentItem(
  supabase: SupabaseClient,
  session: AssessmentSessionRow,
): Promise<AssessmentItemRow | null> {
  const { items: catalog } = await loadAssessmentCatalog(supabase, {
    frameworkVersionId: session.frameworkVersionId,
    frameworkSlug: session.frameworkSlug,
  });
  return presentNextItem(supabase, session, catalog);
}

export type NextBaselineResult = {
  session: AssessmentSessionRow;
  currentItem: AssessmentItemRow | null;
  answeredCount: number;
  itemCount: number;
  canComplete: boolean;
  done: boolean;
};

export async function getNextBaselineItem(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
): Promise<NextBaselineResult> {
  const session = await getSessionForUser(supabase, userId, sessionId);
  if (!session) throw new Error("Session not found");
  if (session.status === "completed") {
    const items = await listSessionItems(supabase, session.id);
    return {
      session,
      currentItem: null,
      answeredCount: items.filter((i) => i.status === "answered").length,
      itemCount: items.length,
      canComplete: true,
      done: true,
    };
  }

  const current = await ensureCurrentItem(supabase, session);
  const items = await listSessionItems(supabase, session.id);
  const answeredCount = items.filter((i) => i.status === "answered").length;
  return {
    session: (await getSessionForUser(supabase, userId, sessionId)) ?? session,
    currentItem: current,
    answeredCount,
    itemCount: items.length,
    canComplete: answeredCount >= 4,
    done: !current && answeredCount > 0,
  };
}

export type RespondBaselineInput = {
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

export type RespondBaselineResult = {
  session: AssessmentSessionRow;
  item: AssessmentItemRow;
  responseId: string;
  nextItem: AssessmentItemRow | null;
  answeredCount: number;
  canComplete: boolean;
  done: boolean;
};

export async function respondToBaselineItem(
  supabase: SupabaseClient,
  input: RespondBaselineInput,
): Promise<RespondBaselineResult> {
  const text = input.responseText.trim();
  if (text.length < 20) {
    throw new Error("Response too short — share a concrete professional answer (min 20 characters).");
  }
  if (text.length > 20000) {
    throw new Error("Response too long (max 20,000 characters).");
  }

  const session = await getSessionForUser(supabase, input.userId, input.sessionId);
  if (!session) throw new Error("Session not found");
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

  const nextState = await getNextBaselineItem(supabase, input.userId, session.id);
  return {
    session: nextState.session,
    item: { ...item, status: "answered" },
    responseId: responseRow.id as string,
    nextItem: nextState.currentItem,
    answeredCount: nextState.answeredCount,
    canComplete: nextState.canComplete || nextState.done,
    done: nextState.done,
  };
}
