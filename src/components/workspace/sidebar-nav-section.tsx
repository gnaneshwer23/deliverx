"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

export type SidebarNavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
};

export function SidebarNavSection({
  label,
  items,
  pathname,
  defaultOpen = false,
}: {
  label: string;
  items: SidebarNavItem[];
  pathname: string;
  defaultOpen?: boolean;
}) {
  const activeInSection = items.some(
    (item) =>
      pathname === item.href ||
      (item.href !== "/workspace/dashboard" && pathname.startsWith(item.href + "/")),
  );
  const [open, setOpen] = useState(defaultOpen || activeInSection);

  useEffect(() => {
    if (activeInSection) setOpen(true);
  }, [activeInSection]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-4 mb-1 flex w-full items-center justify-between rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600"
        aria-expanded={open}
      >
        {label}
        <ChevronDown
          size={12}
          className={`transition-transform ${open ? "rotate-0" : "-rotate-90"}`}
        />
      </button>
      {open ? (
        <div className="flex flex-col gap-1">
          {items.map((item) => (
            <SidebarNavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function SidebarNavLink({
  item,
  pathname,
}: {
  item: SidebarNavItem;
  pathname: string;
}) {
  const Icon = item.icon;
  const active =
    pathname === item.href ||
    (item.href !== "/workspace/dashboard" && pathname.startsWith(item.href + "/"));

  return (
    <Link
      href={item.href}
      className={`group flex items-center gap-2 rounded-md px-2 py-1.5 transition ${
        active
          ? "bg-[#0F766E]/10 font-semibold text-[#0F766E]"
          : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      <Icon size={16} />
      <span className="flex-1">{item.label}</span>
    </Link>
  );
}

export function SidebarNavLinks({
  items,
  pathname,
}: {
  items: SidebarNavItem[];
  pathname: string;
}) {
  return (
    <>
      {items.map((item) => (
        <SidebarNavLink key={item.href} item={item} pathname={pathname} />
      ))}
    </>
  );
}
