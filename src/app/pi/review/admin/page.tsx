import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canAccessPiReviewAdmin } from "@/lib/pi-review/admin-access";
import { PiReviewAdminApp } from "@/components/pi-review/admin-review-app";

export const metadata: Metadata = {
  title: "PI admin review · DeliverX",
  description: "Uphold, revise, or escalate professional intelligence challenges.",
};

export const dynamic = "force-dynamic";

export default async function PiReviewAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/pi/review/admin")}`);
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!canAccessPiReviewAdmin(profile?.role, user)) {
    redirect("/pi/review");
  }

  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      <PiReviewAdminApp />
    </main>
  );
}
