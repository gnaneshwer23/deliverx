/** Marketing copy for the Launchpad product page on DeliverX. */

export const LAUNCHPAD_SIGNUP_HREF = "/signup?product=launchpad";
export const LAUNCHPAD_ROLES_HREF = "/signup?product=launchpad&intent=roles";

export const LAUNCHPAD_TEAM = [
  {
    name: "Sarah",
    role: "Chief Executive Officer",
    focus: "Growth, investor confidence and strategic direction.",
  },
  {
    name: "Maya",
    role: "Engineering Manager",
    focus: "Technical quality, engineering capacity and delivery confidence.",
  },
  {
    name: "James",
    role: "Sales Director",
    focus: "Customer commitments, revenue opportunities and faster delivery.",
  },
  {
    name: "Priya",
    role: "Customer Success Manager",
    focus: "Customer needs, adoption problems and retention risks.",
  },
  {
    name: "Emma",
    role: "Product Designer",
    focus: "Users, accessibility and product usability.",
  },
  {
    name: "Alex",
    role: "Compliance Lead",
    focus: "Regulatory, privacy and operational risks.",
  },
] as const;

export const LAUNCHPAD_FLOW = [
  "Join your company",
  "Meet your team",
  "Understand the product",
  "Investigate customer problems",
  "Develop product strategy",
  "Make decisions",
  "Work with stakeholders",
  "Build and deliver",
  "Measure the outcome",
  "Grow from the experience",
] as const;

export const LAUNCHPAD_EMPLOYER_WANTS = [
  "Understand customers",
  "Make product decisions",
  "Manage conflicting stakeholders",
  "Prioritise under pressure",
  "Work with engineering",
  "Build and launch products",
  "Measure business outcomes",
] as const;

export const LAUNCHPAD_ARTEFACTS = [
  "Product strategy",
  "Business case",
  "Customer research summary",
  "Opportunity assessment",
  "Roadmap",
  "Product requirements document",
  "User stories",
  "Prioritisation framework",
  "Stakeholder plan",
  "Risk register",
  "Sprint plan",
  "Release plan",
  "Performance dashboard",
  "Retrospective",
] as const;

export const LAUNCHPAD_AUDIENCES = [
  {
    title: "Aspiring Product Managers",
    body: "Build practical experience before securing your first role.",
  },
  {
    title: "Career Switchers",
    body: "Translate existing industry knowledge into demonstrated product capability.",
  },
  {
    title: "Early-Career Product Professionals",
    body: "Strengthen areas where your current role provides limited exposure.",
  },
  {
    title: "Experienced Professionals",
    body: "Take on advanced strategy, leadership, crisis and portfolio challenges.",
  },
  {
    title: "Employers and Universities",
    body: "Observe capability through evidence — not assume it from course completion.",
  },
] as const;

export const LAUNCHPAD_OUTCOMES = [
  "A professional portfolio",
  "Verified project case studies",
  "Editable work artefacts",
  "Competency evidence",
  "Performance feedback",
  "Resume recommendations",
  "Structured examples for applications",
  "Interview stories based on your actual decisions",
  "A personalised career development plan",
] as const;

export const LAUNCHPAD_PRICING = [
  {
    name: "Company Preview",
    price: "Free",
    cadence: "",
    summary: "Explore the company and complete an introductory assignment.",
    cta: "Start Free",
    ctaHref: LAUNCHPAD_SIGNUP_HREF,
    features: [
      "Explore the company",
      "Meet selected stakeholders",
      "Review the product",
      "Complete an introductory assignment",
      "Receive an initial career profile",
    ],
    featured: false,
  },
  {
    name: "Full Company Experience",
    price: "From £49",
    cadence: "Role shown before payment",
    summary: "Join the company, take responsibility, and build your Career Record.",
    cta: "Explore Open Roles",
    ctaHref: LAUNCHPAD_ROLES_HREF,
    features: [
      "Join the company with a defined role",
      "Work with the complete AI team",
      "Manage realistic product challenges",
      "Create professional artefacts",
      "Experience business consequences",
      "Detailed performance feedback",
      "Build your Career Record",
      "Generate portfolio evidence",
    ],
    featured: true,
  },
] as const;
