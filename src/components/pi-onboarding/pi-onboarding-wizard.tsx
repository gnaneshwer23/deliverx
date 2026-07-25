"use client";

import { useRouter } from "next/navigation";
import {
  useState,
  useTransition,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { ObCard } from "@/components/dx/ob-card";
import { DxButton } from "@/components/dx/dx-button";
import {
  CURRENT_SITUATIONS,
  INDUSTRY_OPTIONS,
  PI_ONBOARDING_STEPS,
  PROFESSIONAL_IDENTITIES,
  TARGET_SENIORITIES,
  pathHref,
  prevStep,
  recommendPath,
  validateStep,
  whyWeAsk,
  type PiOnboardingPayload,
  type PiOnboardingStep,
  type PiRecommendedPath,
} from "@/lib/pi-onboarding/types";
import { dxClass } from "@/lib/dx-theme";

function SourceBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-md bg-[#EEF5F1] px-2 py-0.5 text-[11px] font-medium text-[#1C4A2E]">
      {label}
    </span>
  );
}

function WhyAsk({ step }: { step: PiOnboardingStep }) {
  return (
    <p className="mb-6 rounded-lg border border-[#E8EAED] bg-[#F8F9FB] px-3 py-2 text-[13px] leading-relaxed text-[#6B7280]">
      <span className="font-medium text-[#0D0D0B]">Why we ask: </span>
      {whyWeAsk(step)}
    </p>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block text-[13px] font-medium text-[#0D0D0B]">{children}</label>
  );
}

function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-[#E8EAED] bg-white px-3 py-2.5 text-[14px] text-[#0D0D0B] outline-none focus:border-[#1C4A2E] ${props.className ?? ""}`}
    />
  );
}

function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-[#E8EAED] bg-white px-3 py-2.5 text-[14px] text-[#0D0D0B] outline-none focus:border-[#1C4A2E] ${props.className ?? ""}`}
    />
  );
}

const STEP_TITLES: Record<PiOnboardingStep, { title: string; description: string }> = {
  identity: {
    title: "Who you are",
    description: "Start your Professional Intelligence Profile.",
  },
  situation: {
    title: "Where you are — and where you want to go",
    description: "Your situation and career objective shape the next best action.",
  },
  targets: {
    title: "Target role and level",
    description: "You can target more than one role later — pick your primary focus now.",
  },
  evidence: {
    title: "Evidence you already have",
    description: "Self-reported and imported notes are not verified evidence yet.",
  },
  consent: {
    title: "Consent and visibility",
    description: "Control what DeliverX may analyse and how you appear by default.",
  },
  path: {
    title: "Your starting path",
    description: "A short baseline helps us calibrate — then choose where to begin.",
  },
};

export function PiOnboardingWizard({
  initialStep,
  initialPayload,
  email,
}: {
  initialStep: PiOnboardingStep;
  initialPayload: PiOnboardingPayload;
  email: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<PiOnboardingStep>(initialStep);
  const [payload, setPayload] = useState<PiOnboardingPayload>(initialPayload);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const stepNumber = PI_ONBOARDING_STEPS.indexOf(step) + 1;
  const meta = STEP_TITLES[step];
  const recommended = recommendPath(payload);

  function patch(partial: Partial<PiOnboardingPayload>) {
    setPayload((prev) => ({ ...prev, ...partial }));
    setError(null);
  }

  function toggleIndustry(name: string) {
    const current = payload.preferredIndustries ?? [];
    if (current.includes(name)) {
      patch({ preferredIndustries: current.filter((i) => i !== name) });
      return;
    }
    if (current.length >= 5) return;
    patch({ preferredIndustries: [...current, name] });
  }

  function skipImport(type: string) {
    const skipped = new Set(payload.skippedImports ?? []);
    skipped.add(type);
    patch({ skippedImports: Array.from(skipped) });
  }

  async function persist(opts: {
    advance?: boolean;
    complete?: boolean;
    chosenPath?: PiRecommendedPath;
    exit?: boolean;
  }) {
    const validation = validateStep(step, payload);
    if (!validation.ok && !opts.exit) {
      setError(validation.message);
      return;
    }

    startTransition(async () => {
      setError(null);
      try {
        if (opts.complete) {
          const res = await fetch("/api/pi-onboarding", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "complete",
              step: "path",
              payload,
              chosenPath: opts.chosenPath ?? recommended,
            }),
          });
          const data = (await res.json()) as { error?: string; redirectTo?: string };
          if (!res.ok) {
            setError(data.error || "Could not complete onboarding.");
            return;
          }
          router.push(data.redirectTo || pathHref(recommended));
          router.refresh();
          return;
        }

        const res = await fetch("/api/pi-onboarding", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "save",
              step,
              payload,
              advance: opts.advance ?? false,
              partial: Boolean(opts.exit),
            }),
          });
        const data = (await res.json()) as {
          error?: string;
          currentStep?: string;
        };
        if (!res.ok) {
          setError(data.error || "Could not save. Try again.");
          return;
        }

        if (opts.exit) {
          router.push("/hub");
          router.refresh();
          return;
        }

        if (opts.advance && data.currentStep && data.currentStep !== "completed") {
          setStep(data.currentStep as PiOnboardingStep);
        }
      } catch {
        setError("Network error. Check your connection and try again.");
      }
    });
  }

  return (
    <ObCard
      step={`Step ${stepNumber} of ${PI_ONBOARDING_STEPS.length}`}
      title={meta.title}
      description={meta.description}
      wide={step === "evidence" || step === "path"}
    >
      <WhyAsk step={step} />

      {step === "identity" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <SourceBadge label="Self-reported" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>First name</FieldLabel>
              <TextInput
                value={payload.firstName ?? ""}
                onChange={(e) => patch({ firstName: e.target.value })}
                autoComplete="given-name"
              />
            </div>
            <div>
              <FieldLabel>Last name</FieldLabel>
              <TextInput
                value={payload.lastName ?? ""}
                onChange={(e) => patch({ lastName: e.target.value })}
                autoComplete="family-name"
              />
            </div>
          </div>
          <div>
            <FieldLabel>Professional identity</FieldLabel>
            <select
              className="w-full rounded-lg border border-[#E8EAED] bg-white px-3 py-2.5 text-[14px]"
              value={payload.professionalIdentity ?? ""}
              onChange={(e) => patch({ professionalIdentity: e.target.value })}
            >
              <option value="">Select…</option>
              {PROFESSIONAL_IDENTITIES.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>
          {payload.professionalIdentity === "Other" && (
            <div>
              <FieldLabel>Describe yourself</FieldLabel>
              <TextInput
                value={payload.professionalIdentityOther ?? ""}
                onChange={(e) => patch({ professionalIdentityOther: e.target.value })}
              />
            </div>
          )}
          <p className="text-[12px] text-[#9CA3AF]">Signed in as {email}</p>
        </div>
      )}

      {step === "situation" && (
        <div className="space-y-4">
          <SourceBadge label="Self-reported" />
          <div>
            <FieldLabel>Current situation</FieldLabel>
            <div className="space-y-2">
              {CURRENT_SITUATIONS.map((s) => (
                <label
                  key={s.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-[14px] ${
                    payload.currentSituation === s.value
                      ? "border-[#1C4A2E] bg-[#EEF5F1]"
                      : "border-[#E8EAED] bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="situation"
                    checked={payload.currentSituation === s.value}
                    onChange={() => patch({ currentSituation: s.value })}
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Career objective</FieldLabel>
            <TextArea
              rows={3}
              value={payload.careerObjective ?? ""}
              onChange={(e) => patch({ careerObjective: e.target.value })}
              placeholder="e.g. Move into an Associate PM role in healthtech within 6 months"
            />
          </div>
        </div>
      )}

      {step === "targets" && (
        <div className="space-y-4">
          <SourceBadge label="Self-reported" />
          <div>
            <FieldLabel>Target role</FieldLabel>
            <TextInput
              value={payload.targetRole ?? ""}
              onChange={(e) => patch({ targetRole: e.target.value })}
              placeholder="Associate Product Manager"
            />
          </div>
          <div>
            <FieldLabel>Target seniority</FieldLabel>
            <select
              className="w-full rounded-lg border border-[#E8EAED] bg-white px-3 py-2.5 text-[14px]"
              value={payload.targetSeniority ?? ""}
              onChange={(e) => patch({ targetSeniority: e.target.value })}
            >
              <option value="">Select…</option>
              {TARGET_SENIORITIES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel>Preferred industries (up to 5)</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {INDUSTRY_OPTIONS.map((ind) => {
                const active = payload.preferredIndustries?.includes(ind);
                return (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => toggleIndustry(ind)}
                    className={`rounded-full border px-3 py-1.5 text-[12px] ${
                      active
                        ? "border-[#1C4A2E] bg-[#EEF5F1] text-[#1C4A2E]"
                        : "border-[#E8EAED] text-[#6B7280]"
                    }`}
                  >
                    {ind}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {step === "evidence" && (
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <SourceBadge label="Self-reported" />
              <span className="text-[12px] text-[#9CA3AF]">Not verified evidence</span>
            </div>
            <FieldLabel>Existing experience summary</FieldLabel>
            <TextArea
              rows={4}
              disabled={payload.noPriorExperience}
              value={payload.existingExperienceSummary ?? ""}
              onChange={(e) => patch({ existingExperienceSummary: e.target.value })}
              placeholder="Projects, roles, outcomes — even informal work counts as a starting point."
            />
            <label className="flex items-center gap-2 text-[13px] text-[#6B7280]">
              <input
                type="checkbox"
                checked={Boolean(payload.noPriorExperience)}
                onChange={(e) =>
                  patch({
                    noPriorExperience: e.target.checked,
                    existingExperienceSummary: e.target.checked
                      ? ""
                      : payload.existingExperienceSummary,
                  })
                }
              />
              I don&apos;t have prior professional experience yet
            </label>
          </div>

          <div className="space-y-3 border-t border-[#E8EAED] pt-4">
            <p className="text-[13px] font-medium text-[#0D0D0B]">
              Optional imports{" "}
              <span className="font-normal text-[#9CA3AF]">— skip and add later</span>
            </p>
            {(
              [
                ["cv", "CV or profile notes", "cvImportNote"],
                ["portfolio", "Project / portfolio links", "portfolioImportNote"],
                ["learning", "Learning & certifications", "learningImportNote"],
              ] as const
            ).map(([key, label, field]) => {
              const skipped = payload.skippedImports?.includes(key);
              return (
                <div
                  key={key}
                  className="rounded-lg border border-[#E8EAED] bg-white p-3"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-[#0D0D0B]">{label}</span>
                      <SourceBadge label="Imported draft" />
                    </div>
                    <button
                      type="button"
                      className="text-[12px] text-[#1C4A2E] underline"
                      onClick={() => skipImport(key)}
                    >
                      {skipped ? "Skipped" : "Skip"}
                    </button>
                  </div>
                  {!skipped && (
                    <TextArea
                      rows={2}
                      value={(payload[field] as string | undefined) ?? ""}
                      onChange={(e) => patch({ [field]: e.target.value })}
                      placeholder="Paste notes or links. You can correct this anytime."
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {step === "consent" && (
        <div className="space-y-4">
          <label className="flex items-start gap-3 rounded-lg border border-[#E8EAED] bg-white p-3 text-[14px]">
            <input
              type="checkbox"
              className="mt-1"
              checked={Boolean(payload.consentAnalysis)}
              onChange={(e) => patch({ consentAnalysis: e.target.checked })}
            />
            <span>
              Allow DeliverX to analyse my onboarding answers and future work evidence to build my
              Professional Intelligence Profile. AI suggestions will not silently update verified
              claims.
            </span>
          </label>
          <div>
            <FieldLabel>Default visibility</FieldLabel>
            <div className="space-y-2">
              {(
                [
                  ["private", "Private — only me"],
                  ["link", "Link — people I share with"],
                  ["public", "Public portfolio later (still opt-in per item)"],
                ] as const
              ).map(([value, label]) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-[14px] ${
                    payload.visibilityDefault === value
                      ? "border-[#1C4A2E] bg-[#EEF5F1]"
                      : "border-[#E8EAED]"
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    checked={payload.visibilityDefault === value}
                    onChange={() => patch({ visibilityDefault: value })}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === "path" && (
        <div className="space-y-5">
          <div className="rounded-lg border border-[#E8EAED] bg-[#F8F9FB] p-4 text-[14px] text-[#6B7280]">
            <p className="mb-2 font-medium text-[#0D0D0B]">Baseline assessment</p>
            <p>
              Next, a light baseline inside your chosen product helps calibrate readiness. It does
              not replace verified evidence — it guides your first actions.
            </p>
            <label className="mt-3 flex items-center gap-2 text-[13px]">
              <input
                type="checkbox"
                checked={payload.baselineOptIn !== false}
                onChange={(e) => patch({ baselineOptIn: e.target.checked })}
              />
              Include baseline when I enter the product
            </label>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-medium text-[#0D0D0B]">
              Recommended:{" "}
              <span className="text-[#1C4A2E]">
                {recommended === "experience"
                  ? "Experience — build evidence through realistic work"
                  : recommended === "launchpad"
                    ? "Launchpad — package evidence for opportunities"
                    : "Hub — choose your journey"}
              </span>
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  ["experience", "Start Experience"],
                  ["launchpad", "Start Launchpad"],
                  ["hub", "Open Hub"],
                ] as const
              ).map(([path, label]) => (
                  <DxButton
                  key={path}
                  type="button"
                  variant={path === recommended ? "primary" : "ghost"}
                  disabled={pending}
                  onClick={() =>
                    void persist({ complete: true, chosenPath: path })
                  }
                >
                  {label}
                </DxButton>
              ))}
            </div>
          </div>
        </div>
      )}

      {error ? (
        <p className="mt-4 text-[13px] text-[#C0392B]" role="alert">
          {error}
        </p>
      ) : null}

      {step !== "path" && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {prevStep(step) ? (
              <DxButton
                type="button"
                variant="ghost"
                disabled={pending}
                onClick={() => {
                  const p = prevStep(step);
                  if (p) setStep(p);
                }}
              >
                Back
              </DxButton>
            ) : null}
            <button
              type="button"
              className="text-[13px] text-[#6B7280] underline"
              disabled={pending}
              onClick={() => void persist({ advance: false, exit: true })}
            >
              Save & exit
            </button>
          </div>
          <DxButton
            type="button"
            variant="primary"
            disabled={pending}
            onClick={() => void persist({ advance: true })}
          >
            {pending ? "Saving…" : "Continue"}
          </DxButton>
        </div>
      )}

      {step === "path" && (
        <div className="mt-6">
          <button
            type="button"
            className="text-[13px] text-[#6B7280] underline"
            disabled={pending}
            onClick={() => {
              const p = prevStep(step);
              if (p) setStep(p);
            }}
          >
            Back
          </button>
        </div>
      )}

      <p className={`mt-6 text-center text-[11px] text-[#9CA3AF] ${dxClass.sans}`}>
        Progressive setup — you can return and correct anything later.
      </p>
    </ObCard>
  );
}
