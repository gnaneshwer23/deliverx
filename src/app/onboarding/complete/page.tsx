import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ObCard } from "@/components/dx/ob-card";
import { DxButtonLink } from "@/components/dx/dx-button";
import { getCompletionCopyForDbRole } from "@/config/persona-onboarding";
import { getOnboardingProfile, isSponsorGatewayComplete } from "@/lib/auth/onboarding";

function workspaceHref(role: string | null): string {
  switch (role) {
    case "product_manager":
      return "/workspace/product";
    case "ba":
      return "/workspace/ba";
    case "pm":
      return "/workspace/pm-mission";
    case "executive":
      return "/workspace/founder";
    case "engineer":
      return "/workspace/engineer";
    case "scrum_master":
      return "/workspace/scrum-mission";
    case "qa":
      return "/workspace/qa";
    default:
      return "/workspace/dashboard";
  }
}

function workspaceCta(role: string | null): string {
  switch (role) {
    case "product_manager":
      return "Open Product Mission Control →";
    case "ba":
      return "Open BA Mission Control →";
    case "pm":
      return "Open PM Mission Control →";
    case "executive":
      return "Open Founder Mission Control →";
    case "engineer":
      return "Open Engineer Mission Control →";
    case "scrum_master":
      return "Open Scrum Mission Control →";
    case "qa":
      return "Open QA Mission Control →";
    default:
      return "Enter workspace →";
  }
}

export default async function CompletePage() {
  const { user, profile, gatewayStep } = await getOnboardingProfile();

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
  const completion = getCompletionCopyForDbRole(profile.role);
  const gatewayDone = isSponsorGatewayComplete(profile, gatewayStep);

  return (
    <ObCard step={completion.stepLabel} title={completion.title} className="text-center">
      <div className="mx-auto mb-6 flex size-12 items-center justify-center border border-[#C6DDD0] bg-[#EEF5F1] text-[#1C4A2E]">
        ✓
      </div>
      <p className="mb-6 text-sm text-[#6B6B64]">{completion.description}</p>
      <dl className="space-y-3 text-left text-sm">
        <Row label="Organisation" value={orgName ?? "—"} />
        <Row label="Signed in as" value={user?.email ?? "—"} />
        <Row label="Onboarding" value={gatewayDone ? completion.gatewayLabel : "In progress"} />
        <Row label="Next step" value={workspaceCta(profile.role).replace(" →", "")} />
      </dl>
      <DxButtonLink href={workspaceHref(profile.role)} className="mt-8 w-full">
        {workspaceCta(profile.role)}
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
