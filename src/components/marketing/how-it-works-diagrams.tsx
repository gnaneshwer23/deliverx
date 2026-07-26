import type { ReactNode, JSX } from "react";
import { mktClass } from "@/lib/marketing/landing-theme";
import type { HowItWorksDiagramId } from "@/lib/marketing/how-it-works-data";
import { HOW_IT_WORKS_PIPELINE } from "@/lib/marketing/how-it-works-data";

/** Horizontal end-to-end workflow: work → evidence → capability → career next step. */
export function HowItWorksPipeline() {
  return (
    <ol
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      aria-label="End-to-end workflow"
    >
      {HOW_IT_WORKS_PIPELINE.map((node, index) => (
        <li key={node.id} className="relative">
          <div className={`${mktClass.softPanelLight} flex h-full flex-col p-5`}>
            <span className={`${mktClass.mono} text-[0.65rem] text-[var(--mkt-green-m)]`}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className={`mt-3 text-[1.15rem] tracking-tight text-[var(--mkt-text1)] ${mktClass.serif}`}>
              {node.label}
            </p>
            <p className="mt-1 text-[0.8125rem] text-[var(--mkt-text3)]">{node.detail}</p>
          </div>
          {index < HOW_IT_WORKS_PIPELINE.length - 1 ? (
            <span
              className="pointer-events-none absolute -right-2 top-1/2 z-[1] hidden size-4 -translate-y-1/2 text-[var(--mkt-green-l)] lg:block"
              aria-hidden
            >
              →
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function DiagramShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <figure
      className={`${mktClass.softPanelLight} overflow-hidden p-4 sm:p-5`}
      aria-label={title}
    >
      <svg
        viewBox="0 0 360 180"
        className="h-auto w-full"
        role="img"
        aria-hidden
      >
        {children}
      </svg>
      <figcaption className="sr-only">{title}</figcaption>
    </figure>
  );
}

function DirectionDiagram() {
  return (
    <DiagramShell title="Map direction: profile answers guide recommendations">
      <rect x="24" y="36" width="120" height="108" rx="12" fill="var(--mkt-s2)" stroke="var(--mkt-border)" />
      <text x="84" y="58" textAnchor="middle" fontSize="10" fill="var(--mkt-text3)">
        You
      </text>
      <rect x="40" y="70" width="88" height="14" rx="4" fill="var(--mkt-s1)" stroke="var(--mkt-border)" />
      <rect x="40" y="92" width="72" height="14" rx="4" fill="var(--mkt-s1)" stroke="var(--mkt-border)" />
      <rect x="40" y="114" width="80" height="14" rx="4" fill="var(--mkt-s1)" stroke="var(--mkt-border)" />
      <path d="M150 90 H198" stroke="var(--mkt-green-l)" strokeWidth="1.5" markerEnd="url(#hiw-arrow)" />
      <rect x="204" y="48" width="132" height="84" rx="12" fill="var(--mkt-s1)" stroke="var(--mkt-green-l)" />
      <text x="270" y="74" textAnchor="middle" fontSize="11" fill="var(--mkt-text1)">
        Direction map
      </text>
      <text x="270" y="96" textAnchor="middle" fontSize="9" fill="var(--mkt-text3)">
        Self-reported · guides next
      </text>
      <text x="270" y="114" textAnchor="middle" fontSize="9" fill="var(--mkt-text3)">
        Not evidence yet
      </text>
      <defs>
        <marker id="hiw-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--mkt-green-l)" />
        </marker>
      </defs>
    </DiagramShell>
  );
}

function ContextDiagram() {
  return (
    <DiagramShell title="Enter context: company, role, team, project">
      <rect x="40" y="28" width="280" height="124" rx="14" fill="var(--mkt-s2)" stroke="var(--mkt-border)" />
      <rect x="56" y="44" width="100" height="40" rx="8" fill="var(--mkt-s1)" stroke="var(--mkt-border)" />
      <text x="106" y="68" textAnchor="middle" fontSize="10" fill="var(--mkt-text1)">
        Company
      </text>
      <rect x="168" y="44" width="68" height="40" rx="8" fill="var(--mkt-s1)" stroke="var(--mkt-border)" />
      <text x="202" y="68" textAnchor="middle" fontSize="10" fill="var(--mkt-text1)">
        Role
      </text>
      <rect x="248" y="44" width="56" height="40" rx="8" fill="var(--mkt-s1)" stroke="var(--mkt-border)" />
      <text x="276" y="68" textAnchor="middle" fontSize="10" fill="var(--mkt-text1)">
        Team
      </text>
      <rect x="56" y="100" width="248" height="36" rx="8" fill="var(--mkt-green)" />
      <text x="180" y="122" textAnchor="middle" fontSize="11" fill="white">
        Project · first activity
      </text>
    </DiagramShell>
  );
}

function WorkDiagram() {
  return (
    <DiagramShell title="Do work: decisions and artefacts you own">
      <rect x="28" y="40" width="100" height="100" rx="12" fill="var(--mkt-s2)" stroke="var(--mkt-border)" />
      <text x="78" y="72" textAnchor="middle" fontSize="10" fill="var(--mkt-text1)">
        Decision
      </text>
      <text x="78" y="92" textAnchor="middle" fontSize="9" fill="var(--mkt-text3)">
        You submit
      </text>
      <rect x="148" y="40" width="100" height="100" rx="12" fill="var(--mkt-s1)" stroke="var(--mkt-border)" />
      <text x="198" y="72" textAnchor="middle" fontSize="10" fill="var(--mkt-text1)">
        Artefact
      </text>
      <text x="198" y="92" textAnchor="middle" fontSize="9" fill="var(--mkt-text3)">
        PRD · plan
      </text>
      <rect x="248" y="52" width="88" height="76" rx="12" fill="var(--mkt-s2)" stroke="var(--mkt-border)" strokeDasharray="4 3" />
      <text x="292" y="84" textAnchor="middle" fontSize="10" fill="var(--mkt-text3)">
        AI draft
      </text>
      <text x="292" y="102" textAnchor="middle" fontSize="8" fill="var(--mkt-text3)">
        labelled
      </text>
    </DiagramShell>
  );
}

function ReviewDiagram() {
  return (
    <DiagramShell title="Review: evidence with provenance, then capability judgement">
      <rect x="24" y="48" width="96" height="84" rx="10" fill="var(--mkt-s2)" stroke="var(--mkt-border)" />
      <text x="72" y="78" textAnchor="middle" fontSize="10" fill="var(--mkt-text1)">
        Evidence
      </text>
      <text x="72" y="98" textAnchor="middle" fontSize="8" fill="var(--mkt-text3)">
        + provenance
      </text>
      <path d="M126 90 H158" stroke="var(--mkt-green-l)" strokeWidth="1.5" />
      <rect x="162" y="40" width="110" height="100" rx="10" fill="var(--mkt-s1)" stroke="var(--mkt-green-l)" />
      <text x="217" y="72" textAnchor="middle" fontSize="10" fill="var(--mkt-text1)">
        Capability Engine
      </text>
      <text x="217" y="92" textAnchor="middle" fontSize="8" fill="var(--mkt-text3)">
        Framework band
      </text>
      <text x="217" y="110" textAnchor="middle" fontSize="8" fill="var(--mkt-text3)">
        Explainable
      </text>
      <rect x="286" y="56" width="54" height="68" rx="10" fill="var(--mkt-s2)" stroke="var(--mkt-border)" />
      <text x="313" y="88" textAnchor="middle" fontSize="8" fill="var(--mkt-text3)">
        Verified
      </text>
      <text x="313" y="104" textAnchor="middle" fontSize="7" fill="var(--mkt-text3)">
        attest only
      </text>
    </DiagramShell>
  );
}

function UseDiagram() {
  return (
    <DiagramShell title="Use the record across Experience, Launchpad and Workspace">
      <rect x="40" y="70" width="72" height="48" rx="10" fill="var(--mkt-s2)" stroke="var(--mkt-border)" />
      <text x="76" y="98" textAnchor="middle" fontSize="9" fill="var(--mkt-text1)">
        PI record
      </text>
      <path d="M118 94 H148" stroke="var(--mkt-green-l)" strokeWidth="1.5" />
      <rect x="152" y="28" width="72" height="40" rx="8" fill="var(--mkt-s1)" stroke="var(--mkt-border)" />
      <text x="188" y="52" textAnchor="middle" fontSize="9" fill="var(--mkt-text1)">
        Experience
      </text>
      <rect x="152" y="78" width="72" height="40" rx="8" fill="var(--mkt-green)" />
      <text x="188" y="102" textAnchor="middle" fontSize="9" fill="white">
        Launchpad
      </text>
      <rect x="152" y="128" width="72" height="36" rx="8" fill="var(--mkt-s1)" stroke="var(--mkt-border)" />
      <text x="188" y="150" textAnchor="middle" fontSize="8" fill="var(--mkt-text1)">
        Workspace
      </text>
      <rect x="248" y="60" width="80" height="68" rx="10" fill="var(--mkt-s2)" stroke="var(--mkt-border)" />
      <text x="288" y="88" textAnchor="middle" fontSize="9" fill="var(--mkt-text1)">
        Next action
      </text>
      <text x="288" y="106" textAnchor="middle" fontSize="8" fill="var(--mkt-text3)">
        explainable
      </text>
    </DiagramShell>
  );
}

const DIAGRAMS: Record<HowItWorksDiagramId, () => JSX.Element> = {
  direction: DirectionDiagram,
  context: ContextDiagram,
  work: WorkDiagram,
  review: ReviewDiagram,
  use: UseDiagram,
};

export function HowItWorksStepDiagram({ id }: { id: HowItWorksDiagramId }) {
  const Diagram = DIAGRAMS[id];
  return <Diagram />;
}
