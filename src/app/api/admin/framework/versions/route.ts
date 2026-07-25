import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/auth";
import { requireOrgAdmin } from "@/lib/brain/require-org-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createFrameworkVersion,
  listFrameworkVersions,
} from "@/lib/admin-framework/store";
import type {
  CreateFrameworkVersionRequest,
  CreateFrameworkVersionResponse,
  ListFrameworkVersionsResponse,
} from "@/lib/admin-framework/types";

/**
 * GET /api/admin/framework/versions
 * POST /api/admin/framework/versions
 *
 * Persistence against pi_cf_*. POST always creates a draft (optional clone).
 * Published content is never mutated — clone via cloneFromVersionId.
 */
export async function GET(request: Request) {
  try {
    await requireOrgAdmin();
  } catch (err) {
    return apiErrorResponse(err);
  }

  const url = new URL(request.url);
  const frameworkSlug = url.searchParams.get("frameworkSlug") ?? undefined;
  const statusParam = url.searchParams.getAll("status");

  const admin = createAdminClient();
  const result = await listFrameworkVersions(admin, {
    frameworkSlug,
    status: statusParam.length
      ? (statusParam as ListFrameworkVersionsResponse["versions"][number]["status"][])
      : undefined,
  });

  if (result.error) {
    return NextResponse.json(
      { error: result.error, code: result.code ?? "validation_failed" },
      { status: 500 },
    );
  }

  return NextResponse.json(result.data as ListFrameworkVersionsResponse);
}

export async function POST(request: Request) {
  let actorId: string | null = null;
  try {
    const auth = await requireOrgAdmin();
    actorId = auth.user.id;
  } catch (err) {
    return apiErrorResponse(err);
  }

  let body: CreateFrameworkVersionRequest;
  try {
    body = (await request.json()) as CreateFrameworkVersionRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON", code: "validation_failed" },
      { status: 400 },
    );
  }

  if (!body.frameworkSlug || !body.version || !body.title) {
    return NextResponse.json(
      {
        error: "frameworkSlug, version, and title are required",
        code: "validation_failed",
      },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const result = await createFrameworkVersion(admin, {
    ...body,
    actorId,
  });

  if (result.error) {
    const status = result.code === "not_found" ? 404 : 400;
    return NextResponse.json(
      { error: result.error, code: result.code ?? "validation_failed" },
      { status },
    );
  }

  const response: CreateFrameworkVersionResponse = {
    version: result.data!,
  };
  return NextResponse.json(response, { status: 201 });
}
