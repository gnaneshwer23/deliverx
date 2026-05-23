"use client";

import { useActionState } from "react";
import { resetPasswordAction, type ResetState } from "./actions";
import { dxClass } from "@/lib/dx-theme";

const initial: ResetState = { ok: false };

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className={dxClass.label}>New password</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={`${dxClass.input} mt-1.5`}
        />
      </label>

      <label className="block">
        <span className={dxClass.label}>Confirm password</span>
        <input
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={`${dxClass.input} mt-1.5`}
        />
      </label>

      {state.error ? (
        <p className="border border-[#C0392B]/30 bg-[#FDF1F0] px-3 py-2 text-sm text-[#C0392B]">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={`${dxClass.btnPrimary} w-full`}>
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
