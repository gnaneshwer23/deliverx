import { NextResponse } from "next/server";
import {
  getProgramme,
  listDependencies,
  listProjectsForProgramme,
} from "@/services/portfolio";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const programme = await getProgramme(id);
    if (!programme) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const projects = await listProjectsForProgramme(id);
    const deps = await listDependencies({
      projectIds: projects.map((p) => p.id),
    });
    return NextResponse.json({ programme, projects, dependencies: deps });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
