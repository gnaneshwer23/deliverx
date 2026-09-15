import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  isCoachingEvidenceEnabled,
  COACHING_EVIDENCE_DISABLED_NOTICE,
  COACH_CONFIRMATION_IS_NOT_VERIFICATION,
} from "@/lib/coaching-evidence";
import { CoachingSubmitApp } from "@/components/pi-coaching/coaching-submit-app";

export const metadata: Metadata = {
  title: "Coaching · DeliverX",
  description:
    "Submit practice for human coach confirmation. Confirmation records supported evidence — never Verified, never capability.",
};

export const dynamic = "force-dynamic";

export default async function CoachingSubmitPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/pi/coaching")}`);
  }

  if (!isCoachingEvidenceEnabled()) {
    return (
      <main className="min-h-screen bg-[#FAFAF7]">
        <div className="mx-auto max-w-2xl space-y-4 px-4 py-16">
          <p className="text-xs font-medium uppercase tracking-wide text-[#6B6B64]">
            Professional Intelligence · Coaching
          </p>
          <h1 className="font-[family-name:var(--font-dx-display)] text-2xl text-[#1A1A18]">
            Coaching evidence
          </h1>
          <p className="text-sm text-[#4A4A45]">{COACHING_EVIDENCE_DISABLED_NOTICE}</p>
          <p className="rounded-md border border-[#E5E2D9] bg-white px-3 py-2 text-sm text-[#4A4A45]">
            {COACH_CONFIRMATION_IS_NOT_VERIFICATION}
          </p>
          <Link href="/profile/evidence" className="inline-block text-sm text-[#1C4A2E] underline">
            Back to evidence
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      <CoachingSubmitApp />
    </main>
  );
}
