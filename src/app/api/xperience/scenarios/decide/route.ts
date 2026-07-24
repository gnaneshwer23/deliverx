import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { applyScenarioDecision } from "@/lib/xperience/score";
import { recordDecision } from "@/lib/xperience/store";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const data = body as {
    enrolmentId?: string;
    rationale?: string;
    choice?: {
      id?: string;
      label?: string;
      impact?: { trust?: number; delivery?: number; clarity?: number };
    };
  };

  const choiceId = String(data.choice?.id ?? "").trim();
  const choiceLabel = String(data.choice?.label ?? "").trim();
  if (!choiceId || !choiceLabel) {
    return NextResponse.json({ error: "Choice required" }, { status: 400 });
  }

  const impact = {
    trust: Number(data.choice?.impact?.trust ?? 0),
    delivery: Number(data.choice?.impact?.delivery ?? 0),
    clarity: Number(data.choice?.impact?.clarity ?? 0),
  };

  const result = applyScenarioDecision({
    choice: { id: choiceId, label: choiceLabel, impact },
    rationale: data.rationale,
  });

  try {
    const evidenceRecord = await recordDecision(supabase, user, {
      enrolmentId: data.enrolmentId,
      choiceId,
      choiceLabel,
      rationale: data.rationale,
      effects: impact,
      evidenceScore: result.evidenceScore,
    });

    return NextResponse.json({
      ...result,
      evidenceRecord,
    });
  } catch (error) {
    console.error("Experience decision failed", error);
    return NextResponse.json(
      {
        ...result,
        evidenceRecord: { mode: "demo", persisted: false },
      },
      { status: 200 },
    );
  }
}
