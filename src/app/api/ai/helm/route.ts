import { aiRouteError } from "@/lib/api/ai-route";
import { apiErrorResponse } from "@/lib/api/auth";
import { DEFAULT_AI_MODEL } from "@/lib/ai/anthropic";
import type { MissionPersonaId } from "@/lib/mission-nav";
import { buildHelmContext, runHelmChat, type HelmChatMessage } from "@/services/helmCopilot";

export const maxDuration = 30;

type Body = {
  messages?: HelmChatMessage[];
  personaId?: MissionPersonaId;
  projectId?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = body.messages?.filter(
    (m) => m.role && m.content?.trim() && (m.role === "user" || m.role === "assistant"),
  );

  if (!messages?.length || messages[messages.length - 1]?.role !== "user") {
    return Response.json({ error: "messages must end with a user message" }, { status: 400 });
  }

  try {
    const projectId = body.projectId?.trim() || null;
    const personaId = body.personaId ?? null;
    const context = await buildHelmContext({ personaId, projectId });
    const reply = await runHelmChat({ messages, personaId, projectId });
    return Response.json({
      ok: true,
      reply,
      context: {
        hasLiveData: context.hasLiveData,
        emptyHint: context.emptyHint,
        projectCount: context.projects.length,
        focusedProjectName: context.focusedProject?.name ?? null,
      },
      model: DEFAULT_AI_MODEL,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "Not authenticated") {
      return apiErrorResponse(err);
    }
    return aiRouteError(err);
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId");
  const personaId = url.searchParams.get("personaId") as MissionPersonaId | null;

  try {
    const context = await buildHelmContext({
      personaId,
      projectId,
    });
    return Response.json({ ok: true, context });
  } catch (err) {
    if (err instanceof Error && err.message === "Not authenticated") {
      return apiErrorResponse(err);
    }
    return apiErrorResponse(err);
  }
}
