import { NextResponse } from "next/server";
import { simulateCopilot } from "@/services/global";
import { COPILOT_SCENARIOS, type CopilotScenarioId } from "@/services/globalEngine";

export async function POST(req: Request) {
  let body: { scenario?: string };
  try {
    body = (await req.json()) as { scenario?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const scenario = body.scenario as CopilotScenarioId | undefined;
  const valid = COPILOT_SCENARIOS.map((s) => s.id);
  if (!scenario || !valid.includes(scenario)) {
    return NextResponse.json(
      { error: "Invalid scenario", valid },
      { status: 400 },
    );
  }

  try {
    const result = await simulateCopilot(scenario);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
