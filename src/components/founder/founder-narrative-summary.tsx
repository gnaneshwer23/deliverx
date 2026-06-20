"use client";

import { EditableMissionAiSummary } from "@/components/dx/editable-mission-ai-summary";

export function FounderNarrativeSummary({ summary }: { summary: string }) {
  return (
    <div data-panel="founder-narrative-summary">
      <EditableMissionAiSummary
        title="Since you last looked"
        summary={summary}
        icon
      />
    </div>
  );
}
