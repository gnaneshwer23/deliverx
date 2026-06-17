import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ObCard } from "@/components/dx/ob-card";
import { DxButtonLink } from "@/components/dx/dx-button";
import { getOnboardingProfile } from "@/lib/auth/onboarding";

export default async function CompletePage() {
  const { user, profile } = await getOnboardingProfile();

  if (!profile?.organisation_id) {
    redirect("/onboarding/organisation");
  }
  if (!profile.role) {
    redirect("/onboarding/role");
  }

  const supabase = await createClient();
  const { data: orgRow } = await supabase
    .from("users")
    .select("organisations(name)")
    .eq("id", user!.id)
    .single();

  const orgName = (orgRow?.organisations as { name?: string } | null)?.name;
  const isBa = profile.role === "ba";

  return (
    <ObCard step="Step 4 of 4" title="Your workspace is ready" className="text-center">
      <div className="mx-auto mb-6 flex size-12 items-center justify-center border border-[#C6DDD0] bg-[#EEF5F1] text-[#1C4A2E]">
        ✓
      </div>
      <dl className="space-y-3 text-left text-sm">
        <Row label="Organisation" value={orgName ?? "—"} />
        <Row label="Signed in as" value={user?.email ?? "—"} />
        <Row
          label="Next step"
          value={isBa ? "Open BA Mission Control" : "Create your first project"}
        />
      </dl>
      <DxButtonLink
        href={isBa ? "/workspace/ba" : "/project/new"}
        className="mt-8 w-full"
      >
        {isBa ? "Open BA Mission Control →" : "Create your first project →"}
      </DxButtonLink>
    </ObCard>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#F0F0E8] pb-3 last:border-b-0">
      <dt className="text-[#6B6B64]">{label}</dt>
      <dd className="font-medium text-[#0D0D0B]">{value}</dd>
    </div>
  );
}
