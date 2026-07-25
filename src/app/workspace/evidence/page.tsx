import { redirect } from "next/navigation";
import { PI_EVIDENCE_PATH } from "@/lib/pi-profile/paths";

export const dynamic = "force-dynamic";

/** Compat shim — next.config also 308-redirects; preserve query (?run=1). */
export default async function WorkspaceEvidenceRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") qs.set(key, value);
    else if (Array.isArray(value) && value[0]) qs.set(key, value[0]);
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  redirect(`${PI_EVIDENCE_PATH}${suffix}`);
}
