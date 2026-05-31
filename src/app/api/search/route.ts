import { apiErrorResponse, requireAuth } from "@/lib/api/auth";
import { searchWorkspace } from "@/services/search";

export async function GET(req: Request) {
  try {
    await requireAuth();
    const q = new URL(req.url).searchParams.get("q") ?? "";
    const results = await searchWorkspace(q);
    return Response.json({ ok: true, ...results });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
