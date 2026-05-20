import { NextResponse } from "next/server";
import { applyPlaybook } from "@/services/memory";

export async function POST(req: Request) {
  let body: { playbookId?: string; projectId?: string };
  try {
    body = (await req.json()) as { playbookId?: string; projectId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { playbookId, projectId } = body;
  if (!playbookId || !projectId) {
    return NextResponse.json(
      { error: "playbookId and projectId required" },
      { status: 400 },
    );
  }

  try {
    const project = await applyPlaybook(playbookId, projectId);
    return NextResponse.json({ ok: true, project });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Apply failed" },
      { status: 500 },
    );
  }
}
