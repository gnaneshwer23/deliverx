import type { SearchHit } from "@/lib/global-search/types";

function normalize(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

function haystack(item: SearchHit): string {
  const parts = [item.title, item.description, item.href, ...(item.keywords ?? [])];
  return normalize(parts.join(" "));
}

/**
 * Case-insensitive substring filter over title, description, href, and keywords.
 * Empty query returns the catalogue unchanged (callers may still limit display).
 */
export function filterCatalogue(
  items: readonly SearchHit[],
  query: string,
): SearchHit[] {
  const q = normalize(query);
  if (!q) return [...items];
  const tokens = q.split(" ").filter(Boolean);
  return items.filter((item) => {
    const text = haystack(item);
    return tokens.every((token) => text.includes(token));
  });
}

/**
 * Keyboard list index: ArrowDown / ArrowUp with wrap-around.
 * Returns the same index when length is 0.
 */
export function moveSearchIndex(
  current: number,
  direction: "ArrowDown" | "ArrowUp",
  length: number,
): number {
  if (length <= 0) return 0;
  if (direction === "ArrowDown") {
    return (current + 1) % length;
  }
  return (current - 1 + length) % length;
}

/** Clamp active index after a result-set shrink. */
export function clampSearchIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  if (index < 0) return 0;
  if (index >= length) return length - 1;
  return index;
}
