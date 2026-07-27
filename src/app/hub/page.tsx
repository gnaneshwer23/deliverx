import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductSuiteShell } from "@/components/dx/product-suite-shell";
import { createClient } from "@/lib/supabase/server";
import { parseSuiteProduct, productDisplayName } from "@/lib/marketing/product-intent";

export const metadata: Metadata = {
  title: "Journey map | DeliverX",
  description: "Choose where to go next in the DeliverX product suite.",
};

export const dynamic = "force-dynamic";

const HUB_JOURNEY = [
  {
    id: "profile",
    stage: "Start here",
    name: "Professional Home",
    progress: "Daily briefing, next action, evidence health, gaps, and fit.",
    href: "/profile",
    cta: "Open home",
  },
  {
    id: "experience",
    stage: "Build evidence",
    name: "Experience",
    progress: "Practice inside a simulated company and create work evidence.",
    href: "/experience/app",
    cta: "Continue practice",
  },
  {
    id: "launchpad",
    stage: "Land the opportunity",
    name: "Launchpad",
    progress: "Turn evidence into readiness, interviews, applications, and outcomes.",
    href: "/launchpad/app",
    cta: "Open Launchpad",
  },
  {
    id: "portfolio",
    stage: "Package proof",
    name: "Verified Portfolio",
    progress: "Share claims with cited evidence and named attestation where available.",
    href: "/portfolio",
    cta: "Open Portfolio",
  },
  {
    id: "workspace",
    stage: "Succeed at work",
    name: "Professional Workspace",
    progress: "Collaborative delivery work after organisation setup.",
    href: "/workspace",
    onboardingHref: "/onboarding/organisation",
    cta: "Open Workspace",
  },
] as const;

function displayNameFromUser(meta: Record<string, unknown> | undefined, email: string | undefined) {
  const name =
    (typeof meta?.name === "string" && meta.name.trim()) ||
    (typeof meta?.full_name === "string" && meta.full_name.trim()) ||
    null;
  if (name) return name.split(/\s+/)[0] ?? name;
  if (email) return email.split("@")[0] ?? "there";
  return "there";
}

export default async function HubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/hub")}`);
  }

  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const firstName = displayNameFromUser(meta, user.email);
  const product = parseSuiteProduct(typeof meta?.product === "string" ? meta.product : null);

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id")
    .eq("id", user.id)
    .maybeSingle();

  const hasOrg = Boolean(profile?.organisation_id);

  return (
    <ProductSuiteShell>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <section className="grid gap-8 border-b border-[var(--dx-rul)] pb-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B4A2F]">
              DeliverX journey map
            </p>
            <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[0.95] tracking-tight text-[#0D0D0B] sm:text-5xl lg:text-6xl">
              Welcome back, {firstName}.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#4B5563]">
              Professional Home is your default starting point. Use this map when you want to jump
              to a specific DeliverX surface without losing the bigger journey.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--dx-rul)] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#0D0D0B]">Today starts at Home</p>
            <p className="mt-2 text-sm leading-6 text-[#4B5563]">
              Home answers where you are, what matters, and what comes next from your evidence.
            </p>
            {product ? (
              <p className="mt-4 rounded-lg bg-[#F7F7F2] px-3 py-2 text-xs text-[#4B5563]">
                Signed up for {productDisplayName(product)}.
              </p>
            ) : null}
            <Link
              href="/profile"
              className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-[#0D2B1E] px-4 text-sm font-semibold text-white hover:bg-[#143A29] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
            >
              Open Professional Home
            </Link>
          </div>
        </section>

        <section className="py-10" aria-labelledby="journey-map-title">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B6B64]">
                Product surfaces
              </p>
              <h2 id="journey-map-title" className="mt-2 text-2xl font-semibold text-[#0D0D0B]">
                One route, five surfaces.
              </h2>
            </div>
            <p className="max-w-lg text-sm leading-6 text-[#4B5563]">
              Dashboard-style work stays inside the signed-in product. This page is only for
              orientation and navigation.
            </p>
          </div>

          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {HUB_JOURNEY.map((item, index) => {
              const href =
                item.id === "workspace"
                  ? hasOrg
                    ? item.href
                    : item.onboardingHref
                  : item.href;

              return (
                <li key={item.id}>
                  <Link
                    href={href}
                    className="group block min-h-full rounded-xl border border-[var(--dx-rul)] bg-white p-5 shadow-sm transition-colors hover:border-[#BFD8C9] hover:bg-[#F8FBF9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8B4A2F]">
                        {String(index + 1).padStart(2, "0")} / {item.stage}
                      </p>
                      <span className="text-sm font-semibold text-[#1C4A2E]">{item.cta}</span>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-[#0D0D0B]">{item.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#4B5563]">{item.progress}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </ProductSuiteShell>
  );
}
