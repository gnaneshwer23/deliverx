import { requireAuth } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { runProjectDiscovery } from "@/services/aiProjectStructuring";

export const maxDuration = 30;

type Body = { brief?: string; answers?: Record<string, string> };

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const brief = body.brief?.trim();
  if (!brief) return Response.json({ error: "brief is required" }, { status: 400 });

  try {
    await requireAuth();
    const result = await runProjectDiscovery(brief, body.answers);
    return Response.json({ ok: true, ...result });
  } catch (err) {
    return aiRouteError(err);
  }
}
