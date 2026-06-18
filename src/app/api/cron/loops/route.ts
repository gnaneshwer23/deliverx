import { NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/api/cron-auth";
import { captureAllCoordinationRuns } from "@/services/coordination";
import { captureAllGlobalContributions } from "@/services/global";
import { sweepOrgAgentOrchestration } from "@/services/agentOrchestration";
import { syncProposalQualityScores } from "@/services/continuousLearning";

/**
 * Vercel cron (07:00 UTC) — coordination snapshots + global network contributions.
 * Authorization: Bearer CRON_SECRET
 */
export async function GET(req: Request) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [coordination, global, agents, learning] = await Promise.all([
      captureAllCoordinationRuns(),
      captureAllGlobalContributions(),
      sweepOrgAgentOrchestration(3).catch(() => ({ runs: 0, projectIds: [] })),
      syncProposalQualityScores().catch(() => 0),
    ]);
    return NextResponse.json({
      ok: true,
      cron: true,
      coordination,
      global,
      agents,
      learning: { proposalScoresSynced: learning },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Cron loops failed" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
