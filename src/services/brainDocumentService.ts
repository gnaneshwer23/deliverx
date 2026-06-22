/**
 * Delivery Brain — document CRUD stubs (Phase 2 foundation).
 */

import { createClient } from "@/lib/supabase/server";
import { throwIfMissingTable } from "@/lib/db-errors";

export type BrainDocumentStatus = "pending" | "classified" | "review" | "archived";

export type BrainDocumentRow = {
  id: string;
  organisationId: string;
  title: string;
  sourceType: string;
  status: BrainDocumentStatus;
  classification: Record<string, unknown>;
  storagePath: string | null;
  createdAt: string;
  updatedAt: string;
};

function mapBrainDocument(row: Record<string, unknown>): BrainDocumentRow {
  return {
    id: String(row.id),
    organisationId: String(row.organisation_id),
    title: String(row.title),
    sourceType: String(row.source_type ?? "upload"),
    status: String(row.status ?? "pending") as BrainDocumentStatus,
    classification: (row.classification as Record<string, unknown>) ?? {},
    storagePath: row.storage_path ? String(row.storage_path) : null,
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

export async function listBrainDocuments(limit = 50): Promise<BrainDocumentRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brain_documents")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throwIfMissingTable(error, "brain_documents");
    throw error;
  }

  return (data ?? []).map(mapBrainDocument);
}

export async function createBrainDocument(input: {
  title: string;
  sourceType?: string;
  storagePath?: string | null;
}): Promise<BrainDocumentRow> {
  const supabase = await createClient();
  const orgId = await getOrgId();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("brain_documents")
    .insert([
      {
        organisation_id: orgId,
        title: input.title,
        source_type: input.sourceType ?? "upload",
        storage_path: input.storagePath ?? null,
        created_by: user?.id ?? null,
      },
    ])
    .select("*")
    .single();

  if (error) {
    throwIfMissingTable(error, "brain_documents");
    throw error;
  }

  return mapBrainDocument(data as Record<string, unknown>);
}

export async function updateBrainDocumentStatus(
  id: string,
  status: BrainDocumentStatus,
): Promise<BrainDocumentRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brain_documents")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throwIfMissingTable(error, "brain_documents");
    throw error;
  }

  return mapBrainDocument(data as Record<string, unknown>);
}

/** Count documents by status for honest Brain Studio KPIs. */
export function countBrainDocumentsByStatus(
  documents: BrainDocumentRow[],
): Record<BrainDocumentStatus, number> {
  const counts: Record<BrainDocumentStatus, number> = {
    pending: 0,
    classified: 0,
    review: 0,
    archived: 0,
  };

  for (const doc of documents) {
    if (doc.status in counts) {
      counts[doc.status] += 1;
    }
  }

  return counts;
}
