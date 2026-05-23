import Link from "next/link";
import { benefitProgress, listOrgBenefits } from "@/services/benefits";
import { DxPageHeader, DxStatCard } from "@/components/dx/dx-page-chrome";
import { dxClass } from "@/lib/dx-theme";

export const dynamic = "force-dynamic";

export default async function WorkspaceBenefitsPage() {
  const benefits = await listOrgBenefits(200);
  const tracked = benefits.filter((b) => benefitProgress(b) != null);
  const avgProgress =
    tracked.length > 0
      ? Math.round(tracked.reduce((s, b) => s + (benefitProgress(b) ?? 0), 0) / tracked.length)
      : 0;

  return (
    <>
      <DxPageHeader breadcrumb="DeliverX OS · Intelligence" title="Benefits" titleEm="realisation" />
      <div className="p-6 md:p-8">
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
          <DxStatCard label="Benefit hypotheses" value={benefits.length} />
          <DxStatCard label="With KPI tracking" value={tracked.length} />
          <DxStatCard label="Avg progress" value={`${avgProgress}%`} tone={avgProgress >= 70 ? "green" : "amber"} />
        </div>

        {benefits.length === 0 ? (
          <div className={`${dxClass.cardPad} text-center text-sm text-[#6B6B64]`}>
            No benefits registered. Add hypotheses from a project or via AI project setup.
          </div>
        ) : (
          <ul className="space-y-3">
            {benefits.map((b) => {
              const progress = benefitProgress(b);
              return (
                <li key={b.id} className={`${dxClass.cardPad}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/project/${b.project_id}/benefits`}
                        className="font-medium text-[#1C4A2E] hover:underline"
                      >
                        {b.title}
                      </Link>
                      <p className="text-xs text-[#6B6B64]">{b.project_name}</p>
                    </div>
                    {progress != null ? (
                      <span className="font-[family-name:var(--font-dx-mono)] text-sm text-[#1A6B3A]">
                        {progress}%
                      </span>
                    ) : null}
                  </div>
                  {b.kpi_name ? (
                    <p className="mt-2 text-xs text-[#6B6B64]">
                      KPI: {b.kpi_name} — baseline {b.baseline_value ?? "—"} → target{" "}
                      {b.target_value ?? "—"} {b.unit ?? ""}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
