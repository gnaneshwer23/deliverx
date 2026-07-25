import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BaselineAssessmentApp } from "@/components/pi/baseline-assessment-app";
import { assertPiAccess } from "@/lib/access/gate";
import { PI_BASELINE_PATH } from "@/lib/pi-assessment/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Baseline assessment · DeliverX",
  description:
    "Adaptive interview, scenarios, work sample and reflection — evidence for your starting capability picture.",
};

export const dynamic = "force-dynamic";

export default async function BaselineAssessmentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(PI_BASELINE_PATH)}`);
  }

  const gate = assertPiAccess({
    userId: user.id,
    email: user.email,
    surface: "baseline",
  });
  if (!gate.allowed) {
    redirect(`/hub?gate=${encodeURIComponent(gate.reason)}`);
  }

  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      <BaselineAssessmentApp />
    </main>
  );
}
