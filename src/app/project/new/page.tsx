import { ProjectForm } from "./project-form";

export default function NewProjectPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col bg-[#F8FAFC] px-6 py-10 text-[#0F172A]">
      <h1 className="text-2xl font-semibold tracking-tight">
        Start your first project
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Capture the basics. AI structuring kicks in next.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ProjectForm />
      </div>
    </div>
  );
}
