"use client";

import { useActionState } from "react";
import { shareAssetAction, type ShareState } from "./actions";

const initial: ShareState = { ok: false };

export function ShareAssetForm() {
  const [state, action, pending] = useActionState(shareAssetAction, initial);

  return (
    <form action={action} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <h3 className="text-sm font-semibold">Share to marketplace</h3>
      <div>
        <label htmlFor="asset-title" className="mb-1 block text-xs text-slate-500">
          Title
        </label>
        <input
          id="asset-title"
          name="title"
          required
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label htmlFor="asset-type" className="mb-1 block text-xs text-slate-500">
          Asset type
        </label>
        <select
          id="asset-type"
          name="asset_type"
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="playbook">Playbook</option>
          <option value="governance_template">Governance template</option>
          <option value="risk_library">Risk library</option>
          <option value="delivery_framework">Delivery framework</option>
        </select>
      </div>
      <div>
        <label htmlFor="asset-desc" className="mb-1 block text-xs text-slate-500">
          Description
        </label>
        <textarea
          id="asset-desc"
          name="description"
          rows={2}
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </div>
      <label className="flex items-center gap-2 text-xs text-slate-600">
        <input type="checkbox" name="is_public" value="true" />
        Publish publicly across ecosystem
      </label>
      <button
        type="submit"
        disabled={pending}
        className="h-9 rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62] disabled:opacity-60"
      >
        {pending ? "Sharing…" : "Share asset"}
      </button>
      {state.error ? <p className="text-xs text-rose-600">{state.error}</p> : null}
      {state.ok ? <p className="text-xs text-emerald-600">Asset shared.</p> : null}
    </form>
  );
}
