import { aiRouteError } from "@/lib/api/ai-route";
import { apiErrorResponse } from "@/lib/api/auth";
import { DEFAULT_AI_MODEL } from "@/lib/ai/anthropic";
import { proposeAssistantActions } from "@/services/assistantActions";
import { runAssistantChat, type ChatMessage } from "@/services/assistant";

type Body = {
  messages?: ChatMessage[];
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
    const reply = await runAssistantChat(messages, projectId);
    const proposedActions = projectId
      ? await proposeAssistantActions(messages, projectId, reply).catch(() => [])
      : [];
    return Response.json({ ok: true, reply, proposedActions, model: DEFAULT_AI_MODEL });
  } catch (err) {
    if (err instanceof Error && err.message === "Not authenticated") {
      return apiErrorResponse(err);
    }
    return aiRouteError(err);
  }
}
