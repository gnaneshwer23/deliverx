import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductSuiteShell } from "@/components/dx/product-suite-shell";
import { HELP_ARTICLES } from "@/lib/global-search";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Help | DeliverX",
  description: "Where you are, what matters, and what to do next in DeliverX.",
};

export const dynamic = "force-dynamic";

const SECTIONS = [
  {
    id: "where-am-i",
    title: "Where am I?",
    body: "Signed-in DeliverX uses one suite navigation: Home, Experience, Launchpad, Portfolio, Workspace, and Journey map. Settings and Help sit in the shell chrome. There is no separate Insights product — search and help are utilities that route into these surfaces.",
    links: [
      { href: "/profile", label: "Open Professional Home" },
      { href: "/hub", label: "Open Journey map" },
    ],
  },
  {
    id: "what-next",
    title: "What should I do next?",
    body: "Start from Professional Home for recommended next actions grounded in your Professional Intelligence, or use Journey map when you want to choose a product surface. Recommendations explain their rationale; they do not invent capability levels or Verified status.",
    links: [
      { href: "/profile", label: "Home next actions" },
      { href: "/hub", label: "Journey map" },
    ],
  },
  {
    id: "evidence-capability",
    title: "Evidence vs capability",
    body: "Evidence is a record of work you demonstrated. Capability levels and confidence bands come only from the Capability Engine after judgement. AI observations and coach drafts are not verified evidence.",
    links: [
      { href: "/profile/evidence", label: "Evidence Ledger" },
      { href: "/profile/baseline", label: "Baseline assessment" },
    ],
  },
  {
    id: "learning",
    title: "Learning is not competency",
    body: "Learning paths help close knowledge gaps. Completing learning does not assign capability and does not light the Verified badge.",
    links: [{ href: "/learning", label: "Open Learning" }],
  },
  {
    id: "consent",
    title: "Observation consent",
    body: "Workspace observation defaults OFF. Coaching and continuous observation require your explicit consent. You can review privacy and consent in Settings.",
    links: [{ href: "/settings/profile", label: "Settings & privacy" }],
  },
  {
    id: "verified",
    title: "What Verified means",
    body: "Verified means a named third party attested a specific claim. A ScoreRun alone does not light Verified. Manage packaging and attestation from Portfolio.",
    links: [{ href: "/portfolio", label: "Open Portfolio" }],
  },
  {
    id: "search",
    title: "How to search",
    body: "Press Command-K (Mac) or Control-K (Windows/Linux), or use Search in the top bar. Results include destinations, help topics, and records you own — evidence, projects you created, artefacts, and Experience enrolments. Org-wide workspace search remains at Workspace search.",
    links: [{ href: "/workspace/search", label: "Workspace search" }],
  },
] as const;

export default async function HelpPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/help")}`);
  }

  return (
    <ProductSuiteShell>
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <p className="text-xs font-medium uppercase tracking-wide text-[#6B6B64]">
          DeliverX · Help
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#0D0D0B]">
          Help
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#4B5563]">
          Calm orientation for the signed-in suite. No unexplained scores, no decorative
          readiness, and no third product surface.
        </p>

        <nav aria-label="Help topics" className="mt-8">
          <ul className="flex flex-wrap gap-2">
            {HELP_ARTICLES.map((article) => (
              <li key={article.id}>
                <a
                  href={article.href}
                  className="inline-flex min-h-11 items-center rounded-lg border border-[var(--dx-rul)] bg-white px-3 text-sm text-[#1C4A2E] hover:bg-[#EEF5F1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
                >
                  {article.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-10 space-y-10">
          {SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-title`}
              className="scroll-mt-24 border-t border-[var(--dx-rul)] pt-8"
            >
              <h2
                id={`${section.id}-title`}
                className="text-lg font-medium text-[#0D0D0B]"
              >
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#4B5563]">{section.body}</p>
              <ul className="mt-4 flex flex-wrap gap-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-11 items-center text-sm font-medium text-[#1C4A2E] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </ProductSuiteShell>
  );
}
