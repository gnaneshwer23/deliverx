import type { ReactNode } from "react";
import { ProductSuiteShell } from "@/components/dx/product-suite-shell";

export default function LearningLayout({ children }: { children: ReactNode }) {
  return <ProductSuiteShell>{children}</ProductSuiteShell>;
}
