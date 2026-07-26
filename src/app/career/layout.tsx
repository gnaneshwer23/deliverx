import type { ReactNode } from "react";
import { ProductSuiteShell } from "@/components/dx/product-suite-shell";

export default function CareerLayout({ children }: { children: ReactNode }) {
  return <ProductSuiteShell>{children}</ProductSuiteShell>;
}
