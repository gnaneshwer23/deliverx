import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { JoinClient } from "./join-client";

export const dynamic = "force-dynamic";

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
