import { ProfessionalModulePage } from "@/components/professional-workspace/module-page";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  return (
    <ProfessionalModulePage
      moduleId="inbox"
      searchParams={searchParams}
      legacyHref="/workspace/alerts"
      legacyLabel="Alert queue"
    />
  );
}
