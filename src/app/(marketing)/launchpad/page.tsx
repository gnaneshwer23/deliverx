import type { Metadata } from "next";
import { ProductMarketingPage } from "@/components/marketing/product-marketing-page";
import { LAUNCHPAD_PAGE } from "@/lib/marketing/launchpad-page";

export const metadata: Metadata = {
  title: "Launchpad — Open Roles & Career Record | DeliverX",
  description:
    "Explore open roles and grow a Career Record employers can trust. Launchpad is the bridge from experience to opportunity — by DeliverX.",
  openGraph: {
    title: "Launchpad — Find the role. Grow your Career Record.",
    description:
      "Browse open roles, commit to a path, and package evidence employers trust — separate from Xperience company membership.",
  },
};

export default function LaunchpadPage() {
  return <ProductMarketingPage content={LAUNCHPAD_PAGE} />;
}
