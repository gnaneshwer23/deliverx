import Link from "next/link";
import { getPortfolioByShareToken } from "@/lib/verified-portfolio/public";
import { EVIDENCE_STRENGTH_DISPLAY, type EvidenceStrengthLabel } from "@/lib/verified-portfolio/types";

export const dynamic = "force-dynamic";

type Params = Promise<{ token: string }>;

export default async function PortfolioExternalViewPage({ params }: { params: Params }) {
  const { token } = await params;
  const result = await getPortfolioByShareToken(token);

  if (!result.ok) {
    const message =
      result.reason === "expired"
        ? "This portfolio link has expired."
        : result.reason === "revoked"
          ? "This portfolio link has been revoked."
          : "This portfolio link is invalid.";

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF5] px-4">
        <div className="w-full max-w-md rounded-2xl border border-[#E4E4DC] bg-white p-8">
          <h1 className="text-xl font-semibold">Link unavailable</h1>
          <p className="mt-2 text-sm text-[#6B6B64]">{message}</p>
          <Link href="/" className="mt-6 inline-flex text-sm font-medium text-[#0F766E] underline">
            Go to DeliverX
          </Link>
        </div>
      </div>
    );
  }

  const view = result.view;
  const strength = view.evidenceStrength as EvidenceStrengthLabel;

  return (
    <div className="min-h-screen bg-[#FAFAF5] px-4 py-10">
      <article className="mx-auto max-w-2xl rounded-2xl border border-[#E4E4DC] bg-white p-8 shadow-sm">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6B6B64]">
          {result.label || "Professional portfolio"} · External view
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[#1A1A18]">{String(view.title)}</h1>
        {view.targetRole ? (
          <p className="mt-1 text-sm text-[#6B6B64]">Prepared for: {String(view.targetRole)}</p>
        ) : null}

        <div className="mt-4 rounded-lg border border-[#C5D9CE] bg-[#EEF5F1] px-3 py-2 text-xs text-[#1C4A2E]">
          {String(view.verificationNotice)}
        </div>

        <p className="mt-4 text-sm">
          Evidence strength:{" "}
          <strong>
            {EVIDENCE_STRENGTH_DISPLAY[strength]?.label ?? String(view.evidenceStrength)}
          </strong>
        </p>

        <section className="mt-6 space-y-3 text-sm text-[#4A4A45]">
          <Field label="Context" value={view.projectContext} />
          <Field label="Responsibility" value={view.userResponsibility} />
          <Field label="Challenge" value={view.challenge} />
          <Field label="Actions" value={view.actions} />
          <Field label="Decisions" value={view.decisions} />
          <Field label="Artefacts" value={view.artefacts} />
          <Field label="Outcomes" value={view.outcomes} />
          <Field label="Reflection" value={view.reflection} />
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-medium">Evidence</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {(view.evidenceLinks as Array<{ title: string; strength: string }>).map((l) => (
              <li key={l.title} className="flex justify-between gap-2 border-b border-[#F0EEE6] py-1">
                <span>{l.title}</span>
                <span className="font-mono text-[10px] text-[#1C4A2E]">
                  {EVIDENCE_STRENGTH_DISPLAY[l.strength as EvidenceStrengthLabel]?.label ??
                    l.strength}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-6 text-xs text-[#6B6B64]">{String(view.aiAssistanceDisclosure)}</p>
      </article>
    </div>
  );
}

function Field({ label, value }: { label: string; value: unknown }) {
  const text = String(value ?? "");
  if (!text || text === "[Hidden]") {
    return (
      <div>
        <p className="text-xs uppercase tracking-wide text-[#6B6B64]">{label}</p>
        <p className="italic text-[#9A9A92]">{text === "[Hidden]" ? "Hidden" : "—"}</p>
      </div>
    );
  }
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-[#6B6B64]">{label}</p>
      <p className="whitespace-pre-wrap">{text}</p>
    </div>
  );
}
