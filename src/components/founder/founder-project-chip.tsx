"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, FolderKanban } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFounderDashboardMode } from "@/components/founder/founder-mission-panel-switch";
import {
  buildFounderMissionProjectHref,
  findFounderSelectedProject,
  shouldShowFounderProjectDropdown,
  type FounderProjectChipProject,
} from "@/lib/founder-project-chip";

function ChipLabel({
  name,
  showSetupPulse,
}: {
  name: string;
  showSetupPulse: boolean;
}) {
  return (
    <>
      {showSetupPulse ? (
        <span
          className="size-1.5 shrink-0 animate-pulse rounded-full bg-[#3D9660]"
          aria-hidden
        />
      ) : (
        <FolderKanban size={12} className="shrink-0 text-[#3D9660]" aria-hidden />
      )}
      <span className="max-w-[12rem] truncate sm:max-w-[16rem]">{name}</span>
    </>
  );
}

function ChipShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#C6DDD0] bg-[#EEF5F1] px-3 py-1.5 text-xs font-medium text-[#1C4A2E] ${className}`}
    >
      {children}
    </span>
  );
}

export function FounderProjectChip({
  projects,
  selectedProjectId,
}: {
  projects: FounderProjectChipProject[];
  selectedProjectId?: string | null;
}) {
  const mode = useFounderDashboardMode();
  const selected = findFounderSelectedProject(projects, selectedProjectId);
  const showDropdown = shouldShowFounderProjectDropdown(projects);
  const showSetupPulse = mode === "day-one";

  if (!selected) return null;

  if (!showDropdown) {
    return (
      <ChipShell aria-label={`Project: ${selected.name}`}>
        <ChipLabel name={selected.name} showSetupPulse={showSetupPulse} />
      </ChipShell>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex min-h-9 touch-manipulation outline-none"
        aria-label={`Switch project — ${selected.name}`}
      >
        <ChipShell className="cursor-pointer transition hover:border-[#1C4A2E] hover:bg-[#E4F0EA]">
          <ChipLabel name={selected.name} showSetupPulse={showSetupPulse} />
          <ChevronDown size={12} className="shrink-0 text-[#3D9660]" aria-hidden />
        </ChipShell>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[12rem] border border-[#E4E4DC] bg-white p-1 shadow-md"
      >
        {projects.map((project) => {
          const isSelected = project.id === selected.id;
          return (
            <DropdownMenuItem
              key={project.id}
              className={`min-h-9 rounded-md px-2.5 py-2 text-sm text-[#2C2C28] focus:bg-[#EEF5F1] focus:text-[#1C4A2E] ${
                isSelected ? "bg-[#F7F7F2] font-medium" : ""
              }`}
              render={<Link href={buildFounderMissionProjectHref(project.id)} />}
            >
              <span className="truncate">{project.name}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
