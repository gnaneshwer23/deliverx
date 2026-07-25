import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  listUnreadNotifications,
  markNotificationRead,
} from "@/lib/pi-review/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await listUnreadNotifications(supabase, user.id);
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ data, error: null });
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

  const notificationId = String(body.notificationId ?? "").trim();
  if (!notificationId) {
    return NextResponse.json({ error: "notificationId required" }, { status: 400 });
  }

  const { error } = await markNotificationRead(supabase, user.id, notificationId);
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ data: { ok: true }, error: null });
}
