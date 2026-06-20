"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, User } from "lucide-react";
import { dxClass } from "@/lib/dx-theme";

const TABS = [
  { href: "/workspace/settings", label: "Profile & notifications", icon: User },
  {
    href: "/workspace/settings/organisation",
    label: "Organisation & integrations",
    icon: Building2,
    adminOnly: true,
  },
] as const;

export function SettingsNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex flex-wrap gap-2 border-b border-[#E4E4DC] pb-4">
      {TABS.filter((tab) => !("adminOnly" in tab && tab.adminOnly) || isAdmin).map((tab) => {
        const active = pathname === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium transition ${
              active
                ? "border border-[#1C4A2E] bg-[#EEF5F1] text-[#1C4A2E]"
                : `${dxClass.btnGhost} text-[#6B6B64]`
            }`}
          >
            <Icon size={14} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
