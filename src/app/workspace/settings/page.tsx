import { redirect } from "next/navigation";
import { SETTINGS_PROFILE_PATH } from "@/lib/settings-routing";

/** Legacy path — redirect to new settings profile route. */
export default function LegacyWorkspaceSettingsPage() {
  redirect(SETTINGS_PROFILE_PATH);
}
