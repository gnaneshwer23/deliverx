import { Badge } from "@/components/ui/badge";

type Status =
  | { ok: true; project: string }
  | { ok: false; reason: "missing-env" | "fetch-failed"; detail?: string };

async function checkSupabase(): Promise<Status> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    return { ok: false, reason: "missing-env" };
  }

  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: anon },
      // Avoid caching at build time so the UI always reflects current status.
      cache: "no-store",
    });
    if (!res.ok) {
      return { ok: false, reason: "fetch-failed", detail: `HTTP ${res.status}` };
    }
    const project = new URL(url).hostname.split(".")[0];
    return { ok: true, project };
  } catch (err) {
    return {
      ok: false,
      reason: "fetch-failed",
      detail: err instanceof Error ? err.message : "unknown error",
    };
  }
}

export async function SupabaseStatus() {
  const status = await checkSupabase();

  if (status.ok) {
    return (
      <Badge variant="secondary" className="gap-2">
        <span className="inline-block size-2 rounded-full bg-green-500" />
        Connected to Supabase · {status.project}
      </Badge>
    );
  }

  if (status.reason === "missing-env") {
    return (
      <Badge variant="outline" className="gap-2">
        <span className="inline-block size-2 rounded-full bg-yellow-500" />
        Supabase not configured — set NEXT_PUBLIC_SUPABASE_URL & ANON_KEY in
        .env.local
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="gap-2">
      <span className="inline-block size-2 rounded-full bg-white" />
      Supabase unreachable {status.detail ? `(${status.detail})` : ""}
    </Badge>
  );
}
