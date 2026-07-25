import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/auth";
import { requireOrgAdmin } from "@/lib/brain/require-org-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isFrameworkPublicationStatus,
  isImmutableFrameworkStatus,
} from "@/lib/admin-framework/lifecycle";
import {
  getFrameworkVersionGraph,
  publishFrameworkVersion,
  transitionFrameworkVersionStatus,
} from "@/lib/admin-framework/store";
import type {
  GetFrameworkVersionResponse,
  PublishFrameworkVersionRequest,
  PublishFrameworkVersionResponse,
  TransitionFrameworkStatusRequest,
  TransitionFrameworkStatusResponse,
} from "@/lib/admin-framework/types";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/framework/versions/[id]
 * Load full FrameworkVersionGraph from pi_cf_*.
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireOrgAdmin();
  } catch (err) {
    return apiErrorResponse(err);
  }

  const { id } = await context.params;
  const admin = createAdminClient();
  const result = await getFrameworkVersionGraph(admin, id);

  if (result.error) {
    const status = result.code === "not_found" ? 404 : 500;
    return NextResponse.json(
      { error: result.error, code: result.code ?? "validation_failed" },
      { status },
    );
  }

  const body: GetFrameworkVersionResponse = { graph: result.data! };
  return NextResponse.json(body);
}

/**
 * PATCH /api/admin/framework/versions/[id]
 * Status transitions. Publish requires confirmImmutable + warning ack.
 * Content edits use child-resource routes (forbidden on published+).
 */
export async function PATCH(request: Request, context: RouteContext) {
  let actorId: string | null = null;
  try {
    const auth = await requireOrgAdmin();
    actorId = auth.user.id;
  } catch (err) {
    return apiErrorResponse(err);
  }

  const { id } = await context.params;
  let body: TransitionFrameworkStatusRequest &
    Partial<PublishFrameworkVersionRequest>;
  try {
    body = (await request.json()) as TransitionFrameworkStatusRequest &
      Partial<PublishFrameworkVersionRequest>;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON", code: "validation_failed" },
      { status: 400 },
    );
  }

  if (!isFrameworkPublicationStatus(body.toStatus)) {
    return NextResponse.json(
      { error: "Invalid toStatus", code: "validation_failed" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  if (body.toStatus === "published") {
    if (body.confirmImmutable !== true) {
      return NextResponse.json(
        {
          error:
            "Publishing freezes this framework version permanently. Pass confirmImmutable: true.",
          code: "publish_confirmation_required",
          versionId: id,
        },
        { status: 400 },
      );
    }

    const published = await publishFrameworkVersion(admin, {
      versionId: id,
      confirmImmutable: true,
      changelog: body.changelog,
      acknowledgedWarningIds: body.acknowledgedWarningIds,
      actorId,
    });

    if (published.error) {
      const status =
        published.code === "not_found"
          ? 404
          : published.code === "invalid_transition"
            ? 409
            : 400;
      return NextResponse.json(
        {
          error: published.error,
          code: published.code ?? "validation_failed",
          versionId: id,
        },
        { status },
      );
    }

    const response: PublishFrameworkVersionResponse = {
      version: published.data!.version,
      rubricVersionId: published.data!.rubricVersionId,
      auditEventId: published.data!.auditEventId,
    };
    return NextResponse.json(response);
  }

  const transitioned = await transitionFrameworkVersionStatus(admin, {
    versionId: id,
    toStatus: body.toStatus,
    actorId,
    note: body.note,
  });

  if (transitioned.error) {
    const status =
      transitioned.code === "not_found"
        ? 404
        : transitioned.code === "invalid_transition"
          ? 409
          : 400;
    return NextResponse.json(
      {
        error: transitioned.error,
        code: transitioned.code ?? "validation_failed",
        versionId: id,
      },
      { status },
    );
  }

  const response: TransitionFrameworkStatusResponse = {
    version: transitioned.data!.version,
    auditEventId: transitioned.data!.auditEventId,
  };
  return NextResponse.json({
    ...response,
    immutable: isImmutableFrameworkStatus(transitioned.data!.version.status),
  });
}

/**
 * PUT is intentionally unsupported for published content.
 * Clients must POST /versions with cloneFromVersionId.
 */
export async function PUT(_request: Request, context: RouteContext) {
  try {
    await requireOrgAdmin();
  } catch (err) {
    return apiErrorResponse(err);
  }

  const { id } = await context.params;
  return NextResponse.json(
    {
      error:
        "Do not PUT content onto a framework version. If published, clone a new draft; if draft, use entity sub-routes.",
      code: "immutable_version",
      versionId: id,
    },
    { status: 405 },
  );
}
