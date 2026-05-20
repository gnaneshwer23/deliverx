import { GraduationCap } from "lucide-react";
import Link from "next/link";

export type Lesson = { lesson: string; recommendation?: string; tags?: string[] };

export function LessonsPanel({
  lessons,
  emptyHref,
}: {
  lessons: Lesson[];
  emptyHref?: string;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <GraduationCap size={14} className="text-[#0F766E]" />
        <h3 className="font-semibold">Lessons from history</h3>
      </div>

      {lessons.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
          No matching lessons yet.{" "}
          {emptyHref ? (
            <Link href={emptyHref} className="text-[#0F766E] hover:underline">
              Browse all memory →
            </Link>
          ) : null}
        </div>
      ) : (
        <ul className="space-y-3 text-sm">
          {lessons.map((l) => (
            <li key={l.lesson}>
              <p className="font-medium text-slate-800">{l.lesson}</p>
              {l.recommendation ? (
                <p className="mt-0.5 text-xs text-slate-500">{l.recommendation}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
