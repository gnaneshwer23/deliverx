import { ProfessionalModulePage } from "@/components/professional-workspace/module-page";
import { DevelopmentLoopPanel } from "@/components/pi/development-loop-panel";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  return (
    <div className="space-y-0">
      <ProfessionalModulePage
        moduleId="coach"
        searchParams={searchParams}
        legacyHref="/workspace/assistant"
        legacyLabel="AI Workspace (legacy)"
      />
      <div className="mx-auto max-w-3xl px-4 pb-10 sm:px-6">
        <div className="rounded-lg border border-[#E5E2D9] bg-white px-4 py-4">
          <h2 className="text-sm font-semibold text-[#1A1A18]">Recommended interventions</h2>
          <p className="mt-1 text-xs text-[#6B6B64]">
            Coach recommends reflection prompts, scenario practice, or learning pointers from your
            ScoreRun gaps. You accept — nothing auto-acts, and nothing assigns capability here.
          </p>
          <div className="mt-3">
            <DevelopmentLoopPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
