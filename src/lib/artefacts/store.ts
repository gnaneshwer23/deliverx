import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ARTEFACT_EVENT,
  canTransitionArtefactStatus,
  computeArtefactContentHash,
  deriveContributionSource,
  type AddArtefactVersionInput,
  type ArtefactRecord,
  type ArtefactStatus,
  type ArtefactVersionProvenance,
  type ArtefactVersionRecord,
  type CreateArtefactInput,
} from "@/lib/artefacts/types";

type DbClient = SupabaseClient;

function mapArtefact(row: Record<string, unknown>): ArtefactRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    kind: row.kind as ArtefactRecord["kind"],
    title: String(row.title ?? ""),
    summary: String(row.summary ?? ""),
    status: row.status as ArtefactStatus,
    confidentiality: row.confidentiality as ArtefactRecord["confidentiality"],
    sourceSurface: (row.source_surface as ArtefactRecord["sourceSurface"]) ?? null,
    currentVersionId: (row.current_version_id as string | null) ?? null,
    currentVersionNumber: Number(row.current_version_number ?? 0),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapVersion(row: Record<string, unknown>): ArtefactVersionRecord {
  return {
    id: String(row.id),
    artefactId: String(row.artefact_id),
    userId: String(row.user_id),
    versionNumber: Number(row.version_number),
    title: String(row.title ?? ""),
    content: (row.content as Record<string, unknown>) ?? {},
    storageRef: (row.storage_ref as string | null) ?? null,
    contentHash: String(row.content_hash),
    contributionSource:
      row.contribution_source as ArtefactVersionRecord["contributionSource"],
    actorType: row.actor_type as ArtefactVersionRecord["actorType"],
    changeNote: (row.change_note as string | null) ?? null,
    createdAt: String(row.created_at),
  };
}

function versionInsertRow(input: {
  artefactId: string;
  userId: string;
  versionNumber: number;
  title: string;
  content: Record<string, unknown>;
  storageRef?: string | null;
  changeNote?: string;
  provenance?: ArtefactVersionProvenance;
}): Record<string, unknown> {
  const contentHash = computeArtefactContentHash({
    title: input.title,
    content: input.content,
    storageRef: input.storageRef,
  });
  const source = deriveContributionSource(input.provenance);
  return {
    artefact_id: input.artefactId,
    user_id: input.userId,
    version_number: input.versionNumber,
    title: input.title.trim(),
    content: input.content,
    storage_ref: input.storageRef ?? null,
    content_hash: contentHash,
    contribution_source: source,
    actor_type: input.provenance?.actorType ?? (source === "ai" ? "ai" : "user"),
    user_contribution: input.provenance?.userContribution ?? {},
    ai_contribution: input.provenance?.aiContribution ?? {},
    model_id: input.provenance?.modelId ?? null,
    model_version: input.provenance?.modelVersion ?? null,
    prompt_slug: input.provenance?.promptSlug ?? null,
    prompt_version: input.provenance?.promptVersion ?? null,
    prompt_hash: input.provenance?.promptHash ?? null,
    change_note: input.changeNote ?? null,
    created_by: input.userId,
  };
}

async function emitEvent(
  supabase: DbClient,
  input: {
    eventType: string;
    aggregateId: string;
    userId: string;
    payload: Record<string, unknown>;
  },
): Promise<void> {
  await supabase.from("pi_domain_events").insert({
    event_type: input.eventType,
    aggregate_type: "artefact",
    aggregate_id: input.aggregateId,
    user_id: input.userId,
    payload: input.payload,
    schema_version: 1,
  });
}

export type CreateArtefactResult = {
  artefact: ArtefactRecord;
  version: ArtefactVersionRecord | null;
  capabilityAssigned: false;
};

/**
 * Create a new artefact envelope (draft), optionally with an immutable v1.
 * Never assigns capability; never writes verified evidence.
 */
export async function createArtefact(
  supabase: DbClient,
  input: CreateArtefactInput,
): Promise<CreateArtefactResult> {
  const { data: created, error } = await supabase
    .from("artefacts")
    .insert({
      user_id: input.userId,
      kind: input.kind ?? "other",
      title: input.title.trim(),
      summary: input.summary?.trim() ?? "",
      status: "draft",
      confidentiality: input.confidentiality ?? "private",
      source_surface: input.sourceSurface ?? null,
      work_item_ref: input.workItemRef ?? null,
      activity_ref: input.activityRef ?? null,
      project_ref: input.projectRef ?? {},
      metadata: input.metadata ?? {},
      current_version_number: 0,
    })
    .select("*")
    .single();

  if (error || !created) throw error ?? new Error("Could not create artefact");

  const artefactId = created.id as string;
  await emitEvent(supabase, {
    eventType: ARTEFACT_EVENT.artefactCreated,
    aggregateId: artefactId,
    userId: input.userId,
    payload: { artefact_id: artefactId, kind: created.kind, title: created.title },
  });

  let version: ArtefactVersionRecord | null = null;
  if (input.initialVersion) {
    const added = await addArtefactVersion(supabase, {
      userId: input.userId,
      artefactId,
      title: input.initialVersion.title ?? input.title,
      content: input.initialVersion.content,
      storageRef: input.initialVersion.storageRef,
      changeNote: input.initialVersion.changeNote,
      provenance: input.initialVersion.provenance,
    });
    version = added.version;
    return { artefact: added.artefact, version, capabilityAssigned: false };
  }

  return { artefact: mapArtefact(created), version, capabilityAssigned: false };
}

export type AddArtefactVersionResult = {
  artefact: ArtefactRecord;
  version: ArtefactVersionRecord;
  duplicate: boolean;
  capabilityAssigned: false;
};

/**
 * Append a new immutable version. Prior versions are never mutated (DB trigger).
 * Bumps the artefact's current version pointer. Idempotent on content hash.
 */
export async function addArtefactVersion(
  supabase: DbClient,
  input: AddArtefactVersionInput,
): Promise<AddArtefactVersionResult> {
  const { data: artefactRow, error: artefactError } = await supabase
    .from("artefacts")
    .select("*")
    .eq("id", input.artefactId)
    .eq("user_id", input.userId)
    .single();
  if (artefactError || !artefactRow) {
    throw artefactError ?? new Error("Artefact not found");
  }

  const title = (input.title ?? (artefactRow.title as string)).trim();
  const contentHash = computeArtefactContentHash({
    title,
    content: input.content,
    storageRef: input.storageRef,
  });

  // Idempotency: identical content for this artefact returns the existing version.
  const { data: existing } = await supabase
    .from("artefact_versions")
    .select("*")
    .eq("artefact_id", input.artefactId)
    .eq("content_hash", contentHash)
    .maybeSingle();
  if (existing?.id) {
    return {
      artefact: mapArtefact(artefactRow),
      version: mapVersion(existing),
      duplicate: true,
      capabilityAssigned: false,
    };
  }

  const nextVersion = Number(artefactRow.current_version_number ?? 0) + 1;

  const { data: versionRow, error: versionError } = await supabase
    .from("artefact_versions")
    .insert(
      versionInsertRow({
        artefactId: input.artefactId,
        userId: input.userId,
        versionNumber: nextVersion,
        title,
        content: input.content,
        storageRef: input.storageRef,
        changeNote: input.changeNote,
        provenance: input.provenance,
      }),
    )
    .select("*")
    .single();

  if (versionError || !versionRow) {
    throw versionError ?? new Error("Could not create artefact version");
  }

  const versionId = versionRow.id as string;

  const { data: updatedArtefact, error: updateError } = await supabase
    .from("artefacts")
    .update({
      current_version_id: versionId,
      current_version_number: nextVersion,
      status: artefactRow.status === "draft" ? "active" : artefactRow.status,
    })
    .eq("id", input.artefactId)
    .eq("user_id", input.userId)
    .select("*")
    .single();
  if (updateError || !updatedArtefact) {
    throw updateError ?? new Error("Could not update artefact pointer");
  }

  await emitEvent(supabase, {
    eventType: ARTEFACT_EVENT.versionCreated,
    aggregateId: input.artefactId,
    userId: input.userId,
    payload: {
      artefact_id: input.artefactId,
      artefact_version_id: versionId,
      version_number: nextVersion,
      content_hash: contentHash,
      contribution_source: versionRow.contribution_source,
    },
  });

  return {
    artefact: mapArtefact(updatedArtefact),
    version: mapVersion(versionRow),
    duplicate: false,
    capabilityAssigned: false,
  };
}

/**
 * Record an auditable artefact status transition (submission / archive / etc).
 * Appends to artefact_status_transitions (immutable) and updates the envelope.
 */
export async function transitionArtefactStatus(
  supabase: DbClient,
  input: {
    userId: string;
    artefactId: string;
    toStatus: ArtefactStatus;
    reason?: string;
    actorType?: ArtefactVersionRecord["actorType"];
  },
): Promise<{ artefact: ArtefactRecord; transitionId: string }> {
  const { data: artefactRow, error } = await supabase
    .from("artefacts")
    .select("*")
    .eq("id", input.artefactId)
    .eq("user_id", input.userId)
    .single();
  if (error || !artefactRow) throw error ?? new Error("Artefact not found");

  const from = artefactRow.status as ArtefactStatus;
  if (!canTransitionArtefactStatus(from, input.toStatus)) {
    throw new Error(
      `Invalid artefact status transition: ${from} → ${input.toStatus}`,
    );
  }

  const { data: transition, error: transitionError } = await supabase
    .from("artefact_status_transitions")
    .insert({
      artefact_id: input.artefactId,
      user_id: input.userId,
      from_status: from,
      to_status: input.toStatus,
      version_id: (artefactRow.current_version_id as string | null) ?? null,
      reason: input.reason ?? null,
      actor_type: input.actorType ?? "user",
      actor_user_id: input.userId,
    })
    .select("id")
    .single();
  if (transitionError || !transition) {
    throw transitionError ?? new Error("Could not record transition");
  }

  const { data: updated, error: updateError } = await supabase
    .from("artefacts")
    .update({ status: input.toStatus })
    .eq("id", input.artefactId)
    .eq("user_id", input.userId)
    .select("*")
    .single();
  if (updateError || !updated) {
    throw updateError ?? new Error("Could not update artefact status");
  }

  await emitEvent(supabase, {
    eventType: ARTEFACT_EVENT.statusChanged,
    aggregateId: input.artefactId,
    userId: input.userId,
    payload: {
      artefact_id: input.artefactId,
      from,
      to: input.toStatus,
      transition_id: transition.id,
    },
  });

  return { artefact: mapArtefact(updated), transitionId: transition.id as string };
}

export async function listArtefacts(
  supabase: DbClient,
  userId: string,
): Promise<ArtefactRecord[]> {
  const { data, error } = await supabase
    .from("artefacts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []).map((r) => mapArtefact(r as Record<string, unknown>));
}

export async function getArtefactDetail(
  supabase: DbClient,
  userId: string,
  artefactId: string,
): Promise<{ artefact: ArtefactRecord; versions: ArtefactVersionRecord[] } | null> {
  const { data: artefactRow, error } = await supabase
    .from("artefacts")
    .select("*")
    .eq("id", artefactId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!artefactRow) return null;

  const { data: versions, error: versionsError } = await supabase
    .from("artefact_versions")
    .select("*")
    .eq("artefact_id", artefactId)
    .eq("user_id", userId)
    .order("version_number", { ascending: false });
  if (versionsError) throw versionsError;

  return {
    artefact: mapArtefact(artefactRow),
    versions: (versions ?? []).map((r) => mapVersion(r as Record<string, unknown>)),
  };
}
