import type { DashboardPersonaId } from "@/lib/dashboard-prefs";

/** Persona-scoped text overrides keyed by field id (see inline edit field helpers). */
export type DashboardInlineEdits = Record<string, string>;

export const EMPTY_DASHBOARD_INLINE_EDITS: DashboardInlineEdits = {};

export function dashboardInlineEditStorageKey(personaId: DashboardPersonaId): string {
  return `dx-dashboard-inline-edit:${personaId}`;
}

export function aiSummaryFieldKey(): string {
  return "ai-summary";
}

export function panelNoteFieldKey(panelId: string): string {
  return `panel-note:${panelId}`;
}

export function parseDashboardInlineEdits(raw: string | null): DashboardInlineEdits {
  if (!raw) return { ...EMPTY_DASHBOARD_INLINE_EDITS };
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ...EMPTY_DASHBOARD_INLINE_EDITS };
    }
    const edits: DashboardInlineEdits = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string") edits[key] = value;
    }
    return edits;
  } catch {
    return { ...EMPTY_DASHBOARD_INLINE_EDITS };
  }
}

export function mergeDashboardInlineEdits(
  current: DashboardInlineEdits,
  patch: Partial<DashboardInlineEdits>,
): DashboardInlineEdits {
  const next: DashboardInlineEdits = { ...current };
  for (const [key, value] of Object.entries(patch)) {
    if (typeof value === "string") next[key] = value;
  }
  return next;
}

export function setInlineEditField(
  edits: DashboardInlineEdits,
  fieldKey: string,
  value: string,
): DashboardInlineEdits {
  const trimmed = value.trim();
  if (!trimmed) {
    const next = { ...edits };
    delete next[fieldKey];
    return next;
  }
  return { ...edits, [fieldKey]: trimmed };
}

export function resolveInlineText(
  edits: DashboardInlineEdits,
  fieldKey: string,
  defaultValue: string,
): string {
  const override = edits[fieldKey];
  if (override != null && override.length > 0) return override;
  return defaultValue;
}

export function readDashboardInlineEdits(personaId: DashboardPersonaId): DashboardInlineEdits {
  if (typeof window === "undefined") return { ...EMPTY_DASHBOARD_INLINE_EDITS };
  const raw = localStorage.getItem(dashboardInlineEditStorageKey(personaId));
  return parseDashboardInlineEdits(raw);
}

export function writeDashboardInlineEdits(
  personaId: DashboardPersonaId,
  edits: DashboardInlineEdits,
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(dashboardInlineEditStorageKey(personaId), JSON.stringify(edits));
}
