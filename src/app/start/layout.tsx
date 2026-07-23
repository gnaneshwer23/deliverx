import type { ReactNode } from "react";
import { MarketingPageShell } from "@/components/marketing/marketing-layout";
import { MarketingNav } from "@/components/marketing/marketing-nav";

export default function StartLayout({ children }: { children: ReactNode }) {
  return (
    <MarketingPageShell>
      <MarketingNav primaryCta={{ href: "/signup", label: "Start Free" }} />
      {children}
    </MarketingPageShell>
  );
}
