import { ProfessionalModulePage } from "@/components/professional-workspace/module-page";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  return (
    <ProfessionalModulePage
      moduleId="artefacts"
      searchParams={searchParams}
      legacyHref="/workspace/documents"
      legacyLabel="Documents"
      secondaryHref="/workspace/proposals"
      secondaryLabel="AI output review"
    />
  );
}
