"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GATEWAY_STEP_LABELS } from "@/services/gatewayOnboardingEngine";
import { usesSponsorGateway } from "@/config/persona-onboarding";

const sponsorSteps = [
  { href: "/onboarding/organisation", label: GATEWAY_STEP_LABELS.account },
  { href: "/project/new", label: GATEWAY_STEP_LABELS.project },
  { href: "/project/new", label: GATEWAY_STEP_LABELS.business_case },
  { href: "/project/new", label: GATEWAY_STEP_LABELS.ai_review },
  { href: "/onboarding/team", label: GATEWAY_STEP_LABELS.team },
];

const personaSteps = [
  { href: "/onboarding/organisation", label: GATEWAY_STEP_LABELS.account },
  { href: "/onboarding/persona", label: "Workspace" },
  { href: "/onboarding/complete", label: GATEWAY_STEP_LABELS.complete },
];

const teamMemberSteps = [
  { href: "/onboarding/organisation", label: GATEWAY_STEP_LABELS.account },
  { href: "/onboarding/complete", label: GATEWAY_STEP_LABELS.complete },
];

function stepsForRole(role: string | null | undefined) {
  if (!role || role === "team_member") return teamMemberSteps;
  if (usesSponsorGateway(role)) return sponsorSteps;
  return personaSteps;
}

function currentStepIndex(pathname: string, role: string | null | undefined): number {
  if (pathname.startsWith("/onboarding/organisation") || pathname.startsWith("/onboarding/role")) {
    return 0;
  }

  if (usesSponsorGateway(role)) {
    if (pathname.startsWith("/project/new")) return 2;
    if (pathname.startsWith("/onboarding/team") || pathname.startsWith("/onboarding/invite")) {
      return 4;
    }
    if (pathname.startsWith("/onboarding/complete")) return 5;
    return -1;
  }

  if (role === "team_member") {
    if (pathname.startsWith("/onboarding/complete")) return 1;
    return -1;
  }

  if (pathname.startsWith("/onboarding/persona")) return 1;
  if (pathname.startsWith("/onboarding/complete")) return 2;
  return -1;
}

export function DxStepper({ role }: { role?: string | null } = {}) {
  const pathname = usePathname();
  const steps = stepsForRole(role);
  const currentIndex = currentStepIndex(pathname, role);
  const doneThrough = usesSponsorGateway(role) ? 5 : role === "team_member" ? 1 : 2;

  return (
    <nav
      aria-label={usesSponsorGateway(role) ? "Sponsor gateway progress" : "Onboarding progress"}
      className="hidden items-center md:flex"
    >
      {steps.map((step, i) => {
        const done = currentIndex > i || currentIndex === doneThrough;
        const active =
          i === currentIndex ||
          (usesSponsorGateway(role) &&
            currentIndex >= 1 &&
            currentIndex <= 3 &&
            i >= 1 &&
            i <= 3 &&
            i === 1);

        return (
          <span key={step.label} className="flex items-center">
            <Link
              href={step.href}
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
