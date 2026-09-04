import type { Metadata } from "next";
import { MarketingGuideArticle } from "@/components/marketing/marketing-guide-article";
import { PM_PORTFOLIO_GUIDE } from "@/lib/marketing/guides";

export const metadata: Metadata = {
  title: `${PM_PORTFOLIO_GUIDE.title} | DeliverX`,
  description: PM_PORTFOLIO_GUIDE.description,
  alternates: { canonical: PM_PORTFOLIO_GUIDE.path },
  openGraph: {
    title: `${PM_PORTFOLIO_GUIDE.title} | DeliverX`,
    description: PM_PORTFOLIO_GUIDE.description,
  },
};

export default function PmPortfolioGuidePage() {
  return <MarketingGuideArticle guide={PM_PORTFOLIO_GUIDE} />;
}
