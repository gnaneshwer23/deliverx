import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SovereignCard } from "@/components/sovereign/sovereign-card";
import { sovereignClass } from "@/lib/sovereign-theme";

export default async function CompletePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id, organisations(name)")
    .single();

  const orgName = (profile?.organisations as { name?: string } | null)?.name;

  return (
    <SovereignCard className="text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-[#6ee7c7]/30 bg-[#6ee7c7]/10 text-[#0a0e14]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h1 className={`mt-6 ${sovereignClass.pageTitle}`}>Your workspace is ready</h1>
      <p className="mt-2 text-sm text-[#4b5563]">
        Charter alignment, governance, and delivery intelligence — in one place.
      </p>

      <dl className="mt-8 space-y-3 text-left text-sm">
        <Row label="Organisation" value={orgName ?? "—"} />
        <Row label="Signed in as" value={user?.email ?? "—"} />
        <Row label="Next step" value="Create your first project" />
      </dl>

      <Link
        href="/project/new"
        className={`${sovereignClass.pillPrimary} mt-8 h-12 w-full`}
      >
        Create your first project →
      </Link>
    </SovereignCard>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#1a1a1a]/8 pb-3 last:border-b-0">
      <dt className="text-[#6b7280]">{label}</dt>
      <dd className="font-medium text-[#1a1a1a]">{value}</dd>
    </div>
  );
}
