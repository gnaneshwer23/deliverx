"use client";

import { useActionState } from "react";
import { Shield } from "lucide-react";
import { useFormToast } from "@/hooks/use-form-toast";
import {
  saveOrgSsoSettingsAction,
  type SettingsState,
} from "@/app/workspace/settings/actions";
import type { OrgSsoSettings } from "@/services/orgSso";

const initial: SettingsState = { ok: false };

export function SsoSettingsForm({ settings }: { settings: OrgSsoSettings | null }) {
  const [state, formAction, pending] = useActionState(saveOrgSsoSettingsAction, initial);
  useFormToast(state, { success: "SSO settings saved" });

  const domains = settings?.allowed_domains.join(", ") ?? "";

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Shield size={20} className="mt-0.5 text-[#0F766E]" />
        <p className="text-sm text-[#6B6B64]">
          Route users with matching email domains to your identity provider via Supabase
          SAML. Configure the IdP in the Supabase dashboard, then list allowed domains
          here.
        </p>
      </div>

      <form action={formAction} className="space-y-4 rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-900">Domain routing</h3>

        <div>
          <label htmlFor="allowed_domains" className="mb-1 block text-sm font-medium text-slate-700">
            Allowed email domains
          </label>
          <input
            id="allowed_domains"
            name="allowed_domains"
            defaultValue={domains}
            placeholder="acme.com, nhs.uk"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-[#6B6B64]">
            Comma-separated. Users signing in with these domains see the SSO button.
          </p>
        </div>

        <div>
          <label htmlFor="idp_name" className="mb-1 block text-sm font-medium text-slate-700">
            Identity provider label (optional)
          </label>
          <input
            id="idp_name"
            name="idp_name"
            defaultValue={settings?.idp_name ?? ""}
            placeholder="Okta, Azure AD, Google Workspace"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="enabled"
            defaultChecked={settings?.enabled ?? false}
            className="rounded border-slate-300"
          />
          Enable SSO for listed domains
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="sso_required"
            defaultChecked={settings?.sso_required ?? false}
            className="rounded border-slate-300"
          />
          Require SSO (hide password sign-in for matched domains)
        </label>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 items-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save SSO settings"}
        </button>
      </form>

      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
    </div>
  );
}
