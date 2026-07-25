import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RealWorldOutcomesApp } from "@/components/pi/real-world-outcomes-app";
import { assertPiAccess } from "@/lib/access/gate";
import { OUTCOMES_PATH } from "@/lib/real-world-outcomes/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Real-world outcomes · DeliverX",
  description:
    "Record real-world career outcomes. Self-reported evidence — never capability, never externally verified.",
};

export const dynamic = "force-dynamic";

export default async function OutcomesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(OUTCOMES_PATH)}`);
  }

  const gate = assertPiAccess({ userId: user.id, email: user.email, surface: "career" });
  if (!gate.allowed) {
    redirect(`/hub?gate=${encodeURIComponent(gate.reason)}`);
  }

  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      <RealWorldOutcomesApp />
    </main>
  );
}
