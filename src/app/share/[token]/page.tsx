import Link from "next/link";
import { getStakeholderShareByToken } from "@/services/stakeholderShare";
import { ExternalStakeholderDashboard } from "@/components/stakeholder/external-stakeholder-dashboard";

export const dynamic = "force-dynamic";

type Params = Promise<{ token: string }>;

export default async function StakeholderSharePage({ params }: { params: Params }) {
  const { token } = await params;
  const result = await getStakeholderShareByToken(token);

  if (!result.ok) {
    const message =
      result.reason === "expired"
        ? "This stakeholder link has expired."
        : result.reason === "revoked"
          ? "This stakeholder link has been revoked."
          : "This stakeholder link is invalid.";

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF5] px-4">
        <div className="w-full max-w-md rounded-2xl border border-[#E4E4DC] bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold">Link unavailable</h1>
          <p className="mt-2 text-sm text-[#6B6B64]">{message}</p>
          <Link
            href="/"
            className="mt-6 inline-flex text-sm font-medium text-[#0F766E] hover:underline"
          >
            Go to DeliverX
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ExternalStakeholderDashboard view={result.view} label={result.link.label} />
  );
}
