import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { EvidenceCapabilityApp } from "@/components/pi/evidence-capability-app";
import { CapabilityCoveragePanel } from "@/components/pi/capability-coverage-panel";
import { createClient } from "@/lib/supabase/server";
import { assertPiAccess } from "@/lib/access/gate";
import { loadCapabilityCoverage } from "@/lib/capability-coverage/load";
import { isCapabilityCoverageEnabled } from "@/lib/capability-coverage/flag";
import { PI_EVIDENCE_PATH } from "@/lib/pi-profile/paths";

export const metadata: Metadata = {
  title: "Evidence & capability · DeliverX",
  description:
    "Person-facing Evidence Ledger and capability assessment projection. Capability is never assigned by Experience UI.",
};

export const dynamic = "force-dynamic";

export default async function ProfileEvidencePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(PI_EVIDENCE_PATH)}`);
  }

  const gate = assertPiAccess({
    userId: user.id,
    email: user.email,
    surface: "evidence",
  });
  if (!gate.allowed) {
    redirect(`/hub?gate=${encodeURIComponent(gate.reason)}`);
  }

  const coverage = isCapabilityCoverageEnabled()
    ? await loadCapabilityCoverage(supabase, user.id).catch(() => null)
    : null;

  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      {coverage ? (
        <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
          <CapabilityCoveragePanel coverage={coverage} />
        </div>
      ) : null}
      <Suspense fallback={<div className="p-8 text-sm text-[#6B6B64]">Loading evidence…</div>}>
        <EvidenceCapabilityApp />
      </Suspense>
    </main>
  );
}
