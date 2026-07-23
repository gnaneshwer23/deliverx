import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireLaunchpadAuth } from "@/lib/launchpad/require-auth";

export const metadata: Metadata = {
  title: "Launchpad app | DeliverX",
  description: "Get career-ready with assessment, Career Twin, portfolio and interview prep.",
};

export default async function LaunchpadAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireLaunchpadAuth();
  return children;
}
