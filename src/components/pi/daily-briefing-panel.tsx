"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { trackPilotKpi } from "@/lib/analytics/client";
import type { DailyBriefing } from "@/lib/contextual-home/types";

type Props = {
  briefing: DailyBriefing;
};

/**
 * Above-fold Daily Briefing for contextual Home (/profile).
 * Screen-bound context panel — never a floating blank chat.
 */
export function DailyBriefingPanel({ briefing }: Props) {
  const viewed = useRef(false);

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    trackPilotKpi("home_briefing_viewed", {
      surface: "profile",
      home_state: briefing.state,
    });
  }, [briefing.state]);

  return (
    <section
      aria-labelledby="daily-briefing-heading"
      className="mb-8 overflow-hidden rounded-lg border border-[#E5E2D9] bg-white"
    >
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.4fr)_minmax(14rem,0.8fr)]">
        <div className="border-b border-[#E5E2D9] p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <p className="font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-[0.16em] text-[#6B6B64]">
            Daily briefing · {briefing.stateLabel}
          </p>
          <h2
            id="daily-briefing-heading"
            className="mt-2 font-[family-name:var(--font-display)] text-xl text-[#1A1A18]"
          >
            {briefing.greeting}
          </h2>
          <p className="mt-1 text-sm text-[#4A4A45]">{briefing.whereAmI}</p>

          <dl className="mt-5 space-y-3 text-sm">
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-[#6B6B64]">
                Today
              </dt>
              <dd className="mt-0.5 text-[#1A1A18]">{briefing.whatToday}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-[#6B6B64]">
                Why it matters
              </dt>
              <dd className="mt-0.5 text-[#4A4A45]">{briefing.whyItMatters}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-[#6B6B64]">
                Progress
              </dt>
              <dd className="mt-0.5 text-[#4A4A45]">{briefing.howProgressing}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-[#6B6B64]">
                What next
              </dt>
              <dd className="mt-0.5 text-[#4A4A45]">{briefing.whatNext}</dd>
            </div>
          </dl>

          <Link
            href={briefing.primaryAction.href}
            onClick={() => {
              trackPilotKpi("home_primary_cta_clicked", {
                surface: "profile",
                home_state: briefing.state,
                cta_kind: briefing.primaryAction.kind.slice(0, 64),
              });
            }}
            className="mt-5 inline-flex rounded-md bg-[#1C4A2E] px-4 py-2.5 text-sm font-medium text-white"
          >
            {briefing.primaryAction.label}
          </Link>

          {briefing.cards.length > 0 ? (
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {briefing.cards.map((card) => (
                <li
                  key={card.id}
                  className="rounded-md border border-[#E5E2D9] bg-[#FAFAF7] px-3 py-3"
                >
                  <p className="text-xs font-medium text-[#1A1A18]">{card.title}</p>
                  <p className="mt-1 text-[11px] text-[#4A4A45]">{card.body}</p>
                  <p className="mt-2 text-[10px] text-[#6B6B64]">{card.whyHere}</p>
                  {card.primaryAction ? (
                    <Link
                      href={card.primaryAction.href}
                      className="mt-2 inline-block text-[11px] font-medium text-[#1C4A2E] underline"
                    >
                      {card.primaryAction.label}
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}

          <p className="mt-4 text-[10px] text-[#6B6B64]">{briefing.honestyNote}</p>
        </div>

        <aside className="bg-[#FAFAF7] p-5 sm:p-6" aria-label="Why this next action">
          <p className="font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-[0.16em] text-[#6B6B64]">
            {briefing.contextPanel.title}
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-4 text-xs text-[#4A4A45]">
            {briefing.contextPanel.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          {briefing.citations.length > 0 ? (
            <div className="mt-5 border-t border-[#E5E2D9] pt-4">
              <p className="text-[10px] font-medium uppercase tracking-wide text-[#6B6B64]">
                Sources cited
              </p>
              <ul className="mt-2 space-y-1 text-[11px] text-[#4A4A45]">
                {briefing.citations.map((c, i) => (
                  <li key={`${c.kind}-${c.id ?? i}`}>
                    <span className="text-[#6B6B64]">{c.kind.replace(/_/g, " ")}</span>
                    {" · "}
                    {c.label}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="mt-5 text-[10px] text-[#6B6B64]">
            Guidance is bound to this screen. Capability is never assigned here; Verified requires
            independent attestation.
          </p>
        </aside>
      </div>
    </section>
  );
}
