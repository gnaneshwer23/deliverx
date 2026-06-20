import { redirect } from "next/navigation";
import { governanceTabHref } from "@/lib/governance-tabs";

export default function WorkspaceDecisionsRedirectPage() {
  redirect(governanceTabHref("decisions"));
}
