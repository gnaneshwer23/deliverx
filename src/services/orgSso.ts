/**
 * Organisation SSO settings — domain routing for Supabase SAML sign-in.
 */

import { getCachedSsoLookup, setCachedSsoLookup } from "@/lib/auth/sso-lookup-cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { throwIfMissingTable } from "@/lib/db-errors";
import {
  parseDomainList,
  parseEmailDomain,
  validateSsoSettings,
} from "./ssoEngine";

export type OrgSsoSettings = {
  organisation_id: string;
  enabled: boolean;
  allowed_domains: string[];
  idp_name: string | null;
  sso_required: boolean;
  updated_at: string;
};

export type SsoLookupResult = {
  domain: string;
  idpName: string | null;
  ssoRequired: boolean;
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

function mapOrgSso(row: Record<string, unknown>): OrgSsoSettings {
  return {
    organisation_id: String(row.organisation_id),
    enabled: Boolean(row.enabled),
    allowed_domains: Array.isArray(row.allowed_domains)
      ? row.allowed_domains.map(String)
      : [],
    idp_name: row.idp_name ? String(row.idp_name) : null,
    sso_required: Boolean(row.sso_required),
    updated_at: String(row.updated_at),
  };
}

export async function getOrgSsoSettings(): Promise<OrgSsoSettings | null> {
  const { supabase, orgId } = await getOrgContext();

  const { data, error } = await supabase
    .from("org_sso_settings")
    .select("*")
    .eq("organisation_id", orgId)
    .maybeSingle();

  throwIfMissingTable(error, "org_sso_settings");
  if (error) throw new Error(error.message);
  if (!data) return null;

  return mapOrgSso(data as Record<string, unknown>);
}

export async function saveOrgSsoSettings(input: {
  enabled: boolean;
  allowedDomainsRaw: string;
  idpName: string | null;
  ssoRequired: boolean;
}): Promise<void> {
  const { supabase, orgId } = await getOrgContext();
  const allowedDomains = parseDomainList(input.allowedDomainsRaw);

  const validation = validateSsoSettings({
    enabled: input.enabled,
    allowedDomains,
  });
  if (!validation.ok) throw new Error(validation.error);

  const payload = {
    organisation_id: orgId,
    enabled: input.enabled,
    allowed_domains: allowedDomains,
    idp_name: input.idpName?.trim() || null,
    sso_required: input.ssoRequired,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("org_sso_settings").upsert(payload, {
    onConflict: "organisation_id",
  });

  throwIfMissingTable(error, "org_sso_settings");
  if (error) throw new Error(error.message);
}

export async function findSsoForEmail(email: string): Promise<SsoLookupResult | null> {
  const domain = parseEmailDomain(email);
  if (!domain) return null;

  const cached = getCachedSsoLookup(domain);
  if (cached !== undefined) return cached;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("org_sso_settings")
    .select("idp_name, sso_required")
    .eq("enabled", true)
    .contains("allowed_domains", [domain])
    .limit(1)
    .maybeSingle();

  throwIfMissingTable(error, "org_sso_settings");
  if (error || !data) {
    setCachedSsoLookup(domain, null);
    return null;
  }

  const result: SsoLookupResult = {
    domain,
    idpName: data.idp_name ? String(data.idp_name) : null,
    ssoRequired: Boolean(data.sso_required),
  };
  setCachedSsoLookup(domain, result);
  return result;
}
