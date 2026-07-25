import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createReviewCase,
  listReviewCases,
  isPiReviewSubjectKind,
  type PiReviewStatus,
} from "@/lib/pi-review";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status");
  const openOnly = url.searchParams.get("open") === "1";
  let status: PiReviewStatus | PiReviewStatus[] | undefined;
  if (statusParam) {
    status = statusParam.split(",").filter(Boolean) as PiReviewStatus[];
  }

  const { data, error } = await listReviewCases(supabase, {
    userId: user.id,
    status,
    openOnly,
    limit: 100,
  });
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ data: data ?? [], error: null });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const subjectKindRaw = String(body.subjectKind ?? "");
  if (!isPiReviewSubjectKind(subjectKindRaw)) {
    return NextResponse.json({ error: "Invalid subjectKind" }, { status: 400 });
  }

  const subjectRefType = String(body.subjectRefType ?? "").trim();
  const subjectRefId = String(body.subjectRefId ?? "").trim();
  const subjectLabel = String(body.subjectLabel ?? "").trim();
  if (!subjectRefType || !subjectRefId || subjectLabel.length < 2) {
    return NextResponse.json(
      { error: "subjectRefType, subjectRefId, and subjectLabel required" },
      { status: 400 },
    );
  }

  const priorityRaw = String(body.priority ?? "normal");
  const priority =
    priorityRaw === "low" ||
    priorityRaw === "high" ||
    priorityRaw === "urgent" ||
    priorityRaw === "normal"
      ? priorityRaw
      : "normal";

  const { data, error } = await createReviewCase(supabase, {
    userId: user.id,
    subjectKind: subjectKindRaw,
    subjectRefType,
    subjectRefId,
    subjectLabel,
    subjectSnapshot:
      body.subjectSnapshot && typeof body.subjectSnapshot === "object"
        ? (body.subjectSnapshot as Record<string, unknown>)
        : {},
    priority,
  });

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ data, error: null }, { status: 201 });
}
