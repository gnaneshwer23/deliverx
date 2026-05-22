import type { ReactNode } from "react";
import { marketingFontClassName, marketingSans } from "@/lib/marketing-fonts";

export function SovereignFonts({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${marketingFontClassName} ${marketingSans.className} ${className}`}>
      {children}
    </div>
  );
}
