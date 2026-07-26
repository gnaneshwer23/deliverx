"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { ObCard } from "@/components/dx/ob-card";
import { DxButton } from "@/components/dx/dx-button";
import {
  COLLABORATION_STYLES,
  COMMUNICATION_PREFERENCES,
  CURRENT_SITUATIONS,
  FEEDBACK_PREFERENCES,
  INDUSTRY_OPTIONS,
  MAX_DEVELOPMENT_PRIORITIES,
  MAX_SELF_REPORTED_STRENGTHS,
  PRACTICE_AREAS,
  PROFESSIONAL_IDENTITIES,
  TARGET_SENIORITIES,
  TIME_HORIZONS,
  explainRecommendation,
  isSkippableStep,
  pathHref,
  prevStep,
  stepsForSet,
  summariseForReview,
  validateStep,
  whyWeAsk,
  type PiOnboardingPayload,
  type PiOnboardingStep,
  type PiOnboardingStepSet,
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

function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-[13px] font-medium text-[#0D0D0B]"
    >
      {children}
    </label>
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

function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { children, className, ...rest } = props;
  return (
    <select
      {...rest}
      className={`w-full rounded-lg border border-[#E8EAED] bg-white px-3 py-2.5 text-[14px] text-[#0D0D0B] outline-none focus:border-[#1C4A2E] ${className ?? ""}`}
    >
      {children}
    </select>
  );
}

function RadioGroup({
  legend,
  name,
  options,
  value,
  onChange,
  hint,
}: {
  legend: string;
  name: string;
  options: readonly { value: string; label: string }[];
  value: string | undefined;
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 block text-[13px] font-medium text-[#0D0D0B]">{legend}</legend>
      {hint ? <p className="mb-2 text-[12px] text-[#9CA3AF]">{hint}</p> : null}
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-[14px] ${
              value === option.value
                ? "border-[#1C4A2E] bg-[#EEF5F1]"
                : "border-[#E8EAED] bg-white"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ChipGroup({
  legend,
  hint,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  hint?: string;
  options: readonly { value: string; label: string }[];
  selected: readonly string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 block text-[13px] font-medium text-[#0D0D0B]">{legend}</legend>
      {hint ? <p className="mb-2 text-[12px] text-[#9CA3AF]">{hint}</p> : null}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(option.value)}
              className={`rounded-full border px-3 py-1.5 text-[12px] ${
                active
                  ? "border-[#1C4A2E] bg-[#EEF5F1] text-[#1C4A2E]"
                  : "border-[#E8EAED] text-[#6B7280]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function stepMeta(
  step: PiOnboardingStep,
  stepSet: PiOnboardingStepSet,
): { title: string; description: string } {
  const conversational = stepSet === "v2-conversation";
  switch (step) {
    case "welcome":
      return {
        title: "Let's set up your Professional Profile",
        description: "A short discovery conversation — around six minutes, saved as you go.",
      };
    case "identity":
      return {
        title: conversational ? "Your background" : "Who you are",
        description: conversational
          ? "Who you are today, and the context you are working from."
          : "Start your Professional Intelligence Profile.",
      };
    case "situation":
      return {
        title: "Where you are — and where you want to go",
        description: "Your situation and career objective shape the next best action.",
      };
    case "targets":
      return {
        title: conversational ? "Career direction" : "Target role and level",
        description: conversational
          ? "What you are aiming for, and by when. You can target more than one role later."
          : "You can target more than one role later — pick your primary focus now.",
      };
    case "strengths":
      return {
        title: "Strengths and development areas",
        description: "Your own read on where you are strong today. Optional — you can skip it.",
      };
    case "evidence":
      return {
        title: "Evidence you already have",
        description: "Self-reported and imported notes are not verified evidence yet.",
      };
    case "working_style":
      return {
        title: "How you like to work",
        description: "Shapes how you are briefed and how feedback lands. Optional.",
      };
    case "consent":
      return {
        title: "Consent and visibility",
        description: "Control what DeliverX may analyse and how you appear by default.",
      };
    case "review":
      return {
        title: "Review what we recorded",
        description: "Correct anything before we use it, then set consent and visibility.",
      };
    case "path":
      return {
        title: "Your starting path",
        description: "A short baseline helps us calibrate — then choose where to begin.",
      };
  }
}

export function PiOnboardingWizard({
  initialStep,
  initialPayload,
  email,
  stepSet,
}: {
  initialStep: PiOnboardingStep;
  initialPayload: PiOnboardingPayload;
  email: string;
  stepSet: PiOnboardingStepSet;
}) {
  const router = useRouter();
  const [step, setStep] = useState<PiOnboardingStep>(initialStep);
  const [payload, setPayload] = useState<PiOnboardingPayload>(initialPayload);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const isFirstRender = useRef(true);
  const fieldId = useId();

  const steps = stepsForSet(stepSet);
  const stepNumber = steps.indexOf(step) + 1;
  const meta = stepMeta(step, stepSet);
  const recommendation = explainRecommendation(payload);
  const recommended = recommendation.path;
  const conversational = stepSet === "v2-conversation";
  const skippable = isSkippableStep(step) && steps.includes(step);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    bodyRef.current?.focus();
  }, [step]);

  function patch(partial: Partial<PiOnboardingPayload>) {
    setPayload((prev) => ({ ...prev, ...partial }));
    setError(null);
  }

  function toggled(current: readonly string[] | undefined, name: string, max: number): string[] {
    const list = current ?? [];
    if (list.includes(name)) return list.filter((item) => item !== name);
    if (list.length >= max) return [...list];
    return [...list, name];
  }

  function skipImport(type: string) {
    const skipped = new Set(payload.skippedImports ?? []);
    skipped.add(type);
    patch({ skippedImports: Array.from(skipped) });
  }

  async function persist(opts: {
    advance?: boolean;
    complete?: boolean;
    skip?: boolean;
    chosenPath?: PiRecommendedPath;
    exit?: boolean;
  }) {
    if (!opts.exit && !opts.skip) {
      const validation = validateStep(step, payload, stepSet);
      if (!validation.ok) {
        setError(validation.message);
        return;
      }
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
            action: opts.skip ? "skip" : "save",
            step,
            payload,
            advance: opts.skip ? true : (opts.advance ?? false),
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
          router.push("/profile");
          router.refresh();
          return;
        }

        if (opts.skip) {
          setPayload((prev) => ({
            ...prev,
            skippedSteps: Array.from(new Set([...(prev.skippedSteps ?? []), step])),
          }));
        }

        if ((opts.advance || opts.skip) && data.currentStep && data.currentStep !== "completed") {
          setStep(data.currentStep as PiOnboardingStep);
        }
      } catch {
        setError("Network error. Check your connection and try again.");
      }
    });
  }

  return (
    <ObCard
      step={`Step ${stepNumber} of ${steps.length}`}
      title={meta.title}
      description={meta.description}
      wide={step === "evidence" || step === "review" || step === "path"}
    >
      <div
        className="mb-6 h-1 w-full overflow-hidden rounded-full bg-[#EDEFF2]"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={stepNumber}
        aria-valuetext={`Step ${stepNumber} of ${steps.length}: ${meta.title}`}
      >
        <div
          className="h-full rounded-full bg-[#1C4A2E] transition-[width] duration-200"
          style={{ width: `${(stepNumber / steps.length) * 100}%` }}
        />
      </div>

      <div
        ref={bodyRef}
        tabIndex={-1}
        aria-label={`${meta.title}. Step ${stepNumber} of ${steps.length}.`}
        className="outline-none"
      >
        <WhyAsk step={step} />

        {step === "welcome" && (
          <div className="space-y-4 text-[14px] leading-relaxed text-[#4B5563]">
            <p>
              We ask a small number of questions so your first actions are relevant. Nothing here
              becomes verified evidence — verified capability comes from work you do and evidence
              that is checked.
            </p>
            <ul className="space-y-2 rounded-lg border border-[#E8EAED] bg-white p-4 text-[13px]">
              {[
                "Your background and current context",
                "Career direction and timeframe",
                "Strengths and development areas (optional)",
                "Experience you already have (optional)",
                "How you like to work (optional)",
                "A review, then your recommended starting path",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="text-[#1C4A2E]">
                    —
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-[13px] text-[#6B7280]">
              Around six minutes. Progress saves at every step, your profile is private by default,
              and you can leave and return at any time.
            </p>
            <p className="text-[12px] text-[#9CA3AF]">Signed in as {email}</p>
          </div>
        )}

        {step === "identity" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <SourceBadge label="Self-reported" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor={`${fieldId}-first-name`}>First name</FieldLabel>
                <TextInput
                  id={`${fieldId}-first-name`}
                  value={payload.firstName ?? ""}
                  onChange={(e) => patch({ firstName: e.target.value })}
                  autoComplete="given-name"
                />
              </div>
              <div>
                <FieldLabel htmlFor={`${fieldId}-last-name`}>Last name</FieldLabel>
                <TextInput
                  id={`${fieldId}-last-name`}
                  value={payload.lastName ?? ""}
                  onChange={(e) => patch({ lastName: e.target.value })}
                  autoComplete="family-name"
                />
              </div>
            </div>
            <div>
              <FieldLabel htmlFor={`${fieldId}-identity`}>Professional identity</FieldLabel>
              <SelectInput
                id={`${fieldId}-identity`}
                value={payload.professionalIdentity ?? ""}
                onChange={(e) => patch({ professionalIdentity: e.target.value })}
              >
                <option value="">Select…</option>
                {PROFESSIONAL_IDENTITIES.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </SelectInput>
            </div>
            {payload.professionalIdentity === "Other" && (
              <div>
                <FieldLabel htmlFor={`${fieldId}-identity-other`}>Describe yourself</FieldLabel>
                <TextInput
                  id={`${fieldId}-identity-other`}
                  value={payload.professionalIdentityOther ?? ""}
                  onChange={(e) => patch({ professionalIdentityOther: e.target.value })}
                />
              </div>
            )}
            {conversational && (
              <RadioGroup
                legend="Current situation"
                name="situation"
                options={CURRENT_SITUATIONS}
                value={payload.currentSituation}
                onChange={(value) => patch({ currentSituation: value })}
              />
            )}
            <p className="text-[12px] text-[#9CA3AF]">Signed in as {email}</p>
          </div>
        )}

        {step === "situation" && (
          <div className="space-y-4">
            <SourceBadge label="Self-reported" />
            <RadioGroup
              legend="Current situation"
              name="situation"
              options={CURRENT_SITUATIONS}
              value={payload.currentSituation}
              onChange={(value) => patch({ currentSituation: value })}
            />
            <div>
              <FieldLabel htmlFor={`${fieldId}-objective`}>Career objective</FieldLabel>
              <TextArea
                id={`${fieldId}-objective`}
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
            {conversational && (
              <div>
                <FieldLabel htmlFor={`${fieldId}-objective`}>
                  What do you want to achieve?
                </FieldLabel>
                <TextArea
                  id={`${fieldId}-objective`}
                  rows={3}
                  value={payload.careerObjective ?? ""}
                  onChange={(e) => patch({ careerObjective: e.target.value })}
                  placeholder="e.g. Move into an Associate PM role in healthtech"
                />
              </div>
            )}
            <div>
              <FieldLabel htmlFor={`${fieldId}-target-role`}>Target role</FieldLabel>
              <TextInput
                id={`${fieldId}-target-role`}
                value={payload.targetRole ?? ""}
                onChange={(e) => patch({ targetRole: e.target.value })}
                placeholder="Associate Product Manager"
              />
            </div>
            <div>
              <FieldLabel htmlFor={`${fieldId}-seniority`}>Target seniority</FieldLabel>
              <SelectInput
                id={`${fieldId}-seniority`}
                value={payload.targetSeniority ?? ""}
                onChange={(e) => patch({ targetSeniority: e.target.value })}
              >
                <option value="">Select…</option>
                {TARGET_SENIORITIES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </SelectInput>
            </div>
            {conversational && (
              <div>
                <FieldLabel htmlFor={`${fieldId}-horizon`}>
                  Timeframe <span className="font-normal text-[#9CA3AF]">— optional</span>
                </FieldLabel>
                <SelectInput
                  id={`${fieldId}-horizon`}
                  value={payload.careerTimeHorizon ?? ""}
                  onChange={(e) => patch({ careerTimeHorizon: e.target.value })}
                >
                  <option value="">Select…</option>
                  {TIME_HORIZONS.map((h) => (
                    <option key={h.value} value={h.value}>
                      {h.label}
                    </option>
                  ))}
                </SelectInput>
              </div>
            )}
            <ChipGroup
              legend="Preferred industries"
              hint="Up to 5."
              options={INDUSTRY_OPTIONS.map((industry) => ({
                value: industry,
                label: industry,
              }))}
              selected={payload.preferredIndustries ?? []}
              onToggle={(value) =>
                patch({ preferredIndustries: toggled(payload.preferredIndustries, value, 5) })
              }
            />
          </div>
        )}

        {step === "strengths" && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <SourceBadge label="Self-reported" />
              <span className="text-[12px] text-[#9CA3AF]">
                A claim about yourself — not a capability level, score or Verified status
              </span>
            </div>
            <ChipGroup
              legend="Where you are strongest today"
              hint={`Choose up to ${MAX_SELF_REPORTED_STRENGTHS}.`}
              options={PRACTICE_AREAS}
              selected={payload.selfReportedStrengths ?? []}
              onToggle={(value) =>
                patch({
                  selfReportedStrengths: toggled(
                    payload.selfReportedStrengths,
                    value,
                    MAX_SELF_REPORTED_STRENGTHS,
                  ),
                })
              }
            />
            <ChipGroup
              legend="Where you want to develop"
              hint={`Choose up to ${MAX_DEVELOPMENT_PRIORITIES}. This sets coaching focus.`}
              options={PRACTICE_AREAS}
              selected={payload.developmentPriorities ?? []}
              onToggle={(value) =>
                patch({
                  developmentPriorities: toggled(
                    payload.developmentPriorities,
                    value,
                    MAX_DEVELOPMENT_PRIORITIES,
                  ),
                })
              }
            />
            <div>
              <FieldLabel htmlFor={`${fieldId}-strengths-note`}>
                Anything to add <span className="font-normal text-[#9CA3AF]">— optional</span>
              </FieldLabel>
              <TextArea
                id={`${fieldId}-strengths-note`}
                rows={3}
                maxLength={500}
                value={payload.strengthsNote ?? ""}
                onChange={(e) => patch({ strengthsNote: e.target.value })}
                placeholder="Context that helps us coach you well."
              />
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
              <FieldLabel htmlFor={`${fieldId}-experience`}>
                Existing experience summary
              </FieldLabel>
              <TextArea
                id={`${fieldId}-experience`}
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
                  <div key={key} className="rounded-lg border border-[#E8EAED] bg-white p-3">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FieldLabel htmlFor={`${fieldId}-${key}`}>{label}</FieldLabel>
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
                        id={`${fieldId}-${key}`}
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

        {step === "working_style" && (
          <div className="space-y-5">
            <SourceBadge label="Self-reported" />
            <RadioGroup
              legend="Collaboration"
              name="collaboration"
              options={COLLABORATION_STYLES}
              value={payload.collaborationStyle}
              onChange={(value) => patch({ collaborationStyle: value })}
            />
            <RadioGroup
              legend="Feedback"
              name="feedback"
              options={FEEDBACK_PREFERENCES}
              value={payload.feedbackPreference}
              onChange={(value) => patch({ feedbackPreference: value })}
            />
            <RadioGroup
              legend="Communication"
              name="communication"
              options={COMMUNICATION_PREFERENCES}
              value={payload.communicationPreference}
              onChange={(value) => patch({ communicationPreference: value })}
            />
          </div>
        )}

        {(step === "consent" || step === "review") && (
          <div className="space-y-5">
            {step === "review" && (
              <div className="overflow-hidden rounded-lg border border-[#E8EAED] bg-white">
                <table className="w-full text-left text-[13px]">
                  <caption className="sr-only">
                    Your onboarding answers. Every row is self-reported and can be corrected.
                  </caption>
                  <tbody>
                    {summariseForReview(payload, stepSet).map((row) => (
                      <tr key={row.label} className="border-b border-[#F0F1F4] last:border-0">
                        <th scope="row" className="w-40 px-3 py-2.5 align-top font-medium text-[#0D0D0B]">
                          {row.label}
                        </th>
                        <td className="px-3 py-2.5 align-top text-[#4B5563]">
                          <span className="mr-2 align-middle">
                            <SourceBadge label={row.sourceLabel} />
                          </span>
                          {row.value}
                        </td>
                        <td className="w-16 px-3 py-2.5 align-top">
                          <button
                            type="button"
                            className="text-[12px] text-[#1C4A2E] underline"
                            onClick={() => setStep(row.step)}
                          >
                            Edit
                            <span className="sr-only"> {row.label}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

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
            <RadioGroup
              legend="Default visibility"
              name="visibility"
              options={[
                { value: "private", label: "Private — only me" },
                { value: "link", label: "Link — people I share with" },
                { value: "public", label: "Public portfolio later (still opt-in per item)" },
              ]}
              value={payload.visibilityDefault}
              onChange={(value) =>
                patch({ visibilityDefault: value as PiOnboardingPayload["visibilityDefault"] })
              }
            />
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
              {recommendation.reasons.length > 0 && (
                <div className="mb-4 rounded-lg border border-[#E8EAED] bg-white p-3">
                  <p className="mb-1.5 text-[12px] font-medium text-[#0D0D0B]">
                    Why this recommendation
                  </p>
                  <ul className="space-y-1 text-[13px] text-[#6B7280]">
                    {recommendation.reasons.map((reason) => (
                      <li key={reason} className="flex gap-2">
                        <span aria-hidden="true" className="text-[#1C4A2E]">
                          —
                        </span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                  {recommendation.dataSufficiency === "limited" && (
                    <p className="mt-2 text-[12px] text-[#9CA3AF]">
                      You can change this now, or add more detail later and re-check.
                    </p>
                  )}
                </div>
              )}
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
                    onClick={() => void persist({ complete: true, chosenPath: path })}
                  >
                    {label}
                  </DxButton>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 min-h-[1rem] text-[13px] text-[#C0392B]" role="alert" aria-live="polite">
        {error}
      </p>

      {step !== "path" && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {prevStep(step, stepSet) ? (
              <DxButton
                type="button"
                variant="ghost"
                disabled={pending}
                onClick={() => {
                  const p = prevStep(step, stepSet);
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
              Save &amp; exit
            </button>
          </div>
          <div className="flex items-center gap-3">
            {skippable ? (
              <button
                type="button"
                className="text-[13px] text-[#6B7280] underline"
                disabled={pending}
                onClick={() => void persist({ skip: true })}
              >
                Skip for now
              </button>
            ) : null}
            <DxButton
              type="button"
              variant="primary"
              disabled={pending}
              onClick={() => void persist({ advance: true })}
            >
              {pending ? "Saving…" : "Continue"}
            </DxButton>
          </div>
        </div>
      )}

      {step === "path" && (
        <div className="mt-6">
          <button
            type="button"
            className="text-[13px] text-[#6B7280] underline"
            disabled={pending}
            onClick={() => {
              const p = prevStep(step, stepSet);
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
