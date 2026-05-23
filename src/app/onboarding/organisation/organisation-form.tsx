"use client";

import { useActionState } from "react";
import { createOrganisationAction, type OrgState } from "./actions";
import { dxClass } from "@/lib/dx-theme";

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
  const [state, formAction, pending] = useActionState(createOrganisationAction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-3.5">
      <Field label="Organisation name" name="name" required placeholder="NHS Transformation Unit" />
      <Select label="Industry" name="industry" options={industries} />
      <Select label="Team size" name="team_size" options={teamSizes} />
      <Select label="Delivery type" name="delivery_type" options={deliveryTypes} />

      {state.error ? (
        <p className="border border-[#C0392B]/30 bg-[#FDF1F0] px-3 py-2 text-sm text-[#C0392B]">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={`${dxClass.btnPrimary} w-full`}>
        {pending ? "Saving…" : "Continue →"}
      </button>
    </form>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <label className="block">
      <span className={dxClass.label}>{label}</span>
      <input {...rest} className={dxClass.input} />
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
      <span className={dxClass.label}>{label}</span>
      <select name={name} defaultValue="" className={dxClass.input}>
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
