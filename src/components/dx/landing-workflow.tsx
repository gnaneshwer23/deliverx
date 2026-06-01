import { LandingReveal } from "@/components/dx/landing-motion";

const STEPS = [
  { label: "Brief", sub: "Business case in" },
  { label: "Structure", sub: "AI + PM review" },
  { label: "Deliver", sub: "Tasks & standups" },
  { label: "Govern", sub: "RAID & reports" },
  { label: "Compound", sub: "Memory & close" },
] as const;

/** Horizontal delivery pipeline — visual anchor for the journey section */
export function LandingWorkflowStrip() {
  return (
    <LandingReveal>
      <div
        className="landing-workflow-strip relative overflow-hidden border border-[#C6DDD0] bg-gradient-to-r from-[#EEF5F1] via-white to-[#FAFAF5] px-6 py-8 md:px-10"
        aria-hidden={false}
        role="img"
        aria-label="Delivery workflow from brief to closure"
      >
        <div className="absolute inset-y-0 left-0 w-1 bg-[#1C4A2E]" />
        <ol className="flex flex-col gap-6 md:flex-row md:items-stretch md:justify-between md:gap-4">
          {STEPS.map((step, i) => (
            <li key={step.label} className="relative flex flex-1 flex-col md:items-center md:text-center">
              <span className="mb-3 flex size-9 items-center justify-center bg-[#1C4A2E] font-[family-name:var(--font-dx-mono)] text-[10px] text-white">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm font-semibold text-[#0D0D0B]">{step.label}</span>
              <span className="mt-0.5 text-xs font-light text-[#6B6B64]">{step.sub}</span>
              {i < STEPS.length - 1 ? (
                <span
                  className="absolute -right-2 top-4 hidden font-mono text-[#A8A89E] md:-right-4 md:block lg:-right-6"
                  aria-hidden
                >
                  →
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </LandingReveal>
  );
}
