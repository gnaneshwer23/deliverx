import { LandingReveal } from "@/components/dx/landing-motion";
import { dxClass } from "@/lib/dx-theme";

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
      <div className="mb-4">
        <p className="font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-[0.2em] text-[#1C4A2E]">
          Your pipeline
        </p>
        <p className={`${dxClass.display} mt-1 text-lg text-[#0D0D0B] md:text-xl`}>
          Five steps from brief to closure
        </p>
      </div>
      <div
        className="landing-workflow-strip relative overflow-hidden border border-[#C6DDD0] bg-gradient-to-r from-[#EEF5F1] via-white to-[#FAFAF5] px-5 py-7 md:px-8 md:py-8"
        aria-label="Delivery workflow from brief to closure"
      >
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[#1C4A2E]" aria-hidden />
        <div
          className="pointer-events-none absolute left-8 right-8 top-[2.65rem] hidden h-0.5 bg-[#C6DDD0] md:block"
          aria-hidden
        />
        <ol className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-3">
          {STEPS.map((step, i) => (
            <li
              key={step.label}
              className="relative flex flex-1 flex-col md:items-center md:text-center"
            >
              <span className="relative z-10 mb-3 flex size-11 items-center justify-center bg-[#1C4A2E] font-[family-name:var(--font-dx-mono)] text-xs font-medium text-white shadow-[0_8px_24px_-8px_rgba(28,74,46,0.5)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[15px] font-semibold text-[#0D0D0B]">{step.label}</span>
              <span className="mt-1 text-xs leading-snug text-[#6B6B64]">{step.sub}</span>
            </li>
          ))}
        </ol>
      </div>
    </LandingReveal>
  );
}
