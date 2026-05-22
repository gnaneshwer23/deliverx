"use client";

import { useActionState } from "react";
import { createOrganisationAction, type OrgState } from "./actions";
import {
  SovereignError,
  SovereignInput,
  SovereignSelect,
} from "@/components/sovereign/sovereign-form";
import { sovereignClass } from "@/lib/sovereign-theme";

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
    <form action={formAction} className="space-y-4">
      <SovereignInput
        label="Organisation name"
        name="name"
        required
        placeholder="NHS Transformation Unit"
      />
      <SovereignSelect label="Industry" name="industry" options={industries} />
      <SovereignSelect label="Team size" name="team_size" options={teamSizes} />
      <SovereignSelect label="Delivery type" name="delivery_type" options={deliveryTypes} />

      {state.error ? <SovereignError>{state.error}</SovereignError> : null}

      <button
        type="submit"
        disabled={pending}
        className={`${sovereignClass.pillPrimary} mt-2 h-11 w-full disabled:opacity-50`}
      >
        {pending ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
