"use client";

import { useActionState } from "react";
import { resetPasswordAction, type ResetState } from "./actions";

const initial: ResetState = { ok: false };

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);

  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">New password</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-[#0F766E]/40 transition focus:border-[#0F766E] focus:ring-2"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Confirm password</span>
        <input
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-[#0F766E]/40 transition focus:border-[#0F766E] focus:ring-2"
        />
      </label>

      {state.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white transition hover:bg-[#0E6B62] disabled:opacity-60"
      >
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
