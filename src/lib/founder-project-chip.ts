export type FounderProjectChipProject = {
  id: string;
  name: string;
};

export const FOUNDER_MISSION_BASE_PATH = "/workspace/founder";

export function buildFounderMissionProjectHref(projectId: string): string {
  return `${FOUNDER_MISSION_BASE_PATH}?project=${encodeURIComponent(projectId)}`;
}

/** Show dropdown when the org has more than one project to switch between. */
export function shouldShowFounderProjectDropdown(
  projects: FounderProjectChipProject[],
): boolean {
  return projects.length > 1;
}

export function findFounderSelectedProject(
  projects: FounderProjectChipProject[],
  selectedId?: string | null,
): FounderProjectChipProject | null {
  if (!projects.length) return null;
  if (selectedId) {
    const match = projects.find((project) => project.id === selectedId);
    if (match) return match;
  }
  return projects[0] ?? null;
}
