/**
 * Merge delivery_impact_events into mission Next up strips (F1 PM→BA handoff).
 */

import type { MissionPersonaId } from "@/lib/mission-nav";
import type { NextUpItem, NextUpTone } from "@/lib/next-up-items";
import { buildImpactEventHref } from "@/lib/signal-deeplinks";
import type { DeliveryImpactEventRow } from "@/services/deliveryImpact";
import type { DeliveryImpactRole, DeliveryImpactTone } from "@/services/deliveryImpactEngine";

const PERSONA_IMPACT_ROLE: Partial<Record<MissionPersonaId, DeliveryImpactRole>> = {
  "pm-mission": "pm",
  ba: "ba",
  founder: "founder",
  product: "product",
  engineer: "engineer",
  qa: "qa",
  scrum: "scrum",
};

function toneFromImpact(tone: DeliveryImpactTone): NextUpTone {
  switch (tone) {
    case "blocked":
      return "amber";
    case "waiting":
    case "pending":
      return "amber";
    case "ready":
      return "green";
    default:
      return "blue";
  }
}

export function impactEventsToNextUpItems(
  events: DeliveryImpactEventRow[],
  personaId: MissionPersonaId,
  projectId?: string,
): NextUpItem[] {
  const targetRole = PERSONA_IMPACT_ROLE[personaId];
  if (!targetRole) return [];

  const scoped = events.filter((event) => event.target_role === targetRole);
  const seen = new Set<string>();

  return scoped
    .filter((event) => {
      const key = event.message.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 2)
    .map((event, index) => ({
      id: `impact-${event.id}`,
      label: event.message,
      href: buildImpactEventHref({
        ...event,
        project_id: projectId ?? event.project_id,
      }),
      tone: toneFromImpact(event.tone),
      priority: 5 + index,
    }));
}

export function mergeImpactIntoMissionNextUp(
  items: NextUpItem[],
  impactItems: NextUpItem[],
  maxItems = 3,
): NextUpItem[] {
  if (impactItems.length === 0) return items.slice(0, maxItems);

  const existingLabels = new Set(items.map((item) => item.label.toLowerCase()));
  const dedupedImpact = impactItems.filter(
    (item) => !existingLabels.has(item.label.toLowerCase()),
  );

  return [...dedupedImpact, ...items].slice(0, maxItems);
}
