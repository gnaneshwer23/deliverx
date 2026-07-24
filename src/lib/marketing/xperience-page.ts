import type { ProductPageContent } from "@/lib/marketing/product-page";
import { BUNDLE_SIGNUP_HREF, careerTierById } from "@/lib/marketing/career-suite";

const tier = careerTierById("xperience");

export const XPERIENCE_PAGE: ProductPageContent = {
  path: "/xperience",
  stage: tier.stage,
  brandEyebrow: `DeliverX · ${tier.stage}`,
  name: "Experience",
  heroTitle: "Build the experience employers expect.",
  promise:
    "Join an AI-powered company as a Product Manager. Work real projects, make real trade-offs, and leave with judgement and an Experience Record — not another certificate.",
  primaryCta: {
    href: tier.ctaHref,
    label: "Start Building Experience",
  },
  secondaryCta: {
    href: "/pricing",
    label: "Explore pricing",
  },
  sections: [
    {
      id: "why",
      tone: "white",
      label: "Why experience matters",
      title: "Employers hire people who have done the work.",
      body: "Job descriptions ask for product experience you cannot get from courses alone. Experience puts you inside a living organisation — with customers, stakeholders, trade-offs and launches — so you leave with judgement and evidence, not slides.",
    },
    {
      id: "company",
      tone: "cream",
      label: "Meet your AI company",
      title: "A living organisation from day one.",
      body: "You join a realistic company with product, customers, stakeholders and business pressure. Onboarding, role expectations and team dynamics mirror how modern product organisations actually work.",
      items: [
        "AI recruitment and onboarding into your company",
        "Industry contexts across Healthcare, AI, FinTech, EdTech and SaaS",
        "Stakeholders who push back, customers who change their minds, and launches that matter",
      ],
    },
    {
      id: "work",
      tone: "white",
      label: "The work you'll do",
      title: "Operate as a Product Manager — end to end.",
      body: "Capability grows through decisions, not lectures. You run discovery, strategy, delivery and launches with AI coaching that challenges your thinking while you stay accountable for the outcomes.",
      items: [
        "Customer discovery and stakeholder management",
        "Product strategy, prioritisation and PRDs",
        "Sprint planning, delivery management and launch simulations",
        "Crisis and leadership scenarios with performance feedback",
      ],
    },
    {
      id: "record",
      tone: "cream",
      label: "Your Experience Record",
      title: "Evidence you can take into interviews.",
      body: "Every project, decision and conversation compounds into a professional record — portfolio artefacts, case studies and interview-ready proof of how you operate.",
      items: [
        "Professional portfolio and case study generation",
        "Resume-ready evidence from real simulated work",
        "Career intelligence that carries into Launchpad",
      ],
    },
  ],
  faq: {
    label: "FAQ",
    title: "Questions about Experience",
    items: [
      {
        question: "Is this a course or a simulation?",
        answer:
          "Neither in the usual sense. Experience is a company experience — you work as a Product Manager inside an AI-powered organisation, with projects, stakeholders and outcomes that build a genuine Experience Record.",
      },
      {
        question: "Do I need prior Product Management experience?",
        answer:
          "No. Experience is designed for career switchers, graduates and aspiring Product Managers who need practical experience before applying. Coaching and feedback guide you as you work.",
      },
      {
        question: "How does this connect to Launchpad and Team Co-pilot?",
        answer:
          "Experience builds the experience. Launchpad helps you present it and land opportunities. Team Co-pilot supports you once you are delivering in a real organisation. You can buy stages alone or take the Complete Journey.",
      },
      {
        question: "What do I get at the end of three months?",
        answer:
          "A portfolio of evidence, case studies and interview-ready stories from the work you completed — plus clearer judgement about how product teams actually operate.",
      },
    ],
  },
  pricing: {
    label: "Pricing",
    title: tier.headline,
    subtitle: `${tier.cadence} · Stage one of the DeliverX journey.`,
    price: tier.price,
    cadence: tier.cadence,
    summary: tier.summary,
    cta: tier.cta,
    ctaHref: tier.ctaHref,
    bundleLabel: "Or get the Complete Journey",
    bundleHref: "/pricing#bundle",
  },
  finalCta: {
    title: "Ready to build the experience?",
    subtitle:
      "Start Experience now — or take the Complete Journey and continue into Launchpad and Team Co-pilot.",
    ctaLabel: tier.cta,
    ctaHref: tier.ctaHref,
    secondaryLabel: "Get the Complete Journey",
    secondaryHref: BUNDLE_SIGNUP_HREF,
  },
  footerCta: {
    title: "Start Building Experience",
    subtitle: `${tier.price} · ${tier.cadence}. Or take the Complete Journey.`,
    href: tier.ctaHref,
    label: tier.cta,
  },
};
