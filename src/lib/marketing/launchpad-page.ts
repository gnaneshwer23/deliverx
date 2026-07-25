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
    "Career Intelligence for product professionals — labelled readiness, evidence-backed packaging and interview prep that cite what you can prove and what you cannot.",
  primaryCta: {
    href: tier.ctaHref,
    label: "Join the pilot",
  },
  secondaryCta: {
    href: "/pricing",
    label: "See pilot access",
  },
  sections: [
    {
      id: "readiness",
      tone: "white",
      label: "Role readiness",
      title: "Know where you stand — and why.",
      body: "Career Intelligence shows role readiness with an explicit source label: ScoreRun projection, mixed, or evidence-coverage heuristic. Decorative percentages without a method are not capability truth.",
      items: [
        "Readiness grounded in Professional Intelligence where a ScoreRun exists",
        "Personalised roadmap from capability gaps",
        "Clear labels when the signal is heuristic",
      ],
    },
    {
      id: "profile",
      tone: "cream",
      label: "Career profile",
      title: "A profile grounded in evidence, not slogans.",
      body: "Your career profile draws on SnapshotClaims and evidence from Experience and Professional Intelligence — so packaging stays tied to what the ledger can support.",
    },
    {
      id: "cv",
      tone: "white",
      label: "CV and portfolio",
      title: "Make your experience readable to hiring managers.",
      body: "Translate projects and decisions into CV packaging that can flow into Verified Portfolio entries — clear outcomes and relevant skills, not unverifiable claims.",
      items: [
        "Evidence-backed CV packaging",
        "Portfolio entries from work you can cite",
        "Verified lighting only via independent attestation",
      ],
    },
    {
      id: "interview",
      tone: "cream",
      label: "Interview lab",
      title: "Practise with structure.",
      body: "STAR stories and interview practice sessions help you answer with evidence. Sessions are recorded as observations — they do not assign capability.",
      items: [
        "STAR interview story drafting",
        "Interview practice sessions",
        "Notes tied to evidence ids where available",
      ],
    },
    {
      id: "applications",
      tone: "white",
      label: "Applications",
      title: "Track the roles you pursue.",
      body: "Log applications and outcomes as you go — so career progress stays visible without inventing an employer marketplace.",
    },
  ],
  pricing: {
    label: "Access",
    title: tier.headline,
    subtitle: `${tier.cadence} · Stage two of the DeliverX journey.`,
    price: tier.price,
    cadence: tier.cadence,
    summary: tier.summary,
    cta: tier.cta,
    ctaHref: tier.ctaHref,
    bundleLabel: "Or explore the Complete Journey",
    bundleHref: "/pricing#bundle",
  },
  finalCta: {
    title: "Ready to land the opportunity?",
    subtitle:
      "Join the Launchpad pilot — or take the Complete Journey if you also need company experience and delivery tools.",
    ctaLabel: tier.cta,
    ctaHref: tier.ctaHref,
    secondaryLabel: "Explore Complete Journey",
    secondaryHref: BUNDLE_SIGNUP_HREF,
  },
  footerCta: {
    title: "Join the Launchpad pilot",
    subtitle: `${tier.price} · ${tier.cadence}. Or explore the Complete Journey.`,
    href: tier.ctaHref,
    label: tier.cta,
  },
};
