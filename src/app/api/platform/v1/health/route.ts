import {
  authorizePlatformV1Request,
  platformV1Json,
} from "@/lib/platform-v1";
import { runPhaseDSmokeTests } from "@/services/phaseDHealth";

export async function GET(req: Request) {
  const authResult = await authorizePlatformV1Request(req, "read:health");
  if (authResult instanceof Response) return authResult;

  const smoke = runPhaseDSmokeTests();
  return platformV1Json(
    {
      ok: smoke.every((s) => s.ok),
      organisationId: authResult.auth.orgId,
      phase: "D",
      smokeTests: smoke,
      checkedAt: new Date().toISOString(),
    },
    authResult.rateHeaders,
  );
}
