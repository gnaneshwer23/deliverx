import { OrganisationForm } from "./organisation-form";
import { ObCard } from "@/components/dx/ob-card";

export default function OrganisationPage() {
  return (
    <ObCard
      step="Step 1 of 4"
      title="Tell us about your organisation"
      description="We'll use this to set up your workspace and tailor delivery intelligence to your context."
    >
      <OrganisationForm />
    </ObCard>
  );
}
