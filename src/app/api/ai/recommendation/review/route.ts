import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ReviewPayload = {
  projectId?: string;
  id?: string;
  action?: "accept" | "ignore";
};

export async function POST(req: Request) {
  let body: ReviewPayload;
  try {
    body = (await req.json()) as ReviewPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { projectId, id, action } = body;
  if (!projectId || !id || !action || !["accept", "ignore"].includes(action)) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // RLS-checked access — silently no-op if the user doesn't have this project.
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Persistence will land with the recommendation_reviews table.
  // For now we acknowledge so the client can complete the validation loop.
  return NextResponse.json({ ok: true, projectId, id, action });
}
