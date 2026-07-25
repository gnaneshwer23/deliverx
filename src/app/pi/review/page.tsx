import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PiReviewQueueApp } from "@/components/pi-review/review-queue-app";

export const metadata: Metadata = {
  title: "Review & challenge · DeliverX",
  description:
    "Review professional intelligence findings. Challenge creates a new record — never overwrites history.",
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

  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      <PiReviewQueueApp />
    </main>
  );
}
