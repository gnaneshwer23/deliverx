"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";

type NavItem = { label: string; href: string };

type NavSection = {
  label: string;
  items: NavItem[];
};

function isActive(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href.endsWith("/tasks") && pathname.startsWith(`${href}/`)) return true;
  if (href.endsWith("/reports") && pathname.startsWith(`${href}/`)) return true;
  if (href.includes("/requirements") && pathname.startsWith(href)) return true;
  if (href.includes("/product") && pathname.startsWith(href)) return true;
  if (href.includes("/engineering") && pathname.startsWith(href)) return true;
  if (href.includes("/scrum") && pathname.startsWith(href)) return true;
  if (href.includes("/delivery") && pathname.startsWith(href)) return true;
  if (href.includes("/charter") && pathname.startsWith(href)) return true;
  if (href.includes("/standups") && pathname.startsWith(href)) return true;
  if (href.includes("/stakeholders") && pathname.startsWith(href)) return true;
  if (href.includes("/traceability") && pathname.startsWith(href)) return true;
  if (href.includes("/meetings") && pathname.startsWith(href)) return true;
  if (href.includes("/workstreams") && pathname.startsWith(href)) return true;
  return false;
}

export function ProjectSidebar({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const pathname = usePathname();

  const sections: NavSection[] = [
    {
      label: "Business analysis",
      items: [
        { label: "Requirements", href: `/project/${projectId}/requirements` },
        { label: "Charter", href: `/project/${projectId}/charter` },
      ],
    },
    {
      label: "Product",
      items: [{ label: "Product workspace", href: `/project/${projectId}/product` }],
    },
    {
      label: "Engineering",
      items: [{ label: "Engineering workspace", href: `/project/${projectId}/engineering` }],
    },
    {
      label: "Scrum",
      items: [{ label: "Scrum workspace", href: `/project/${projectId}/scrum` }],
    },
    {
      label: "Delivery PM",
      items: [{ label: "Delivery workspace", href: `/project/${projectId}/delivery` }],
    },
    {
      label: "Project",
      items: [{ label: "Overview", href: `/project/${projectId}` }],
    },
    {
      label: "Delivery",
      items: [
        { label: "Workstreams", href: `/project/${projectId}/workstreams` },
        { label: "Tasks", href: `/project/${projectId}/tasks` },
        { label: "Meetings", href: `/project/${projectId}/meetings` },
        { label: "Standups", href: `/project/${projectId}/standups` },
      ],
    },
    {
      label: "Governance",
      items: [
        { label: "RAID", href: `/project/${projectId}/raid` },
        { label: "Decisions", href: `/project/${projectId}/decisions` },
        { label: "Documents", href: `/project/${projectId}/documents` },
        { label: "Changes", href: `/project/${projectId}/changes` },
        { label: "Reports", href: `/project/${projectId}/reports` },
      ],
    },
    {
      label: "People & trace",
      items: [
        { label: "Stakeholders", href: `/project/${projectId}/stakeholders` },
        { label: "Traceability", href: `/project/${projectId}/traceability` },
      ],
    },
  ];

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
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
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
          className="flex items-center gap-2 text-xs text-[#A8A89E] hover:text-[#1C4A2E]"
        >
          <Plus size={14} />
          New project
        </Link>
      </div>
    </aside>
  );
}
