"use client";

import { useState } from "react";
import { useActionState } from "react";
import type { OnboardingOutput, OnboardingRoleData } from "@/config/persona-onboarding";
import { completePersonaOnboardingAction, type PersonaState } from "./actions";
import { dxClass } from "@/lib/dx-theme";

const initial: PersonaState = { ok: false };

function OutputCard({ output }: { output: OnboardingOutput }) {
  return (
    <div className="flex items-start gap-3 border border-[#E4E4DC] bg-white p-3">
      <span
        className="flex size-8 shrink-0 items-center justify-center font-[family-name:var(--font-dx-mono)] text-[10px] font-semibold"
        style={{ backgroundColor: output.iconBg, color: output.iconColor }}
      >
        {output.code}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-[#0D0D0B]">{output.title}</span>
        <span className="block text-xs text-[#6B6B64]">{output.sub}</span>
      </span>
      <span
        className={`ml-auto shrink-0 font-[family-name:var(--font-dx-mono)] text-[7px] uppercase tracking-[0.08em] ${
          output.badgeCls === "badge-g"
            ? "text-[#1C4A2E]"
            : output.badgeCls === "badge-a"
              ? "text-[#D97706]"
              : "text-[#6B6B64]"
        }`}
      >
        {output.badge}
      </span>
    </div>
  );
}

export function PersonaWizard({ config, roleLabel }: { config: OnboardingRoleData; roleLabel: string }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [state, formAction, pending] = useActionState(completePersonaOnboardingAction, initial);
  const steps = config.steps;
  const isLast = stepIndex >= steps.length - 1;

  return (
    <div className="flex flex-col gap-6">
      <ol className="space-y-2">
        {steps.map((step, i) => {
          const done = i < stepIndex;
          const active = i === stepIndex;
          return (
            <li
              key={step.n}
              className={`flex gap-3 border p-3 transition ${
                active
                  ? "border-[#1C4A2E] bg-[#EEF5F1]"
                  : done
                    ? "border-[#C6DDD0] bg-[#F7FBF8]"
                    : "border-[#E4E4DC] bg-white"
              }`}
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold ${
                  done
                    ? "border-[#1C4A2E] bg-[#1C4A2E] text-white"
                    : active
                      ? "border-[#1C4A2E] text-[#1C4A2E]"
                      : "border-[#E4E4DC] text-[#A8A89E]"
                }`}
              >
                {done ? "✓" : step.n}
              </span>
              <span>
                <span className="block text-sm font-semibold text-[#0D0D0B]">{step.title}</span>
                <span className="block text-xs leading-relaxed text-[#6B6B64]">{step.desc}</span>
              </span>
            </li>
          );
        })}
      </ol>

      {isLast ? (
        <div className="space-y-2">
          <p className="font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-[0.1em] text-[#6B6B64]">
            AI outputs preview · {roleLabel}
          </p>
          {config.outputs.map((output) => (
            <OutputCard key={`${output.code}-${output.title}`} output={output} />
          ))}
        </div>
      ) : null}

      {state.error ? (
        <p className="border border-[#C0392B]/30 bg-[#FDF1F0] px-3 py-2 text-sm text-[#C0392B]">
          {state.error}
        </p>
      ) : null}

      <div className="flex gap-3 border-t border-[#E4E4DC] pt-6">
        {stepIndex > 0 ? (
          <button
            type="button"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            className={`${dxClass.btnGhost} flex-1`}
          >
            Back
          </button>
        ) : null}

        {isLast ? (
          <form action={formAction} className="flex-1">
            <button type="submit" disabled={pending} className={`${dxClass.btnPrimary} w-full`}>
              {pending ? "Setting up…" : "Enter workspace →"}
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
            className={`${dxClass.btnPrimary} flex-1`}
          >
            Continue →
          </button>
        )}
      </div>
    </div>
  );
}
