/**
 * R8 — Sprint data loader (workstreams + tasks; no sprints table yet).
 */

import { createClient } from "@/lib/supabase/server";
import type { ScrumBurndownPoint } from "@/lib/scrum-health-kpis";
import {
  buildBurndownFromTasks,
  buildVelocityFromWorkstreams,
  computeSprintPoints,
  deriveCeremoniesFromMeetings,
  defaultCeremonyLabels,
  resolveSprintScope,
  type SprintScope,
  type SprintTaskSnapshot,
  type SprintWorkstreamSnapshot,
} from "@/lib/sprint-metrics";
import { listWorkstreams } from "./delivery";
import { listMeetings } from "./governance";

export type ProjectSprintMetrics = {
  scope: SprintScope | null;
  plannedPoints: number;
  completedPoints: number;
  completionPct: number;
  daysRemaining: number;
  sprintLabel: string;
  burndownPoints: ScrumBurndownPoint[];
  velocity: Array<{ sprint: string; points: number }>;
  ceremonies: string[];
  dataSources: {
    burndown: "live" | "fallback";
    velocity: "live" | "fallback";
  };
};

async function loadProjectTasks(projectId: string): Promise<SprintTaskSnapshot[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("id, status, assignee_id, completed_at, created_at, workstream_id")
    .eq("project_id", projectId);

  if (error) throw error;
  return (data ?? []) as SprintTaskSnapshot[];
}

function mapWorkstreams(rows: Awaited<ReturnType<typeof listWorkstreams>>): SprintWorkstreamSnapshot[] {
  return rows.map((w) => ({
    id: w.id,
    name: w.name,
    status: w.status,
    owner_id: w.owner_id,
    created_at: w.created_at,
    updated_at: w.updated_at,
  }));
}

export async function loadProjectSprintMetrics(projectId: string): Promise<ProjectSprintMetrics> {
  const [workstreams, tasks, meetings] = await Promise.all([
    listWorkstreams(projectId).catch(() => []),
    loadProjectTasks(projectId).catch(() => []),
    listMeetings(projectId, { pageSize: 30 }).catch(() => []),
  ]);

  const ws = mapWorkstreams(workstreams);
  const scope = resolveSprintScope({ workstreams: ws, tasks });
  const { plannedPoints, completedPoints } = scope
    ? computeSprintPoints(scope.tasks)
    : { plannedPoints: 0, completedPoints: 0 };

  const completionPct =
    plannedPoints > 0 ? Math.round((completedPoints / plannedPoints) * 100) : 0;

  const burndownPoints =
    scope && plannedPoints > 0
      ? buildBurndownFromTasks({
          tasks: scope.tasks,
          startDate: scope.startDate,
          sprintDays: scope.sprintDays,
        })
      : [];

  const velocity = buildVelocityFromWorkstreams({ workstreams: ws, tasks });
  const ceremonyMatches = deriveCeremoniesFromMeetings(meetings);
  const ceremonies =
    ceremonyMatches.length > 0 ? ceremonyMatches : defaultCeremonyLabels();

  return {
    scope,
    plannedPoints,
    completedPoints,
    completionPct,
    daysRemaining: scope?.daysRemaining ?? 0,
    sprintLabel: scope?.label ?? "No active sprint",
    burndownPoints,
    velocity,
    ceremonies,
    dataSources: {
      burndown: scope && plannedPoints > 0 ? "live" : "fallback",
      velocity: velocity.length > 0 ? "live" : "fallback",
    },
  };
}
