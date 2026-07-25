import { NextResponse } from "next/server";
import { assertPiAccess } from "@/lib/access/gate";
import {
  listNotifications,
  markNotificationsRead,
  syncNotificationsFromDomainEvents,
} from "@/lib/notifications";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gate = assertPiAccess({
    userId: user.id,
    email: user.email,
    surface: "notifications",
  });
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  const url = new URL(request.url);
  const rawLimit = Number(url.searchParams.get("limit") ?? "50");
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 50;

  try {
    await syncNotificationsFromDomainEvents(supabase, user.id);
    const result = await listNotifications(supabase, user.id, limit);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[pi/notifications] list failed", error);
    return NextResponse.json({ error: "Could not load notifications" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gate = assertPiAccess({
    userId: user.id,
    email: user.email,
    surface: "notifications",
  });
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const value = body as { notificationIds?: unknown; all?: unknown };
  const ids = Array.isArray(value.notificationIds)
    ? value.notificationIds.filter((id): id is string => typeof id === "string" && id.length > 0)
    : undefined;
  if (value.all !== true && !ids?.length) {
    return NextResponse.json(
      { error: "notificationIds or all=true required" },
      { status: 400 },
    );
  }

  try {
    const updated = await markNotificationsRead(
      supabase,
      user.id,
      value.all === true ? undefined : ids,
    );
    return NextResponse.json({ ok: true, updated });
  } catch (error) {
    console.error("[pi/notifications] mark read failed", error);
    return NextResponse.json({ error: "Could not update notifications" }, { status: 500 });
  }
}
