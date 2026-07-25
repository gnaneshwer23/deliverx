import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LearningIntelligenceApp } from "@/components/pi/learning-intelligence-app";
import { assertPiAccess } from "@/lib/access/gate";
import { PI_LEARNING_PATH } from "@/lib/learning-intelligence/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Learning Intelligence · DeliverX",
  description:
    "Log learning against capability gaps. Knowledge evidence only — never automatic competency.",
};

export const dynamic = "force-dynamic";

export default async function LearningPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(PI_LEARNING_PATH)}`);
  }

  const gate = assertPiAccess({
    userId: user.id,
    email: user.email,
    surface: "learning",
  });
  if (!gate.allowed) {
    redirect(`/hub?gate=${encodeURIComponent(gate.reason)}`);
  }

  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      <LearningIntelligenceApp />
    </main>
  );
}
