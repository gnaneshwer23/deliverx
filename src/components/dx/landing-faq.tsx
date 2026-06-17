import { LandingReveal } from "@/components/dx/landing-motion";
import {
  LandingContainer,
  LandingSection,
  SectionIntro,
} from "@/components/dx/landing-layout";

const FAQ = [
  {
    q: "How is DeliverX different from Jira or Monday?",
    a: "Those tools track tasks. DeliverX connects business case → delivery → governance → closure, with AI that drafts RAID, reports, and alerts — always behind human approval.",
  },
  {
    q: "Does AI change my project data automatically?",
    a: "No. AI proposes updates to RAID, timelines, and reports. Your PM reviews the alert queue and approves before anything is applied.",
  },
  {
    q: "How long does setup take?",
    a: "Most teams create their first project in about 15 minutes: paste or upload a business case, review AI-generated structure, invite the team.",
  },
  {
    q: "Can we use DeliverX at programme or portfolio level?",
    a: "Yes. Professional and Enterprise plans add programme views, portfolio health, digital twin scenarios, and cross-project memory.",
  },
  {
    q: "Where is data hosted?",
    a: "EU-ready infrastructure with GDPR-aligned practices. Enterprise can discuss dedicated residency requirements.",
  },
] as const;

export function LandingFaq() {
  return (
    <LandingSection id="faq" tone="white" className="border-t border-[#E4E4DC]">
      <LandingContainer>
        <LandingReveal>
          <SectionIntro
            eyebrow="FAQ"
            align="center"
            title={
              <>
                Answers before you <em className="text-[#1C4A2E] not-italic">start a trial.</em>
              </>
            }
          />
        </LandingReveal>
        <div className="mx-auto max-w-2xl divide-y divide-[#E4E4DC] border border-[#E4E4DC] bg-white">
          {FAQ.map((item, i) => (
            <LandingReveal key={item.q} delay={i * 0.04}>
              <details className="group px-6 py-5 md:px-8">
                <summary className="cursor-pointer list-none font-medium text-[#0D0D0B] marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-start justify-between gap-4">
                    {item.q}
                    <span
                      className="mt-0.5 shrink-0 font-[family-name:var(--font-dx-mono)] text-[10px] text-[#1C4A2E] transition group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm font-light leading-relaxed text-[#6B6B64]">{item.a}</p>
              </details>
            </LandingReveal>
          ))}
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
