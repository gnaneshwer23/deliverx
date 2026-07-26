import type { ReactNode } from "react";
import { ProductSuiteShellFrame } from "@/components/dx/product-suite-shell-frame";
import { isGlobalSearchEnabled } from "@/lib/global-search";

/**
 * Signed-in suite chrome. Resolves DELIVERX_GLOBAL_SEARCH on the server so the
 * kill-switch applies on the next request without a client rebuild.
 * Import ProductSuiteNav from product-suite-shell-frame in client modules.
 */
export function ProductSuiteShell({ children }: { children: ReactNode }) {
  return (
    <ProductSuiteShellFrame globalSearchEnabled={isGlobalSearchEnabled()}>
      {children}
    </ProductSuiteShellFrame>
  );
}
