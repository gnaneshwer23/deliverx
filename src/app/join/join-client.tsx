"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { SignupForm } from "@/app/(auth)/signup/signup-form";
import { DxCaps } from "@/components/dx/dx-logo";
import { buildJoinReturnPath, formatInviteRoleLabel } from "@/lib/invite-role-labels";
import { dxClass } from "@/lib/dx-theme";

type InvitePreview = {
  ok: true;
  projectId: string;
  projectName: string;
  role: string;
  invitedByName: string;
  viewMode: string;
  expiresAt: string;
};

type InviteError = {
  ok: false;
  message?: string;
};

export function JoinClient({ authenticated }: { authenticated: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const view = searchParams.get("view");

  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(() =>
    token ? null : "This invite link is missing a token.",
  );
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [loading, setLoading] = useState(() => Boolean(token));

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/invites/validate?token=${encodeURIComponent(token)}`);
        const data = (await res.json()) as InvitePreview | InviteError & { message?: string };
        if (cancelled) return;
        if (!res.ok || !("ok" in data) || !data.ok) {
          setLoadError(
            ("message" in data && data.message) ||
              "This invite link is not valid — ask your Project Manager for a new one.",
          );
          setPreview(null);
          return;
        }
        setPreview(data);
        setLoadError(null);
      } catch {
        if (!cancelled) {
          setLoadError("Could not validate invite. Check your connection and try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function acceptInvite() {
    if (!token) return;
    setAccepting(true);
    setAcceptError(null);
    try {
      const res = await fetch("/api/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        redirectPath?: string;
      };
      if (!res.ok || !data.ok || !data.redirectPath) {
        setAcceptError(data.error ?? "Could not accept invite.");
        return;
      }
      router.push(data.redirectPath);
      router.refresh();
    } catch {
      setAcceptError("Could not accept invite. Try again.");
    } finally {
      setAccepting(false);
    }
  }

  const loginHref = token
    ? `/login?next=${encodeURIComponent(buildJoinReturnPath(token, view))}`
    : "/login";
  const signupJoinToken = token || undefined;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--dx-page)] text-[#0D0D0B]">
      <header className={`${dxClass.navBar} px-6 py-4`}>
        <Link href="/" className={`${dxClass.display} text-xl tracking-tight text-[#1C4A2E]`}>
          DeliverX
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {loading ? (
            <div className={`${dxClass.cardPad} flex flex-col items-center gap-3 text-center`}>
              <Loader2 size={24} className="animate-spin text-[#1C4A2E]" aria-hidden />
              <p className="text-sm text-[#6B6B64]">Validating invite…</p>
            </div>
          ) : loadError ? (
            <div className={`${dxClass.cardPad} text-center`}>
              <h1 className={`${dxClass.display} text-xl text-[#0D0D0B]`}>Invite unavailable</h1>
              <p className="mt-2 text-sm text-[#6B6B64]">{loadError}</p>
              <Link href="/" className="mt-6 inline-flex text-sm font-medium text-[#1C4A2E] hover:underline">
                Back to DeliverX
              </Link>
            </div>
          ) : preview ? (
            <div className={`${dxClass.cardPad} space-y-6`}>
              <div>
                <DxCaps className="text-[#1C4A2E]">Project invite</DxCaps>
                <h1 className={`${dxClass.display} mt-2 text-2xl text-[#0D0D0B]`}>
                  Join {preview.projectName}
                </h1>
                <p className="mt-2 text-sm text-[#6B6B64]">
                  {preview.invitedByName} invited you as{" "}
                  <span className="font-medium text-[#2C2C28]">
                    {formatInviteRoleLabel(preview.role)}
                  </span>
                  {preview.viewMode === "read_only" ? " (read-only sponsor view)" : ""}.
                </p>
                <p className="mt-1 text-xs text-[#9CA3AF]">
                  Expires {new Date(preview.expiresAt).toLocaleDateString()}
                </p>
              </div>

              {authenticated ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    disabled={accepting}
                    onClick={() => void acceptInvite()}
                    className={`${dxClass.btnPrimary} w-full`}
                  >
                    {accepting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Joining workspace…
                      </>
                    ) : (
                      "Accept invite →"
                    )}
                  </button>
                  {acceptError ? (
                    <p className="border border-[#C0392B]/30 bg-[#FDF1F0] px-3 py-2 text-sm text-[#C0392B]">
                      {acceptError}
                    </p>
                  ) : null}
                </div>
              ) : (
                <>
                  <div className="rounded-lg border border-[#C6DDD0] bg-[#EEF5F1] px-4 py-3 text-sm text-[#1C4A2E]">
                    Create an account or sign in to join this project workspace.
                  </div>

                  <SignupForm joinToken={signupJoinToken} />

                  <p className="text-center text-sm text-[#6B6B64]">
                    Already have an account?{" "}
                    <Link href={loginHref} className="font-medium text-[#1C4A2E] hover:underline">
                      Sign in
                    </Link>
                  </p>
                </>
              )}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
