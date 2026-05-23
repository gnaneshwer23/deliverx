"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const steps = [
  { href: "/onboarding/organisation", label: "Organisation" },
  { href: "/onboarding/role", label: "Role" },
  { href: "/onboarding/invite", label: "Team" },
  { href: "/onboarding/complete", label: "Ready" },
];

export function DxStepper() {
  const pathname = usePathname();
  const currentIndex = steps.findIndex((s) => pathname.startsWith(s.href));

  return (
    <nav aria-label="Onboarding progress" className="hidden items-center md:flex">
      {steps.map((step, i) => {
        const active = i === currentIndex;
        const done = currentIndex > i;
        return (
          <span key={step.href} className="flex items-center">
            <Link
              href={step.href}
              className={`flex items-center gap-1.5 px-4 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-[0.1em] ${
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
