import { requireAuth } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { DEFAULT_AI_MODEL } from "@/lib/ai/anthropic";
import { reviewBusinessCase } from "@/services/aiBusinessCaseReview";
import { getCurrentOrganisationProfile } from "@/services/organisationProfile";

type Body = { content?: string };

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const content = body.content?.trim();
  if (!content) {
    return Response.json({ error: "content is required" }, { status: 400 });
  }

  try {
    await requireAuth();
    const orgProfile = await getCurrentOrganisationProfile();
    const review = await reviewBusinessCase(content, {
      industry: orgProfile.industry,
      deliveryType: orgProfile.deliveryType,
    });
    return Response.json({ ok: true, review, model: DEFAULT_AI_MODEL });
  } catch (err) {
    return aiRouteError(err);
  }
}
