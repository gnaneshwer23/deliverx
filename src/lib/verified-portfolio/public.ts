import { createAdminClient } from "@/lib/supabase/admin";
import { externalViewModel } from "@/lib/verified-portfolio/compile";
import { buildPortfolioShareUrl } from "@/lib/verified-portfolio/store";
import type {
  ConfidentialFieldKey,
  PortfolioEntry,
  PortfolioEvidenceLink,
  VerifierStatus,
} from "@/lib/verified-portfolio/types";
import {
  deliverxVerifiedClaim,
  emptyContributionBreakdown,
} from "@/lib/verified-portfolio/types";

export type PublicPortfolioResult =
  | { ok: true; view: ReturnType<typeof externalViewModel>; label: string | null }
  | { ok: false; reason: "invalid" | "revoked" | "expired" };

function mapEntryFromAdmin(
  row: Record<string, unknown>,
  links: PortfolioEvidenceLink[],
): PortfolioEntry {
  const verifierStatus = (row.verifier_status as VerifierStatus) ?? "none";
  const evidenceStrength = row.evidence_strength as PortfolioEntry["evidenceStrength"];
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    targetRole: (row.target_role as string) ?? null,
    lifecycle: row.lifecycle as PortfolioEntry["lifecycle"],
    visibility: row.visibility as PortfolioEntry["visibility"],
    projectContext: (row.project_context as string) ?? "",
    userResponsibility: (row.user_responsibility as string) ?? "",
    challenge: (row.challenge as string) ?? "",
    actions: (row.actions as string) ?? "",
    decisions: (row.decisions as string) ?? "",
    artefacts: (row.artefacts as string) ?? "",
    outcomes: (row.outcomes as string) ?? "",
    competenciesDemonstrated: (row.competencies_demonstrated as string[]) ?? [],
    evidenceStrength,
    contributionBreakdown:
      (row.contribution_breakdown as PortfolioEntry["contributionBreakdown"]) ??
      emptyContributionBreakdown(),
    reflection: (row.reflection as string) ?? "",
    verifierStatus,
    aiAssistanceDisclosure: (row.ai_assistance_disclosure as string) ?? "",
    aiSummary: (row.ai_summary as string) ?? null,
    narrative: (row.narrative as string) ?? "",
    hiddenFields: (row.hidden_fields as ConfidentialFieldKey[]) ?? [],
    evidenceLinks: links,
    deliverxVerified: deliverxVerifiedClaim({ verifierStatus, evidenceStrength }),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/** E. External view — tokenised, privacy-filtered, no false verification claims. */
export async function getPortfolioByShareToken(token: string): Promise<PublicPortfolioResult> {
  const admin = createAdminClient();
  const { data: share, error } = await admin
    .from("vpp_shares")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (error || !share) return { ok: false, reason: "invalid" };
  if (share.status === "revoked") return { ok: false, reason: "revoked" };
  if (share.expires_at && new Date(share.expires_at as string).getTime() < Date.now()) {
    await admin.from("vpp_shares").update({ status: "expired" }).eq("id", share.id);
    return { ok: false, reason: "expired" };
  }
  if (share.status !== "active") return { ok: false, reason: "invalid" };

  const { data: entry } = await admin
    .from("vpp_entries")
    .select("*")
    .eq("id", share.entry_id)
    .single();
  if (!entry) return { ok: false, reason: "invalid" };

  let links: PortfolioEvidenceLink[] = [];
  if (share.version_id) {
    const { data: version } = await admin
      .from("vpp_versions")
      .select("snapshot")
      .eq("id", share.version_id)
      .maybeSingle();
    const snap = version?.snapshot as PortfolioEntry | undefined;
    if (snap?.evidenceLinks) links = snap.evidenceLinks;
  }
  if (!links.length) {
    const { data: linkRows } = await admin
      .from("vpp_entry_evidence")
      .select("*")
      .eq("entry_id", share.entry_id);
    links = (linkRows ?? []).map((r) => ({
      evidenceId: r.evidence_id as string,
      claimField: r.claim_field as string,
      title: r.title_snapshot as string,
      sourceType: r.source_type as string,
      ledgerStatus: r.ledger_status as string,
      strength: r.strength as PortfolioEvidenceLink["strength"],
      confidentiality: r.confidentiality as string,
      deliverxClaimsVerification: false as const,
    }));
  }

  const mapped = mapEntryFromAdmin(entry, links);
  const hidden = (share.hidden_fields as ConfidentialFieldKey[]) ?? mapped.hiddenFields;
  const view = externalViewModel(mapped, hidden);

  await admin
    .from("vpp_shares")
    .update({
      view_count: ((share.view_count as number) ?? 0) + 1,
      last_viewed_at: new Date().toISOString(),
    })
    .eq("id", share.id);

  return { ok: true, view, label: (share.label as string) ?? null };
}

export { buildPortfolioShareUrl };
