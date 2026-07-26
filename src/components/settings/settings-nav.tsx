"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Code2, CreditCard, Shield, User } from "lucide-react";
import { dxClass } from "@/lib/dx-theme";
import {
  SETTINGS_ADMIN_PATH,
  SETTINGS_BILLING_PATH,
  SETTINGS_DEVELOPER_PATH,
  SETTINGS_PROFILE_PATH,
  SETTINGS_WORKSPACE_PATH,
} from "@/lib/settings-routing";

const TABS = [
  { href: SETTINGS_PROFILE_PATH, label: "Profile & notifications", icon: User },
  { href: SETTINGS_BILLING_PATH, label: "Billing", icon: CreditCard },
  {
    href: SETTINGS_WORKSPACE_PATH,
    label: "Workspace & organisation",
    icon: Building2,
    adminOnly: true,
  },
  {
    href: SETTINGS_ADMIN_PATH,
    label: "Pilot admin",
    icon: Shield,
    adminOnly: true,
  },
  {
    href: SETTINGS_DEVELOPER_PATH,
    label: "Developer & integrations",
    icon: Code2,
    developerOnly: true,
  },
] as const;

export function SettingsNav({
  isAdmin,
  isDeveloper = false,
}: {
  isAdmin: boolean;
  isDeveloper?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex flex-wrap gap-2 border-b border-[#E4E4DC] pb-4">
      {TABS.filter((tab) => {
        if ("adminOnly" in tab && tab.adminOnly) return isAdmin;
        if ("developerOnly" in tab && tab.developerOnly) return isDeveloper;
        return true;
      }).map((tab) => {
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
