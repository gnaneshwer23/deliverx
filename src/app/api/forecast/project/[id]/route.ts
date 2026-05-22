import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { forecastProject } from "@/services/portfolio";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", id)
    .single();
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const forecast = await forecastProject(id);
  return NextResponse.json(forecast);
}
