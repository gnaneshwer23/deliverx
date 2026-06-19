export type PmProjectChipProject = {
  id: string;
  name: string;
};

export const PM_MISSION_BASE_PATH = "/workspace/pm-mission";

export function buildPmMissionProjectHref(projectId: string): string {
  return `${PM_MISSION_BASE_PATH}?project=${encodeURIComponent(projectId)}`;
}

/** Show dropdown when the org has more than one project to switch between. */
export function shouldShowPmProjectDropdown(projects: PmProjectChipProject[]): boolean {
  return projects.length > 1;
}

export function findPmSelectedProject(
  projects: PmProjectChipProject[],
  selectedId?: string | null,
): PmProjectChipProject | null {
  if (!projects.length) return null;
  if (selectedId) {
    const match = projects.find((project) => project.id === selectedId);
    if (match) return match;
  }
  return projects[0] ?? null;
}
