import { notFound } from "next/navigation";
import { getTask, listWorkstreams } from "@/services/delivery";
import { PageHeader } from "@/components/shared/page-header";
import { TaskDetailForm } from "./task-detail-form";

type Params = Promise<{ id: string; taskId: string }>;

export default async function TaskDetailPage({ params }: { params: Params }) {
  const { id, taskId } = await params;
  const [task, workstreams] = await Promise.all([
    getTask(taskId),
    listWorkstreams(id),
  ]);

  if (!task || task.project_id !== id) notFound();

  return (
    <main className="p-6">
      <PageHeader title={task.title} description="Edit task details and status." />
      <TaskDetailForm task={task} workstreams={workstreams} />
    </main>
  );
}
