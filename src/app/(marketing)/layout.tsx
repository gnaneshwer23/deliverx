import type { ReactNode } from "react";
import { marketingFontClassName, marketingSans } from "@/lib/marketing-fonts";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${marketingFontClassName} ${marketingSans.className}`}>{children}</div>
  );
}
