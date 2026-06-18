import { requireAuth, apiErrorResponse } from "@/lib/api/auth";
import { createOrgApiKey, revokeOrgApiKey } from "@/services/platformApi";

export async function POST(req: Request) {
  try {
    await requireAuth();
    const body = (await req.json()) as { name?: string };
    if (!body.name?.trim()) {
      return Response.json({ error: "name is required" }, { status: 400 });
    }
    const result = await createOrgApiKey(body.name);
    return Response.json({ ok: true, ...result });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAuth();
    const body = (await req.json()) as { id?: string };
    if (!body.id) {
      return Response.json({ error: "id is required" }, { status: 400 });
    }
    await revokeOrgApiKey(body.id);
    return Response.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
