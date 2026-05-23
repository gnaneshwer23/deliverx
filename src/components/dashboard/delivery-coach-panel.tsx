"use client";

import Link from "next/link";
import type { CoachSuggestion } from "@/services/deliveryCoach";
import { dxClass } from "@/lib/dx-theme";

export function DeliveryCoachPanel({ suggestions }: { suggestions: CoachSuggestion[] }) {
  return (
    <ul className="space-y-3">
      {suggestions.map((s) => (
        <li key={s.id} className={`${dxClass.card} border-l-2 border-[#1C4A2E] px-4 py-3`}>
          <p className="font-[family-name:var(--font-dx-mono)] text-[7px] uppercase tracking-wider text-[#A8A89E]">
            {s.behaviour}
          </p>
          {s.href ? (
            <Link href={s.href} className="mt-1 block text-sm font-medium text-[#1C4A2E] hover:underline">
              {s.action} →
            </Link>
          ) : (
            <p className="mt-1 text-sm font-medium">{s.action}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
