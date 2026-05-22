import { OrganisationForm } from "./organisation-form";
import { SovereignCard } from "@/components/sovereign/sovereign-card";

export default function OrganisationPage() {
  return (
    <SovereignCard
      title="Tell us about your organisation"
      description="We'll use this to set up your workspace and tailor delivery intelligence to your context."
    >
      <OrganisationForm />
    </SovereignCard>
  );
}
