import { BookOpen } from "lucide-react";
import Link from "next/link";
import { listPlaybooks } from "@/services/memory";
import { ApplyButton } from "./apply-button";

export default async function PlaybooksPage() {
  const playbooks = await listPlaybooks();

  return (
    <main className="p-8">
      <header className="mb-8">
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <BookOpen size={20} className="text-[#0F766E]" /> Delivery Playbooks
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Reusable structures distilled from your closed projects. Apply one to
          accelerate setup on a new engagement.
        </p>
      </header>

      {playbooks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          <p className="font-medium text-slate-700">
            No playbooks generated yet.
          </p>
          <p className="mt-1">
            Closing a project (or running{" "}
            <span className="font-medium text-[#0F766E]">Extract insights</span>{" "}
            from the project page) generates a playbook automatically.
          </p>
          <Link
            href="/workspace/dashboard"
            className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62]"
          >
            Go to projects
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {playbooks.map((p) => (
            <article
              key={p.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div>
                <h3 className="font-semibold tracking-tight">{p.name}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {[p.industry, p.delivery_type].filter(Boolean).join(" · ") ||
                    "Generic"}
                </p>
              </div>
              <p className="mt-3 text-sm text-slate-600">{p.description}</p>

              {p.structure?.workstreams?.length ? (
                <div className="mt-4">
                  <div className="text-[10px] uppercase tracking-wide text-slate-400">
                    Workstreams
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {p.structure.workstreams.map((w) => (
                      <span
                        key={w}
                        className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700"
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {p.structure?.milestones?.length ? (
                <div className="mt-3">
                  <div className="text-[10px] uppercase tracking-wide text-slate-400">
                    Milestones
                  </div>
                  <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-xs text-slate-600">
                    {p.structure.milestones.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ol>
                </div>
              ) : null}

              <div className="mt-auto pt-4">
                <ApplyButton playbookId={p.id} />
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
