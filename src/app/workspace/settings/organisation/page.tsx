import { redirect } from "next/navigation";
import { SETTINGS_WORKSPACE_PATH } from "@/lib/settings-routing";

/** Legacy path — redirect to new workspace settings route. */
export default function LegacyOrganisationSettingsPage() {
  redirect(SETTINGS_WORKSPACE_PATH);
}
