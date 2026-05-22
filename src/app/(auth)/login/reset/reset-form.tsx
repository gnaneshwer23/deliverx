"use client";

import { useActionState } from "react";
import {
  authButtonClass,
  authInputClass,
  authLabelClass,
} from "@/components/marketing/auth-panel";
import { resetPasswordAction, type ResetState } from "./actions";

const initial: ResetState = { ok: false };

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);

  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="block">
        <span className={authLabelClass}>New password</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={authInputClass}
        />
      </label>

      <label className="block">
        <span className={authLabelClass}>Confirm password</span>
        <input
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={authInputClass}
        />
      </label>

      {state.error ? (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={authButtonClass}>
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
