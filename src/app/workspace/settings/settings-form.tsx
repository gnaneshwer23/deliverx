"use client";

import { useActionState } from "react";
import { Settings } from "lucide-react";
import { useFormToast } from "@/hooks/use-form-toast";
import {
  updateOrganisationAction,
  updateProfileAction,
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
  useFormToast(state, { success: "Organisation settings saved" });

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

export function ProfileSettingsForm({
  profile,
}: {
  profile: {
    name: string | null;
    email: string;
    role: string | null;
    avatar_url: string | null;
  };
}) {
  const [state, action, pending] = useActionState(updateProfileAction, initial);
  useFormToast(state, { success: "Profile updated" });

  const avatarInitial = (profile.name ?? profile.email).charAt(0).toUpperCase();

  return (
    <form action={action} className="space-y-4">
      <div className="flex items-center gap-4">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt=""
            className="size-14 rounded-full border border-slate-200 object-cover"
          />
        ) : (
          <span className="flex size-14 items-center justify-center rounded-full bg-[#0F766E]/10 text-lg font-semibold text-[#0F766E]">
            {avatarInitial}
          </span>
        )}
        <div className="text-sm text-slate-500">
          <p>{profile.email}</p>
          <p className="capitalize">{profile.role?.replace(/_/g, " ") ?? "Member"}</p>
        </div>
      </div>
      <div>
        <label htmlFor="display_name" className="mb-1 block text-sm font-medium text-slate-700">
          Display name
        </label>
        <input
          id="display_name"
          name="name"
          defaultValue={profile.name ?? ""}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="avatar_url" className="mb-1 block text-sm font-medium text-slate-700">
          Avatar URL
        </label>
        <input
          id="avatar_url"
          name="avatar_url"
          type="url"
          defaultValue={profile.avatar_url ?? ""}
          placeholder="https://…"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-slate-400">Optional image link (file upload coming later).</p>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-9 items-center justify-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Update profile"}
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
