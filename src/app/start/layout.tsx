import type { ReactNode } from "react";
import { MarketingPageShell } from "@/components/marketing/marketing-layout";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { PRODUCT_NAV } from "@/lib/marketing/suite-data";

export default function StartLayout({ children }: { children: ReactNode }) {
  return (
    <MarketingPageShell>
      <MarketingNav links={PRODUCT_NAV} primaryCta={{ href: "/signup", label: "Get started" }} />
      {children}
    </MarketingPageShell>
  );
}
