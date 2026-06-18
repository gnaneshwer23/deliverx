/**
 * Collaborative loop snapshot history — periodic captures for Stakeholder Loop.
 */

import { createClient } from "@/lib/supabase/server";
import { throwIfMissingTable } from "@/lib/db-errors";
import {
  getCollaborativeLoopSnapshot,
} from "./collaborativeLoop";
import type {
  CollaborativeLoopSnapshot,
  CollaborativePersona,
} from "./collaborativeLoopEngine";

export type CollaborativeLoopSnapshotRow = {
  id: string;
  organisationId: string;
  projectId: string | null;
  persona: CollaborativePersona;
  snapshot: CollaborativeLoopSnapshot;
  triggerSource: string;
  createdAt: string;
};

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

export async function captureCollaborativeLoopSnapshot(input: {
  persona: CollaborativePersona;
  projectId?: string | null;
  triggerSource?: string;
}): Promise<{ id: string; snapshot: CollaborativeLoopSnapshot }> {
  const { supabase, orgId } = await getOrgContext();
  const snapshot = await getCollaborativeLoopSnapshot(input.persona, input.projectId);

  const { data, error } = await supabase
    .from("collaborative_loop_snapshots")
    .insert({
      organisation_id: orgId,
      project_id: input.projectId ?? null,
      persona: input.persona,
      snapshot,
      trigger_source: input.triggerSource ?? "manual",
    })
    .select("id")
    .single();

  if (error) {
    throwIfMissingTable(error, "collaborative_loop_snapshots");
    throw error;
  }

  return { id: String(data.id), snapshot };
}

export async function listCollaborativeLoopSnapshots(
  opts: { projectId?: string; persona?: CollaborativePersona; limit?: number } = {},
): Promise<CollaborativeLoopSnapshotRow[]> {
  const { supabase } = await getOrgContext();
  let q = supabase
    .from("collaborative_loop_snapshots")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 10);

  if (opts.projectId) q = q.eq("project_id", opts.projectId);
  if (opts.persona) q = q.eq("persona", opts.persona);

  const { data, error } = await q;
  if (error) {
    if (error.code === "42P01") return [];
    throwIfMissingTable(error, "collaborative_loop_snapshots");
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    organisationId: String(row.organisation_id),
    projectId: row.project_id ? String(row.project_id) : null,
    persona: row.persona as CollaborativePersona,
    snapshot: row.snapshot as CollaborativeLoopSnapshot,
    triggerSource: String(row.trigger_source),
    createdAt: String(row.created_at),
  }));
}
