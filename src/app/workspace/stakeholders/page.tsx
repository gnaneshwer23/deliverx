import { ProfessionalModulePage } from "@/components/professional-workspace/module-page";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  return (
    <ProfessionalModulePage
      moduleId="stakeholders"
      searchParams={searchParams}
      legacyHref="/workspace/team"
      legacyLabel="Team & governance"
    />
  );
}
