import {
  Callout,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Pill,
  Row,
  Select,
  Stack,
  Stat,
  Table,
  Text,
  useCanvasState,
} from "cursor/canvas";

type Status =
  | "Shipped"
  | "Partial"
  | "Net-new"
  | "Conflict"
  | "Out of charter"
  | "Ops / already tracked";

type Verdict = "Keep" | "Modify" | "Defer" | "Reject";

type ReqRow = {
  id: string;
  requirement: string;
  status: Status;
  verdict: Verdict;
  evidence: string;
};

const NAV = [
  { value: "overview", label: "Overview" },
  { value: "doc-00", label: "00 Index" },
  { value: "doc-01", label: "01 Master PRD" },
  { value: "doc-02", label: "02 TRD" },
  { value: "doc-03", label: "03 UI/UX" },
  { value: "doc-04", label: "04 App Flow" },
  { value: "doc-05", label: "05 Backend Schema" },
  { value: "doc-06", label: "06 Implementation Plan" },
  { value: "conflicts", label: "Charter conflicts" },
  { value: "net-new", label: "Net-new delta" },
  { value: "decisions", label: "Founder decisions" },
] as const;

const DOC_META: Record<
  string,
  {
    title: string;
    purpose: string;
    audience: string;
    kind: string;
    summary: string;
  }
> = {
  "doc-00": {
    title: "00 — Six Document Build Pack Index",
    purpose: "Orient the pack, define usage, and propose a source-of-truth order.",
    audience: "Product, Design, Engineering, QA",
    kind: "Process / governance",
    summary:
      "Useful as an intake checklist. SoT order in the pack under-ranks the Product Bible and invents /docs/build-pack/ (not present). Treat as advisory relative to Build Charter + Current Scope.",
  },
  "doc-01": {
    title: "01 — Master PRD",
    purpose: "Product contract: vision, personas, FR/NFR, success metrics, DoD.",
    audience: "Product, Design, Engineering, QA",
    kind: "PRD / vision",
    summary:
      "Core evidence-loop vision matches shipped P0–P8. FRs mostly shipped or partial. Launchpad marked Later in pack is already foundation-shipped (T7). Team Copilot “architecture only” is more conservative than shipped Workspace alias.",
  },
  "doc-02": {
    title: "02 — Technical Requirements Document",
    purpose: "Architecture, stack, modules, AI, security, CI/CD, release gates.",
    audience: "Engineering, Security, QA",
    kind: "Engineering spec",
    summary:
      "Modular-monolith + trust-rail intent matches shipped T0–T9. Stack deltas: Next 16 (not 15), typed Supabase client (not Prisma), Vercel Analytics (not PostHog). Rate limits / CI remain open ops/eng residuals.",
  },
  "doc-03": {
    title: "03 — UI/UX Design Specification",
    purpose: "Visual system, shell, marketing IA, onboarding, dashboards, a11y.",
    audience: "Design, Frontend, Content",
    kind: "Design / UX spec",
    summary:
      "Calm professional principles align. Shell/nav partially match ProductSuiteNav; global search + Insights nav are net-new. 8-step conversation onboarding differs from shipped 6-step PI onboarding. Pricing “guarantee terms” conflicts with Batch 2 honesty.",
  },
  "doc-04": {
    title: "04 — End-to-End App Flow",
    purpose: "Journey from discovery → evidence → PI update → next action.",
    audience: "Product, Engineering, QA",
    kind: "Process / journey spec",
    summary:
      "Primary E2E acceptance scenario is largely proven by T6/T8 live gates. Human reviewer-queue-centric verification differs from Capability Engine + external attestation model. Full Xperience entry ceremony is thinner than specified.",
  },
  "doc-05": {
    title: "05 — Backend Schema & Data Architecture",
    purpose: "Entities, immutability, RLS, AI provenance, deletion, integrity tests.",
    audience: "Data, Backend, Security",
    kind: "Data architecture",
    summary:
      "Principles match (append-only evidence, claims≠evidence, AI provenance). Physical schema uses pi_* / ScoreRun model, not pack table names. Seed “one company” conflicts with 12-company catalogue (PD-2026-07-03).",
  },
  "doc-06": {
    title: "06 — Implementation Plan",
    purpose: "Milestone sequence M0–M9, Cursor operating model, release gates.",
    audience: "Founder, Engineering leads, QA",
    kind: "Process / delivery plan",
    summary:
      "M0–M8 are effectively complete relative to shipped reality. M9 Launchpad foundation is partial. Cursor rule already lives in .cursor/rules/deliverx.mdc. Do not restart greenfield milestones.",
  },
};

const PRD_ROWS: ReqRow[] = [
  {
    id: "FR-001",
    requirement: "Visitor understands product; clear path CTAs (desktop/mobile)",
    status: "Partial",
    verdict: "Keep",
    evidence: "(marketing)/* live; Batch 2 honesty; residual copy polish vs matrix",
  },
  {
    id: "FR-002",
    requirement: "Create/verify account; session + protected routes",
    status: "Shipped",
    verdict: "Keep",
    evidence: "Supabase Auth; T6 LIVE signup/signin; route guards",
  },
  {
    id: "FR-003",
    requirement: "Personalised onboarding with saved/editable progress",
    status: "Partial",
    verdict: "Modify",
    evidence: "6-step PI onboarding /onboarding/profile (not pack’s 8-step conversation)",
  },
  {
    id: "FR-004",
    requirement: "Initial profile without presenting claims as evidence",
    status: "Shipped",
    verdict: "Keep",
    evidence: "SnapshotClaims; Verified gate; ledger empty until evidence",
  },
  {
    id: "FR-005",
    requirement: "Enter one simulated org + assigned project (coherent)",
    status: "Partial",
    verdict: "Modify",
    evidence: "12-company catalogue 0079 (over-deliver vs “one org”); Day-1 sim live",
  },
  {
    id: "FR-006",
    requirement: "Activities + versioned artefact submissions",
    status: "Shipped",
    verdict: "Keep",
    evidence: "0088 artefacts/versions; Experience Day-1 → ledger",
  },
  {
    id: "FR-007",
    requirement: "Reviewer/controlled rule verifies observations → evidence",
    status: "Partial",
    verdict: "Modify",
    evidence: "Capability Engine + controlled paths; T8 attestation; human reviewer queue thin (0073)",
  },
  {
    id: "FR-008",
    requirement: "Evidence maps to capability definitions",
    status: "Shipped",
    verdict: "Keep",
    evidence: "ScoreRuns pin pm-core@2026.1; judgements via engine",
  },
  {
    id: "FR-009",
    requirement: "PI updates with explanation of what changed",
    status: "Shipped",
    verdict: "Keep",
    evidence: "Growth reports; SnapshotClaims; citations",
  },
  {
    id: "FR-010",
    requirement: "Next action with rationale citing goal/evidence/gap",
    status: "Partial",
    verdict: "Modify",
    evidence: "Profile/Career CTAs + recommendations; no formal recommendation state machine",
  },
  {
    id: "FR-011",
    requirement: "Admin manages single org/project config (audited)",
    status: "Partial",
    verdict: "Defer",
    evidence: "Thin admin framework seed; org config UX not first-class",
  },
  {
    id: "FR-012",
    requirement: "Launchpad consumes evidence (Later in pack)",
    status: "Partial",
    verdict: "Keep",
    evidence: "T7 readiness honesty + /career + /portfolio; marketplace deferred",
  },
  {
    id: "BR-*",
    requirement: "Business rules: observation≠evidence; AI provenance; consent; no fake marketing",
    status: "Shipped",
    verdict: "Keep",
    evidence: "0095/0096 trust rails; Batch 2 honesty; PD-2026-07-04/05/06/10",
  },
  {
    id: "NFR-*",
    requirement: "Security, privacy, AA, perf, observability, quality",
    status: "Partial",
    verdict: "Keep",
    evidence: "Export/delete 0086; AA core Batch 5–6; rate limit/CI open (remaining-work A/B)",
  },
  {
    id: "METRICS",
    requirement: "Activation ≥70%, loop ≥50%, explainability 100%, etc.",
    status: "Net-new",
    verdict: "Defer",
    evidence: "Targets not instrumented as product KPIs; analytics thin (docs/14)",
  },
];

const TRD_ROWS: ReqRow[] = [
  {
    id: "STACK",
    requirement: "Next 15 + React 19 + Tailwind + Supabase + Vitest/Playwright + GH Actions",
    status: "Partial",
    verdict: "Modify",
    evidence: "Next 16.2.12 shipped; stack otherwise matches; CI workflows disabled (TD-018)",
  },
  {
    id: "ORM",
    requirement: "Prisma or typed Supabase client — choose one",
    status: "Shipped",
    verdict: "Keep",
    evidence: "Typed Supabase client chosen; do not add Prisma",
  },
  {
    id: "ANALYTICS",
    requirement: "PostHog product events",
    status: "Net-new",
    verdict: "Defer",
    evidence: "Vercel Analytics/Speed Insights; no PostHog — not in remaining-work",
  },
  {
    id: "EMAIL",
    requirement: "Resend transactional email",
    status: "Partial",
    verdict: "Keep",
    evidence: "src/lib/email/resend.ts; SMTP reset proof still open (R-P1-15)",
  },
  {
    id: "PAY",
    requirement: "Stripe deferred unless commercial release",
    status: "Ops / already tracked",
    verdict: "Keep",
    evidence: "T9 code 0097 shipped; payments later founder ops",
  },
  {
    id: "AI-AGENTS",
    requirement: "Line Manager, Stakeholder, Observer only; structured outputs + provenance",
    status: "Shipped",
    verdict: "Keep",
    evidence: "0090 ai_orchestration; citations enforcement 2026-07-26",
  },
  {
    id: "AI-BOUNDARY",
    requirement: "Agents propose observations; verification service creates evidence",
    status: "Shipped",
    verdict: "Keep",
    evidence: "Consent OFF default; Capability Engine–only writes; 0095",
  },
  {
    id: "SM-ARTEFACT",
    requirement: "Artefact version draft→submitted→superseded (immutable submitted)",
    status: "Shipped",
    verdict: "Keep",
    evidence: "0088 artefact_versions + immutability",
  },
  {
    id: "SM-REC",
    requirement: "Recommendation generated→viewed→accepted/dismissed/completed",
    status: "Net-new",
    verdict: "Modify",
    evidence: "Ad-hoc recommendations exist; no first-class recommendation entity SM",
  },
  {
    id: "SM-ACTIVITY",
    requirement: "Activity not_started→…→completed with reviewer states",
    status: "Partial",
    verdict: "Modify",
    evidence: "Experience/workspace activity models differ; human under_review path thin",
  },
  {
    id: "SEC-RLS",
    requirement: "RLS on user/org tables; service-role server-only",
    status: "Shipped",
    verdict: "Keep",
    evidence: "0092/0095; T6 security journeys",
  },
  {
    id: "SEC-RATE",
    requirement: "Rate limits on auth/AI/uploads/public forms",
    status: "Ops / already tracked",
    verdict: "Keep",
    evidence: "R-P2-06 open in remaining-work",
  },
  {
    id: "CI",
    requirement: "PR gates + staging Playwright smoke",
    status: "Ops / already tracked",
    verdict: "Keep",
    evidence: "TD-018 / remaining-work §A — workflows dark",
  },
  {
    id: "FLAGS",
    requirement: "Feature flags protect incomplete modules",
    status: "Partial",
    verdict: "Defer",
    evidence: "Env gates; progressive flag SaaS deferred (MF-D08)",
  },
];

const UX_ROWS: ReqRow[] = [
  {
    id: "PRINCIPLES",
    requirement: "Calm, evidence-distinct, explainable, no course-marketplace look",
    status: "Shipped",
    verdict: "Keep",
    evidence: "UX bible + Batch 3 language; ProductSuiteNav",
  },
  {
    id: "SHELL",
    requirement: "Top bar: logo, global search, notifications, help, account",
    status: "Partial",
    verdict: "Modify",
    evidence: "Notifications + account exist; global search + help net-new",
  },
  {
    id: "NAV",
    requirement: "Home, PI, Xperience, Launchpad, Team Copilot, Portfolio, Insights, Settings",
    status: "Partial",
    verdict: "Modify",
    evidence: "Suite nav ships products; Insights as product nav = net-new / risk of third surface",
  },
  {
    id: "MKT-PAGES",
    requirement: "Home, How it works, PI, Xperience, Launchpad, Team Copilot, Pricing, Enterprise, About, Contact",
    status: "Partial",
    verdict: "Keep",
    evidence: "Most (marketing) routes live; Enterprise/Contact depth varies",
  },
  {
    id: "ONB-8",
    requirement: "8-step conversation onboarding (Welcome→Recommendation)",
    status: "Partial",
    verdict: "Modify",
    evidence: "Shipped: identity/situation/targets/evidence/consent/path — different shape",
  },
  {
    id: "HOME-DASH",
    requirement: "Today / journey / PI snapshot / active experience / ≤3 recommendations",
    status: "Partial",
    verdict: "Modify",
    evidence: "/hub + profile-centre aggregate; not pack zone layout 1:1",
  },
  {
    id: "PI-VIEWS",
    requirement: "Overview, Capabilities, Evidence, Growth, Portfolio, Privacy",
    status: "Shipped",
    verdict: "Keep",
    evidence: "/profile, ledger, growth, /portfolio, settings privacy",
  },
  {
    id: "XP-SCREENS",
    requirement: "Company/project/activity/meetings/evidence workspace screens",
    status: "Partial",
    verdict: "Modify",
    evidence: "Day-1 + planner + workspace modules; full ceremony thinner than spec",
  },
  {
    id: "PRICING-G",
    requirement: "Pricing page includes guarantee terms",
    status: "Conflict",
    verdict: "Reject",
    evidence: "Money-back rejected Batch 2 / MF-D09; FAQ disclaims",
  },
  {
    id: "A11Y",
    requirement: "WCAG 2.2 AA acceptance checklist",
    status: "Ops / already tracked",
    verdict: "Keep",
    evidence: "Core chrome Batch 5–6; AT lab before whole-product AA claim",
  },
  {
    id: "TYPE",
    requirement: "Typography Inter or Geist",
    status: "Partial",
    verdict: "Defer",
    evidence: "Existing design system prevails; Inter default bias noted — do not force restyle",
  },
];

const FLOW_ROWS: ReqRow[] = [
  {
    id: "E2E-PRIMARY",
    requirement: "Visitor→signup→onboard→org→activity→submit→verify→PI→next action",
    status: "Shipped",
    verdict: "Keep",
    evidence: "T6 LIVE loop + T8 attestation E2E; release-gate",
  },
  {
    id: "PUBLIC",
    requirement: "Marketing→signup with product context; resume intended path",
    status: "Partial",
    verdict: "Keep",
    evidence: "postSignupPath / start/*; residual product-intent polish",
  },
  {
    id: "XP-ENTRY",
    requirement: "Company welcome→role→meet team→project→first activity",
    status: "Partial",
    verdict: "Modify",
    evidence: "Catalogue + Day-1; not full multi-screen entry ceremony",
  },
  {
    id: "REVIEWER",
    requirement: "Human reviewer queue: inspect, observe, decide, verify, notify",
    status: "Partial",
    verdict: "Modify",
    evidence: "pi_review_cases 0073 thin/0 cases; primary path is engine + T8 attestor",
  },
  {
    id: "ADMIN",
    requirement: "Admin configures org/role/project/activities/capabilities",
    status: "Partial",
    verdict: "Defer",
    evidence: "pm-core seed + thin admin; not ops console depth",
  },
  {
    id: "LP-UNLOCK",
    requirement: "Launchpad unlocks after min evidence or explicit choice",
    status: "Partial",
    verdict: "Keep",
    evidence: "Entitlements T9 + readiness honesty; unlock rules not pack-literal",
  },
  {
    id: "FAILURES",
    requirement: "AI timeout, upload fail, duplicate submit, session expiry recovery",
    status: "Partial",
    verdict: "Keep",
    evidence: "AI fallback units; idempotency partial; residual polish",
  },
];

const SCHEMA_ROWS: ReqRow[] = [
  {
    id: "PRINCIPLES",
    requirement: "Postgres SoT; claims≠obs≠evidence≠capability; immutable submitted/verified",
    status: "Shipped",
    verdict: "Keep",
    evidence: "Product Bible 12 + 0095/0088; Capability Engine",
  },
  {
    id: "NAMING",
    requirement: "Pack entity names (evidence_items, recommendations, …)",
    status: "Partial",
    verdict: "Modify",
    evidence: "Shipped pi_* / ScoreRun / SnapshotClaims — conceptual map, not rename",
  },
  {
    id: "BANDS",
    requirement: "Confidence bands Not yet→Emerging→Demonstrated→Consistent (versioned algo)",
    status: "Partial",
    verdict: "Modify",
    evidence: "PD-2026-07-05 bands preferred; documented versioned algorithm incomplete",
  },
  {
    id: "AI-PROV",
    requirement: "AI provenance fields (agent, model, prompt version, cost, …)",
    status: "Shipped",
    verdict: "Keep",
    evidence: "0090 ai_agents / ai_prompt_versions / ai_interactions",
  },
  {
    id: "DELETE",
    requirement: "Export/delete + storage cascade + audit tombstones",
    status: "Shipped",
    verdict: "Keep",
    evidence: "0086 privacy; purge RPC; cascade maps",
  },
  {
    id: "SEED-ONE",
    requirement: "Seed one coherent company + three activities",
    status: "Conflict",
    verdict: "Reject",
    evidence: "PD-2026-07-03 12-company catalogue 0079 — keep shipped seed",
  },
  {
    id: "INTEGRITY",
    requirement: "Cross-user evidence denial; verification required; append-only snapshots",
    status: "Shipped",
    verdict: "Keep",
    evidence: "T6 security + 0095 triggers; release-gate",
  },
  {
    id: "AUDIT-TBL",
    requirement: "First-class audit_events append-only table",
    status: "Partial",
    verdict: "Defer",
    evidence: "Domain events / privacy tombstones / AI logs exist; unified audit_events not 1:1",
  },
];

const IMPL_ROWS: ReqRow[] = [
  {
    id: "M0",
    requirement: "Audit baseline: matrix, debt, QA",
    status: "Shipped",
    verdict: "Keep",
    evidence: "docs/audit/*; remaining-work; canvases",
  },
  {
    id: "M1-M7",
    requirement: "Foundation→marketing→onboarding→org→artefact→evidence→PI",
    status: "Shipped",
    verdict: "Keep",
    evidence: "P0–P8 + T0–T8; do not rebuild as greenfield",
  },
  {
    id: "M8",
    requirement: "Pilot hardening: security, a11y, monitoring",
    status: "Partial",
    verdict: "Keep",
    evidence: "Batches 1–6 done; founder ops (CI/Auth) gate controlled pilot",
  },
  {
    id: "M9",
    requirement: "Launchpad foundation after evidence quality proven",
    status: "Partial",
    verdict: "Keep",
    evidence: "T7 Launchpad honesty + Career/Portfolio; marketplace still deferred",
  },
  {
    id: "CURSOR",
    requirement: "Permanent Cursor product-team rule + SoT hierarchy",
    status: "Shipped",
    verdict: "Keep",
    evidence: ".cursor/rules/deliverx.mdc + AGENTS.md",
  },
  {
    id: "BUILD-PACK-PATH",
    requirement: "Store six docs in /docs/build-pack/",
    status: "Net-new",
    verdict: "Modify",
    evidence: "Path missing; optional docs intake — not product feature",
  },
];

function statusTone(
  s: Status,
): "success" | "warning" | "info" | "neutral" | "deleted" {
  switch (s) {
    case "Shipped":
      return "success";
    case "Partial":
      return "warning";
    case "Net-new":
      return "info";
    case "Conflict":
    case "Out of charter":
      return "deleted";
    default:
      return "neutral";
  }
}

function countByStatus(rows: ReqRow[]) {
  const init: Record<string, number> = {
    Shipped: 0,
    Partial: 0,
    "Net-new": 0,
    Conflict: 0,
    "Out of charter": 0,
    "Ops / already tracked": 0,
  };
  for (const r of rows) init[r.status] = (init[r.status] ?? 0) + 1;
  return init;
}

const ALL_ROWS = [
  ...PRD_ROWS,
  ...TRD_ROWS,
  ...UX_ROWS,
  ...FLOW_ROWS,
  ...SCHEMA_ROWS,
  ...IMPL_ROWS,
];
const TOTALS = countByStatus(ALL_ROWS);

function ReqTable({ rows, caption }: { rows: ReqRow[]; caption: string }) {
  return (
    <Stack gap={8}>
      <Text tone="secondary" size="small">
        {caption}
      </Text>
      <Table
        headers={["ID", "Requirement", "Status", "Verdict", "Evidence"]}
        rows={rows.map((r) => [
          r.id,
          r.requirement,
          <Pill tone={statusTone(r.status)} size="sm">
            {r.status}
          </Pill>,
          r.verdict,
          r.evidence,
        ])}
      />
    </Stack>
  );
}

function DocPanel({
  keyId,
  rows,
  caption,
}: {
  keyId: string;
  rows: ReqRow[];
  caption: string;
}) {
  const meta = DOC_META[keyId];
  const c = countByStatus(rows);
  return (
    <Stack gap={16}>
      <Stack gap={6}>
        <H2>{meta.title}</H2>
        <Row gap={8} wrap>
          <Pill tone="info" size="sm">
            {meta.kind}
          </Pill>
          <Pill tone="neutral" size="sm">
            Audience: {meta.audience}
          </Pill>
        </Row>
        <Text>{meta.purpose}</Text>
        <Text tone="secondary">{meta.summary}</Text>
      </Stack>
      <Grid columns={4} gap={12}>
        <Stat value={String(c.Shipped)} label="Shipped" tone="success" />
        <Stat value={String(c.Partial)} label="Partial" tone="warning" />
        <Stat value={String(c["Net-new"])} label="Net-new" tone="info" />
        <Stat
          value={String((c.Conflict ?? 0) + (c["Out of charter"] ?? 0))}
          label="Conflict / OOC"
          tone="danger"
        />
      </Grid>
      <ReqTable rows={rows} caption={caption} />
    </Stack>
  );
}

export default function DeliverXSixDocGapCheck() {
  const [nav, setNav] = useCanvasState("six-doc-gap-nav", "overview");

  return (
    <Stack gap={20} style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <Row align="start" justify="space-between" gap={16} wrap>
        <Stack gap={6}>
          <H1>DeliverX Six-Doc Pack — Gap Check</H1>
          <Text tone="secondary">
            Founder Build Pack vs shipped P0–P8 / T0–T9 code · 26 Jul 2026 · docs
            intake only
          </Text>
        </Stack>
        <Select
          value={nav}
          onChange={setNav}
          options={[...NAV]}
          style={{ minWidth: 240 }}
        />
      </Row>

      {nav === "overview" && (
        <Stack gap={18}>
          <Callout tone="info" title="Verdict">
            The pack describes the same evidence loop already shipped. Most
            requirements are Shipped or Partial. Net-new items are mostly UX
            ceremony, recommendation state machine, analytics KPIs, and shell
            extras — not a rebuild. Two hard conflicts: money-back/guarantee
            language and “one company” seed vs 12-company catalogue.
          </Callout>

          <Grid columns={4} gap={12}>
            <Stat
              value={String(TOTALS.Shipped)}
              label="Shipped rows"
              tone="success"
            />
            <Stat
              value={String(TOTALS.Partial)}
              label="Partial rows"
              tone="warning"
            />
            <Stat
              value={String(TOTALS["Net-new"])}
              label="Net-new rows"
              tone="info"
            />
            <Stat
              value={String(
                (TOTALS.Conflict ?? 0) + (TOTALS["Out of charter"] ?? 0),
              )}
              label="Conflicts"
              tone="danger"
            />
          </Grid>

          <Text tone="secondary" size="small">
            Counts are requirement rows across docs 01–06 (n={ALL_ROWS.length}).
            Source: /tmp/deliverx-six-doc-pack extracts · governance
            docs/product/* · docs/engineering/remaining-work.md ·
            docs/audit/feature-completeness-matrix.md · prod
            https://www.deliverx.dev
          </Text>

          <H2>What the six documents are</H2>
          <Table
            headers={["Doc", "Title", "Kind", "Audience"]}
            rows={[
              ["00", "Build Pack Index", "Process", "All"],
              ["01", "Master PRD", "PRD / vision", "Product+QA"],
              ["02", "Technical Requirements", "Engineering spec", "Eng+Sec"],
              ["03", "UI/UX Design Spec", "Design spec", "Design+FE"],
              ["04", "End-to-End App Flow", "Journey / process", "Product+Eng"],
              ["05", "Backend Schema & Data", "Data architecture", "Data+BE"],
              ["06", "Implementation Plan", "Delivery process", "Leads+QA"],
            ]}
          />

          <H2>Evidence layers (separate carefully)</H2>
          <Grid columns={2} gap={12}>
            <Card>
              <CardHeader>Verified codebase facts</CardHeader>
              <CardBody>
                <Stack gap={6}>
                  <Text>
                    P0–P8 + T0–T9 code shipped (migrations through 0097; T9
                    payments deferred ops).
                  </Text>
                  <Text>
                    Trust rails: 0095 ScoreRun/Verified lockdown; 0096 consent;
                    AI citations; T6/T8 live E2E.
                  </Text>
                  <Text>
                    Remediations Batches 1–6 closed; CI workflows disabled
                    (TD-018).
                  </Text>
                </Stack>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>Product assumptions in the pack</CardHeader>
              <CardBody>
                <Stack gap={6}>
                  <Text>
                    First release = one org / one project / human reviewer queue.
                  </Text>
                  <Text>
                    Team Copilot remains architecture-only until loop proven.
                  </Text>
                  <Text>
                    Pack SoT sits above architecture docs and invents
                    /docs/build-pack/.
                  </Text>
                </Stack>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>Technical recommendations</CardHeader>
              <CardBody>
                <Stack gap={6}>
                  <Text>
                    Do not rename pi_* schema to pack names; map conceptually.
                  </Text>
                  <Text>
                    Prefer recommendation state machine as small vertical slice
                    if founder wants FR-010 literal.
                  </Text>
                  <Text>
                    Reject PostHog/Prisma/guarantee/one-company seed unless
                    founder overrides PD.
                  </Text>
                </Stack>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>Founder decisions required</CardHeader>
              <CardBody>
                <Stack gap={6}>
                  <Text>
                    Accept pack as advisory vs promote into SoT under Bible?
                  </Text>
                  <Text>
                    Adopt 8-step onboarding + Xperience entry ceremony?
                  </Text>
                  <Text>
                    Human reviewer ops vs keep engine+attestation primary?
                  </Text>
                </Stack>
              </CardBody>
            </Card>
          </Grid>

          <H3>Pack vs remaining-work posture</H3>
          <Text>
            Most “gaps” the pack implies are already inventoried in
            remaining-work §A (founder ops) and §B (residual eng). Only genuine
            pack-sourced net-new items belong in the delta — see Net-new tab and
            updated remaining-work §E.
          </Text>
        </Stack>
      )}

      {nav === "doc-00" && (
        <Stack gap={16}>
          <H2>{DOC_META["doc-00"].title}</H2>
          <Row gap={8} wrap>
            <Pill tone="info" size="sm">
              {DOC_META["doc-00"].kind}
            </Pill>
          </Row>
          <Text>{DOC_META["doc-00"].purpose}</Text>
          <Text tone="secondary">{DOC_META["doc-00"].summary}</Text>
          <Table
            headers={["Claim", "Status", "Verdict", "Evidence"]}
            rows={[
              [
                "Store pack in /docs/build-pack/",
                <Pill tone="info" size="sm">
                  Net-new
                </Pill>,
                "Modify",
                "Directory absent; optional docs intake",
              ],
              [
                "SoT: Charter → Scope → PDs → six docs → arch 00–07 → code",
                <Pill tone="deleted" size="sm">
                  Conflict
                </Pill>,
                "Modify",
                "Current SoT: Charter → Scope → Bible 00–15 → PDs → eng → arch → code",
              ],
              [
                "Use pack to control Cursor milestones",
                <Pill tone="warning" size="sm">
                  Partial
                </Pill>,
                "Keep",
                "deliverx.mdc already encodes product-team + charter refuse list",
              ],
              [
                "Defer long-term arch when it conflicts with Charter",
                <Pill tone="success" size="sm">
                  Shipped
                </Pill>,
                "Keep",
                "Matches Build Charter + agent rules",
              ],
            ]}
          />
        </Stack>
      )}

      {nav === "doc-01" && (
        <DocPanel
          keyId="doc-01"
          rows={PRD_ROWS}
          caption="Master PRD functional + business + NFR requirement gap table"
        />
      )}
      {nav === "doc-02" && (
        <DocPanel
          keyId="doc-02"
          rows={TRD_ROWS}
          caption="TRD stack, AI, security, and workflow requirement gap table"
        />
      )}
      {nav === "doc-03" && (
        <DocPanel
          keyId="doc-03"
          rows={UX_ROWS}
          caption="UI/UX shell, marketing, onboarding, dashboard requirement gap table"
        />
      )}
      {nav === "doc-04" && (
        <DocPanel
          keyId="doc-04"
          rows={FLOW_ROWS}
          caption="End-to-end journey and role-flow requirement gap table"
        />
      )}
      {nav === "doc-05" && (
        <DocPanel
          keyId="doc-05"
          rows={SCHEMA_ROWS}
          caption="Schema principles and integrity requirement gap table"
        />
      )}
      {nav === "doc-06" && (
        <DocPanel
          keyId="doc-06"
          rows={IMPL_ROWS}
          caption="Implementation milestones vs shipped reality"
        />
      )}

      {nav === "conflicts" && (
        <Stack gap={16}>
          <H2>Conflicts with Build Charter / trust rails</H2>
          <Callout tone="danger" title="Do not silently accept">
            Flagged items contradict Product Decisions or trust rails. Require
            explicit founder PD before any implementation that reopens them.
          </Callout>
          <Table
            headers={["Pack claim", "Rail / decision", "Risk", "Disposition"]}
            rows={[
              [
                "Pricing includes guarantee terms (UI §5)",
                "MF-D09 / Batch 2 removed money-back",
                "Legal/commercial honesty",
                "Reject",
              ],
              [
                "Seed one company + three activities",
                "PD-2026-07-03 12-company catalogue",
                "Reverts Experience breadth",
                "Reject (keep catalogue)",
              ],
              [
                "Human reviewer as primary verification",
                "Capability Engine–only writes; T8 Verified=attestation",
                "Could blur ScoreRun→Verified",
                "Modify — reviewer optional ops, not Verified path",
              ],
              [
                "Team Copilot architecture-only",
                "T7 alias shipped (not third SKU)",
                "None if left as alias; conflict if rebuilt as SKU",
                "Keep alias; refuse third SKU",
              ],
              [
                "Pack SoT above Product Bible",
                "deliverx.mdc SoT hierarchy",
                "Agents follow wrong contract",
                "Modify — pack advisory under Bible",
              ],
              [
                "Insights as primary nav product",
                "No third SKU / suite IA",
                "IA sprawl",
                "Defer / reject as product Home",
              ],
              [
                "Unexplained or decorative readiness %",
                "No unexplained scores; PD-2026-07-05",
                "Trust destruction",
                "Reject if unlabeled",
              ],
              [
                "Learning completion as capability",
                "Learning ≠ competency PD-2026-07-10",
                "False Verified/capability",
                "Reject (already enforced)",
              ],
              [
                "AI creates high-confidence verified evidence",
                "Observation≠evidence; AI provenance",
                "Fabricated trust",
                "Reject — pack itself forbids; keep enforcement",
              ],
            ]}
          />
          <Divider />
          <H3>Out of charter if expanded from pack vision language</H3>
          <Table
            headers={["Theme", "Pack signal", "Charter posture"]}
            rows={[
              [
                "Employer marketplace / opportunity OS",
                "Launchpad long-term “opportunity engine”",
                "Deferred — MF-D02",
              ],
              [
                "Enterprise Team Copilot depth",
                "Delivery intelligence for real teams",
                "Deferred — MF-D03 / alias only",
              ],
              [
                "Multi-profession frameworks",
                "Permanent PI record / breadth",
                "Deferred — MF-D04; thin pm-core",
              ],
              [
                "Microservice split of intelligence domains",
                "Five-layer future separation",
                "Deferred — taxonomy only",
              ],
            ]}
          />
        </Stack>
      )}

      {nav === "net-new" && (
        <Stack gap={16}>
          <H2>Net-new vs remaining-work.md</H2>
          <Callout tone="warning" title="Already covered — do not duplicate">
            CI (TD-018), Auth HIBP (TD-006), SMTP proof, AT lab, Stripe ops,
            R-P1-12/13, rate limits, coverage CI, marketplace/mission-control —
            already in remaining-work A/B/C.
          </Callout>

          <H3>Genuinely new pack-sourced items (added to remaining-work §E)</H3>
          <Table
            headers={["ID", "Item", "Effort", "Verdict", "Why new"]}
            rows={[
              [
                "PACK-E1",
                "Optional: copy six docs into docs/build-pack/ + index note",
                "S",
                "Defer",
                "Path requested by Index; docs-only",
              ],
              [
                "PACK-E2",
                "Formal recommendation entity + state machine (FR-010 / TRD SM)",
                "M",
                "Modify",
                "Not inventoried as first-class SM",
              ],
              [
                "PACK-E3",
                "Documented versioned confidence-band algorithm (Schema 5.1)",
                "S",
                "Keep",
                "Bands preferred; algo doc incomplete",
              ],
              [
                "PACK-E4",
                "Xperience entry ceremony screens (welcome→role→team→project)",
                "M",
                "Defer",
                "Day-1 works; ceremony is UX depth",
              ],
              [
                "PACK-E5",
                "Human reviewer ops playbook + queue usage (not Verified path)",
                "M",
                "Defer",
                "Overlaps R-P2-09 but pack makes it primary — clarify",
              ],
              [
                "PACK-E6",
                "Onboarding shape: adopt/reject 8-step conversation redesign",
                "M",
                "Defer",
                "Needs founder UX decision vs current 6-step",
              ],
              [
                "PACK-E7",
                "App-shell global search (and help) if desired",
                "M",
                "Defer",
                "Not in residual eng list",
              ],
              [
                "PACK-E8",
                "Pilot success-metric instrumentation (activation/loop KPIs)",
                "M",
                "Defer",
                "PRD targets exist; product analytics thin",
              ],
              [
                "PACK-E9",
                "PostHog (or explicit reject; keep Vercel Analytics)",
                "M",
                "Reject default",
                "TRD preference only — needs PD",
              ],
            ]}
          />

          <H3>Consolidated “still need to build” delta</H3>
          <Text>
            Priority remains founder ops (CI, Auth, SMTP, AT) then optional
            residual eng. Pack does not reopen T9 product engineering. If founder
            wants pack-literal UX, the smallest coherent slice is PACK-E2
            (explainable next-action SM) + PACK-E3 (bands algorithm doc) — not a
            schema rename or greenfield M0–M7 restart.
          </Text>
        </Stack>
      )}

      {nav === "decisions" && (
        <Stack gap={16}>
          <H2>Founder decisions required</H2>
          <Table
            headers={["ID", "Decision", "If silent (default)", "Impact"]}
            rows={[
              [
                "FD-PACK-1",
                "Promote six-doc pack into repo SoT under Bible, or keep advisory?",
                "Advisory only; Bible + Charter win",
                "Agent contract clarity",
              ],
              [
                "FD-PACK-2",
                "Copy pack into docs/build-pack/?",
                "Skip until asked",
                "Docs clutter vs founder accessibility",
              ],
              [
                "FD-PACK-3",
                "Keep 6-step PI onboarding or rebuild toward 8-step conversation?",
                "Keep shipped 6-step",
                "Onboarding eng cost",
              ],
              [
                "FD-PACK-4",
                "Invest in Xperience entry ceremony vs Day-1 sufficiency?",
                "Day-1 sufficient for pilot",
                "Experience UX depth",
              ],
              [
                "FD-PACK-5",
                "Human reviewer queue as pilot ops path (not Verified)?",
                "Leave thin; T8 attestation = Verified",
                "Ops staffing + R-P2-09",
              ],
              [
                "FD-PACK-6",
                "Formal recommendation state machine now?",
                "Defer; keep CTAs",
                "FR-010 literal completeness",
              ],
              [
                "FD-PACK-7",
                "Adopt PostHog or stay on Vercel Analytics?",
                "Stay Vercel; reject PostHog for pilot",
                "Analytics vendor surface",
              ],
              [
                "FD-PACK-8",
                "Insights nav item / global search?",
                "Reject Insights product; defer search",
                "IA / third-surface risk",
              ],
            ]}
          />
          <Callout tone="info" title="Already settled — do not reopen">
            Verification meaning (T8/PD-2026-07-25c), T9 SKUs (PD-2026-07-26d),
            learning≠capability, consent default OFF, no money-back, Team Copilot
            = Workspace alias not third SKU, 12-company catalogue.
          </Callout>
        </Stack>
      )}
    </Stack>
  );
}
