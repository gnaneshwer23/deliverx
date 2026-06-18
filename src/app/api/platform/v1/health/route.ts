import {
  authenticatePlatformRequest,
  hasPlatformScope,
} from "@/services/platformApi";
import { runPhaseDSmokeTests } from "@/services/phaseDHealth";

export async function GET(req: Request) {
  const auth = await authenticatePlatformRequest(req);
  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPlatformScope(auth.scopes, "read:health")) {
    return Response.json({ error: "Missing scope read:health" }, { status: 403 });
  }

  const smoke = runPhaseDSmokeTests();
  return Response.json({
    ok: smoke.every((s) => s.ok),
    organisationId: auth.orgId,
    phase: "D",
    smokeTests: smoke,
    checkedAt: new Date().toISOString(),
  });
}
