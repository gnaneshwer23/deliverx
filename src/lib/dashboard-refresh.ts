import { revalidatePath } from "next/cache";

/** Revalidate all persona mission controls and project surfaces after an approved apply. */
export function refreshProjectDashboards(projectId: string): void {
  const projectPaths = [
    `/project/${projectId}`,
    `/project/${projectId}/tasks`,
    `/project/${projectId}/raid`,
    `/project/${projectId}/decisions`,
    `/project/${projectId}/meetings`,
    `/project/${projectId}/requirements`,
    `/project/${projectId}/traceability`,
    `/project/${projectId}/delivery`,
    `/project/${projectId}/engineering`,
    `/project/${projectId}/qa`,
    `/project/${projectId}/scrum`,
    `/project/${projectId}/product`,
  ];

  for (const path of projectPaths) {
    revalidatePath(path);
  }

  const workspacePaths = [
    "/workspace/dashboard",
    "/workspace/proposals",
    "/workspace/tasks",
    "/workspace/raid",
    "/workspace/decisions",
    "/workspace/meetings",
    "/workspace/founder",
    "/workspace/product",
    "/workspace/pm-mission",
    "/workspace/ba",
    "/workspace/engineer",
    "/workspace/qa",
    "/workspace/scrum-mission",
    "/workspace/governance",
  ];

  for (const path of workspacePaths) {
    revalidatePath(path);
  }
}
