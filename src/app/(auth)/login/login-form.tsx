"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  authButtonClass,
  authInputClass,
  authLabelClass,
  authLinkClass,
} from "@/components/marketing/auth-panel";
import { loginAction, type LoginState } from "./actions";

const initial: LoginState = { ok: false };

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <label className="block">
        <span className={authLabelClass}>Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          className={authInputClass}
        />
      </label>

      <label className="block">
        <div className="flex items-center justify-between">
          <span className={authLabelClass}>Password</span>
          <Link href="/login/forgot" className={`text-xs ${authLinkClass}`}>
            Forgot password?
          </Link>
        </div>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={authInputClass}
        />
      </label>

      {state.error ? (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={authButtonClass}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
