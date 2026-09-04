import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { JoinClient } from "./join-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Join with invite | DeliverX",
  description:
    "Redeem a DeliverX invite to join the open pilot. Access is invite-gated.",
  robots: { index: false, follow: false },
};

export default async function JoinPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--dx-page)] text-sm text-[#6B6B64]">
          Loading invite…
        </div>
      }
    >
      <JoinClient authenticated={Boolean(user)} />
    </Suspense>
  );
}
