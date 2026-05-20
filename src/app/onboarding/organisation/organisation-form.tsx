"use client";

import { useActionState } from "react";
import { createOrganisationAction, type OrgState } from "./actions";

const initial: OrgState = { ok: false };

const industries = [
  "Healthcare",
  "Financial Services",
  "Public Sector",
  "Technology",
  "Manufacturing",
  "Energy",
  "Retail",
  "Other",
];

const teamSizes = ["1-10", "10-20", "20-50", "50-200", "200+"];

const deliveryTypes = [
  "Digital Transformation",
  "Healthcare Transformation",
  "Infrastructure",
  "Product Delivery",
  "Operations",
  "Other",
];

export function OrganisationForm() {
  const [state, formAction, pending] = useActionState(
    createOrganisationAction,
    initial,
  );

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <Text label="Organisation name" name="name" required placeholder="NHS Transformation Unit" />
      <Select label="Industry" name="industry" options={industries} />
      <Select label="Team size" name="team_size" options={teamSizes} />
      <Select label="Delivery type" name="delivery_type" options={deliveryTypes} />

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
        {pending ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}

function Text(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        {...rest}
        className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-[#0F766E]/40 transition focus:border-[#0F766E] focus:ring-2"
      />
    </label>
  );
}

function Select({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        name={name}
        defaultValue=""
        className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-[#0F766E]/40 transition focus:border-[#0F766E] focus:ring-2"
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
