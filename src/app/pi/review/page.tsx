import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isReviewerQueueEnabled, REVIEW_DOES_NOT_GRANT_VERIFIED } from "@/lib/pi-review";
import { PiReviewQueueApp } from "@/components/pi-review/review-queue-app";

export const metadata: Metadata = {
  title: "Review & challenge · DeliverX",
  description:
    "Review professional intelligence findings. Challenge creates a new record — never overwrites history. Does not grant Verified.",
};

export const dynamic = "force-dynamic";

export default async function PiReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/pi/review")}`);
  }

  if (!isReviewerQueueEnabled()) {
    return (
      <main className="min-h-screen bg-[#FAFAF7]">
        <div className="mx-auto max-w-2xl space-y-4 px-4 py-16">
          <p className="text-xs font-medium uppercase tracking-wide text-[#6B6B64]">
            Professional Intelligence
          </p>
          <h1 className="font-[family-name:var(--font-dx-display)] text-2xl text-[#1A1A18]">
            Review & challenge
          </h1>
          <p className="text-sm text-[#4A4A45]">
            The reviewer queue is not enabled for this environment. Cases already recorded are
            retained; enable with <code className="font-[family-name:var(--font-dx-mono)] text-xs">DELIVERX_REVIEWER_QUEUE=on</code>.
          </p>
          <p className="rounded-md border border-[#E5E2D9] bg-white px-3 py-2 text-sm text-[#4A4A45]">
            {REVIEW_DOES_NOT_GRANT_VERIFIED}
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
      <PiReviewQueueApp />
    </main>
  );
}
