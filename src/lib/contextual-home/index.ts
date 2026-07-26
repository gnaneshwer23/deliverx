export { isContextualHomeEnabled } from "@/lib/contextual-home/flag";
export { resolveHomeState } from "@/lib/contextual-home/resolve-home-state";
export { buildDailyBriefing } from "@/lib/contextual-home/build-daily-briefing";
export {
  projectHomeSignals,
  isActiveExperienceWork,
} from "@/lib/contextual-home/project-signals";
export type {
  DailyBriefing,
  HomeState,
  HomeStateSignals,
  HomeBriefingCard,
  HomePrimaryAction,
  HomeCitation,
} from "@/lib/contextual-home/types";
export { HOME_STATES, homeStateLetter } from "@/lib/contextual-home/types";
