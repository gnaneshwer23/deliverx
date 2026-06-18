/**
 * Marketplace façade — install shared assets as org playbooks.
 */

import { createClient } from "@/lib/supabase/server";
import { throwIfMissingTable } from "@/lib/db-errors";
import { savePlaybook, type PlaybookRow } from "./memory";
import type { MarketplaceAssetRow } from "./coordination";
import {
  canInstallAsset,
  mapAssetToPlaybookDraft,
  type InstallableAsset,
  type MarketplaceAssetContent,
} from "./marketplaceEngine";

export type MarketplaceInstallRow = {
  id: string;
  assetId: string;
  playbookId: string;
  installedAt: string;
  assetTitle: string;
  assetType: string;
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
  return { supabase, orgId: profile.organisation_id as string, userId: user.id };
}

function toInstallableAsset(row: MarketplaceAssetRow): InstallableAsset {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    assetType: row.asset_type,
    content: (row.content ?? {}) as MarketplaceAssetContent,
    isPublic: row.is_public,
    sourceOrgId: row.organisation_id,
  };
}

export async function getMarketplaceAsset(assetId: string): Promise<MarketplaceAssetRow | null> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("marketplace_assets")
    .select("*")
    .eq("id", assetId)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") return null;
    throw error;
  }
  return (data as MarketplaceAssetRow | null) ?? null;
}

export async function listInstalledAssetIds(): Promise<Set<string>> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase.from("marketplace_installs").select("asset_id");

  if (error) {
    if (error.code === "42P01") return new Set();
    throwIfMissingTable(error, "marketplace_installs");
    throw error;
  }

  return new Set((data ?? []).map((row) => String(row.asset_id)));
}

export async function listMarketplaceInstalls(limit = 10): Promise<MarketplaceInstallRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("marketplace_installs")
    .select(
      "id, asset_id, playbook_id, installed_at, marketplace_assets!inner(title, asset_type)",
    )
    .order("installed_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === "42P01") return [];
    throwIfMissingTable(error, "marketplace_installs");
    throw error;
  }

  return (data ?? []).map((row) => {
    const asset = row.marketplace_assets as
      | { title?: string; asset_type?: string }
      | { title?: string; asset_type?: string }[]
      | null;
    const meta = Array.isArray(asset) ? asset[0] : asset;
    return {
      id: String(row.id),
      assetId: String(row.asset_id),
      playbookId: String(row.playbook_id),
      installedAt: String(row.installed_at),
      assetTitle: meta?.title ?? "Asset",
      assetType: meta?.asset_type ?? "playbook",
    };
  });
}

export async function installMarketplaceAsset(
  assetId: string,
): Promise<{ playbook: PlaybookRow; installId: string }> {
  const { supabase, orgId, userId } = await getOrgContext();

  const row = await getMarketplaceAsset(assetId);
  if (!row) throw new Error("Marketplace asset not found");

  const installed = await listInstalledAssetIds();
  const asset = toInstallableAsset(row);
  const gate = canInstallAsset(asset, orgId, installed.has(assetId));
  if (!gate.ok) throw new Error(gate.reason ?? "Cannot install asset");

  const draft = mapAssetToPlaybookDraft(asset);
  const playbook = await savePlaybook(draft);

  const { data, error } = await supabase
    .from("marketplace_installs")
    .insert({
      organisation_id: orgId,
      asset_id: assetId,
      playbook_id: playbook.id,
      installed_by: userId,
    })
    .select("id")
    .single();

  if (error) {
    throwIfMissingTable(error, "marketplace_installs");
    throw error;
  }

  return { playbook, installId: String(data.id) };
}
