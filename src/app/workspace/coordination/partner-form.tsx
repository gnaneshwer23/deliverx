"use client";

import { useActionState } from "react";
import { createPartnerAction, type PartnerState } from "./actions";

const initial: PartnerState = { ok: false };

export function PartnerForm() {
  const [state, action, pending] = useActionState(createPartnerAction, initial);

  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <div className="min-w-[140px] flex-1">
        <label htmlFor="partner-name" className="mb-1 block text-xs text-slate-500">
          Partner name
        </label>
        <input
          id="partner-name"
          name="name"
          required
          placeholder="Acme Consulting"
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label htmlFor="partner-type" className="mb-1 block text-xs text-slate-500">
          Type
        </label>
        <select
          id="partner-type"
          name="partner_type"
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="vendor">Vendor</option>
          <option value="client">Client</option>
          <option value="consulting_partner">Consulting partner</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-9 rounded-md bg-violet-600 px-3 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
      >
        Add partner
      </button>
      {state.error ? (
        <p className="w-full text-xs text-rose-600">{state.error}</p>
      ) : null}
      {state.ok ? (
        <p className="w-full text-xs text-emerald-600">Partner added.</p>
      ) : null}
    </form>
  );
}
