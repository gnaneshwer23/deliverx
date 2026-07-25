import type { ProductPageContent } from "@/lib/marketing/product-page";
import { BUNDLE_SIGNUP_HREF, careerTierById } from "@/lib/marketing/career-suite";

const tier = careerTierById("launchpad");

export const LAUNCHPAD_PAGE: ProductPageContent = {
  path: "/launchpad",
  stage: tier.stage,
  brandEyebrow: `DeliverX · ${tier.stage}`,
  name: "Launchpad",
  heroTitle: "Turn evidence into opportunity.",
  promise:
    "Career Intelligence for product professionals — role readiness, evidence-backed packaging and interview prep that cite what you can prove and what you cannot.",
  primaryCta: {
    href: tier.ctaHref,
    label: "Start Your Career Journey",
  },
  secondaryCta: {
    href: "/pricing",
    label: "Explore pricing",
  },
  sections: [
    {
      id: "assessment",
      tone: "white",
      label: "Career assessment",
      title: "Know exactly where you stand.",
      body: "Start with an AI career assessment that maps your skills, gaps and readiness — so you strengthen the right things before you apply, not after a rejection.",
      items: [
        "Skills gap analysis against Product Manager expectations",
        "Personalised learning roadmap",
        "Job readiness score you can track over time",
      ],
    },
    {
      id: "twin",
      tone: "cream",
      label: "Career Twin",
      title: "A living profile of how you operate.",
      body: "Your Career Twin captures strengths, stories and evidence from your experience — including work from Experience — so career materials stay grounded in real capability.",
    },
    {
      id: "cv",
      tone: "white",
      label: "CV optimisation",
      title: "Make your experience readable to hiring managers.",
      body: "Translate projects and decisions into a CV and LinkedIn presence that hiring managers can scan quickly — clear outcomes, relevant skills and language that matches the roles you want.",
      items: [
        "CV optimisation tuned for Product Management roles",
        "LinkedIn profile enhancement",
        "Personal branding guidance",
      ],
    },
    {
      id: "portfolio",
      tone: "cream",
      label: "Portfolio",
      title: "Show the work, not just the claim.",
      body: "Build a professional portfolio and case studies that demonstrate how you think — discovery, trade-offs, delivery and outcomes employers can trust.",
    },
    {
      id: "interview",
      tone: "white",
      label: "Interview preparation",
      title: "Win the conversation.",
      body: "STAR stories, AI mock interviews and communication coaching prepare you to answer with structure and confidence — so experience turns into offers.",
      items: [
        "STAR interview story generation",
        "AI mock interviews with performance analytics",
        "Communication coaching for product conversations",
      ],
    },
    {
      id: "salary",
      tone: "cream",
      label: "Salary insights",
      title: "Negotiate from a clearer baseline.",
      body: "Salary insights and career recommendations help you target roles that fit your level — and walk into compensation conversations informed, not guessing.",
    },
  ],
  pricing: {
    label: "Pricing",
    title: tier.headline,
    subtitle: `${tier.cadence} · Stage two of the DeliverX journey.`,
    price: tier.price,
    cadence: tier.cadence,
    summary: tier.summary,
    cta: tier.cta,
    ctaHref: tier.ctaHref,
    bundleLabel: "Or get the Complete Journey",
    bundleHref: "/pricing#bundle",
  },
  finalCta: {
    title: "Ready to land the opportunity?",
    subtitle:
      "Start Launchpad now — or take the Complete Journey if you also need company experience and delivery tools.",
    ctaLabel: tier.cta,
    ctaHref: tier.ctaHref,
    secondaryLabel: "Get the Complete Journey",
    secondaryHref: BUNDLE_SIGNUP_HREF,
  },
  footerCta: {
    title: "Start Your Career Journey",
    subtitle: `${tier.price} · ${tier.cadence}. Or take the Complete Journey.`,
    href: tier.ctaHref,
    label: tier.cta,
  },
};
