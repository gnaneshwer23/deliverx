export const productSuiteNav = [
  { id: "profile", label: "Home", href: "/profile", paths: ["/profile", "/learning", "/career/outcomes"] },
  { id: "experience", label: "Experience", href: "/experience/app", paths: ["/experience/app"] },
  { id: "launchpad", label: "Launchpad", href: "/launchpad/app", paths: ["/launchpad/app"] },
  { id: "portfolio", label: "Portfolio", href: "/portfolio", paths: ["/portfolio"] },
  { id: "workspace", label: "Workspace", href: "/workspace", paths: ["/workspace", "/project", "/brain"] },
  { id: "hub", label: "Journey map", href: "/hub", paths: ["/hub"] },
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
