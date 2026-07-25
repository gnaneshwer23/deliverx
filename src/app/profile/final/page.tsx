import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FinalAssessmentApp } from "@/components/pi/final-assessment-app";
import { assertPiAccess } from "@/lib/access/gate";
import { PI_FINAL_PATH } from "@/lib/pi-assessment/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Final assessment · DeliverX",
  description:
    "Post-project interview, independent work sample, and a transfer task in a novel industry — evidence for growth, not a quiz.",
};

export const dynamic = "force-dynamic";

export default async function FinalAssessmentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(PI_FINAL_PATH)}`);
  }

  const gate = assertPiAccess({
    userId: user.id,
    email: user.email,
    surface: "final_assessment",
  });
  if (!gate.allowed) {
    redirect(`/hub?gate=${encodeURIComponent(gate.reason)}`);
  }

  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      <FinalAssessmentApp />
    </main>
  );
}
