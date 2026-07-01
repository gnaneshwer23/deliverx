"use client";

import { useActionState } from "react";
import type { DbRole } from "@/config/persona-onboarding";
import { createOrganisationAction, type OrgState } from "./actions";
import { SelectWithOther } from "@/components/dx/select-with-other";
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

export function OrganisationForm({ preselectedRole }: { preselectedRole?: DbRole | null }) {
  const [state, formAction, pending] = useActionState(createOrganisationAction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {preselectedRole ? (
        <input type="hidden" name="preselected_role" value={preselectedRole} />
      ) : null}
      <Field
        label="Organisation name"
        name="name"
        required
        placeholder="NHS Transformation Unit"
        helper="The delivery unit, programme office, or company name your team recognises."
      />
      <SelectWithOther
        label="Industry"
        name="industry"
        otherName="industry_other"
        options={industries}
        helper="Delivery Brain uses this to suggest playbooks, RAID patterns, and benchmarks for your sector."
        otherPlaceholder="e.g. Higher Education, Defence, Non-profit"
        otherLabel="Tell us your industry"
      />
      <SelectField
        label="Team size"
        name="team_size"
        options={teamSizes}
        helper="Approximate delivery headcount. Helps size default workspaces and approval routes."
      />
      <SelectWithOther
        label="Delivery type"
        name="delivery_type"
        otherName="delivery_type_other"
        options={deliveryTypes}
        helper="What kind of change your team delivers most often. Shapes Brief v2 templates and AI review criteria."
        otherPlaceholder="e.g. Regulatory change, ERP rollout"
        otherLabel="Tell us your delivery type"
      />

      {state.error ? (
        <p className="border border-[#C0392B]/30 bg-[#FDF1F0] px-3 py-2 text-sm text-[#C0392B]">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={`${dxClass.btnPrimary} mt-1 w-full`}>
        {pending ? "Saving…" : "Continue →"}
      </button>
    </form>
  );
}

function Field(
  props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; helper?: string },
) {
  const { label, helper, id, ...rest } = props;
  const fieldId = id ?? props.name;
  return (
    <label htmlFor={fieldId} className="block">
      <span className={dxClass.label}>{label}</span>
      <input id={fieldId} {...rest} className={`${dxClass.input} mt-1.5`} />
      {helper ? (
        <p className="mt-1.5 text-[13px] font-light leading-snug text-[#6B7280]">{helper}</p>
      ) : null}
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  helper,
}: {
  label: string;
  name: string;
  options: string[];
  helper?: string;
}) {
  return (
    <label htmlFor={name} className="block">
      <span className={dxClass.label}>{label}</span>
      <select id={name} name={name} defaultValue="" className={`${dxClass.input} mt-1.5`}>
        <option value="" disabled>
          Select…
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {helper ? (
        <p className="mt-1.5 text-[13px] font-light leading-snug text-[#6B7280]">{helper}</p>
      ) : null}
    </label>
  );
}
