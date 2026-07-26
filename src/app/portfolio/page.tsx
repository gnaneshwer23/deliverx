import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProductSuiteShell } from "@/components/dx/product-suite-shell";
import { VerifiedPortfolioApp } from "@/components/verified-portfolio/portfolio-app";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Verified Professional Portfolio · DeliverX",
  description:
    "Evidence-linked professional portfolio. Claims require evidence. DeliverX does not invent verification.",
};

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/portfolio")}`);
  }

  return (
    <ProductSuiteShell>
      <main className="min-h-screen bg-[#FAFAF7]">
        <VerifiedPortfolioApp />
      </main>
    </ProductSuiteShell>
  );
}
