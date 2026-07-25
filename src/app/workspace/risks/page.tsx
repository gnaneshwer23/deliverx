import { ProfessionalModulePage } from "@/components/professional-workspace/module-page";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  return (
    <ProfessionalModulePage
      moduleId="risks"
      searchParams={searchParams}
      legacyHref="/workspace/governance?tab=risks"
      legacyLabel="Governance · Risks"
    />
  );
}
