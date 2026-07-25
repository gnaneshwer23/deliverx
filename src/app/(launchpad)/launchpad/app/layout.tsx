import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireLaunchpadAuth } from "@/lib/launchpad/require-auth";

export const metadata: Metadata = {
  title: "Career Intelligence | DeliverX",
  description:
    "Evidence-backed role readiness, roadmap, interview lab and applications — never assigns capability.",
};

export default async function LaunchpadAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireLaunchpadAuth();
  return children;
}
