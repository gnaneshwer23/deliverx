export type { SearchHit, SearchHitKind, GlobalSearchResponse } from "@/lib/global-search/types";
export { SEARCH_HIT_KINDS } from "@/lib/global-search/types";
export {
  SEARCH_CATALOGUE,
  SEARCH_DESTINATIONS,
  HELP_ARTICLES,
} from "@/lib/global-search/catalogue";
export {
  filterCatalogue,
  moveSearchIndex,
  clampSearchIndex,
} from "@/lib/global-search/filter";
export { isGlobalSearchEnabled } from "@/lib/global-search/flag";
export type { GlobalSearchEnv } from "@/lib/global-search/flag";
export {
  searchOwnResources,
  searchCatalogueHits,
  runGlobalSearch,
} from "@/lib/global-search/search-own";
