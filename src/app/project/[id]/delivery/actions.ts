"use server";

import { revalidatePath } from "next/cache";
import {
  createWorkstream,
  createTask,
  updateTask,
  updateWorkstream,
  deleteWorkstream,
  deleteTask,
  type TaskPriority,
  type TaskStatus,
  type WorkstreamStatus,
} from "@/services/delivery";

export type ActionState = { ok: boolean; error?: string };

function revalidateDelivery(projectId: string) {
  revalidatePath(`/project/${projectId}`);
  revalidatePath(`/project/${projectId}/workstreams`);
  revalidatePath(`/project/${projectId}/tasks`);
  revalidatePath("/workspace/tasks");
  revalidatePath("/workspace/dashboard");
}

export async function createWorkstreamAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") ?? "");
  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");
  const status = String(formData.get("status") ?? "planned") as WorkstreamStatus;

  try {
    await createWorkstream({ projectId, name, description, status });
    revalidateDelivery(projectId);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to create workstream",
    };
  }
}

export async function createTaskAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") ?? "");
  const workstreamId = String(formData.get("workstreamId") ?? "") || undefined;
  const title = String(formData.get("title") ?? "");
  const description = String(formData.get("description") ?? "");
  const status = String(formData.get("status") ?? "todo") as TaskStatus;
  const priority = String(formData.get("priority") ?? "medium") as TaskPriority;
  const dueDate = String(formData.get("dueDate") ?? "") || undefined;
  const blockedReason = String(formData.get("blockedReason") ?? "") || undefined;

  try {
    await createTask({
      projectId,
      workstreamId,
      title,
      description,
      status,
      priority,
      dueDate,
      blockedReason: status === "blocked" ? blockedReason : undefined,
    });
    revalidateDelivery(projectId);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to create task",
    };
  }
}

export async function updateTaskStatusAction(
  taskId: string,
  projectId: string,
  status: TaskStatus,
): Promise<ActionState> {
  try {
    await updateTask(taskId, { status });
    revalidateDelivery(projectId);
    revalidatePath(`/project/${projectId}/tasks/${taskId}`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update task",
    };
  }
}

export async function updateTaskAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const taskId = String(formData.get("taskId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");
  const title = String(formData.get("title") ?? "");
  const description = String(formData.get("description") ?? "");
  const status = String(formData.get("status") ?? "todo") as TaskStatus;
  const priority = String(formData.get("priority") ?? "medium") as TaskPriority;
  const workstreamId = String(formData.get("workstreamId") ?? "") || null;
  const dueDate = String(formData.get("dueDate") ?? "") || null;
  const blockedReason = String(formData.get("blockedReason") ?? "") || null;

  try {
    await updateTask(taskId, {
      title,
      description: description || null,
      status,
      priority,
      workstream_id: workstreamId,
      due_date: dueDate,
      blocked_reason: status === "blocked" ? blockedReason : null,
    });
    revalidateDelivery(projectId);
    revalidatePath(`/project/${projectId}/tasks/${taskId}`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update task",
    };
  }
}

export async function updateWorkstreamStatusAction(
  workstreamId: string,
  projectId: string,
  status: WorkstreamStatus,
): Promise<ActionState> {
  try {
    await updateWorkstream(workstreamId, { status });
    revalidateDelivery(projectId);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update workstream",
    };
  }
}

export async function deleteWorkstreamAction(
  workstreamId: string,
  projectId: string,
): Promise<ActionState> {
  try {
    await deleteWorkstream(workstreamId);
    revalidateDelivery(projectId);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to delete workstream",
    };
  }
}

export async function deleteTaskAction(
  taskId: string,
  projectId: string,
): Promise<ActionState> {
  try {
    await deleteTask(taskId);
    revalidateDelivery(projectId);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to delete task",
    };
  }
}
