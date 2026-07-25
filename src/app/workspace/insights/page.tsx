import { redirect } from "next/navigation";

/** Insights module → existing intelligence surface */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const params = await searchParams;
  const q = params.project ? `?project=${encodeURIComponent(params.project)}` : "";
  redirect(`/workspace/intelligence${q}`);
}
