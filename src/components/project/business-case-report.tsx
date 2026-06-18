import type { BusinessCaseReview } from "@/services/aiBusinessCaseReview";
import { businessCaseRecommendationLabel } from "@/lib/business-case/constants";
import { DxBadge } from "@/components/dx/dx-badge";
import { dxClass } from "@/lib/dx-theme";

export function BusinessCaseReport({ review }: { review: BusinessCaseReview }) {
  const recTone =
    review.recommendation === "go"
      ? "green"
      : review.recommendation === "no_go"
        ? "red"
        : "amber";

  const sym =
    review.financialIntelligence.currency === "GBP"
      ? "£"
      : review.financialIntelligence.currency === "EUR"
        ? "€"
        : "$";

  const fmt = (n: number) =>
    n >= 1000 ? `${sym}${Math.round(n / 1000)}k` : `${sym}${n.toLocaleString()}`;

  return (
    <div className="space-y-5">
      <div className={`${dxClass.cardPad} flex flex-wrap items-center justify-between gap-4`}>
        <div>
          <p className={dxClass.label}>Business case health</p>
          <p className={`${dxClass.display} text-3xl`}>{review.score}%</p>
          <p className="mt-1 text-xs text-[#6B6B64]">
            Confidence {review.recommendationConfidence}%
          </p>
        </div>
        <DxBadge tone={recTone}>{businessCaseRecommendationLabel(review.recommendation)}</DxBadge>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(review.healthDimensions).map(([key, value]) => (
          <ScoreTile key={key} label={formatDimensionLabel(key)} value={value} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <ScoreTile label="Feasibility" value={review.feasibilityScore} />
        <ScoreTile label="Risk" value={review.riskScore} invert />
        <ScoreTile label="Innovation" value={review.innovationScore} />
        <ScoreTile label="Financial" value={review.financialConfidence} />
        <ScoreTile label="Delivery" value={review.deliveryConfidence} />
      </div>

      <ReportSection title="Executive summary">
        <p className="text-sm text-[#2C2C28]">{review.executiveSummary}</p>
      </ReportSection>

      {review.recommendationReasons.length > 0 ? (
        <ReportSection title="Recommendation rationale">
          <ul className="list-inside list-disc space-y-1 text-sm text-[#2C2C28]">
            {review.recommendationReasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </ReportSection>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <ReportSection title="Financial intelligence">
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <Stat label="Dev cost" value={`${fmt(review.financialIntelligence.devCostMin)} – ${fmt(review.financialIntelligence.devCostMax)}`} />
            <Stat label="Infra / mo" value={fmt(review.financialIntelligence.infraCostMonthly)} />
            <Stat label="Break-even" value={`${review.financialIntelligence.breakEvenMonths} mo`} />
            <Stat label="3yr ROI" value={`${review.financialIntelligence.roi3YearPct}%`} />
          </dl>
        </ReportSection>

        <ReportSection title="Innovation analysis">
          <p className="text-sm text-[#2C2C28]">
            Novelty score: {review.innovationAnalysis.noveltyScore}%
          </p>
          <p className="mt-2 text-sm text-[#6B6B64]">
            {review.innovationAnalysis.competitorComparison}
          </p>
          {review.innovationAnalysis.differentiationGaps.length > 0 ? (
            <ul className="mt-2 list-inside list-disc text-sm text-[#6B6B64]">
              {review.innovationAnalysis.differentiationGaps.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          ) : null}
        </ReportSection>
      </div>

      <ReportSection title="Delivery confidence breakdown">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <ScoreTile label="Success probability" value={review.deliveryConfidenceBreakdown.successProbability} />
          <ScoreTile label="Timeline" value={review.deliveryConfidenceBreakdown.timelineConfidence} />
          <ScoreTile label="Budget" value={review.deliveryConfidenceBreakdown.budgetConfidence} />
          <ScoreTile label="Stakeholders" value={review.deliveryConfidenceBreakdown.stakeholderAlignment} />
        </div>
      </ReportSection>

      {review.strengths.length > 0 ? (
        <ReviewList title="Strengths" items={review.strengths} tone="green" />
      ) : null}
      {review.gaps.length > 0 ? (
        <ReviewList title="Gaps to address" items={review.gaps} tone="amber" />
      ) : null}
      {review.clarificationQuestions.length > 0 ? (
        <ReviewList title="Clarification questions" items={review.clarificationQuestions} tone="amber" />
      ) : null}
      {review.initialRisks.length > 0 ? (
        <ReviewList title="Initial risks" items={review.initialRisks} tone="red" />
      ) : null}

      {review.raidSeed.length > 0 ? (
        <ReportSection title="RAID seed">
          <ul className="space-y-1 text-sm">
            {review.raidSeed.map((r) => (
              <li key={`${r.type}-${r.title}`} className="flex gap-2 text-[#2C2C28]">
                <span className="font-mono text-[10px] uppercase text-[#A8A89E]">{r.type}</span>
                <span>{r.title}</span>
                <span className="text-[#6B6B64]">({r.severity})</span>
              </li>
            ))}
          </ul>
        </ReportSection>
      ) : null}

      {review.scenarios.length > 0 ? (
        <ReportSection title="Scenario modelling">
          <div className="space-y-3">
            {review.scenarios.map((s) => (
              <div key={s.title} className="border border-[#E4E4DC] bg-[#FAFAF7] p-3 text-sm">
                <p className="font-medium">{s.title}</p>
                <p className="mt-1 text-[#6B6B64]">
                  Delay +{s.deliveryDelayWeeks}w · Cost −{s.costReductionPct}% · {s.revenueImpact}
                </p>
              </div>
            ))}
          </div>
        </ReportSection>
      ) : null}
    </div>
  );
}

function formatDimensionLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={`${dxClass.cardPad}`}>
      <p className={`${dxClass.label} mb-2`}>{title}</p>
      {children}
    </div>
  );
}

function ReviewList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "green" | "amber" | "red";
}) {
  const bg =
    tone === "green" ? "bg-[#EDF7F1]" : tone === "amber" ? "bg-[#FEF6EC]" : "bg-[#FDF1F0]";
  return (
    <div className={`${dxClass.cardPad} ${bg}`}>
      <p className={`${dxClass.label} mb-2`}>{title}</p>
      <ul className="list-inside list-disc space-y-1 text-sm text-[#2C2C28]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ScoreTile({
  label,
  value,
  invert = false,
}: {
  label: string;
  value: number;
  invert?: boolean;
}) {
  const effective = invert ? 100 - value : value;
  const tone =
    effective >= 75 ? "text-[#1C4A2E]" : effective >= 50 ? "text-[#8B6914]" : "text-[#8B2E2E]";

  return (
    <div className="border border-[#E4E4DC] bg-white p-3">
      <p className={dxClass.label}>{label}</p>
      <p className={`${dxClass.display} text-xl ${tone}`}>{value}%</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase text-[#A8A89E]">{label}</dt>
      <dd className="font-medium text-[#2C2C28]">{value}</dd>
    </div>
  );
}
