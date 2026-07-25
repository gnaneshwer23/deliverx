import { ProfessionalModulePage } from "@/components/professional-workspace/module-page";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  return (
    <ProfessionalModulePage
      moduleId="timeline"
      searchParams={searchParams}
      legacyHref="/workspace/pm-mission"
      legacyLabel="PM Mission Control"
    />
  );
}
