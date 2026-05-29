/**
 * Resource capacity loop — workload per member and rebalance suggestions.
 */

import { createClient } from "@/lib/supabase/server";
import { listOrgMembers, updateTask } from "./delivery";

export type MemberWorkload = {
  userId: string;
  name: string;
  email: string;
  openTasks: number;
  blockedTasks: number;
  criticalTasks: number;
  overload: boolean;
};

export type RebalanceSuggestion = {
  id: string;
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  reason: string;
  taskCount: number;
};

export type CapacitySnapshot = {
  members: MemberWorkload[];
  avgLoad: number;
  overloadedCount: number;
  suggestions: RebalanceSuggestion[];
  deliveryStrain: "low" | "medium" | "high";
};

const OVERLOAD_THRESHOLD = 8;

async function getOrgContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id")
    .single();
  if (!profile?.organisation_id) throw new Error("No organisation");
  return { supabase, orgId: profile.organisation_id as string };
}

export async function getOrgCapacitySnapshot(): Promise<CapacitySnapshot> {
  const { supabase } = await getOrgContext();
  const members = await listOrgMembers();

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("assignee_id, status, priority")
    .in("status", ["todo", "in_progress", "blocked"]);

  if (error) throw error;

  const byUser = new Map<
    string,
    { open: number; blocked: number; critical: number }
  >();

  for (const m of members) {
    byUser.set(m.id, { open: 0, blocked: 0, critical: 0 });
  }

  const unassigned = { open: 0, blocked: 0, critical: 0 };

  for (const t of tasks ?? []) {
    const bucket = t.assignee_id ? byUser.get(t.assignee_id as string) : unassigned;
    if (!bucket) continue;
    bucket.open++;
    if (t.status === "blocked") bucket.blocked++;
    if (t.priority === "critical" || t.priority === "high") bucket.critical++;
  }

  const workloads: MemberWorkload[] = members.map((m) => {
    const w = byUser.get(m.id) ?? { open: 0, blocked: 0, critical: 0 };
    return {
      userId: m.id,
      name: (m.name as string | null) ?? m.email,
      email: m.email as string,
      openTasks: w.open,
      blockedTasks: w.blocked,
      criticalTasks: w.critical,
      overload: w.open >= OVERLOAD_THRESHOLD,
    };
  });

  const loads = workloads.map((w) => w.openTasks);
  const avgLoad = loads.length ? loads.reduce((a, b) => a + b, 0) / loads.length : 0;
  const overloaded = workloads.filter((w) => w.overload);
  const underused = workloads.filter((w) => w.openTasks <= Math.max(2, avgLoad * 0.5));

  const suggestions: RebalanceSuggestion[] = [];
  for (const from of overloaded) {
    const to = underused.find((u) => u.userId !== from.userId);
    if (!to) continue;
    suggestions.push({
      id: `${from.userId}-${to.userId}`,
      fromUserId: from.userId,
      fromName: from.name,
      toUserId: to.userId,
      toName: to.name,
      reason: `${from.name} has ${from.openTasks} open tasks (threshold ${OVERLOAD_THRESHOLD})`,
      taskCount: Math.ceil((from.openTasks - avgLoad) / 2),
    });
  }

  const strainScore =
    overloaded.length / Math.max(members.length, 1) +
    (tasks ?? []).filter((t) => t.status === "blocked").length / Math.max((tasks ?? []).length, 1);

  return {
    members: workloads.sort((a, b) => b.openTasks - a.openTasks),
    avgLoad: Math.round(avgLoad * 10) / 10,
    overloadedCount: overloaded.length,
    suggestions,
    deliveryStrain: strainScore > 0.35 ? "high" : strainScore > 0.15 ? "medium" : "low",
  };
}

/** Reassign open tasks from an overloaded member to a lighter-loaded peer. */
export async function applyRebalanceSuggestion(
  suggestion: RebalanceSuggestion,
): Promise<{ moved: number }> {
  const { supabase } = await getOrgContext();

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("id")
    .eq("assignee_id", suggestion.fromUserId)
    .in("status", ["todo", "in_progress"])
    .order("created_at", { ascending: true })
    .limit(Math.max(1, suggestion.taskCount));

  if (error) throw error;
  const ids = (tasks ?? []).map((t) => t.id as string);
  for (const id of ids) {
    await updateTask(id, { assignee_id: suggestion.toUserId });
  }
  return { moved: ids.length };
}
