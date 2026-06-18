import { requireAuth, apiErrorResponse } from "@/lib/api/auth";
import { installMarketplaceAsset } from "@/services/marketplace";

export async function POST(req: Request) {
  try {
    await requireAuth();
    const body = (await req.json()) as { assetId?: string };
    const assetId = body.assetId?.trim();
    if (!assetId) {
      return Response.json({ error: "assetId required" }, { status: 400 });
    }

    const result = await installMarketplaceAsset(assetId);
    return Response.json({
      ok: true,
      playbookId: result.playbook.id,
      playbookName: result.playbook.name,
      installId: result.installId,
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
