import { redirect } from "next/navigation";

/** Retired marketing path — Professional Workspace is canonical. */
export default function TeamCopilotRedirectPage() {
  redirect("/professional-workspace");
}
