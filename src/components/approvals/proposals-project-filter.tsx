"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function ProposalsProjectFilter({
  projects,
  currentProjectId,
}: {
  projects: Array<{ id: string; name: string }>;
  currentProjectId?: string | null;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (projects.length === 0) return null;

  function hrefFor(projectId: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (projectId) {
      params.set("project", projectId);
    } else {
      params.delete("project");
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={hrefFor(null)}
        className={`rounded-full border px-3 py-1 text-xs font-medium ${
          !currentProjectId
            ? "border-[#1C4A2E] bg-[#EEF5F1] text-[#1C4A2E]"
            : "border-[#E4E4DC] text-[#6B6B64] hover:border-[#A8A89E]"
        }`}
      >
        All projects
      </Link>
      {projects.slice(0, 12).map((project) => (
        <Link
          key={project.id}
          href={hrefFor(project.id)}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            currentProjectId === project.id
              ? "border-[#1C4A2E] bg-[#EEF5F1] text-[#1C4A2E]"
              : "border-[#E4E4DC] text-[#6B6B64] hover:border-[#A8A89E]"
          }`}
        >
          {project.name}
        </Link>
      ))}
    </div>
  );
}
