import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";

const steps = [
  { href: "/onboarding/organisation", label: "Organisation" },
  { href: "/onboarding/role", label: "Role" },
  { href: "/onboarding/invite", label: "Invite team" },
  { href: "/onboarding/complete", label: "Ready" },
];

export default async function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-[#0F172A]">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            DeliverX
          </Link>
          <span className="text-xs text-slate-500">{user.email}</span>
        </div>
        <nav className="mx-auto flex max-w-4xl items-center gap-2 overflow-x-auto px-6 pb-4 text-xs">
          {steps.map((step, i) => (
            <span
              key={step.href}
              className="flex items-center gap-2 whitespace-nowrap text-slate-500"
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-700">
                {i + 1}
              </span>
              {step.label}
              {i < steps.length - 1 ? <span className="text-slate-300">→</span> : null}
            </span>
          ))}
        </nav>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-10">
        <div className="w-full max-w-xl">{children}</div>
      </main>
    </div>
  );
}
