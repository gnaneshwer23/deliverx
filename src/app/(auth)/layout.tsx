import type { ReactNode } from "react";
import { AuthBrandPanel } from "@/components/dx/dx-page-chrome";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <AuthBrandPanel />
      <div className="flex items-center justify-center bg-[#f5f2ed] p-8 md:p-14">
        <div className="w-full max-w-md rounded-2xl border border-[#0a0e14]/[0.06] bg-white p-8 shadow-[0_24px_80px_-32px_rgba(10,14,20,0.12)] md:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}
