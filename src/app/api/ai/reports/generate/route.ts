import { requireProjectAccess } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { DEFAULT_AI_MODEL } from "@/lib/ai/anthropic";
import { generateReportDraft } from "@/services/aiGovernance";

type Body = {
  projectId?: string;
  reportType?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const projectId = body.projectId?.trim();
  if (!projectId) {
    return Response.json({ error: "projectId is required" }, { status: 400 });
  }

  try {
    const { project } = await requireProjectAccess(projectId);
    const draft = await generateReportDraft({
      projectId,
      projectName: project.name,
      reportType: body.reportType?.trim() || "status",
    });

    return Response.json({ ok: true, draft, model: DEFAULT_AI_MODEL });
  } catch (err) {
    return aiRouteError(err);
  }
}
