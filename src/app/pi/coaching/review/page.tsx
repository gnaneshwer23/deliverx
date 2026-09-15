import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canAccessPiReviewAdmin } from "@/lib/pi-review/admin-access";
import {
  isCoachingEvidenceEnabled,
  COACHING_EVIDENCE_DISABLED_NOTICE,
  COACHING_DOES_NOT_GRANT_VERIFIED,
} from "@/lib/coaching-evidence";
import { CoachingReviewApp } from "@/components/pi-coaching/coaching-review-app";

export const metadata: Metadata = {
  title: "Coach queue · DeliverX",
  description:
    "Confirm coaching submissions. Confirmation records supported evidence for the learner — never Verified, never capability.",
};

export const dynamic = "force-dynamic";

export default async function CoachingReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/pi/coaching/review")}`);
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!canAccessPiReviewAdmin(profile?.role, user)) {
    redirect("/pi/coaching");
  }

  if (!isCoachingEvidenceEnabled()) {
    return (
      <main className="min-h-screen bg-[#FAFAF7]">
        <div className="mx-auto max-w-2xl space-y-4 px-4 py-16">
          <p className="text-xs font-medium uppercase tracking-wide text-[#6B6B64]">
            Professional Intelligence · Coach queue
          </p>
          <h1 className="font-[family-name:var(--font-dx-display)] text-2xl text-[#1A1A18]">
            Confirm coaching submissions
          </h1>
          <p className="text-sm text-[#4A4A45]">{COACHING_EVIDENCE_DISABLED_NOTICE}</p>
          <p className="rounded-md border border-[#E5E2D9] bg-white px-3 py-2 text-sm text-[#4A4A45]">
            {COACHING_DOES_NOT_GRANT_VERIFIED}
          </p>
          <Link href="/profile" className="inline-block text-sm text-[#1C4A2E] underline">
            Back to Professional Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      <CoachingReviewApp />
    </main>
  );
}
