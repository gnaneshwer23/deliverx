/**
 * Shared helpers for T0/T6 signed-in API harnesses.
 * Cookie jar + fetch against a live Next app; Supabase admin for fixtures.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function loadDotEnvLocal(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const raw = readFileSync(path.resolve(__dirname, "../../.env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      out[m[1]!] = m[2]!.replace(/^["']|["']$/g, "");
    }
  } catch {
    // no .env.local
  }
  return out;
}

const dotenv = loadDotEnvLocal();
export const env = (key: string) => process.env[key]?.trim() || dotenv[key]?.trim() || "";

export type CookieJar = Map<string, string>;

export function createCookieJar(): CookieJar {
  return new Map();
}

export function cookieHeader(jar: CookieJar): string {
  return [...jar.entries()].map(([n, v]) => `${n}=${v}`).join("; ");
}

export async function apiFetch(
  baseUrl: string,
  jar: CookieJar,
  pathName: string,
  init: { method?: string; body?: unknown; noAuth?: boolean } = {},
): Promise<{ status: number; json: Record<string, unknown>; text: string }> {
  const res = await fetch(`${baseUrl}${pathName}`, {
    method: init.method ?? (init.body !== undefined ? "POST" : "GET"),
    headers: {
      "content-type": "application/json",
      ...(init.noAuth ? {} : { cookie: cookieHeader(jar) }),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    redirect: "manual",
  });
  const text = await res.text();
  let json: Record<string, unknown> = {};
  try {
    json = JSON.parse(text) as Record<string, unknown>;
  } catch {
    // non-JSON
  }
  return { status: res.status, json, text };
}

export function expectOk(
  res: { status: number; json: Record<string, unknown>; text: string },
  label: string,
  allowed: number[] = [200, 201],
): Record<string, unknown> {
  if (!allowed.includes(res.status)) {
    throw new Error(`${label} → HTTP ${res.status}: ${res.text.slice(0, 500)}`);
  }
  return res.json;
}

export function createAdminClient(url: string, serviceRoleKey: string): SupabaseClient {
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function signInWithCookies(input: {
  url: string;
  anonKey: string;
  email: string;
  password: string;
  jar: CookieJar;
}): Promise<void> {
  const authClient = createServerClient(input.url, input.anonKey, {
    cookies: {
      getAll: () => [...input.jar.entries()].map(([name, value]) => ({ name, value })),
      setAll: (cookies) => {
        for (const c of cookies) {
          if (c.value) input.jar.set(c.name, c.value);
          else input.jar.delete(c.name);
        }
      },
    },
  });
  const { error } = await authClient.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error) throw new Error(`signIn failed: ${error.message}`);
  if (input.jar.size === 0) throw new Error("sign-in produced no auth cookies");
}

export async function createConfirmedTestUser(
  admin: SupabaseClient,
  email: string,
  password: string,
  meta: Record<string, unknown> = {},
): Promise<string> {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { t6_qa: true, ...meta },
  });
  if (error || !data.user) throw new Error(`createUser failed: ${error?.message}`);
  return data.user.id;
}

export async function purgeUserFallback(
  admin: SupabaseClient,
  userId: string,
): Promise<void> {
  try {
    const { data: req } = await admin
      .from("pi_privacy_requests")
      .insert({ user_id: userId, request_type: "delete", status: "processing" })
      .select("id")
      .single();
    if (req) {
      await admin.rpc("pi_privacy_purge_person_data", {
        p_user_id: userId,
        p_request_id: req.id,
      });
    }
  } catch (err) {
    console.error("[t6] fallback purge failed", err);
  }
  try {
    await admin.auth.admin.deleteUser(userId);
  } catch (err) {
    console.error("[t6] fallback auth delete failed", err);
  }
}
