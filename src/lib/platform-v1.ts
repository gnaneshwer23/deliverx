import {
  authenticatePlatformRequest,
  checkPlatformRateLimit,
  hasPlatformScope,
  type PlatformAuthContext,
} from "@/services/platformApi";

export type PlatformV1Context = {
  auth: PlatformAuthContext;
  rateHeaders: Record<string, string>;
};

export async function authorizePlatformV1Request(
  req: Request,
  requiredScope: string,
): Promise<PlatformV1Context | Response> {
  const auth = await authenticatePlatformRequest(req);
  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPlatformScope(auth.scopes, requiredScope)) {
    return Response.json({ error: `Missing scope ${requiredScope}` }, { status: 403 });
  }

  const rate = await checkPlatformRateLimit(auth.keyId);
  const rateHeaders = {
    "X-RateLimit-Limit": String(rate.limit),
    "X-RateLimit-Remaining": String(rate.remaining),
    "X-RateLimit-Reset": rate.resetAt,
  };

  if (!rate.allowed) {
    return Response.json(
      { error: "Rate limit exceeded", retryAfterSeconds: rate.retryAfterSeconds },
      {
        status: 429,
        headers: { ...rateHeaders, "Retry-After": String(rate.retryAfterSeconds) },
      },
    );
  }

  return { auth, rateHeaders };
}

export function platformV1Json(
  body: unknown,
  rateHeaders: Record<string, string>,
  status = 200,
): Response {
  return Response.json(body, { status, headers: rateHeaders });
}
