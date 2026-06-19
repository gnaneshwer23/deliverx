/** Panel shell ids prioritized in founder day-one layout (P-Founder-1). */
export const FOUNDER_DAY_ONE_PANEL_IDS = [
  "decisions",
  "intelligence-feed",
  "funding",
  "objectives",
  "founder-context",
] as const;

export type FounderDayOnePanelId = (typeof FOUNDER_DAY_ONE_PANEL_IDS)[number];

export function isFounderDayOnePanel(panelId: string): panelId is FounderDayOnePanelId {
  return (FOUNDER_DAY_ONE_PANEL_IDS as readonly string[]).includes(panelId);
}
