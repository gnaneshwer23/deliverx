"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { dxClass } from "@/lib/dx-theme";
import { SsoLoginPanel } from "@/components/auth/sso-login-panel";
import { loginAction, type LoginState } from "./actions";

const initial: LoginState = { ok: false };

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initial);
  const [email, setEmail] = useState("");
  const [ssoRequired, setSsoRequired] = useState(false);

  return (
    <>
      <form action={formAction} className="flex flex-col gap-3.5">
        {next ? <input type="hidden" name="next" value={next} /> : null}

        <label className="block">
          <span className={dxClass.label}>Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="alex@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={dxClass.input}
          />
        </label>

        {!ssoRequired ? (
          <label className="block">
            <div className="flex items-center justify-between">
              <span className={dxClass.label}>Password</span>
              <Link
                href="/login/forgot"
                className="inline-flex min-h-11 items-center text-xs text-[#1C4A2E] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              name="password"
              type="password"
              required={!ssoRequired}
              autoComplete="current-password"
              className={dxClass.input}
            />
          </label>
        ) : (
          <input type="hidden" name="password" value="" />
        )}

        {state.error ? (
          <p className="border border-[#C0392B]/30 bg-[#FDF1F0] px-3 py-2 text-sm text-[#C0392B]">
            {state.error}
          </p>
        ) : null}

        {!ssoRequired ? (
          <button type="submit" disabled={pending} className={`${dxClass.btnPrimary} w-full`}>
            {pending ? "Signing in…" : "Sign In →"}
          </button>
        ) : null}
      </form>

      <SsoLoginPanel
        email={email}
        next={next}
        onSsoRequiredChange={setSsoRequired}
      />
    </>
  );
}
