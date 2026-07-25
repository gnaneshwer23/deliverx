import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileCentre } from "@/components/pi/profile-centre";
import { assertPiAccess } from "@/lib/access/gate";
import { PI_PROFILE_PATH } from "@/lib/pi-profile/paths";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Professional Intelligence Profile · DeliverX",
  description:
    "Who you are, what you can prove, what is holding you back, what next, and which opportunities fit.",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(PI_PROFILE_PATH)}`);
  }

  const gate = assertPiAccess({
    userId: user.id,
    email: user.email,
    surface: "profile",
  });
  if (!gate.allowed) {
    redirect(`/hub?gate=${encodeURIComponent(gate.reason)}`);
  }

  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      <ProfileCentre />
    </main>
  );
}
