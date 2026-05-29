import { dxClass } from "@/lib/dx-theme";

export type CreationStep = "brief" | "review" | "discovery" | "create";

const STEPS: { id: CreationStep; label: string }[] = [
  { id: "brief", label: "Brief" },
  { id: "review", label: "AI review" },
  { id: "discovery", label: "Questionnaire" },
  { id: "create", label: "Setup" },
];

export function ProjectCreationStepper({ current }: { current: CreationStep }) {
  const idx = STEPS.findIndex((s) => s.id === current);

  return (
    <nav aria-label="Project creation progress" className="mb-6">
      <ol className="flex flex-wrap gap-1">
        {STEPS.map((step, i) => {
          const done = i < idx;
          const active = i === idx;
          return (
            <li key={step.id} className="flex items-center gap-1">
              <span
                className={`flex items-center gap-1.5 px-2 py-1 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-[0.08em] ${
                  active
                    ? "bg-[#1C4A2E] text-white"
                    : done
                      ? "bg-[#EEF5F1] text-[#1C4A2E]"
                      : "bg-[#F7F7F2] text-[#A8A89E]"
                }`}
              >
                <span className="opacity-80">{i + 1}</span>
                {step.label}
              </span>
              {i < STEPS.length - 1 ? (
                <span className="text-[#E4E4DC]" aria-hidden>
                  →
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
      <p className={`${dxClass.label} mt-2 text-[#6B6B64]`}>
        {current === "brief"
          ? "Describe your programme or paste a business case."
          : current === "review"
            ? "AI readiness review before follow-up questions."
            : current === "discovery"
              ? "Answer delivery questions so structure generation is accurate."
              : "Confirm details and optionally generate workstreams & RAID."}
      </p>
    </nav>
  );
}
