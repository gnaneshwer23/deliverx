import type {
  CapabilityCoverage,
  CapabilityCoverageRow,
} from "@/lib/capability-coverage/types";

type Props = {
  coverage: CapabilityCoverage;
};

const BASIS_TONE: Record<CapabilityCoverageRow["basis"], string> = {
  assessed: "border-[#1C4A2E] text-[#1C4A2E]",
  insufficient_evidence: "border-[#B7791F] text-[#8A5A00]",
  not_assessed: "border-[#C9C6BC] text-[#6B6B64]",
};

/**
 * Capability Coverage Map — a calm, read-only view that lists every capability
 * in the pinned framework and states an explainable basis for each. No scores,
 * no capability writes, no Verified lighting.
 */
export function CapabilityCoveragePanel({ coverage }: Props) {
  return (
    <section
      aria-labelledby="capability-coverage-heading"
      className="mb-8 overflow-hidden rounded-lg border border-[#E5E2D9] bg-white"
    >
      <div className="border-b border-[#E5E2D9] p-5 sm:p-6">
        <p className="font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-[0.16em] text-[#6B6B64]">
          Capability coverage · {coverage.frameworkSlug}@{coverage.frameworkVersion}
        </p>
        <h2
          id="capability-coverage-heading"
          className="mt-2 font-[family-name:var(--font-display)] text-xl text-[#1A1A18]"
        >
          What you have demonstrated, and what supports it
        </h2>
        <p className="mt-1 text-sm text-[#4A4A45]">
          Every capability in {coverage.frameworkTitle} with an honest basis —{" "}
          {coverage.summary.assessed} assessed, {coverage.summary.insufficient} insufficient,{" "}
          {coverage.summary.notAssessed} not assessed yet.
        </p>

        {coverage.emptyGuidance ? (
          <p className="mt-4 rounded-md border border-[#E5E2D9] bg-[#FAFAF7] px-3 py-3 text-[13px] text-[#4A4A45]">
            {coverage.emptyGuidance}
          </p>
        ) : null}
      </div>

      <ul className="divide-y divide-[#E5E2D9]">
        {coverage.rows.map((row) => (
          <li key={row.competencyId} className="p-5 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-[#1A1A18]">{row.title}</p>
              <span
                className={`rounded-full border px-2.5 py-0.5 font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-wide ${BASIS_TONE[row.basis]}`}
              >
                {row.basisLabel}
              </span>
            </div>

            {row.basis === "assessed" ? (
              <p className="mt-1.5 text-[13px] text-[#4A4A45]">
                {row.capabilityBandLabel}
                {row.confidenceBandLabel ? ` · ${row.confidenceBandLabel}` : ""} ·{" "}
                {row.citedEvidenceCount}{" "}
                {row.citedEvidenceCount === 1 ? "evidence citation" : "evidence citations"}
              </p>
            ) : null}

            {row.whyThisBand ? (
              <p className="mt-1.5 text-[12px] text-[#6B6B64]">Why this band: {row.whyThisBand}</p>
            ) : null}

            {row.reasoningSummary ? (
              <p className="mt-1.5 border-l-2 border-[#E5E2D9] pl-3 text-[12px] text-[#4A4A45]">
                {row.reasoningSummary}
              </p>
            ) : null}

            <p className="mt-2 text-[11px] text-[#6B6B64]">Next: {row.whatToDoNext}</p>
          </li>
        ))}
      </ul>

      {coverage.selfReported.length > 0 ? (
        <div className="border-t border-[#E5E2D9] bg-[#FAFAF7] p-5 sm:p-6">
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#6B6B64]">
            Self-reported at setup — not evidence
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {coverage.selfReported.map((claim, i) => (
              <li
                key={`${claim.key}-${i}`}
                className="rounded-full border border-[#E5E2D9] bg-white px-3 py-1 text-[12px] text-[#4A4A45]"
              >
                {claim.value}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-[#6B6B64]">
            These are self-reported claims. They are never counted as proof and can never become
            Verified on their own.
          </p>
        </div>
      ) : null}

      <p className="border-t border-[#E5E2D9] p-4 text-[10px] text-[#6B6B64]">
        {coverage.honestyNote}
      </p>
    </section>
  );
}
