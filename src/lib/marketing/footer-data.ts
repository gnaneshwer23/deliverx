/**
 * Marketing footer IA — aligned to simplified primary nav and shipped public routes.
 * Do not add links that 404 or imply unshipped employer marketplace / mission-control depth.
 */

export const FOOTER_PRODUCT_LINKS = [
  { href: "/experience", label: "Experience" },
  { href: "/launchpad", label: "Launchpad" },
  { href: "/professional-workspace", label: "Professional Workspace" },
  { href: "/how-it-works", label: "How it works" },
] as const;

export const FOOTER_PLATFORM_LINKS = [
  { href: "/#professional-intelligence", label: "Professional Intelligence" },
  { href: "/pricing", label: "Pilot access" },
  { href: "/resources", label: "Resources" },
  {
    href: "/professional-workspace",
    label: "Team Copilot",
    note: "Workspace alias (not a third SKU)",
  },
] as const;

export const FOOTER_COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
] as const;

export const FOOTER_ACCOUNT_LINKS = [
  { href: "/login", label: "Sign in" },
  { href: "/signup", label: "Start" },
] as const;

export const FOOTER_LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
  {
    href: "https://github.com/gnaneshwer23/deliverx",
    label: "GitHub",
    external: true as const,
  },
] as const;

export const FOOTER_COLUMNS = [
  { id: "product", title: "Product", links: FOOTER_PRODUCT_LINKS },
  { id: "platform", title: "Platform", links: FOOTER_PLATFORM_LINKS },
  { id: "company", title: "Company", links: FOOTER_COMPANY_LINKS },
  { id: "account", title: "Account", links: FOOTER_ACCOUNT_LINKS },
] as const;

export const DEFAULT_FOOTER_CTA = {
  title: "Start with DeliverX",
  subtitle:
    "Experience, Launchpad or Professional Workspace: open pilot access, or create an account.",
  href: "/signup",
  label: "Start",
} as const;

/** Public routes the footer may link to (excludes auth-gated app surfaces). */
export const FOOTER_PUBLIC_PATHS = [
  "/experience",
  "/launchpad",
  "/professional-workspace",
  "/how-it-works",
  "/pricing",
  "/resources",
  "/about",
  "/privacy",
  "/terms",
  "/cookies",
  "/login",
  "/signup",
  "/#professional-intelligence",
] as const;
