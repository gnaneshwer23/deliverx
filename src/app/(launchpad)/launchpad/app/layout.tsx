import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ProductSuiteShell } from "@/components/dx/product-suite-shell";
import { requireLaunchpadAuth } from "@/lib/launchpad/require-auth";

export const metadata: Metadata = {
  title: "Launchpad | DeliverX",
  description:
    "Evidence-backed role readiness, roadmap, interview lab and applications — never assigns capability.",
};

export default async function LaunchpadAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireLaunchpadAuth();
  return <ProductSuiteShell>{children}</ProductSuiteShell>;
}
