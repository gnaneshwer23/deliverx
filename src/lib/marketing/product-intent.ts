import { appendRoleToPath } from "@/lib/marketing/role-signup";
import type { DbRole } from "@/config/persona-onboarding";

export type SuiteProduct = "xperience" | "launchpad" | "team-copilot" | "bundle";

export function parseSuiteProduct(raw: string | null | undefined): SuiteProduct | null {
  const value = raw?.toLowerCase().trim();
  if (value === "xperience") return "xperience";
  if (value === "launchpad") return "launchpad";
  if (value === "team-copilot" || value === "team_copilot") return "team-copilot";
  if (value === "bundle" || value === "career-bundle" || value === "complete") return "bundle";
  return null;
}

export function productDisplayName(product: SuiteProduct): string {
  switch (product) {
    case "xperience":
      return "Xperience";
    case "launchpad":
      return "Launchpad";
    case "team-copilot":
      return "Team Co-pilot";
    case "bundle":
      return "Complete Career Bundle";
  }
}

export function productMarketingPath(product: SuiteProduct): string {
  switch (product) {
    case "xperience":
      return "/xperience";
    case "launchpad":
      return "/launchpad";
    case "team-copilot":
      return "/team-copilot";
    case "bundle":
      return "/pricing#bundle";
  }
}

/**
 * Where to send the user after signup / email confirm.
 * Invite/join always win over product intent.
 */
export function postSignupPath(options: {
  product?: SuiteProduct | null;
  intent?: string | null;
  invite?: string | null;
  joinToken?: string | null;
  preselectedRole?: DbRole | null;
}): string {
  const { product, intent, invite, joinToken, preselectedRole } = options;

  if (joinToken) {
    return `/join?token=${encodeURIComponent(joinToken)}`;
  }
  if (invite) {
    return `/invite/${encodeURIComponent(invite)}`;
  }

  if (product === "xperience") {
    return "/start/xperience";
  }

  if (product === "launchpad") {
    const params = new URLSearchParams();
    if (intent) params.set("intent", intent);
    const qs = params.toString();
    return qs ? `/start/launchpad?${qs}` : "/start/launchpad";
  }

  if (product === "bundle") {
    return "/start/bundle";
  }

  // team-copilot or default → existing workspace onboarding
  return appendRoleToPath("/onboarding/organisation", preselectedRole ?? null);
}

export function signupCopy(product: SuiteProduct | null): {
  title: string;
  subtitle: string;
  banner: string | null;
} {
  switch (product) {
    case "xperience":
      return {
        title: "Create your Xperience account",
        subtitle: "Build Experience — £500 for 3 months. We’ll issue login credentials after signup.",
        banner:
          "Starting Xperience — Build the experience employers expect (£500 · 3 months).",
      };
    case "launchpad":
      return {
        title: "Create your Launchpad account",
        subtitle: "Advance Your Career — £250 for 3 months. We’ll issue login credentials after signup.",
        banner:
          "Starting Launchpad — Get career-ready (£250 · 3 months).",
      };
    case "team-copilot":
      return {
        title: "Create your Team Co-pilot account",
        subtitle: "Deliver Products Together — £500 for 3 months. We’ll issue login credentials after signup.",
        banner:
          "Starting Team Co-pilot — Deliver with confidence (£500 · 3 months).",
      };
    case "bundle":
      return {
        title: "Create your DeliverX account",
        subtitle:
          "Complete Career Bundle — £800 for 12 months across Xperience, Launchpad and Team Co-pilot.",
        banner:
          "Starting the Complete Career Bundle — Experience. Career. Delivery. (£800 · 12 months).",
      };
    default:
      return {
        title: "Create your DeliverX account",
        subtitle: "Build the experience → Land the opportunity → Succeed in the role.",
        banner: null,
      };
  }
}
