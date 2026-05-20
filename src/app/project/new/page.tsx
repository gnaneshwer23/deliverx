import Link from "next/link";
import { BookOpen } from "lucide-react";
import { listPlaybooks, type PlaybookRow } from "@/services/memory";
import { ProjectForm } from "./project-form";

type Search = Promise<{ playbook?: string }>;

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { playbook: selectedId } = await searchParams;
  const playbooks = await safeListPlaybooks();
  const selected = playbooks.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col bg-[#F8FAFC] px-6 py-10 text-[#0F172A]">
      <h1 className="text-2xl font-semibold tracking-tight">
        Start your project
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Capture the basics. AI structuring kicks in next.
      </p>

      {playbooks.length > 0 ? (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <BookOpen size={14} className="text-[#0F766E]" /> Start from a
              playbook
            </h2>
            <span className="text-xs text-slate-500">Optional</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {playbooks.slice(0, 4).map((pb) => {
              const active = pb.id === selected?.id;
              return (
                <Link
                  key={pb.id}
                  href={`/project/new?playbook=${encodeURIComponent(pb.id)}`}
                  className={`rounded-lg border p-3 text-left transition ${
                    active
                      ? "border-[#0F766E] bg-[#0F766E]/5 ring-2 ring-[#0F766E]/30"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <p className="text-sm font-medium">{pb.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {[pb.industry, pb.delivery_type].filter(Boolean).join(" · ") || "Generic"}
                  </p>
                </Link>
              );
            })}
          </div>

          {selected ? (
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Selected: <span className="font-medium text-[#0F172A]">{selected.name}</span>
              </span>
              <Link
                href="/project/new"
                className="text-slate-500 hover:text-slate-700"
              >
                Clear
              </Link>
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ProjectForm
          playbookId={selected?.id}
          deliveryTypeDefault={selected?.delivery_type ?? undefined}
        />
      </div>
    </div>
  );
}

async function safeListPlaybooks(): Promise<PlaybookRow[]> {
  try {
    return await listPlaybooks();
  } catch {
    // Migration 0002 may not be applied yet — degrade gracefully.
    return [];
  }
}
