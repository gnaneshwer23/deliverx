export type { GuideLink, GuideSection, MarketingGuide } from "@/lib/marketing/guides/types";
export { PM_PORTFOLIO_GUIDE } from "@/lib/marketing/guides/pm-portfolio";
export { STAR_INTERVIEW_STORIES_GUIDE } from "@/lib/marketing/guides/star-interview-stories";

import { PM_PORTFOLIO_GUIDE } from "@/lib/marketing/guides/pm-portfolio";
import { STAR_INTERVIEW_STORIES_GUIDE } from "@/lib/marketing/guides/star-interview-stories";
import type { MarketingGuide } from "@/lib/marketing/guides/types";

/** Flagship discovery guides linked from Resources (Phase 2). */
export const FLAGSHIP_GUIDES: readonly MarketingGuide[] = [
  PM_PORTFOLIO_GUIDE,
  STAR_INTERVIEW_STORIES_GUIDE,
] as const;
