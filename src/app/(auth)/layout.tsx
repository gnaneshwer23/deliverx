import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthBrandPanel } from "@/components/dx/dx-page-chrome";
import { DxLogo } from "@/components/dx/dx-logo";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="order-1 flex items-start justify-center bg-[#FAFAF5] px-5 py-7 sm:px-8 md:order-2 md:items-center md:p-14">
        <div className="w-full max-w-[388px]">
          <div className="mb-5 md:hidden">
            <DxLogo href="/" />
          </div>
          {children}
        </div>
      </div>
      <div className="order-2 hidden md:order-1 md:block">
        <AuthBrandPanel />
      </div>
    </div>
  );
}
