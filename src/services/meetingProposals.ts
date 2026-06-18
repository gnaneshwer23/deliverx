/**
 * Convert meeting AI output into structured proposals for the approval queue.
 * @deprecated Prefer intelligenceResultToProposals from meetingIntelligenceEngine.
 */

import type { MeetingSummaryResult } from "./aiGovernance";
import { intelligenceResultToProposals } from "./meetingIntelligenceEngine";

export function meetingResultToProposals(
  result: MeetingSummaryResult,
  meetingTitle: string,
  ceremonyType?: import("@/lib/ai/prompts/meeting-ceremonies").MeetingCeremonyType,
) {
  return intelligenceResultToProposals(result, meetingTitle, ceremonyType ?? "general");
}
