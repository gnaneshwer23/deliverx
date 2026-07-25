import { appendRoleToPath } from "@/lib/marketing/role-signup";
import type { DbRole } from "@/config/persona-onboarding";

export type SuiteProduct = "xperience" | "launchpad" | "team-copilot" | "bundle";

export function parseSuiteProduct(raw: string | null | undefined): SuiteProduct | null {
  const value = raw?.toLowerCase().trim();
  if (value === "xperience") return "xperience";
  if (value === "launchpad") return "launchpad";
  if (
    value === "team-copilot" ||
    value === "team_copilot" ||
    value === "professional-workspace" ||
    value === "workspace"
  ) {
    return "team-copilot";
  }
  if (value === "bundle" || value === "career-bundle" || value === "complete") return "bundle";
  return null;
}

export function productDisplayName(product: SuiteProduct): string {
  switch (product) {
    case "xperience":
      return "Experience";
    case "launchpad":
      return "Launchpad";
    case "team-copilot":
      return "Professional Workspace";
    case "bundle":
      return "Complete Journey";
  }
}

export function productMarketingPath(product: SuiteProduct): string {
  switch (product) {
    case "xperience":
      return "/experience";
    case "launchpad":
      return "/launchpad";
    case "team-copilot":
      return "/professional-workspace";
    case "bundle":
      return "/pricing#bundle";
  }
}

/**
 * Where to send the user after signup / email confirm.
 * Invite/join always win over product intent.
 *
 * - xperience / launchpad / bundle → /onboarding/profile (PI progressive setup)
 * - team-copilot → organisation onboarding (then workspace)
 * - no product → /hub
 */
export function postSignupPath(options: {
  product?: SuiteProduct | null;
  intent?: string | null;
  invite?: string | null;
  joinToken?: string | null;
  preselectedRole?: DbRole | null;
}): string {
  const { product, invite, joinToken, preselectedRole } = options;

  if (joinToken) {
    return `/join?token=${encodeURIComponent(joinToken)}`;
  }
  if (invite) {
    return `/invite/${encodeURIComponent(invite)}`;
  }

  // Career suite products establish Professional Intelligence posture first.
  if (product === "xperience" || product === "launchpad" || product === "bundle") {
    return "/onboarding/profile";
  }

  if (product === "team-copilot") {
    return appendRoleToPath("/onboarding/organisation", preselectedRole ?? null);
  }

  // No product intent → Hub (existing behaviour); PI setup available from Hub later
  return "/hub";
}

export function signupCopy(product: SuiteProduct | null): {
  title: string;
  subtitle: string;
  banner: string | null;
} {
  switch (product) {
    case "xperience":
      return {
        title: "Create your Experience account",
        subtitle:
          "Build the experience — open pilot access. We’ll issue login credentials after signup.",
        banner:
          "Starting Experience — Build the experience employers expect (pilot access).",
      };
    case "launchpad":
      return {
        title: "Create your Launchpad account",
        subtitle:
          "Land the opportunity — open pilot access. We’ll issue login credentials after signup.",
        banner:
          "Starting Launchpad — Turn your experience into opportunities (pilot access).",
      };
    case "team-copilot":
      return {
        title: "Create your Professional Workspace account",
        subtitle:
          "Succeed in the role — open pilot access. We’ll issue login credentials after signup.",
        banner:
          "Starting Professional Workspace — Deliver with AI teammates (pilot access).",
      };
    case "bundle":
      return {
        title: "Create your DeliverX account",
        subtitle:
          "Complete Journey — open pilot access across Experience, Launchpad and Professional Workspace.",
        banner:
          "Starting the Complete Journey — Experience. Opportunity. Delivery. (pilot access).",
      };
    default:
      return {
        title: "Create your DeliverX account",
        subtitle: "Build the experience → Land the opportunity → Succeed in the role.",
        banner: null,
      };
  }
}
