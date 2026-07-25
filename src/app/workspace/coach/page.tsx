import { ProfessionalModulePage } from "@/components/professional-workspace/module-page";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  return (
    <ProfessionalModulePage
      moduleId="coach"
      searchParams={searchParams}
      legacyHref="/workspace/assistant"
      legacyLabel="AI Workspace (legacy)"
    />
  );
}
