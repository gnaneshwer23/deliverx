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

const NAV = [
  { value: "overview", label: "Overview" },
  { value: "ledger", label: "Built vs missing" },
  { value: "phases", label: "Phases B0–B9" },
  { value: "b1", label: "B1 detail" },
  { value: "b2", label: "B2 detail" },
  { value: "b3", label: "B3 detail" },
  { value: "blocked", label: "Blocked / not-in-scope" },
] as const;

type Status = "Built" | "Partial" | "Missing" | "Conflicts" | "Out of charter";

function statusTone(
  s: Status,
): "success" | "warning" | "info" | "deleted" | "neutral" {
  switch (s) {
    case "Built":
      return "success";
    case "Partial":
      return "warning";
    case "Missing":
      return "info";
    case "Conflicts":
    case "Out of charter":
      return "deleted";
    default:
      return "neutral";
  }
}

const COUNTS = [
  { status: "Built" as Status, n: 28, note: "Core loop + trust rails + T0–T9 code" },
  { status: "Partial" as Status, n: 28, note: "Remainder → Bn or remaining-work A/B" },
  { status: "Missing" as Status, n: 9, note: "PACK-E1…E9 net-new" },
  { status: "Conflicts" as Status, n: 5, note: "Reject / modify-with-PD" },
  { status: "Out of charter" as Status, n: 4, note: "Marketplace / SKU / multi-prof / µsvc" },
];

const LEDGER_HIGHLIGHT: Array<{
  id: string;
  src: string;
  req: string;
  status: Status;
  verdict: string;
  evidence: string;
}> = [
  {
    id: "FR-002",
    src: "01 PRD",
    req: "Account + protected routes",
    status: "Built",
    verdict: "Keep",
    evidence: "Auth + e2e/t0-signed-in-loop.test.ts",
  },
  {
    id: "FR-006",
    src: "01 PRD",
    req: "Versioned artefacts",
    status: "Built",
    verdict: "Keep",
    evidence: "0088_artefact_versions.sql",
  },
  {
    id: "FR-008/009",
    src: "01 PRD",
    req: "Capability map + PI explanation",
    status: "Built",
    verdict: "Keep",
    evidence: "capability-engine/ + growth reports + citations",
  },
  {
    id: "FLOW-E2E",
    src: "04 Flow",
    req: "Primary evidence loop E2E",
    status: "Built",
    verdict: "Keep",
    evidence: "T6 LIVE + T8 attestation E2E",
  },
  {
    id: "TRD-AI-*",
    src: "02 TRD",
    req: "Bounded agents + evidence boundary",
    status: "Built",
    verdict: "Keep",
    evidence: "0090 + citations.ts + 0095/0096",
  },
  {
    id: "FR-003",
    src: "01 PRD",
    req: "Personalised onboarding",
    status: "Partial",
    verdict: "Modify",
    evidence: "6-step pi-onboarding; 8-step missing (B5)",
  },
  {
    id: "FR-007",
    src: "01 PRD",
    req: "Reviewer/controlled verification",
    status: "Partial",
    verdict: "Modify",
    evidence: "Engine+T8 built; human queue thin (B4)",
  },
  {
    id: "FR-010",
    src: "01 PRD",
    req: "Next action + rationale",
    status: "Partial",
    verdict: "Modify",
    evidence: "CTAs exist; recommendation SM missing (B2)",
  },
  {
    id: "SCH-BANDS",
    src: "05 Schema",
    req: "Versioned confidence-band algo",
    status: "Partial",
    verdict: "Keep",
    evidence: "Levels in engine; algo doc missing (B1)",
  },
  {
    id: "TRD-SM-REC",
    src: "02 TRD",
    req: "Recommendation state machine",
    status: "Missing",
    verdict: "Modify",
    evidence: "No pi_recommendations SM (PACK-E2 / B2)",
  },
  {
    id: "METRICS",
    src: "01 PRD",
    req: "Activation/loop KPI targets",
    status: "Missing",
    verdict: "Defer",
    evidence: "Not instrumented (PACK-E8 / B3)",
  },
  {
    id: "TRD-ANALYTICS",
    src: "02 TRD",
    req: "PostHog product events",
    status: "Missing",
    verdict: "Defer",
    evidence: "Vercel Analytics only; FD-PACK-7 (B3)",
  },
  {
    id: "UX-SHELL",
    src: "03 UX",
    req: "Global search + help",
    status: "Partial",
    verdict: "Modify",
    evidence: "Notifs/account exist; search missing (B7)",
  },
  {
    id: "IMPL-PATH",
    src: "06 Impl",
    req: "docs/build-pack/ archive",
    status: "Missing",
    verdict: "Defer",
    evidence: "Directory absent (B0)",
  },
  {
    id: "UX-PRICING-G",
    src: "03 UX",
    req: "Guarantee terms on pricing",
    status: "Conflicts",
    verdict: "Reject",
    evidence: "GUARANTEE honesty + MF-D09",
  },
  {
    id: "SCH-SEED-ONE",
    src: "05 Schema",
    req: "One-company seed",
    status: "Conflicts",
    verdict: "Reject",
    evidence: "0079 12-company catalogue / PD-07-03",
  },
  {
    id: "OOC-01",
    src: "Pack vision",
    req: "Marketplace liquidity",
    status: "Out of charter",
    verdict: "Defer",
    evidence: "MF-D02 / Build Charter",
  },
];

const PHASES: Array<{
  id: string;
  title: string;
  size: string;
  ids: string;
  blocked: string;
  value: string;
}> = [
  {
    id: "B0",
    title: "Archive pack + advisory SoT note",
    size: "S",
    ids: "IMPL-PATH, PACK-E1, CX-03",
    blocked: "FD-PACK-1/2 optional",
    value: "Founder-accessible docs without elevating pack above Bible",
  },
  {
    id: "B1",
    title: "Confidence-band algorithm doc + labels",
    size: "S",
    ids: "SCH-BANDS, PACK-E3",
    blocked: "—",
    value: "Explainable bands; no unexplained scores",
  },
  {
    id: "B2",
    title: "Recommendation entity + state machine",
    size: "M",
    ids: "FR-010, TRD-SM-REC, PACK-E2",
    blocked: "FD-PACK-6",
    value: "Dismissible next actions with retained rationale",
  },
  {
    id: "B3",
    title: "Pilot KPI event layer (provider-agnostic)",
    size: "M",
    ids: "METRICS, NFR-OBS, PACK-E8/E9",
    blocked: "FD-PACK-7 for PostHog sink",
    value: "Measure activation/loop vs PRD targets",
  },
  {
    id: "B4",
    title: "Human reviewer ops (non-Verified)",
    size: "M",
    ids: "FR-007 rem, FLOW-REVIEWER, PACK-E5",
    blocked: "FD-PACK-5",
    value: "Structured review without lighting Verified",
  },
  {
    id: "B5",
    title: "Onboarding shape (6-step vs 8-step)",
    size: "M",
    ids: "FR-003, UX-ONB-8, PACK-E6",
    blocked: "FD-PACK-3",
    value: "Clearer first-run personalisation or confirm shipped",
  },
  {
    id: "B6",
    title: "Xperience entry ceremony",
    size: "M",
    ids: "FR-005 rem, FLOW-XP-ENTRY, PACK-E4",
    blocked: "FD-PACK-4",
    value: "Company→role→team→project→activity narrative",
  },
  {
    id: "B7",
    title: "Shell search + help (no Insights product)",
    size: "M",
    ids: "UX-SHELL, PACK-E7, CX-05",
    blocked: "FD-PACK-8",
    value: "Find own resources without third Home",
  },
  {
    id: "B8",
    title: "Thin admin org/project config",
    size: "M",
    ids: "FR-011, FLOW-ADMIN",
    blocked: "Founder OK depth",
    value: "Operate pilot org safely",
  },
  {
    id: "B9",
    title: "NFR polish (rate limit, recovery, activity honesty)",
    size: "M",
    ids: "TRD-SEC-RATE, FLOW-FAIL, TRD-SM-ACTIVITY",
    blocked: "Prefer TD-018 for CI proof",
    value: "Hardening matching TRD without new SKUs",
  },
];

function PhaseDetail({
  id,
  objective,
  reuse,
  db,
  apis,
  ai,
  ux,
  ac,
  dod,
}: {
  id: string;
  objective: string;
  reuse: string;
  db: string;
  apis: string;
  ai: string;
  ux: string;
  ac: string;
  dod: string;
}) {
  const p = PHASES.find((x) => x.id === id)!;
  return (
    <Stack gap={14}>
      <Stack gap={6}>
        <H2>
          {p.id} — {p.title}
        </H2>
        <Row gap={8} wrap>
          <Pill tone="info" size="sm">
            Size {p.size}
          </Pill>
          <Pill tone={p.blocked === "—" ? "success" : "warning"} size="sm">
            {p.blocked === "—" ? "Unblocked" : p.blocked}
          </Pill>
        </Row>
        <Text>{objective}</Text>
      </Stack>
      <Table
        headers={["Facet", "Plan"]}
        rows={[
          ["Requirement IDs", p.ids],
          ["Reuse", reuse],
          ["DB (after 0097)", db],
          ["APIs", apis],
          ["AI / citations", ai],
          ["UX", ux],
          ["AC / tests", ac],
          ["Definition of Done", dod],
        ]}
      />
    </Stack>
  );
}

export default function DeliverXSixDocBuildPhases() {
  const [nav, setNav] = useCanvasState("six-doc-build-phases-nav", "overview");

  return (
    <Stack gap={20} style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <Row align="start" justify="space-between" gap={16} wrap>
        <Stack gap={6}>
          <H1>Six-Doc Pack — Built vs Missing + B Phases</H1>
          <Text tone="secondary">
            Candidate next scope · not Charter-authorised until founder picks a
            Bn · migration head 0097 · 26 Jul 2026
          </Text>
        </Stack>
        <Select
          value={nav}
          onChange={setNav}
          options={[...NAV]}
          style={{ minWidth: 220 }}
        />
      </Row>

      {nav === "overview" && (
        <Stack gap={18}>
          <Callout tone="info" title="Recommended next: B1">
            Document and label the versioned confidence-band algorithm (size S,
            unblocked). Do not restart pack M0–M7. Payments stay founder ops.
          </Callout>

          <Grid columns={5} gap={10}>
            <Stat value="28" label="Built" tone="success" />
            <Stat value="28" label="Partial" tone="warning" />
            <Stat value="9" label="Missing" tone="info" />
            <Stat value="5" label="Conflicts" tone="danger" />
            <Stat value="4" label="Out of charter" tone="danger" />
          </Grid>
          <Text tone="secondary" size="small">
            Total 74 material rows · reconciled with gap check 2fed883 · full
            ledger in docs/engineering/six-doc-build-phases.md
          </Text>

          <H2>Phase order (dependency)</H2>
          <Table
            headers={["Phase", "One-liner", "Size", "Blocked on"]}
            rows={PHASES.map((p) => [
              p.id,
              p.title,
              p.size,
              p.blocked,
            ])}
          />

          <Grid columns={2} gap={12}>
            <Card>
              <CardHeader>Verified facts</CardHeader>
              <CardBody>
                <Text>
                  P0–P8 + T0–T9 code; trust rails 0095/0096; citations; catalogue
                  0079; suite nav without Insights; Vercel Analytics not PostHog.
                </Text>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>Correction vs earlier gap check</CardHeader>
              <CardBody>
                <Text>
                  Live GUARANTEE copy already disclaims money-back. Conflict is
                  the pack UX asking for guarantee terms — Reject pack claim, not
                  a product bug.
                </Text>
              </CardBody>
            </Card>
          </Grid>
        </Stack>
      )}

      {nav === "ledger" && (
        <Stack gap={16}>
          <H2>Built vs missing ledger (highlights)</H2>
          <Text tone="secondary">
            De-duplicated highlights across docs 01–06. Full 74-row table lives
            in six-doc-build-phases.md.
          </Text>
          <Table
            headers={["ID", "Doc", "Requirement", "Status", "Verdict", "Evidence"]}
            rows={LEDGER_HIGHLIGHT.map((r) => [
              r.id,
              r.src,
              r.req,
              <Pill tone={statusTone(r.status)} size="sm">
                {r.status}
              </Pill>,
              r.verdict,
              r.evidence,
            ])}
          />
          <Divider />
          <H3>Status legend</H3>
          <Table
            headers={["Status", "Count", "Meaning"]}
            rows={COUNTS.map((c) => [
              <Pill tone={statusTone(c.status)} size="sm">
                {c.status}
              </Pill>,
              String(c.n),
              c.note,
            ])}
          />
        </Stack>
      )}

      {nav === "phases" && (
        <Stack gap={16}>
          <H2>Build-out phases B0–B9</H2>
          <Callout tone="warning" title="Not pack M0–M7">
            Fresh series for Missing + Partial remainder only. Pack M1–M7 are
            already Built for the core loop.
          </Callout>
          <Table
            headers={["Phase", "Objective", "IDs", "Size", "Gate"]}
            rows={PHASES.map((p) => [
              p.id,
              p.value,
              p.ids,
              p.size,
              p.blocked,
            ])}
          />
          <H3>Reuse / migration head</H3>
          <Text>
            Current migration head is 0097_stripe_entitlements.sql. B2/B3 may
            introduce 0098+. Payments / enforce remain founder ops — not a Bn.
          </Text>
        </Stack>
      )}

      {nav === "b1" && (
        <PhaseDetail
          id="B1"
          objective="Candidates and employers understand confidence bands without pseudo-% theatre. Recommended first engineering slice."
          reuse="capability-engine levels (emerging, …), SnapshotClaims, PD-2026-07-05"
          db="Prefer none; optional 0098 version pin only"
          apis="None required; may expose algorithmVersion on reads"
          ai="No new agents; coach citations already required if bands cited"
          ux="Why this band copy; no decorative readiness %"
          ac="Band mapping units; test:pi if engine touched"
          dod="Versioned algorithm documented; UI labels match; tests green"
        />
      )}

      {nav === "b2" && (
        <PhaseDetail
          id="B2"
          objective="Explainable, dismissible next actions with retained rationale (FR-010 literal)."
          reuse="Capability snapshot recommendations, Career matching, Profile CTAs"
          db="0098/0099 pi_recommendations + links; RLS self-only"
          apis="GET/POST/PATCH /api/pi/recommendations"
          ai="Optional wording only; cite goal/evidence/gap; no capability writes"
          ux="Hub/Profile next actions with accept/dismiss"
          ac="State-transition units; RLS negatives; test:pi; release-gate if ledger-adjacent"
          dod="SM persisted; dismiss does not alter evidence; flag default off"
        />
      )}

      {nav === "b3" && (
        <PhaseDetail
          id="B3"
          objective="Instrument activation / loop KPIs. Provider-agnostic; PostHog optional after FD-PACK-7 (MCP available)."
          reuse="Vercel Analytics; ai_interactions cost/latency; domain events"
          db="Optional analytics_events; else provider-only"
          apis="Internal emit helper only"
          ai="Correlate funnel events to interaction IDs where useful"
          ux="None for pilot (ops view later)"
          ac="Event contract tests; no PII in props"
          dod="Catalogue + core funnel emits; DELIVERX_ANALYTICS=vercel|posthog|off"
        />
      )}

      {nav === "blocked" && (
        <Stack gap={16}>
          <H2>Founder decisions gating Bn</H2>
          <Table
            headers={["ID", "Decision", "Default if silent", "Blocks"]}
            rows={[
              ["FD-PACK-1", "Pack advisory vs SoT under Bible", "Advisory", "B0 framing"],
              ["FD-PACK-2", "Copy into docs/build-pack/?", "Skip", "B0"],
              ["FD-PACK-3", "6-step vs 8-step onboarding", "Keep 6-step", "B5"],
              ["FD-PACK-4", "Entry ceremony vs Day-1", "Day-1 enough", "B6"],
              ["FD-PACK-5", "Reviewer ops (non-Verified)?", "Leave thin", "B4"],
              ["FD-PACK-6", "Recommendation SM now?", "Defer", "B2"],
              ["FD-PACK-7", "PostHog vs Vercel", "Stay Vercel", "B3 PostHog sink"],
              ["FD-PACK-8", "Search/help (no Insights)?", "Defer search", "B7"],
            ]}
          />
          <H2>Founder ops (parallel, not Bn)</H2>
          <Table
            headers={["Item", "Blocks"]}
            rows={[
              ["TD-018 CI minutes", "Continuous proof / B9 confidence"],
              ["TD-006 leaked-password", "Auth hygiene"],
              ["SMTP reset proof", "Recovery confidence"],
              ["AT lab", "Whole-product AA claim"],
              ["Stripe ops + enforce", "Live paid access only (payments later)"],
            ]}
          />
          <H2>Not in scope</H2>
          <Table
            headers={["Item", "Why"]}
            rows={[
              ["Marketplace / employer liquidity", "Charter / MF-D02"],
              ["Third SKU / mission-control depth", "T7 alias only"],
              ["Multi-profession beyond pm-core", "MF-D04"],
              ["Graph DB / microservices", "MF-D05"],
              ["Guarantee / money-back", "MF-D09 Reject"],
              ["Live payments eng chase", "Payments later ops"],
              ["Pack M0–M7 restart", "Already Built"],
              ["Schema rename to pack names", "pi_* SoT"],
              ["Insights product Home", "IA / third-surface"],
              ["Add Prisma", "Typed Supabase chosen"],
            ]}
          />
        </Stack>
      )}
    </Stack>
  );
}
