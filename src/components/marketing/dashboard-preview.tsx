import type { RoleDashboard, RoleId } from "@/lib/marketing/landing-data";
import { RolePreview } from "@/components/marketing/role-previews";

export function DashboardPreview({
  role,
  roleId,
  accentBorder,
}: {
  role: RoleDashboard;
  roleId: RoleId;
  accentBorder?: string;
}) {
  return <RolePreview roleId={roleId} role={role} accentBorder={accentBorder} />;
}
