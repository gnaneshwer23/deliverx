import { LandingReveal } from "@/components/dx/landing-motion";
import { PpArrowDivider, PpSectionLabel } from "@/components/dx/landing-pp-ui";
import { LandingContainer, LandingSection } from "@/components/dx/landing-layout";
import { ppClass } from "@/lib/policy-pilot-theme";
import type { LandingPageContent } from "@/services/landing";

export function LandingShift({ shift }: { shift: LandingPageContent["shift"] }) {
  return (
    <LandingSection id="shift" className={ppClass.creamSection}>
      <LandingContainer>
        <LandingReveal>
          <PpSectionLabel dark>{shift.eyebrow}</PpSectionLabel>
          <h2 className={`${ppClass.display} mt-4 max-w-2xl text-3xl leading-tight md:text-4xl`}>
            {shift.title}{" "}
            <span className="text-[#1C4A2E]">{shift.titleEm}</span>
          </h2>
        </LandingReveal>

        <div className="mt-12 flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-stretch lg:gap-6">
          <LandingReveal delay={0.05}>
            <ComparisonCard
              heading={shift.today.heading}
              items={shift.today.items}
              variant="today"
            />
          </LandingReveal>
          <PpArrowDivider className="py-2 lg:py-0" />
          <LandingReveal delay={0.1}>
            <ComparisonCard
              heading={shift.withProduct.heading}
              items={shift.withProduct.items}
              variant="with"
            />
          </LandingReveal>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}

function ComparisonCard({
  heading,
  items,
  variant,
}: {
  heading: string;
  items: readonly string[];
  variant: "today" | "with";
}) {
  const isWith = variant === "with";
  return (
    <div className={`${ppClass.cardLight} flex h-full flex-col p-8 md:p-9`}>
      <h3 className="mb-6 text-lg font-semibold text-[#0a0e14]">{heading}</h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className={`flex gap-3 text-sm leading-relaxed ${
              isWith ? "text-[#2C2C28]" : "text-[#6B6B64]"
            }`}
          >
            <span
              className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                isWith ? "bg-[#6ee7c7]" : "bg-[#f87171]/80"
              }`}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
