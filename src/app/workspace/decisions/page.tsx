import { ProfessionalModulePage } from "@/components/professional-workspace/module-page";

export default async function WorkspaceDecisionsPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  return (
    <ProfessionalModulePage
      moduleId="decisions"
      searchParams={searchParams}
      legacyHref="/workspace/governance?tab=decisions"
      legacyLabel="Governance · Decisions"
    />
  );
}
