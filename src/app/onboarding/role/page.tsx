import { RoleForm } from "./role-form";
import { ObCard } from "@/components/dx/ob-card";

export default function RolePage() {
  return (
    <ObCard
      step="Step 2 of 4"
      title="What's your role?"
      description="We'll tailor dashboards, shortcuts, and intelligence to how you deliver."
    >
      <RoleForm />
    </ObCard>
  );
}
