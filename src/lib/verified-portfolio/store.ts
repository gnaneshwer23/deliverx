import { randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { compilePortfolioDraft } from "@/lib/verified-portfolio/compile";
import { shareBaseUrl } from "@/lib/share-url";
import type {
  ConfidentialFieldKey,
  EntryLifecycle,
  EntryVisibility,
  LinkedEvidenceInput,
  PortfolioEntry,
  PortfolioEvidenceLink,
  PortfolioShare,
  VerifierStatus,
} from "@/lib/verified-portfolio/types";
import {
  deliverxVerifiedClaim,
  emptyContributionBreakdown,
} from "@/lib/verified-portfolio/types";

function mapEntry(
  row: Record<string, unknown>,
  links: PortfolioEvidenceLink[] = [],
): PortfolioEntry {
  const verifierStatus = (row.verifier_status as VerifierStatus) ?? "none";
  const evidenceStrength = row.evidence_strength as PortfolioEntry["evidenceStrength"];
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    targetRole: (row.target_role as string) ?? null,
    lifecycle: row.lifecycle as EntryLifecycle,
    visibility: row.visibility as EntryVisibility,
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
    deliverxVerified: deliverxVerifiedClaim({
      verifierStatus,
      evidenceStrength,
    }),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

async function loadLinks(
  supabase: SupabaseClient,
  entryId: string,
): Promise<PortfolioEvidenceLink[]> {
  const { data } = await supabase
    .from("vpp_entry_evidence")
    .select("*")
    .eq("entry_id", entryId);
  return (data ?? []).map((r) => ({
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

export async function listUserEvidenceForPortfolio(
  supabase: SupabaseClient,
  userId: string,
): Promise<LinkedEvidenceInput[]> {
  const { data: records } = await supabase
    .from("pi_evidence_records")
    .select(
      "id, source_type, category, title, summary, confidentiality, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  const ids = (records ?? []).map((r) => r.id as string);
  const statusById: Record<string, string> = {};
  const actorById: Record<string, string> = {};
  if (ids.length) {
    const [{ data: transitions }, { data: provenance }] = await Promise.all([
      supabase
        .from("pi_evidence_status_transitions")
        .select("evidence_id, to_status, created_at")
        .in("evidence_id", ids)
        .order("created_at", { ascending: false }),
      supabase
        .from("pi_evidence_provenance")
        .select("evidence_id, actor_type")
        .in("evidence_id", ids),
    ]);
    for (const t of transitions ?? []) {
      const eid = t.evidence_id as string;
      if (!statusById[eid]) statusById[eid] = t.to_status as string;
    }
    for (const p of provenance ?? []) {
      actorById[p.evidence_id as string] = p.actor_type as string;
    }
  }

  return (records ?? []).map((r) => ({
    id: r.id as string,
    title: r.title as string,
    sourceType: r.source_type as string,
    category: r.category as string,
    status: statusById[r.id as string] ?? "observed",
    confidentiality: (r.confidentiality as string) ?? "private",
    summary: (r.summary as string) ?? null,
    actorType: actorById[r.id as string] ?? null,
  }));
}

export async function createPortfolioEntryFromEvidence(
  supabase: SupabaseClient,
  userId: string,
  input: {
    title: string;
    targetRole?: string | null;
    evidenceIds: string[];
    userNotes?: Parameters<typeof compilePortfolioDraft>[0]["userNotes"];
  },
) {
  const all = await listUserEvidenceForPortfolio(supabase, userId);
  const selected = all.filter((e) => input.evidenceIds.includes(e.id));
  if (selected.length === 0) throw new Error("evidence_required");

  const draft = compilePortfolioDraft({
    title: input.title,
    targetRole: input.targetRole,
    evidence: selected,
    userNotes: input.userNotes,
  });

  const { data: entry, error } = await supabase
    .from("vpp_entries")
    .insert({
      user_id: userId,
      title: input.title.trim(),
      target_role: input.targetRole ?? null,
      lifecycle: draft.lifecycle,
      visibility: "private",
      project_context: draft.projectContext,
      user_responsibility: draft.userResponsibility,
      challenge: draft.challenge,
      actions: draft.actions,
      decisions: draft.decisions,
      artefacts: draft.artefacts,
      outcomes: draft.outcomes,
      competencies_demonstrated: draft.competenciesDemonstrated,
      evidence_strength: draft.evidenceStrength,
      contribution_breakdown: draft.contributionBreakdown,
      reflection: draft.reflection,
      verifier_status: draft.verifierStatus,
      ai_assistance_disclosure: draft.aiAssistanceDisclosure,
      ai_summary: draft.aiSummary,
      narrative: draft.narrative,
      hidden_fields: [],
    })
    .select("*")
    .single();

  if (error) throw error;

  const linkRows = draft.links.map((l) => ({
    entry_id: entry.id,
    evidence_id: l.evidenceId,
    claim_field: l.claimField,
    strength: l.strength,
    title_snapshot: l.title,
    source_type: l.sourceType,
    ledger_status: l.ledgerStatus,
    confidentiality: l.confidentiality,
  }));

  const { error: linkError } = await supabase.from("vpp_entry_evidence").insert(linkRows);
  if (linkError) throw linkError;

  return mapEntry(entry, draft.links);
}

export async function listPortfolioEntries(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("vpp_entries")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  const entries: PortfolioEntry[] = [];
  for (const row of data ?? []) {
    const links = await loadLinks(supabase, row.id as string);
    entries.push(mapEntry(row, links));
  }
  return entries;
}

export async function getPortfolioEntry(
  supabase: SupabaseClient,
  userId: string,
  entryId: string,
) {
  const { data, error } = await supabase
    .from("vpp_entries")
    .select("*")
    .eq("id", entryId)
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  const links = await loadLinks(supabase, entryId);
  return mapEntry(data, links);
}

export async function updatePortfolioEntry(
  supabase: SupabaseClient,
  userId: string,
  entryId: string,
  patch: Partial<{
    title: string;
    targetRole: string | null;
    lifecycle: EntryLifecycle;
    visibility: EntryVisibility;
    projectContext: string;
    userResponsibility: string;
    challenge: string;
    actions: string;
    decisions: string;
    artefacts: string;
    outcomes: string;
    competenciesDemonstrated: string[];
    reflection: string;
    narrative: string;
    aiSummary: string | null;
    hiddenFields: ConfidentialFieldKey[];
    contributionBreakdown: PortfolioEntry["contributionBreakdown"];
    verifierStatus: VerifierStatus;
  }>,
) {
  const row: Record<string, unknown> = {};
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.targetRole !== undefined) row.target_role = patch.targetRole;
  if (patch.lifecycle !== undefined) row.lifecycle = patch.lifecycle;
  if (patch.visibility !== undefined) row.visibility = patch.visibility;
  if (patch.projectContext !== undefined) row.project_context = patch.projectContext;
  if (patch.userResponsibility !== undefined) {
    row.user_responsibility = patch.userResponsibility;
  }
  if (patch.challenge !== undefined) row.challenge = patch.challenge;
  if (patch.actions !== undefined) row.actions = patch.actions;
  if (patch.decisions !== undefined) row.decisions = patch.decisions;
  if (patch.artefacts !== undefined) row.artefacts = patch.artefacts;
  if (patch.outcomes !== undefined) row.outcomes = patch.outcomes;
  if (patch.competenciesDemonstrated !== undefined) {
    row.competencies_demonstrated = patch.competenciesDemonstrated;
  }
  if (patch.reflection !== undefined) row.reflection = patch.reflection;
  if (patch.narrative !== undefined) {
    row.narrative = patch.narrative;
    const breakdown = emptyContributionBreakdown();
    breakdown.userEdited = ["narrative"];
    row.contribution_breakdown = {
      ...breakdown,
      ...(patch.contributionBreakdown ?? {}),
      userEdited: ["narrative"],
    };
  }
  if (patch.aiSummary !== undefined) row.ai_summary = patch.aiSummary;
  if (patch.hiddenFields !== undefined) row.hidden_fields = patch.hiddenFields;
  // T8: users cannot self-set external attestation statuses — only the attestation path may.
  if (patch.verifierStatus !== undefined) {
    if (
      patch.verifierStatus === "externally_attested" ||
      patch.verifierStatus === "pending_external" ||
      patch.verifierStatus === "disputed"
    ) {
      throw new Error("verifier_status_requires_attestation_path");
    }
    row.verifier_status = patch.verifierStatus;
  }

  const { data, error } = await supabase
    .from("vpp_entries")
    .update(row)
    .eq("id", entryId)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error) throw error;
  const links = await loadLinks(supabase, entryId);
  return mapEntry(data, links);
}

export async function createRoleVersion(
  supabase: SupabaseClient,
  userId: string,
  entryId: string,
  roleLabel: string,
) {
  const entry = await getPortfolioEntry(supabase, userId, entryId);
  const { data, error } = await supabase
    .from("vpp_versions")
    .insert({
      entry_id: entryId,
      user_id: userId,
      role_label: roleLabel.trim(),
      snapshot: entry,
    })
    .select("*")
    .single();
  if (error) throw error;
  return {
    id: data.id as string,
    entryId,
    roleLabel: data.role_label as string,
    snapshot: data.snapshot as Record<string, unknown>,
    createdAt: data.created_at as string,
  };
}

function newToken() {
  return randomBytes(24).toString("base64url");
}

export async function createPortfolioShare(
  supabase: SupabaseClient,
  userId: string,
  input: {
    entryId: string;
    label?: string;
    versionId?: string | null;
    hiddenFields?: ConfidentialFieldKey[];
    expiresAt?: string | null;
  },
): Promise<PortfolioShare> {
  const entry = await getPortfolioEntry(supabase, userId, input.entryId);
  const hidden = input.hiddenFields ?? entry.hiddenFields;
  const token = newToken();

  const { data, error } = await supabase
    .from("vpp_shares")
    .insert({
      entry_id: input.entryId,
      version_id: input.versionId ?? null,
      user_id: userId,
      token,
      label: input.label ?? entry.title,
      status: "active",
      expires_at: input.expiresAt ?? null,
      hidden_fields: hidden,
    })
    .select("*")
    .single();
  if (error) throw error;

  await supabase
    .from("vpp_entries")
    .update({ lifecycle: "shared", visibility: "link" })
    .eq("id", input.entryId)
    .eq("user_id", userId);

  return {
    id: data.id as string,
    entryId: input.entryId,
    versionId: (data.version_id as string) ?? null,
    token: data.token as string,
    label: (data.label as string) ?? null,
    status: "active",
    expiresAt: (data.expires_at as string) ?? null,
    hiddenFields: (data.hidden_fields as ConfidentialFieldKey[]) ?? [],
    viewCount: 0,
    lastViewedAt: null,
    shareUrl: buildPortfolioShareUrl(data.token as string),
  };
}

export function buildPortfolioShareUrl(token: string) {
  return `${shareBaseUrl()}/portfolio/v/${token}`;
}

export async function revokePortfolioShare(
  supabase: SupabaseClient,
  userId: string,
  shareId: string,
) {
  const { error } = await supabase
    .from("vpp_shares")
    .update({ status: "revoked" })
    .eq("id", shareId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function listPortfolioShares(
  supabase: SupabaseClient,
  userId: string,
  entryId: string,
) {
  const { data, error } = await supabase
    .from("vpp_shares")
    .select("*")
    .eq("user_id", userId)
    .eq("entry_id", entryId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    entryId: row.entry_id as string,
    versionId: (row.version_id as string) ?? null,
    token: row.token as string,
    label: (row.label as string) ?? null,
    status: row.status as PortfolioShare["status"],
    expiresAt: (row.expires_at as string) ?? null,
    hiddenFields: (row.hidden_fields as ConfidentialFieldKey[]) ?? [],
    viewCount: (row.view_count as number) ?? 0,
    lastViewedAt: (row.last_viewed_at as string) ?? null,
    shareUrl: buildPortfolioShareUrl(row.token as string),
  }));
}

/**
 * H. Migrate a launchpad portfolio_case artefact into a draft VPP entry.
 * Does not invent verification.
 */
export async function migrateLaunchpadCase(
  supabase: SupabaseClient,
  userId: string,
  artefactId: string,
) {
  const { data: art, error } = await supabase
    .from("launchpad_artefacts")
    .select("*")
    .eq("id", artefactId)
    .eq("user_id", userId)
    .eq("artefact_type", "portfolio_case")
    .single();
  if (error) throw error;

  const content = (art.content as Record<string, unknown>) ?? {};
  if (typeof content.vppEntryId === "string") {
    return getPortfolioEntry(supabase, userId, content.vppEntryId);
  }

  const title = (art.title as string) || "Migrated portfolio case";
  const narrative = String(content.narrative ?? content.body ?? content.notes ?? "");

  const { data: entry, error: insertError } = await supabase
    .from("vpp_entries")
    .insert({
      user_id: userId,
      title,
      lifecycle: "draft",
      visibility: "private",
      narrative,
      project_context: narrative.slice(0, 280),
      evidence_strength: "self_reported",
      verifier_status: "none",
      ai_assistance_disclosure:
        "Migrated from Launchpad portfolio case. Link Evidence Ledger items before sharing.",
      contribution_breakdown: {
        ...emptyContributionBreakdown(),
        userAuthored: ["migrated_launchpad_case"],
      },
      migrated_from_type: "launchpad_artefacts",
      migrated_from_id: artefactId,
    })
    .select("*")
    .single();
  if (insertError) throw insertError;

  const ledgerId = art.ledger_evidence_id as string | null | undefined;
  if (ledgerId) {
    const evidence = await listUserEvidenceForPortfolio(supabase, userId);
    const hit = evidence.find((e) => e.id === ledgerId);
    if (hit) {
      await supabase.from("vpp_entry_evidence").insert({
        entry_id: entry.id,
        evidence_id: hit.id,
        claim_field: "general",
        strength: "self_reported",
        title_snapshot: hit.title,
        source_type: hit.sourceType,
        ledger_status: hit.status,
        confidentiality: hit.confidentiality ?? "private",
      });
    }
  }

  await supabase
    .from("launchpad_artefacts")
    .update({ content: { ...content, vppEntryId: entry.id } })
    .eq("id", artefactId);

  return getPortfolioEntry(supabase, userId, entry.id as string);
}
