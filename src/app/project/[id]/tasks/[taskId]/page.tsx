import { notFound } from "next/navigation";
import { getTask, listWorkstreams } from "@/services/delivery";
import { listTaskExternalLinks } from "@/services/githubIntegration";
import { PageHeader } from "@/components/shared/page-header";
import { TaskDetailForm } from "./task-detail-form";
import { TaskGitHubLinks } from "@/components/integrations/task-github-links";

type Params = Promise<{ id: string; taskId: string }>;

export default async function TaskDetailPage({ params }: { params: Params }) {
  const { id, taskId } = await params;
  const [task, workstreams, githubLinks] = await Promise.all([
    getTask(taskId),
    listWorkstreams(id),
    listTaskExternalLinks(taskId).catch(() => []),
  ]);

  if (!task || task.project_id !== id) notFound();

  return (
    <main className="p-6">
      <PageHeader title={task.title} description="Edit task details and status." />
      <TaskDetailForm task={task} workstreams={workstreams} />
      <div className="mt-6">
        <TaskGitHubLinks projectId={id} taskId={taskId} links={githubLinks} />
      </div>
    </main>
  );
}
