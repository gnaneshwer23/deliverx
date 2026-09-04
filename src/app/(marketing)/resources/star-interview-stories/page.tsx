import type { Metadata } from "next";
import { MarketingGuideArticle } from "@/components/marketing/marketing-guide-article";
import { STAR_INTERVIEW_STORIES_GUIDE } from "@/lib/marketing/guides";

export const metadata: Metadata = {
  title: `${STAR_INTERVIEW_STORIES_GUIDE.title} | DeliverX`,
  description: STAR_INTERVIEW_STORIES_GUIDE.description,
  alternates: { canonical: STAR_INTERVIEW_STORIES_GUIDE.path },
  openGraph: {
    title: `${STAR_INTERVIEW_STORIES_GUIDE.title} | DeliverX`,
    description: STAR_INTERVIEW_STORIES_GUIDE.description,
  },
};

export default function StarInterviewStoriesGuidePage() {
  return <MarketingGuideArticle guide={STAR_INTERVIEW_STORIES_GUIDE} />;
}
