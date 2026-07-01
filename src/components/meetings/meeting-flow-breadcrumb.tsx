import { dxClass } from "@/lib/dx-theme";
import {
  MEETING_FLOW_STEPS,
  resolveMeetingFlowStage,
  type MeetingFlowStepId,
} from "@/lib/meeting-flow";

export function MeetingFlowBreadcrumb({
  currentStep,
  className = "",
}: {
  currentStep: MeetingFlowStepId;
  className?: string;
}) {
  const stage = resolveMeetingFlowStage(currentStep);

  return (
    <nav
      aria-label="Meeting intelligence flow"
      className={`${dxClass.card} overflow-hidden px-4 py-4 md:px-5 ${className}`}
      data-panel="meeting-flow-breadcrumb"
    >
      <p className={dxClass.capsAcc}>Meeting intelligence flow</p>
      <ol className="mt-3 flex flex-col gap-2 min-[720px]:flex-row min-[720px]:items-center min-[720px]:gap-0">
        {stage.steps.map((step, index) => (
          <li key={step.id} className="flex min-w-0 flex-1 items-center">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full border-[1.5px] font-[family-name:var(--font-dx-mono)] text-[10px] font-semibold min-[720px]:size-7 min-[720px]:text-[9px] ${
                  step.status === "complete"
                    ? "border-[#1C4A2E] bg-[#1C4A2E] text-white"
                    : step.status === "current"
                      ? "border-[#1C4A2E] bg-[#EEF5F1] text-[#1C4A2E]"
                      : "border-[var(--dx-rul)] bg-[var(--dx-bas)] text-[var(--dx-fnt)]"
                }`}
                aria-hidden
              >
                {step.status === "complete" ? "✓" : index + 1}
              </span>
              <div className="min-w-0">
                <p
                  className={`truncate font-[family-name:var(--font-dx-sans)] text-xs font-medium ${
                    step.status === "current"
                      ? "text-[#1C4A2E]"
                      : step.status === "complete"
                        ? "text-[#2C2C28]"
                        : "text-[var(--dx-fnt)]"
                  }`}
                >
                  <span className="min-[720px]:hidden">{step.short}</span>
                  <span className="hidden min-[720px]:inline">{step.label}</span>
                </p>
              </div>
            </div>
            {index < MEETING_FLOW_STEPS.length - 1 ? (
              <span
                className={`mx-2 hidden h-px flex-1 min-[720px]:block ${
                  step.status === "complete" ? "bg-[#C6DDD0]" : "bg-[var(--dx-rul)]"
                }`}
                aria-hidden
              />
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
