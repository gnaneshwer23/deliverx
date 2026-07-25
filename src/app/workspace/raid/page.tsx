import { redirect } from "next/navigation";

/** Retired path — Professional Workspace Risks module is canonical. */
export default async function WorkspaceRaidRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const params = await searchParams;
  const q = params.project ? `?project=${encodeURIComponent(params.project)}` : "";
  redirect(`/workspace/risks${q}`);
}
