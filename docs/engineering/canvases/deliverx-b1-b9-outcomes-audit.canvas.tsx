import {
  Callout,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Grid,
  H1,
  H2,
  Pill,
  Row,
  Select,
  Stack,
  Stat,
  Table,
  Text,
  useCanvasState,
} from "cursor/canvas";

type Grade = "Strong" | "Adequate" | "Weak" | "Incomplete";
type Leverage = "High" | "Med" | "Low" | "—";
type View =
  | "summary"
  | "B0"
  | "B1"
  | "B2"
  | "B3"
  | "B4"
  | "B5"
  | "B6"
  | "B7"
  | "B8"
  | "B9"
  | "efficiency"
  | "system"
  | "backlog";

type PhaseRow = {
  phase: string;
  objective: string;
  shipped: string;
  dod: string;
  verify: string;
  residual: string;
  grade: Grade;
  leverage: Leverage;
  commit: string;
};

const HEAD = "2e3d4fd";
const AUDIT_DATE = "2026-07-26";

const NAV: { value: View; label: string }[] = [
  { value: "summary", label: "Summary" },
  { value: "B0", label: "B0" },
  { value: "B1", label: "B1" },
  { value: "B2", label: "B2" },
  { value: "B3", label: "B3" },
  { value: "B4", label: "B4" },
  { value: "B5", label: "B5" },
  { value: "B6", label: "B6" },
  { value: "B7", label: "B7" },
  { value: "B8", label: "B8" },
  { value: "B9", label: "B9" },
  { value: "efficiency", label: "Efficiency" },
  { value: "system", label: "System" },
  { value: "backlog", label: "Backlog" },
];

const PHASES: PhaseRow[] = [
  {
    phase: "B0",
    objective: "Archive pack into docs/build-pack/ without elevating above Bible.",
    shipped: "Nothing — docs/build-pack/ absent; intake via gap-check docs only.",
    dod: "No (optional; FD-PACK-1/2)",
    verify: "Path spot-check MISS",
    residual: "SoT confusion if Desktop pack treated as higher SoT",
    grade: "Incomplete",
    leverage: "—",
    commit: "—",
  },
  {
    phase: "B1",
    objective: "Understand confidence bands without pseudo-% theatre.",
    shipped: "confidence-bands@2026.1 + algorithm doc + Why-this-band UI; no migration.",
    dod: "Met",
    verify: "Unit in test:pi",
    residual: "Future band changes need version bump",
    grade: "Strong",
    leverage: "High",
    commit: "f4a7fc5",
  },
  {
    phase: "B2",
    objective: "Explainable dismissible next actions with retained rationale (FR-010).",
    shipped: "0098 SM + recommendations SoT + Profile/Career UI; flag on in prod.",
    dod: "Met",
    verify: "Units + prod migrate + flag docs",
    residual: "Next-action quality capped by thin pm-core",
    grade: "Strong",
    leverage: "High",
    commit: "6574449",
  },
  {
    phase: "B3",
    objective: "Measure activation/loop vs PRD targets without vanity dashboards.",
    shipped: "Typed Vercel KPI catalogue + PII sanitizer; PostHog deferred.",
    dod: "Met (Vercel path)",
    verify: "Units; dashboard ops not re-checked",
    residual: "No ready activation-% board; FD-PACK-7 open",
    grade: "Adequate",
    leverage: "Med",
    commit: "59f32d0",
  },
  {
    phase: "B4",
    objective: "Structured review without lighting deliverxVerified.",
    shipped: "Queue + playbook + trust guards; flag default off.",
    dod: "Met (code); prod queue off",
    verify: "Trust + SM units; release-gate",
    residual: "Unused until founder enables flag",
    grade: "Adequate",
    leverage: "Med",
    commit: "52eb654",
  },
  {
    phase: "B5",
    objective: "Clearer first-run personalisation (founder chose 8-step).",
    shipped: "v2-conversation + 0099 + skip/review/claim labels; rollback flag.",
    dod: "Met",
    verify: "Units + prod 0099",
    residual: "Longer funnel vs activation",
    grade: "Strong",
    leverage: "High",
    commit: "a6ac193",
  },
  {
    phase: "B6",
    objective: "Coherent company→role→team→project→first activity narrative.",
    shipped: "Ceremony over sim state; kill-switch on; no migration/API.",
    dod: "Met",
    verify: "17 ceremony units",
    residual: "Still Day-1 depth (honest)",
    grade: "Adequate",
    leverage: "Med",
    commit: "5f7d1f0",
  },
  {
    phase: "B7",
    objective: "Find profile/evidence/projects without new product Home.",
    shipped: "Cmd/Ctrl+K + /help + self-only search; no Insights.",
    dod: "Met",
    verify: "Units + Insights-omit test",
    residual: "Owner filters must stay as surface grows",
    grade: "Strong",
    leverage: "High",
    commit: "844c81e",
  },
  {
    phase: "B8",
    objective: "Operate one pilot org/project safely without enterprise CMS.",
    shipped: "/settings/admin + audited APIs; follow-up 0100 org-admin UPDATE.",
    dod: "Met after 0100",
    verify: "Units + signed-in prod spot-check",
    residual: "Thin by design; structure seed often empty",
    grade: "Adequate",
    leverage: "Med",
    commit: "0d1102b → f9ca5d7",
  },
  {
    phase: "B9",
    objective: "Rate-limit / recovery / activity-state honesty without new SKUs.",
    shipped: "0101+0102 atomic RPC; 429/409 honesty; activity SM.",
    dod: "Met",
    verify: "Units; 0101 prod; HEAD=atomic fix",
    residual: "CI dark (TD-018); load tuning open",
    grade: "Strong",
    leverage: "High",
    commit: "cd9f656 → 2e3d4fd",
  },
];

const GRADE_TONE: Record<Grade, "success" | "warning" | "deleted" | "neutral"> = {
  Strong: "success",
  Adequate: "warning",
  Weak: "deleted",
  Incomplete: "neutral",
};

function gradeCounts() {
  const counts: Record<Grade, number> = {
    Strong: 0,
    Adequate: 0,
    Weak: 0,
    Incomplete: 0,
  };
  for (const p of PHASES) counts[p.grade] += 1;
  return counts;
}

function PhaseDetail({ row }: { row: PhaseRow }) {
  return (
    <Stack gap={12}>
      <Row gap={8} align="center" wrap>
        <Pill tone={GRADE_TONE[row.grade]} active>
          {row.grade}
        </Pill>
        <Pill tone="neutral">Leverage {row.leverage}</Pill>
        <Pill tone="neutral">DoD: {row.dod}</Pill>
        {row.commit !== "—" ? <Pill tone="info">{row.commit}</Pill> : null}
      </Row>
      <Card>
        <CardHeader>Objective</CardHeader>
        <CardBody>
          <Text>{row.objective}</Text>
        </CardBody>
      </Card>
      <Grid columns={2} gap={12}>
        <Card>
          <CardHeader>What shipped</CardHeader>
          <CardBody>
            <Text>{row.shipped}</Text>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>Verification</CardHeader>
          <CardBody>
            <Text>{row.verify}</Text>
          </CardBody>
        </Card>
      </Grid>
      <Card>
        <CardHeader>Residual risk</CardHeader>
        <CardBody>
          <Text>{row.residual}</Text>
        </CardBody>
      </Card>
    </Stack>
  );
}

function SummaryView() {
  const counts = gradeCounts();
  return (
    <Stack gap={16}>
      <Callout tone="success" title="Overall verdict">
        B1–B9 closed the six-doc Missing/Partial remainder with strong charter
        discipline — trust rails intact, no Insights/PostHog/Stripe chase, no M0–M7
        restart. Pilot-ready: Conditional (product loop yes; founder ops still gate).
      </Callout>
      <Grid columns={4} gap={12}>
        <Stat value={String(counts.Strong)} label="Strong" tone="success" />
        <Stat value={String(counts.Adequate)} label="Adequate" tone="warning" />
        <Stat value={String(counts.Weak)} label="Weak" tone="danger" />
        <Stat value={String(counts.Incomplete)} label="Incomplete" />
      </Grid>
      <Grid columns={3} gap={12}>
        <Stat value="Conditional" label="Pilot-ready" tone="warning" />
        <Stat value={HEAD.slice(0, 7)} label="Audit HEAD" />
        <Stat value="Intact" label="Trust rails" tone="success" />
      </Grid>
      <Table
        headers={["Phase", "Grade", "Leverage", "DoD", "Commit"]}
        rows={PHASES.map((p) => [
          p.phase,
          p.grade,
          p.leverage,
          p.dod,
          p.commit,
        ])}
        rowTone={PHASES.map((p) =>
          p.grade === "Strong"
            ? "success"
            : p.grade === "Adequate"
              ? "warning"
              : p.grade === "Incomplete"
                ? "neutral"
                : "danger",
        )}
      />
      <Text tone="secondary" size="small">
        Source: docs/engineering/b1-b9-outcomes-efficiency-audit.md · {AUDIT_DATE} ·
        HEAD {HEAD}
      </Text>
    </Stack>
  );
}

function EfficiencyView() {
  return (
    <Stack gap={16}>
      <H2>Efficiency</H2>
      <Grid columns={2} gap={12}>
        <Card>
          <CardHeader>Top leverage wins</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>B2 formal next-action SM closes FR-010 / loop gap.</Text>
              <Text>B1 versioned bands unlock explainability without score theater.</Text>
              <Text>B9 rate-limit + atomic fix closes R-P2-06 with verify→fix loop.</Text>
            </Stack>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>Waste / residual risks</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>TD-018 CI dark — continuous proof for Bn still missing.</Text>
              <Text>B4 shipped but prod queue flag off (utilization deferred).</Text>
              <Text>B3 emits events without an ops activation dashboard.</Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>
      <Table
        headers={["Risk area", "Finding"]}
        rows={[
          ["Mission-control / third SKU", "Avoided — B8 thin; alias only"],
          ["Insights Home", "Avoided — B7 omit + test"],
          ["PostHog", "Avoided — FD-PACK-7 open"],
          ["Live Stripe chase", "Avoided — payments later"],
          ["Pack M0–M7 restart", "Avoided — Bn remainder only"],
        ]}
      />
      <Callout tone="info" title="Migration / flag discipline">
        0098–0102 purposeful; 0100 and 0102 are verify-driven follow-ups. Kill-switches
        documented; B2 on in prod; B4 off by design.
      </Callout>
    </Stack>
  );
}

function SystemView() {
  return (
    <Stack gap={16}>
      <H2>System-level outcomes</H2>
      <Table
        headers={["Pilot question", "Better?", "Driver"]}
        rows={[
          ["Who am I here?", "Yes", "B5 identity review"],
          ["What evidence do I have?", "Yes", "Ledger + B7 search"],
          ["What confidence on claims?", "Yes", "B1 bands"],
          ["What next?", "Yes", "B2 recommendations"],
          ["How do I enter/operate?", "Yes", "B6 + B8 thin admin"],
        ]}
      />
      <Table
        headers={["Loop stage", "Status"]}
        rows={[
          ["Evidence", "Intact"],
          ["Capability (engine-only)", "Intact"],
          ["PI explainability", "Improved (B1)"],
          ["Next action", "Closed pack gap (B2)"],
          ["Loop measurement", "Partial (B3 emits; board thin)"],
        ]}
      />
      <Callout tone="warning" title="Pilot-ready: Conditional">
        Controlled pilot of the candidate loop is product-ready. Do not claim continuous
        CI, whole-product AA, live paid access, or measured PRD activation targets yet.
      </Callout>
    </Stack>
  );
}

function BacklogView() {
  return (
    <Stack gap={16}>
      <H2>Open backlog after B1–B9</H2>
      <Table
        headers={["Rank", "Action", "Owner", "Why"]}
        rows={[
          ["1", "TD-018 restore CI minutes / workflows", "Founder", "Protect everything just shipped"],
          ["2", "TD-006 HIBP + SMTP reset proof", "Founder", "Auth hygiene for real candidates"],
          ["3", "AT lab or enable B4 only if needed", "Founder/ops", "AA claim / dispute path"],
          ["—", "Stripe when payments later is now", "Founder", "Not eng chase"],
          ["—", "FD-PACK-7 PostHog if Vercel insufficient", "Founder", "Optional sink"],
          ["—", "B0 pack archive", "Founder ask", "Docs-only optional"],
          ["—", "R-P1-12 / R-P1-13 residual trust", "Engineering", "Optional after ops"],
        ]}
      />
      <Callout tone="danger" title="Stop">
        Bn feature expansion · Insights · PostHog-by-default · Stripe eng · mission-control
        · pack M0–M7 restart.
      </Callout>
    </Stack>
  );
}

export default function DeliverXB1B9OutcomesAudit() {
  const [view, setView] = useCanvasState<View>("view", "summary");
  const phase = PHASES.find((p) => p.phase === view);

  return (
    <Stack gap={20}>
      <Stack gap={6}>
        <H1>DeliverX B0–B9 outcomes & efficiency</H1>
        <Text tone="secondary">
          Six-doc build-out audit · {AUDIT_DATE} · HEAD {HEAD} · production
          deliverx.dev
        </Text>
      </Stack>

      <Row gap={8} align="center" wrap>
        <Text weight="semibold">View</Text>
        <Select
          value={view}
          onChange={(v) => setView(v as View)}
          options={NAV.map((n) => ({ value: n.value, label: n.label }))}
        />
      </Row>

      <Divider />

      {view === "summary" ? <SummaryView /> : null}
      {phase ? (
        <Stack gap={12}>
          <H2>
            {phase.phase} — outcome scorecard
          </H2>
          <PhaseDetail row={phase} />
        </Stack>
      ) : null}
      {view === "efficiency" ? <EfficiencyView /> : null}
      {view === "system" ? <SystemView /> : null}
      {view === "backlog" ? <BacklogView /> : null}
    </Stack>
  );
}
