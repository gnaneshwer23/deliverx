"use client";

import { useActionState } from "react";
import { Settings } from "lucide-react";
import {
  updateOrganisationAction,
  type SettingsState,
} from "./actions";

const initial: SettingsState = { ok: false };

export function OrganisationSettingsForm({
  org,
}: {
  org: {
    name: string;
    industry: string | null;
    team_size: string | null;
    delivery_type: string | null;
  };
}) {
  const [state, action, pending] = useActionState(updateOrganisationAction, initial);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
          Organisation name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={org.name}
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="industry" className="mb-1 block text-sm font-medium text-slate-700">
            Industry
          </label>
          <input
            id="industry"
            name="industry"
            defaultValue={org.industry ?? ""}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="team_size" className="mb-1 block text-sm font-medium text-slate-700">
            Team size
          </label>
          <input
            id="team_size"
            name="team_size"
            defaultValue={org.team_size ?? ""}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label htmlFor="delivery_type" className="mb-1 block text-sm font-medium text-slate-700">
          Primary delivery type
        </label>
        <input
          id="delivery_type"
          name="delivery_type"
          defaultValue={org.delivery_type ?? ""}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      {state.error ? (
        <p className="text-sm text-rose-600">{state.error}</p>
      ) : null}
      {state.ok ? (
        <p className="text-sm text-emerald-600">Settings saved.</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-9 items-center justify-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

export function SettingsHeader() {
  return (
    <header className="mb-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
        <Settings size={22} className="text-slate-600" /> Settings
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Organisation profile and account details.
      </p>
    </header>
  );
}
