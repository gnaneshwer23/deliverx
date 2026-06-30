"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GATEWAY_STEP_LABELS,
  PERSONA_GATEWAY_STEP_COUNT,
  SPONSOR_GATEWAY_STEP_HINTS,
  SPONSOR_GATEWAY_USER_STEPS,
  TEAM_MEMBER_STEP_COUNT,
  resolveOnboardingFlowKind,
} from "@/services/gatewayOnboardingEngine";

const sponsorSteps = SPONSOR_GATEWAY_USER_STEPS.map((step) => ({
  href:
    step === "account"
      ? "/onboarding/organisation"
      : step === "team"
        ? "/onboarding/team"
        : "/project/new",
  label: GATEWAY_STEP_LABELS[step],
  hint: SPONSOR_GATEWAY_STEP_HINTS[step],
}));

const personaSteps = [
  { href: "/onboarding/organisation", label: GATEWAY_STEP_LABELS.account, hint: SPONSOR_GATEWAY_STEP_HINTS.account },
  { href: "/onboarding/persona", label: "Workspace", hint: "Persona-specific day-one panels and tasks" },
  { href: "/onboarding/complete", label: GATEWAY_STEP_LABELS.complete, hint: "Open your mission dashboard" },
];

const teamMemberSteps = [
  { href: "/onboarding/organisation", label: GATEWAY_STEP_LABELS.account, hint: SPONSOR_GATEWAY_STEP_HINTS.account },
  { href: "/onboarding/complete", label: GATEWAY_STEP_LABELS.complete, hint: "Join your project workspace" },
];

function stepsForRole(role: string | null | undefined) {
  const kind = resolveOnboardingFlowKind(role);
  if (kind === "team_member") return teamMemberSteps;
  if (kind === "persona") return personaSteps;
  return sponsorSteps;
}

function currentStepIndex(pathname: string, role: string | null | undefined): number {
  const kind = resolveOnboardingFlowKind(role);

  if (pathname.startsWith("/onboarding/organisation") || pathname.startsWith("/onboarding/role")) {
    return 0;
  }

  if (kind === "sponsor") {
    if (pathname.startsWith("/project/new")) return 1;
    if (pathname.startsWith("/onboarding/team") || pathname.startsWith("/onboarding/invite")) {
      return 4;
    }
    if (pathname.startsWith("/onboarding/complete")) return 5;
    return -1;
  }

  if (kind === "team_member") {
    if (pathname.startsWith("/onboarding/complete")) return 1;
    return -1;
  }

  if (pathname.startsWith("/onboarding/persona")) return 1;
  if (pathname.startsWith("/onboarding/complete")) return 2;
  return -1;
}

function doneThroughIndex(role: string | null | undefined): number {
  const kind = resolveOnboardingFlowKind(role);
  if (kind === "team_member") return TEAM_MEMBER_STEP_COUNT - 1;
  if (kind === "persona") return PERSONA_GATEWAY_STEP_COUNT - 1;
  return SPONSOR_GATEWAY_USER_STEPS.length;
}

export function DxStepper({ role }: { role?: string | null } = {}) {
  const pathname = usePathname();
  const steps = stepsForRole(role);
  const currentIndex = currentStepIndex(pathname, role);
  const doneThrough = doneThroughIndex(role);
  const kind = resolveOnboardingFlowKind(role);

  return (
    <nav
      aria-label={kind === "sponsor" ? "Founder setup progress" : "Onboarding progress"}
      className="hidden items-center md:flex"
    >
      {steps.map((step, i) => {
        const done = currentIndex > i || currentIndex === doneThrough;
        const active =
          i === currentIndex ||
          (kind === "sponsor" &&
            currentIndex >= 1 &&
            currentIndex <= 3 &&
            i >= 1 &&
            i <= 3 &&
            i === 1);

        return (
          <span key={step.label} className="flex items-center">
            <Link
              href={step.href}
              title={"hint" in step ? step.hint : undefined}
              className={`flex items-center gap-1.5 px-3 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-[0.1em] ${
                active ? "text-[#1C4A2E]" : done ? "text-[#6B6B64]" : "text-[#A8A89E]"
              }`}
            >
              <span
                className={`flex size-[18px] items-center justify-center rounded-full border-[1.5px] text-[7px] font-semibold ${
                  done
                    ? "border-[#1C4A2E] bg-[#1C4A2E] text-white"
                    : active
                      ? "border-[#1C4A2E] text-[#1C4A2E]"
                      : "border-[#E4E4DC] text-[#A8A89E]"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              {step.label}
            </Link>
            {i < steps.length - 1 ? (
              <span className="text-[#E4E4DC]" aria-hidden>
                ›
              </span>
            ) : null}
          </span>
        );
      })}
    </nav>
  );
}
