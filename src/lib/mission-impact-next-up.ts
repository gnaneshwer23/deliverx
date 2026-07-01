/**
 * Merge delivery_impact_events into mission Next up strips (F1 PM→BA handoff).
 */

import type { MissionPersonaId } from "@/lib/mission-nav";
import type { NextUpItem, NextUpTone } from "@/lib/next-up-items";
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

function impactEventHref(
  event: DeliveryImpactEventRow,
  personaId: MissionPersonaId,
  projectId?: string,
): string {
  const msg = event.message.toLowerCase();
  const projectQs = projectId ? `&project=${projectId}` : "";

  if (msg.includes("ai review queue") || msg.includes("business case uploaded")) {
    return `/workspace/proposals?persona=${personaId}${projectQs}`;
  }
  if (msg.includes("ba invite") || msg.includes("join link")) {
    return projectId
      ? `/workspace/pm-mission?project=${projectId}#ba-invite`
      : "/workspace/pm-mission#ba-invite";
  }
  if (msg.includes(" joined ") && msg.includes(" as ba")) {
    return projectId ? `/workspace/ba?project=${projectId}` : "/workspace/ba";
  }
  if (msg.includes("workspace created") || msg.includes("business case approved")) {
    return projectId ? `/workspace/pm-mission?project=${projectId}` : "/workspace/pm-mission";
  }

  return projectId
    ? `/workspace/pm-mission?project=${projectId}`
    : `/workspace/${personaId === "pm-mission" ? "pm-mission" : personaId}`;
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
      href: impactEventHref(event, personaId, projectId ?? event.project_id),
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
