"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import {
  projectHref,
  projectNavSections,
  READ_ONLY_PROJECT_SEGMENTS,
  type ProjectNavSection,
} from "@/config/project-nav";

function isActive(pathname: string, projectId: string, segment: string) {
  const href = projectHref(projectId, segment);
  if (pathname === href) return true;
  if (segment === "tasks" && pathname.startsWith(`${href}/`)) return true;
  if (segment === "reports" && pathname.startsWith(`${href}/`)) return true;
  if (segment && pathname.startsWith(`${href}/`)) return true;
  return false;
}

export function ProjectSidebar({
  projectId,
  projectName,
  readOnly = false,
}: {
  projectId: string;
  projectName: string;
  readOnly?: boolean;
}) {
  const pathname = usePathname();
  const sections: ProjectNavSection[] = projectNavSections.map((section) => ({
    ...section,
    items: readOnly
      ? section.items.filter(
          (item) => READ_ONLY_PROJECT_SEGMENTS.has(item.segment),
        )
      : section.items,
  })).filter((section) => section.items.length > 0);

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[#E4E4DC] bg-white p-5 md:flex">
      <div className="mb-6 truncate text-sm font-semibold text-[#0D0D0B]" title={projectName}>
        {projectName}
      </div>

      <nav className="flex flex-col gap-1 text-sm">
        {sections.map((section) => (
          <div key={section.label}>
            <div className="mb-1 mt-3 px-2 font-[family-name:var(--font-dx-mono)] text-[7px] uppercase tracking-wider text-[#A8A89E] first:mt-0">
              {section.label}
            </div>
            {section.items.map((item) => {
              const href = projectHref(projectId, item.segment);
              const active = isActive(pathname, projectId, item.segment);
              return (
                <Link
                  key={item.label}
                  href={href}
                  className={`flex items-center rounded-md px-2 py-1.5 transition ${
                    active
                      ? "bg-[#EEF5F1] font-semibold text-[#1C4A2E]"
                      : "text-[#6B6B64] hover:bg-[#F7F7F2] hover:text-[#0D0D0B]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-auto space-y-3 pt-6">
        <Link
          href="/workspace/projects"
          className="flex items-center gap-2 text-xs text-[#A8A89E] hover:text-[#1C4A2E]"
        >
          <ArrowLeft size={14} />
          All projects
        </Link>
        <Link
          href="/project/new"
          className={`flex items-center gap-2 text-xs text-[#A8A89E] hover:text-[#1C4A2E] ${readOnly ? "pointer-events-none opacity-40" : ""}`}
          aria-disabled={readOnly}
          tabIndex={readOnly ? -1 : undefined}
        >
          <Plus size={14} />
          New project
        </Link>
      </div>
    </aside>
  );
}
