/**
 * Delivery Brain — playbook CRUD stubs (Phase 2 foundation).
 */

import { createClient } from "@/lib/supabase/server";
import { throwIfMissingTable } from "@/lib/db-errors";

export type PlaybookRow = {
  id: string;
  organisationId: string;
  name: string;
  content: Record<string, unknown>;
  sourceDocumentId: string | null;
  createdAt: string;
  updatedAt: string;
};

function mapPlaybook(row: Record<string, unknown>): PlaybookRow {
  return {
    id: String(row.id),
    organisationId: String(row.organisation_id),
    name: String(row.name),
    content: (row.content as Record<string, unknown>) ?? {},
    sourceDocumentId: row.source_document_id ? String(row.source_document_id) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

async function getOrgId(): Promise<string> {
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
  return String(profile.organisation_id);
}

export async function listPlaybooks(limit = 50): Promise<PlaybookRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("playbooks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throwIfMissingTable(error, "playbooks");
    throw error;
  }

  return (data ?? []).map(mapPlaybook);
}

export async function createPlaybook(input: {
  name: string;
  content?: Record<string, unknown>;
  sourceDocumentId?: string | null;
}): Promise<PlaybookRow> {
  const supabase = await createClient();
  const orgId = await getOrgId();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("playbooks")
    .insert([
      {
        organisation_id: orgId,
        name: input.name,
        content: input.content ?? {},
        source_document_id: input.sourceDocumentId ?? null,
        created_by: user?.id ?? null,
      },
    ])
    .select("*")
    .single();

  if (error) {
    throwIfMissingTable(error, "playbooks");
    throw error;
  }

  return mapPlaybook(data as Record<string, unknown>);
}

export async function deletePlaybook(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("playbooks").delete().eq("id", id);

  if (error) {
    throwIfMissingTable(error, "playbooks");
    throw error;
  }
}
