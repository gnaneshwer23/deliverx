import Link from "next/link";
import { listBenefits, benefitProgress } from "@/services/benefits";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { dxClass } from "@/lib/dx-theme";

export default async function ProjectBenefitsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const benefits = await listBenefits(id);

  return (
    <>
      <DxPageHeader breadcrumb="Project · Benefits" title="Benefits" titleEm="realisation" />
      <div className="p-6 md:p-8">
        {benefits.length === 0 ? (
          <p className="text-sm text-[#6B6B64]">
            No benefit hypotheses yet. Re-run AI structure or add from project charter.
          </p>
        ) : (
          <ul className="space-y-3">
            {benefits.map((b) => {
              const p = benefitProgress(b);
              return (
                <li key={b.id} className={`${dxClass.cardPad}`}>
                  <p className="font-medium">{b.title}</p>
                  {b.description ? <p className="mt-1 text-sm text-[#6B6B64]">{b.description}</p> : null}
                  {b.kpi_name ? (
                    <p className="mt-2 text-xs text-[#6B6B64]">
                      {b.kpi_name}: {b.baseline_value ?? "—"} → {b.target_value ?? "—"} {b.unit ?? ""}
                      {p != null ? ` (${p}% to target)` : ""}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
        <Link href={`/project/${id}`} className="mt-6 inline-block text-sm text-[#1C4A2E] hover:underline">
          ← Back to project
        </Link>
      </div>
    </>
  );
}
