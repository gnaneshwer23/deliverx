import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  DELETE_CONFIRM_PHRASE,
  PRIVACY_EVENT,
} from "@/lib/pi-privacy/cascade-map";
import type { PrivacyDeleteResult, PrivacyRequestRecord } from "@/lib/pi-privacy/types";

type DbClient = SupabaseClient;

function mapRequest(row: Record<string, unknown>): PrivacyRequestRecord {
  return {
    id: String(row.id),
    userId: (row.user_id as string | null) ?? null,
    requestType: row.request_type as PrivacyRequestRecord["requestType"],
    status: row.status as PrivacyRequestRecord["status"],
    exportSummary: (row.export_summary as Record<string, unknown>) ?? {},
    tablesTouched: (row.tables_touched as string[]) ?? [],
    retentionNote: String(row.retention_note ?? ""),
    errorMessage: (row.error_message as string | null) ?? null,
    requestedAt: String(row.requested_at),
    completedAt: (row.completed_at as string | null) ?? null,
  };
}

export function validateDeleteConfirmation(input: {
  confirmPhrase?: string;
  password?: string;
}): { ok: true } | { ok: false; error: string } {
  if (!input.password || input.password.length < 1) {
    return { ok: false, error: "Password re-authentication is required to delete PI data." };
  }
  if (input.confirmPhrase !== DELETE_CONFIRM_PHRASE) {
    return {
      ok: false,
      error: `Confirmation phrase must be exactly ${DELETE_CONFIRM_PHRASE}.`,
    };
  }
  return { ok: true };
}

/**
 * Re-auth with password, create delete request, purge person PI via RPC,
 * emit domain events, optionally delete Auth user (cascades public.users).
 * Privacy request tombstone survives with user_id set null.
 */
export async function requestAndDeletePersonPi(
  supabase: DbClient,
  input: {
    userId: string;
    email: string;
    password: string;
    confirmPhrase: string;
    deleteAuthUser?: boolean;
  },
): Promise<{ request: PrivacyRequestRecord; result: PrivacyDeleteResult }> {
  const check = validateDeleteConfirmation({
    password: input.password,
    confirmPhrase: input.confirmPhrase,
  });
  if (!check.ok) {
    throw new Error(check.error);
  }

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (reauthError) {
    throw new Error("Re-authentication failed. Check password and try again.");
  }

  const { data: inserted, error: insertError } = await supabase
    .from("pi_privacy_requests")
    .insert({
      user_id: input.userId,
      request_type: "delete",
      status: "processing",
      confirmation_phrase: DELETE_CONFIRM_PHRASE,
    })
    .select("*")
    .single();
  if (insertError || !inserted) throw insertError ?? new Error("Could not create delete request");

  const requestId = inserted.id as string;

  await supabase.from("pi_domain_events").insert({
    event_type: PRIVACY_EVENT.deleteRequested,
    aggregate_type: "pi_privacy_request",
    aggregate_id: requestId,
    user_id: input.userId,
    payload: { request_type: "delete" },
    schema_version: 1,
  });

  const admin = createAdminClient();

  try {
    const { data: purgeResult, error: purgeError } = await admin.rpc(
      "pi_privacy_purge_person_data",
      {
        p_user_id: input.userId,
        p_request_id: requestId,
      },
    );
    if (purgeError) throw purgeError;

    const tablesTouched =
      (purgeResult as { tables_touched?: string[] } | null)?.tables_touched ?? [];

    const completedAt = new Date().toISOString();

    await admin.from("pi_domain_events").insert({
      event_type: PRIVACY_EVENT.deleteCompleted,
      aggregate_type: "pi_privacy_request",
      aggregate_id: requestId,
      user_id: input.userId,
      payload: {
        tables_touched: tablesTouched,
        auth_user_deleted: Boolean(input.deleteAuthUser ?? true),
      },
      schema_version: 1,
    });

    const { data: updated, error: updateError } = await admin
      .from("pi_privacy_requests")
      .update({
        status: "completed",
        tables_touched: tablesTouched,
        completed_at: completedAt,
        retention_note:
          "Legal minimum: request tombstone retained after person PI purge. Shared pi_cf_* catalogue untouched.",
      })
      .eq("id", requestId)
      .select("*")
      .single();
    if (updateError || !updated) throw updateError ?? new Error("Could not complete delete request");

    let authUserDeleted = false;
    if (input.deleteAuthUser !== false) {
      const { error: authDelError } = await admin.auth.admin.deleteUser(input.userId);
      if (authDelError) {
        // PI data already purged; surface auth failure without rolling back purge.
        console.error("[pi-privacy] auth delete failed after purge", authDelError);
        await admin
          .from("pi_privacy_requests")
          .update({
            metadata: {
              auth_delete_error: authDelError.message,
              pi_purged: true,
            },
          })
          .eq("id", requestId);
      } else {
        authUserDeleted = true;
      }
    }

    return {
      request: mapRequest(updated as Record<string, unknown>),
      result: {
        requestId,
        tablesTouched,
        authUserDeleted,
        completedAt,
      },
    };
  } catch (err) {
    await admin
      .from("pi_privacy_requests")
      .update({
        status: "failed",
        error_message: err instanceof Error ? err.message : "Delete failed",
      })
      .eq("id", requestId);
    throw err;
  }
}
