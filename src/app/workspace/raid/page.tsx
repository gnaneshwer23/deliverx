import { redirect } from "next/navigation";
import { governanceTabHref } from "@/lib/governance-tabs";

export default function WorkspaceRaidRedirectPage() {
  redirect(governanceTabHref("risks"));
}
