/**
 * Estimation pack types — pure definitions shared by services and UI.
 */

export type EstimationPackRole = "pm" | "ba" | "engineering" | "qa";

export type EstimationPackStatus = "draft" | "pending" | "approved" | "rejected";

export type EstimationLineItem = {
  id: string;
  title: string;
  days: number;
  notes?: string;
};

export const ESTIMATION_ROLE_LABELS: Record<EstimationPackRole, string> = {
  pm: "Project management",
  ba: "Business analysis",
  engineering: "Engineering",
  qa: "Quality assurance",
};

export function sumLineItemDays(items: EstimationLineItem[]): number {
  return Math.round(items.reduce((sum, item) => sum + item.days, 0) * 10) / 10;
}

export function normalizeLineItems(raw: unknown): EstimationLineItem[] {
  if (!Array.isArray(raw)) return [];
  const items: EstimationLineItem[] = [];
  raw.forEach((item, index) => {
    const row = item as Record<string, unknown>;
    const title = String(row.title ?? "").trim();
    const days = Number(row.days ?? 0);
    if (!title || !Number.isFinite(days) || days < 0) return;
    items.push({
      id: String(row.id ?? `item-${index + 1}`),
      title,
      days: Math.round(days * 10) / 10,
      notes: row.notes ? String(row.notes) : undefined,
    });
  });
  return items;
}
