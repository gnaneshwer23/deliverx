/**
 * B7 — App-shell global search + help.
 * Shell utilities only: destinations route into existing products.
 * No Insights product Home (CX-05).
 */

export const SEARCH_HIT_KINDS = [
  "destination",
  "help",
  "evidence",
  "project",
  "artefact",
  "enrolment",
] as const;

export type SearchHitKind = (typeof SEARCH_HIT_KINDS)[number];

export type SearchHit = {
  id: string;
  kind: SearchHitKind;
  title: string;
  description: string;
  href: string;
  /** Extra terms matched by filter (not shown in UI). */
  keywords?: readonly string[];
};

export type GlobalSearchResponse = {
  ok: true;
  query: string;
  items: SearchHit[];
};
