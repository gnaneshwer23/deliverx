/**
 * B9 shared PI API error contracts — honest failures, stable codes, calm copy.
 * Does not invent success; never implies capability or Verified.
 */

import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api/auth";

export const PI_ERROR_CODE = {
  unauthorized: "unauthorized",
  forbidden: "forbidden",
  notFound: "not_found",
  badRequest: "bad_request",
  conflict: "conflict",
  rateLimited: "rate_limited",
  invalidTransition: "invalid_transition",
  pending: "pending",
  retryable: "retryable",
  server: "server_error",
} as const;

export type PiErrorCode = (typeof PI_ERROR_CODE)[keyof typeof PI_ERROR_CODE];

export type PiErrorBody = {
  error: string;
  code: PiErrorCode;
  retryAfterSeconds?: number;
  [key: string]: unknown;
};

export function piErrorResponse(
  status: number,
  error: string,
  code: PiErrorCode,
  extras?: {
    retryAfterSeconds?: number;
    headers?: Record<string, string>;
    details?: Record<string, unknown>;
  },
): NextResponse {
  const body: PiErrorBody = { error, code, ...(extras?.details ?? {}) };
  if (typeof extras?.retryAfterSeconds === "number") {
    body.retryAfterSeconds = extras.retryAfterSeconds;
  }
  return NextResponse.json(body, {
    status,
    headers: extras?.headers,
  });
}

export function invalidTransitionResponse(
  from: string,
  to: string,
  entity = "activity",
): NextResponse {
  return piErrorResponse(
    409,
    `That ${entity} cannot move from “${from}” to “${to}”. Refresh and try a valid next step.`,
    PI_ERROR_CODE.invalidTransition,
    { details: { from, to } },
  );
}

export function pendingRetryResponse(
  message = "Still processing. Please wait a moment and try again.",
): NextResponse {
  return piErrorResponse(202, message, PI_ERROR_CODE.pending);
}

/** Map ApiError (and RateLimitError details) into the shared PI envelope. */
export function piApiErrorResponse(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    const code =
      (err.code as PiErrorCode | undefined) ??
      (err.status === 401
        ? PI_ERROR_CODE.unauthorized
        : err.status === 403
          ? PI_ERROR_CODE.forbidden
          : err.status === 404
            ? PI_ERROR_CODE.notFound
            : err.status === 409
              ? PI_ERROR_CODE.conflict
              : err.status === 429
                ? PI_ERROR_CODE.rateLimited
                : err.status >= 400 && err.status < 500
                  ? PI_ERROR_CODE.badRequest
                  : PI_ERROR_CODE.server);
    const body: PiErrorBody = { error: err.message, code, ...(err.details ?? {}) };
    return NextResponse.json(body, {
      status: err.status,
      headers: err.headers,
    });
  }
  const message = err instanceof Error ? err.message : "Request failed";
  return piErrorResponse(500, message, PI_ERROR_CODE.server);
}
