export const productSuiteNav = [
  { id: "hub", label: "Hub", href: "/hub", paths: ["/hub"] },
  { id: "profile", label: "Profile", href: "/profile", paths: ["/profile", "/learning", "/career/outcomes"] },
  { id: "experience", label: "Experience", href: "/experience/app", paths: ["/experience/app"] },
  { id: "launchpad", label: "Launchpad", href: "/launchpad/app", paths: ["/launchpad/app"] },
  { id: "workspace", label: "Workspace", href: "/workspace", paths: ["/workspace", "/project", "/brain"] },
  { id: "portfolio", label: "Portfolio", href: "/portfolio", paths: ["/portfolio"] },
] as const;

export type ProductSuiteNavItem = (typeof productSuiteNav)[number];

export function isProductSuiteNavActive(
  item: ProductSuiteNavItem,
  pathname: string,
) {
  return item.paths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}
