import type { ReactNode } from "react";
import { AuthBrandPanel } from "@/components/dx/dx-page-chrome";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <AuthBrandPanel />
      <div className="flex items-center justify-center bg-[#FAFAF5] p-8 md:p-14">{children}</div>
    </div>
  );
}
