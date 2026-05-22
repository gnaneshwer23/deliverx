import { RoleForm } from "./role-form";
import { SovereignCard } from "@/components/sovereign/sovereign-card";

export default function RolePage() {
  return (
    <SovereignCard
      title="What's your role?"
      description="We'll tailor your workspace — dashboards, shortcuts, and intelligence — to how you deliver."
    >
      <RoleForm />
    </SovereignCard>
  );
}
