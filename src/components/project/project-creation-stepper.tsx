import { dxClass } from "@/lib/dx-theme";
import {
  GATEWAY_STEP_LABELS,
  PROJECT_CREATION_STEP_HINTS,
  SPONSOR_GATEWAY_STEP_COUNT,
  projectFormStepNumber,
  sponsorGatewayStepNumber,
  type ProjectFormStep,
} from "@/services/gatewayOnboardingEngine";

export type CreationStep = ProjectFormStep;

const STEPS: { id: Exclude<ProjectFormStep, "discovery" | "create">; label: string }[] = [
  { id: "project", label: GATEWAY_STEP_LABELS.project },
  { id: "brief", label: GATEWAY_STEP_LABELS.business_case },
  { id: "review", label: GATEWAY_STEP_LABELS.ai_review },
];

function displayStepFor(current: CreationStep): Exclude<ProjectFormStep, "discovery" | "create"> {
  if (current === "brief") return "brief";
  if (current === "project") return "project";
  return "review";
}

export function ProjectCreationStepper({ current }: { current: CreationStep }) {
  const displayStep = displayStepFor(current);
  const idx = STEPS.findIndex((step) => step.id === displayStep);

  return (
    <nav aria-label="Project setup progress" className="mb-6">
      <ol className="flex flex-wrap gap-1">
        {STEPS.map((step, i) => {
          const done = i < idx;
          const active = i === idx;
          const stepNumber = sponsorGatewayStepNumber(
            step.id === "project" ? "project" : step.id === "brief" ? "business_case" : "ai_review",
          );

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
                <span className="opacity-80">{stepNumber}</span>
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
            <span className="opacity-80">{sponsorGatewayStepNumber("team")}</span>
            {GATEWAY_STEP_LABELS.team}
          </span>
        </li>
      </ol>
      <p className={`${dxClass.label} mt-2 text-[#6B6B64]`}>{PROJECT_CREATION_STEP_HINTS[current]}</p>
      <p className="mt-1 text-xs text-[#A8A89E]">
        Step {projectFormStepNumber(current)} of {SPONSOR_GATEWAY_STEP_COUNT} in founder setup
      </p>
    </nav>
  );
}
