import Link from "next/link";
import { listBenefits, benefitProgress } from "@/services/benefits";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { SchemaMigrationBanner, schemaErrorMessage } from "@/components/dx/schema-migration-banner";
import { dxClass } from "@/lib/dx-theme";
import { BenefitForm } from "./benefit-form";
import { BenefitCurrentForm } from "./benefit-current-form";

export default async function ProjectBenefitsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let benefits: Awaited<ReturnType<typeof listBenefits>> = [];
  let schemaError: string | null = null;

  try {
    benefits = await listBenefits(id);
  } catch (err) {
    schemaError = schemaErrorMessage(err);
    if (!schemaError) throw err;
  }

  return (
    <>
      <DxPageHeader breadcrumb="Project · Benefits" title="Benefits" titleEm="realisation" />
      <div className="p-6 md:p-8">
        {schemaError ? <SchemaMigrationBanner message={schemaError} /> : <BenefitForm projectId={id} />}
        {benefits.length === 0 && !schemaError ? (
          <p className="text-sm text-[#6B6B64]">
            No benefit hypotheses yet. Add one above or re-run AI project structure.
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
                  {!schemaError && b.kpi_name ? (
                    <BenefitCurrentForm projectId={id} benefitId={b.id} currentValue={b.current_value} />
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
