/**
 * QA quality data — test cases, defects, UAT sign-offs (Postgres-backed).
 */

import { createClient } from "@/lib/supabase/server";
import type { QaDefect, QaTestCase, QaUatRow } from "./qaEngine";
import { defectChangeToImpactDrafts, emitLoopPropagation } from "./loopEventPropagation";

async function getOrgContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organisation_id) throw new Error("No organisation");
  return { supabase, orgId: profile.organisation_id as string };
}

export type DbTestCase = {
  id: string;
  test_code: string;
  title: string;
  priority: string;
  linked_story_code: string | null;
  automation_candidate: boolean;
  test_type: string;
  status: string;
};

export type DbDefect = {
  id: string;
  defect_code: string;
  title: string;
  severity: string;
  owner: string | null;
  status: string;
};

export type DbUatSignoff = {
  id: string;
  stakeholder_group: string;
  completion_pct: number;
  signed_off: boolean;
};

function mapTestCase(row: DbTestCase): QaTestCase & { status: string } {
  return {
    code: row.test_code,
    title: row.title,
    priority: row.priority,
    linkedStory: row.linked_story_code ?? "—",
    automationCandidate: row.automation_candidate,
    type: row.test_type,
    status: row.status,
  };
}

function mapDefect(row: DbDefect): QaDefect {
  return {
    code: row.defect_code,
    title: row.title,
    severity: row.severity,
    owner: row.owner ?? "Unassigned",
    status: row.status,
  };
}

function mapUat(row: DbUatSignoff): QaUatRow {
  return {
    group: row.stakeholder_group,
    completionPct: row.completion_pct,
  };
}

export async function listTestCases(projectId: string): Promise<QaTestCase[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("test_cases")
    .select("id, test_code, title, priority, linked_story_code, automation_candidate, test_type, status")
    .eq("project_id", projectId)
    .order("test_code", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as DbTestCase[]).map(mapTestCase);
}

export async function listDefects(projectId: string): Promise<QaDefect[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("defects")
    .select("id, defect_code, title, severity, owner, status")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as DbDefect[]).map(mapDefect);
}

export async function listUatSignoffs(projectId: string): Promise<QaUatRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("uat_signoffs")
    .select("id, stakeholder_group, completion_pct, signed_off")
    .eq("project_id", projectId)
    .order("stakeholder_group", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as DbUatSignoff[]).map(mapUat);
}

export async function syncQaQualityFromAnalysis(
  projectId: string,
  input: {
    testCases: QaTestCase[];
    defects: QaDefect[];
    uat: QaUatRow[];
  },
): Promise<{ testCases: number; defects: number; uat: number }> {
  const { supabase, orgId } = await getOrgContext();

  const testRows = input.testCases.map((tc) => ({
    organisation_id: orgId,
    project_id: projectId,
    test_code: tc.code,
    title: tc.title,
    priority: tc.priority,
    linked_story_code: tc.linkedStory !== "—" ? tc.linkedStory : null,
    automation_candidate: tc.automationCandidate,
    test_type: tc.type,
    status: "ready" as const,
    ai_generated: true,
    review_status: "needs_review" as const,
  }));

  const defectRows = input.defects.map((d) => ({
    organisation_id: orgId,
    project_id: projectId,
    defect_code: d.code,
    title: d.title,
    severity: d.severity,
    owner: d.owner,
    status: d.status,
    ai_generated: true,
    review_status: "needs_review" as const,
  }));

  const uatRows = input.uat.map((u) => ({
    organisation_id: orgId,
    project_id: projectId,
    stakeholder_group: u.group,
    completion_pct: u.completionPct,
    ai_generated: true,
  }));

  if (testRows.length) {
    const { error } = await supabase.from("test_cases").upsert(testRows, {
      onConflict: "project_id,test_code",
    });
    if (error) throw error;
  }

  if (defectRows.length) {
    const { error } = await supabase.from("defects").upsert(defectRows, {
      onConflict: "project_id,defect_code",
    });
    if (error) throw error;

    const critical = input.defects.filter(
      (d) => d.severity === "critical" && d.status !== "closed",
    );
    for (const defect of critical) {
      void emitLoopPropagation({
        projectId,
        actionType: "defect_sync",
        entityType: "defect",
        entityId: defect.code,
        drafts: defectChangeToImpactDrafts({
          code: defect.code,
          title: defect.title,
          severity: defect.severity,
          status: defect.status,
          isNew: true,
        }),
      }).catch(() => 0);
    }
  }

  if (uatRows.length) {
    const { error } = await supabase.from("uat_signoffs").upsert(uatRows, {
      onConflict: "project_id,stakeholder_group",
    });
    if (error) throw error;
  }

  return {
    testCases: testRows.length,
    defects: defectRows.length,
    uat: uatRows.length,
  };
}

export function computeReleaseReadinessFromDb(input: {
  testCases: Array<QaTestCase & { status?: string }>;
  defects: QaDefect[];
  uat: QaUatRow[];
  storyCount: number;
}): {
  releaseReadiness: number;
  testCoverage: number;
  openDefects: number;
  criticalDefects: number;
  uatCompletion: number;
  passedTests: number;
  failedTests: number;
  automationCoverage: number;
  defectScore: number;
} {
  const openDefects = input.defects.filter((d) => d.status !== "closed").length;
  const criticalDefects = input.defects.filter(
    (d) => d.severity === "critical" && d.status !== "closed",
  ).length;

  const passedTests = input.testCases.filter((t) => t.status === "passed").length;
  const failedTests = input.testCases.filter((t) => t.status === "failed").length;
  const executedTests = passedTests + failedTests;

  const testCoverage =
    input.storyCount > 0
      ? Math.min(100, Math.round((input.testCases.length / input.storyCount) * 100))
      : executedTests > 0
        ? Math.round((passedTests / executedTests) * 100)
        : input.testCases.length > 0
          ? 0
          : 0;

  const automationCoverage =
    input.testCases.length > 0
      ? Math.round(
          (input.testCases.filter((t) => t.automationCandidate).length /
            input.testCases.length) *
            100,
        )
      : 0;

  const uatCompletion =
    input.uat.length > 0
      ? Math.round(
          input.uat.reduce((s, r) => s + r.completionPct, 0) / input.uat.length,
        )
      : 0;

  const defectScore = Math.max(0, 100 - criticalDefects * 15 - openDefects * 3);

  const releaseReadiness = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        testCoverage * 0.35 + defectScore * 0.35 + uatCompletion * 0.3,
      ),
    ),
  );

  return {
    releaseReadiness,
    testCoverage,
    openDefects,
    criticalDefects,
    uatCompletion,
    passedTests,
    failedTests,
    automationCoverage,
    defectScore,
  };
}
