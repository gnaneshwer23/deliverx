import { Sparkles } from "lucide-react";

export function ExecutiveSummary({ summary }: { summary: string }) {
  return (
    <section className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 to-white p-6 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-indigo-700">
        <Sparkles size={14} />
        <h3 className="font-semibold">Executive Insight</h3>
      </div>
      <p className="text-sm leading-relaxed text-slate-700">{summary}</p>
    </section>
  );
}
