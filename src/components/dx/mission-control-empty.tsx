import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";
import { dxClass } from "@/lib/dx-theme";

export function MissionControlNoProjectBanner({
  persona,
}: {
  persona: string;
}) {
  return (
    <div
      role="status"
      className={`${dxClass.card} flex flex-col gap-4 border-dashed border-[#C6DDD0] bg-[#EEF5F1]/40 p-6 sm:flex-row sm:items-center sm:justify-between`}
    >
      <div className="flex gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#EEF5F1] text-[#1C4A2E]">
          <FolderKanban size={18} aria-hidden />
        </span>
        <div>
          <p className="font-medium text-[#2C2C28]">No active projects yet</p>
          <p className="mt-1 max-w-xl text-sm text-[#6B6B64]">
            {persona} workspace view needs at least one project with delivery data.
            Create a programme or open an existing project to unlock guided tasks and live
            signals.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Link href="/project/new" className={`${dxClass.btnPrimary} inline-flex items-center gap-2 text-[10px]`}>
          <Plus size={12} aria-hidden /> New project
        </Link>
        <Link href="/workspace/projects" className={`${dxClass.btnGhost} text-[10px]`}>
          Browse projects
        </Link>
      </div>
    </div>
  );
}
