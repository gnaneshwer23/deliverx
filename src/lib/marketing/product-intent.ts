import { appendRoleToPath } from "@/lib/marketing/role-signup";
import type { DbRole } from "@/config/persona-onboarding";

export type SuiteProduct = "xperience" | "launchpad" | "team-copilot";

export function parseSuiteProduct(raw: string | null | undefined): SuiteProduct | null {
  const value = raw?.toLowerCase().trim();
  if (value === "xperience") return "xperience";
  if (value === "launchpad") return "launchpad";
  if (value === "team-copilot" || value === "team_copilot") return "team-copilot";
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
        subtitle: "Pay once for access. We’ll issue login credentials after signup.",
        banner:
          "Starting Xperience — £49 one-time professional experience access (separate from Team Co-pilot pricing).",
      };
    case "launchpad":
      return {
        title: "Create your Launchpad account",
        subtitle: "Explore open roles or start free. We’ll issue login credentials after signup.",
        banner:
          "Starting Launchpad — join an AI-powered company and build your Career Record (separate from Team Co-pilot pricing).",
      };
    case "team-copilot":
      return {
        title: "Create your Team Co-pilot account",
        subtitle: "30-day free trial for Team Co-pilot. No credit card needed.",
        banner:
          "Starting Team Co-pilot — delivery intelligence for your real team (a DeliverX product).",
      };
    default:
      return {
        title: "Create your workspace",
        subtitle: "30-day free trial. No credit card needed.",
        banner: null,
      };
  }
}
