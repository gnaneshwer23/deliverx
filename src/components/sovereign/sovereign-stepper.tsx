"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const steps = [
  { href: "/onboarding/organisation", label: "Organisation" },
  { href: "/onboarding/role", label: "Role" },
  { href: "/onboarding/invite", label: "Team" },
  { href: "/onboarding/complete", label: "Ready" },
];

export function SovereignStepper() {
  const pathname = usePathname();
  const currentIndex = steps.findIndex((s) => pathname.startsWith(s.href));

  return (
    <nav aria-label="Onboarding progress" className="flex flex-wrap items-center gap-2">
      {steps.map((step, i) => {
        const active = i === currentIndex;
        const done = currentIndex > i;
        return (
          <span key={step.href} className="flex items-center gap-2">
            <Link
              href={step.href}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] transition ${
                active
                  ? "border border-[#6ee7c7]/40 bg-[#6ee7c7]/10 text-[#6ee7c7]"
                  : done
                    ? "border border-white/10 text-[#f8f6f2]/70 hover:text-[#f8f6f2]"
                    : "border border-transparent text-[#9ca3af] hover:text-[#f8f6f2]/80"
              }`}
            >
              <span
                className={`flex size-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                  active
                    ? "bg-[#6ee7c7] text-[#0a0e14]"
                    : done
                      ? "bg-white/15 text-[#f8f6f2]"
                      : "bg-white/5 text-[#9ca3af]"
                }`}
              >
                {i + 1}
              </span>
              {step.label}
            </Link>
            {i < steps.length - 1 ? (
              <span className="hidden text-white/20 sm:inline" aria-hidden>
                →
              </span>
            ) : null}
          </span>
        );
      })}
    </nav>
  );
}
