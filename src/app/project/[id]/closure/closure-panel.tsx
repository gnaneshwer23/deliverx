"use client";

import { useState, useTransition } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { ClosurePackage } from "@/services/closurePackage";
import { aiErrorMessage, postAi } from "@/lib/ai/client-fetch";
import { dxClass } from "@/lib/dx-theme";

type Response = { ok: true; package: ClosurePackage };

export function ClosurePackagePanel({
  projectId,
  existing,
}: {
  projectId: string;
  existing: ClosurePackage | null;
}) {
  const [pkg, setPkg] = useState<ClosurePackage | null>(existing);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function generate() {
    setError(null);
    startTransition(async () => {
      const res = await postAi<Response>("/api/ai/closure-package", {
        projectId,
        persist: true,
      });
      if (!res.ok) {
        setError(aiErrorMessage(res));
        return;
      }
      setPkg(res.data.package);
    });
  }

  return (
    <div className="space-y-4">
      <button type="button" disabled={pending} onClick={generate} className={dxClass.btnPrimary}>
        {pending ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Generating closure package…
          </>
        ) : (
          <>
            <Sparkles size={14} /> Generate closure package
          </>
        )}
      </button>
      {error ? <p className="text-sm text-[#C0392B]">{error}</p> : null}
      {pkg ? (
        <div className={`${dxClass.cardPad} space-y-4 text-sm`}>
          <Section title="Executive summary" body={pkg.executiveSummary} />
          <Section title="Planned vs actual" body={pkg.plannedVsActual} />
          <Section title="Timeline variance" body={pkg.timelineVariance} />
          <Section title="Risk outcomes" body={pkg.riskOutcomes} />
          <Section title="Decision outcomes" body={pkg.decisionOutcomes} />
          <Section title="Change impact" body={pkg.changeImpact} />
          <Section title="Benefits summary" body={pkg.benefitsSummary} />
          <div>
            <h3 className={dxClass.label}>Lessons learned</h3>
            <ul className="mt-2 list-inside list-disc text-[#6B6B64]">
              {pkg.lessonsLearned.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className={dxClass.label}>{title}</h3>
      <p className="mt-1 whitespace-pre-wrap text-[#2C2C28]">{body}</p>
    </div>
  );
}
