"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { DeliveryImpactEventRow } from "@/services/deliveryImpact";
import type { DeliveryImpactRole, ImpactFeedSeverity } from "@/services/deliveryImpactEngine";
import { IMPACT_ROLE_LABELS } from "@/services/deliveryImpactEngine";
import { DeliveryImpactFeed } from "@/components/delivery/delivery-impact-feed";

const SEVERITY_OPTIONS: Array<{ value: ImpactFeedSeverity; label: string }> = [
  { value: "all", label: "All" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
];

const ROLE_OPTIONS: Array<{ value: DeliveryImpactRole | "all"; label: string }> = [
  { value: "all", label: "All roles" },
  { value: "pm", label: "Delivery PM" },
  { value: "engineer", label: "Engineers" },
  { value: "scrum", label: "Scrum Master" },
  { value: "qa", label: "QA" },
  { value: "ba", label: "Business Analyst" },
  { value: "product", label: "Product Manager" },
  { value: "founder", label: "Founder" },
];

function filterHref(
  pathname: string,
  searchParams: URLSearchParams,
  patch: Record<string, string | undefined>,
) {
  const params = new URLSearchParams(searchParams.toString());
  for (const [key, value] of Object.entries(patch)) {
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  }
  const q = params.toString();
  return q ? `${pathname}?${q}` : pathname;
}

export function CommandCentreImpactFeed({
  events,
  severity,
  role,
  projectId,
  projects,
}: {
  events: DeliveryImpactEventRow[];
  severity: ImpactFeedSeverity;
  role?: DeliveryImpactRole;
  projectId?: string;
  projects: Array<{ id: string; name: string }>;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-wider text-[#A8A89E]">
          Severity
        </span>
        {SEVERITY_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={filterHref(pathname, searchParams, { feedSeverity: opt.value })}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              severity === opt.value
                ? "bg-[#1C4A2E] text-white"
                : "bg-[#F7F7F2] text-[#6B6B64] hover:bg-[#E4E4DC]"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-wider text-[#A8A89E]">
          Role
        </span>
        {ROLE_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={filterHref(pathname, searchParams, { feedRole: opt.value })}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              (opt.value === "all" && !role) || role === opt.value
                ? "bg-[#0D0D0B] text-white"
                : "bg-[#F7F7F2] text-[#6B6B64] hover:bg-[#E4E4DC]"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {projects.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-wider text-[#A8A89E]">
            Project
          </span>
          <Link
            href={filterHref(pathname, searchParams, { feedProject: undefined })}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              !projectId
                ? "bg-[#1C4A2E] text-white"
                : "bg-[#F7F7F2] text-[#6B6B64] hover:bg-[#E4E4DC]"
            }`}
          >
            All projects
          </Link>
          {projects.slice(0, 6).map((p) => (
            <Link
              key={p.id}
              href={filterHref(pathname, searchParams, { feedProject: p.id })}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                projectId === p.id
                  ? "bg-[#1C4A2E] text-white"
                  : "bg-[#F7F7F2] text-[#6B6B64] hover:bg-[#E4E4DC]"
              }`}
            >
              {p.name}
            </Link>
          ))}
        </div>
      ) : null}

      <DeliveryImpactFeed
        events={events}
        showProject
        title="Intelligence feed"
        emptyMessage="No delivery updates match the current filters."
      />
    </div>
  );
}
