import { AttestationForm } from "@/components/verified-portfolio/attestation-form";

export const dynamic = "force-dynamic";

type Params = Promise<{ token: string }>;

export default async function PortfolioAttestPage({ params }: { params: Params }) {
  const { token } = await params;

  return (
    <div className="min-h-screen bg-[#FAFAF5] px-4 py-10">
      <AttestationForm token={token} />
    </div>
  );
}
