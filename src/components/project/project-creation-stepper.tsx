import { dxClass } from "@/lib/dx-theme";
import { GATEWAY_STEP_LABELS } from "@/services/gatewayOnboardingEngine";

export type CreationStep = "project" | "brief" | "review" | "discovery" | "create";

const STEPS: { id: CreationStep; label: string }[] = [
  { id: "project", label: GATEWAY_STEP_LABELS.project },
  { id: "brief", label: GATEWAY_STEP_LABELS.business_case },
  { id: "review", label: GATEWAY_STEP_LABELS.ai_review },
  { id: "create", label: "Setup" },
];

export function ProjectCreationStepper({ current }: { current: CreationStep }) {
  const displayStep = current === "discovery" ? "create" : current;
  const idx = STEPS.findIndex((s) => s.id === displayStep);

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
                <span className="opacity-80">{i + 2}</span>
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
        <li className="flex items-center gap-1">
          <span className="text-[#E4E4DC]" aria-hidden>
            →
          </span>
          <span className="flex items-center gap-1.5 bg-[#F7F7F2] px-2 py-1 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-[0.08em] text-[#A8A89E]">
            <span className="opacity-80">6</span>
            {GATEWAY_STEP_LABELS.team}
          </span>
        </li>
      </ol>
      <p className={`${dxClass.label} mt-2 text-[#6B6B64]`}>
        {current === "project"
          ? "Name your project shell before the business case review."
          : current === "brief"
            ? "Describe your programme or paste a business case."
            : current === "review"
              ? "AI readiness review and sponsor GO gate."
              : current === "discovery"
                ? "Answer delivery questions so structure generation is accurate."
                : "Confirm details — team invites follow after GO."}
      </p>
    </nav>
  );
}
