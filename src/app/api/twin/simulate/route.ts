import { NextResponse } from "next/server";
import { simulate } from "@/services/twin";
import type { ScenarioId } from "@/services/twinEngine";

const VALID: ScenarioId[] = [
  "increase_governance_speed",
  "dependency_delay",
  "resolve_top_blockers",
  "split_critical_milestone",
  "add_team_capacity",
  "escalate_top_dependency",
];

type Body = { scenarioId?: ScenarioId; intensity?: number };

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.scenarioId || !VALID.includes(body.scenarioId)) {
    return NextResponse.json(
      { error: "Missing or invalid scenarioId" },
      { status: 400 },
    );
  }
  try {
    const result = await simulate({
      scenarioId: body.scenarioId,
      intensity:
        typeof body.intensity === "number" ? body.intensity : undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
