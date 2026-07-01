"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Loader2, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import { AiStatusBanner } from "@/components/ai/ai-status-banner";
import { businessCaseUploadCopy } from "@/lib/ai/prompts/business-case-industry";
import { aiErrorMessage, postAi } from "@/lib/ai/client-fetch";
import { dxClass } from "@/lib/dx-theme";
import type { BusinessCaseReview } from "@/services/aiBusinessCaseReview";
import { businessCaseRecommendationLabel } from "@/lib/business-case/constants";
import type { ProjectStructureDraft } from "@/services/aiProjectStructuring";
import { ProjectCreationStepper } from "@/components/project/project-creation-stepper";
import { ProjectDiscoveryChat } from "@/components/project/project-discovery-chat";
import { BusinessCaseReport } from "@/components/project/business-case-report";
import {
  canProceedFromGoReview,
  projectFormStepToGatewayStep,
  projectFormStepNumber,
} from "@/services/gatewayOnboardingEngine";
import { createProjectDraftAction, type ProjectState } from "./actions";

const initial: ProjectState = { ok: false };

const deliveryTypes = [
  "Digital Transformation",
  "Healthcare Transformation",
  "Infrastructure",
  "Product Delivery",
  "Operations",
  "Other",
];

const timelines = ["< 3 months", "3-6 months", "6-12 months", "12+ months"];

type StructureResponse = { ok: true; draft: ProjectStructureDraft };
type ReviewResponse = { ok: true; review: BusinessCaseReview };

type Step = "project" | "brief" | "review" | "discovery" | "create";
type InputMode = "form" | "chat";

type DiscoveryResponse = {
  ok: true;
  complete: boolean;
  summary: string;
  questions: string[];
};

export function ProjectForm({
  playbookId,
  deliveryTypeDefault,
  initialMode = "form",
  orgIndustry,
  orgDeliveryType,
}: {
  playbookId?: string;
  deliveryTypeDefault?: string;
  initialMode?: InputMode;
  orgIndustry?: string | null;
  orgDeliveryType?: string | null;
}) {
  const [state, formAction, pending] = useActionState(createProjectDraftAction, initial);
  const errorSeen = useRef("");

  useEffect(() => {
    if (state.error && state.error !== errorSeen.current) {
      errorSeen.current = state.error;
      toast.error(state.error);
    }
  }, [state.error]);

  const [step, setStep] = useState<Step>("project");
  const [inputMode, setInputMode] = useState<InputMode>(initialMode);
  const [brief, setBrief] = useState("");
  const [review, setReview] = useState<BusinessCaseReview | null>(null);
  const [projectName, setProjectName] = useState("");
  const [goal, setGoal] = useState("");
  const [deliveryType, setDeliveryType] = useState(deliveryTypeDefault ?? "");
  const [timeline, setTimeline] = useState("");
  const [draft, setDraft] = useState<ProjectStructureDraft | null>(null);
  const [discoveryQuestions, setDiscoveryQuestions] = useState<string[]>([]);
  const [discoveryAnswers, setDiscoveryAnswers] = useState<Record<string, string>>({});
  const [discovering, setDiscovering] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [goAccepted, setGoAccepted] = useState(false);
  const [conditionalWaiver, setConditionalWaiver] = useState(false);

  function syncGateway(formStep: Step) {
    const gatewayStep = projectFormStepToGatewayStep(formStep);
    void fetch("/api/gateway/session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step: gatewayStep,
        draftPayload: {
          brief,
          projectName,
          goal,
          deliveryType,
          timeline,
          discoveryAnswers,
          goAccepted,
          conditionalWaiver,
        },
      }),
    }).catch(() => undefined);
  }

  function goToStep(next: Step) {
    setStep(next);
    syncGateway(next);
  }

  async function runReview() {
    const trimmed = brief.trim();
    if (!trimmed) {
      setAiError("Paste or upload a business case to continue.");
      return;
    }

    setReviewing(true);
    setAiError(null);

    const res = await postAi<ReviewResponse>("/api/ai/review-business-case", {
      content: trimmed,
    });

    setReviewing(false);

    if (!res.ok) {
      setAiError(aiErrorMessage(res));
      return;
    }

    const r = res.data.review;
    setReview(r);
    setGoAccepted(false);
    setConditionalWaiver(false);
    setProjectName(r.suggestedProjectName);
    setGoal(r.suggestedGoal);
    if (deliveryTypes.includes(r.suggestedDeliveryType)) {
      setDeliveryType(r.suggestedDeliveryType);
    }
    setStep("review");
    syncGateway("review");
  }

  async function generateStructure() {
    const trimmed = brief.trim();
    if (!trimmed) return;

    setGenerating(true);
    setAiError(null);

    const res = await postAi<StructureResponse>("/api/ai/structure-project", {
      brief: trimmed,
      projectName: projectName || undefined,
      deliveryType: deliveryType || undefined,
      goal: goal || undefined,
      discoveryAnswers: Object.keys(discoveryAnswers).length ? discoveryAnswers : undefined,
    });

    setGenerating(false);

    if (!res.ok) {
      setAiError(aiErrorMessage(res));
      return;
    }

    setDraft(res.data.draft);
  }

  async function continueFromReview() {
    if (!review) return;
    const gate = canProceedFromGoReview({
      recommendation: review.recommendation,
      goAccepted,
      conditionalWaiver,
    });
    if (!gate.ok) {
      setAiError(gate.reason ?? "Cannot proceed through sponsor gateway.");
      return;
    }

    const trimmed = brief.trim();
    if (!trimmed) return;
    setDiscovering(true);
    setAiError(null);
    const res = await postAi<DiscoveryResponse>("/api/ai/project-discovery", {
      brief: trimmed,
      answers: discoveryAnswers,
    });
    setDiscovering(false);
    if (!res.ok) {
      setAiError(aiErrorMessage(res));
      return;
    }
    if (res.data.complete || res.data.questions.length === 0) {
      goToStep("create");
      return;
    }
    setDiscoveryQuestions(res.data.questions);
    goToStep("discovery");
  }

  async function submitDiscovery() {
    const trimmed = brief.trim();
    setDiscovering(true);
    const res = await postAi<DiscoveryResponse>("/api/ai/project-discovery", {
      brief: trimmed,
      answers: discoveryAnswers,
    });
    setDiscovering(false);
    if (!res.ok) {
      setAiError(aiErrorMessage(res));
      return;
    }
    if (!res.data.complete && res.data.questions.length > 0) {
      setDiscoveryQuestions(res.data.questions);
      setAiError("Answer all follow-up questions to continue.");
      return;
    }
    setStep("create");
    syncGateway("create");
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    const textLocal = [".txt", ".md", ".csv"];
    const serverExtract = [".pdf", ".docx"];

    if (!textLocal.includes(ext) && !serverExtract.includes(ext)) {
      setAiError("Upload PDF, DOCX, TXT, MD, or CSV — or paste content directly.");
      return;
    }

    setAiError(null);

    if (textLocal.includes(ext)) {
      const reader = new FileReader();
      reader.onload = () => {
        setBrief(String(reader.result ?? ""));
      };
      reader.readAsText(file);
      return;
    }

    setExtracting(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/documents/extract-text", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as { ok?: boolean; text?: string; error?: string };
      if (!res.ok || !data.text) {
        setAiError(data.error ?? "Could not extract text from file.");
        return;
      }
      setBrief(data.text);
      toast.success(`Loaded ${file.name} (${data.text.length.toLocaleString()} characters)`);
    } catch {
      setAiError("Upload failed. Try a smaller file or paste text directly.");
    } finally {
      setExtracting(false);
      event.target.value = "";
    }
  }

  function onChatDiscoveryComplete(payload: { brief: string; answers: Record<string, string> }) {
    setBrief(payload.brief);
    setDiscoveryAnswers(payload.answers);
    void runReviewFromBrief(payload.brief);
  }

  async function runReviewFromBrief(text: string) {
    setReviewing(true);
    setAiError(null);
    const res = await postAi<ReviewResponse>("/api/ai/review-business-case", { content: text });
    setReviewing(false);
    if (!res.ok) {
      setAiError(aiErrorMessage(res));
      setStep("brief");
      syncGateway("brief");
      return;
    }
    const r = res.data.review;
    setReview(r);
    setGoAccepted(false);
    setConditionalWaiver(false);
    setProjectName(r.suggestedProjectName);
    setGoal(r.suggestedGoal);
    if (deliveryTypes.includes(r.suggestedDeliveryType)) {
      setDeliveryType(r.suggestedDeliveryType);
    }
    setStep("review");
    syncGateway("review");
  }

  if (step === "project") {
    return (
      <div className="space-y-5">
        <ProjectCreationStepper current="project" />
        <StepHeader n={projectFormStepNumber("project")} label="Name your project" />
        <p className="text-sm text-[#6B6B64]">
          Give your initiative a name and delivery context. Next you&apos;ll share your business case for AI review.
        </p>
        <Field
          label="Project name"
          name="project_name_preview"
          required
          value={projectName}
          onChange={setProjectName}
        />
        <TextareaField label="Goal (optional)" name="goal_preview" value={goal} onChange={setGoal} />
        <SelectField
          label="Delivery type"
          name="delivery_type_preview"
          options={deliveryTypes}
          value={deliveryType}
          onChange={setDeliveryType}
        />
        <SelectField
          label="Timeline"
          name="timeline_preview"
          options={timelines}
          value={timeline}
          onChange={setTimeline}
        />
        {aiError ? <AiStatusBanner message={aiError} /> : null}
        <button
          type="button"
          disabled={!projectName.trim()}
          onClick={() => {
            if (!projectName.trim()) {
              setAiError("Project name is required.");
              return;
            }
            setAiError(null);
            goToStep("brief");
          }}
          className={`${dxClass.btnPrimary} w-full`}
        >
          Continue to business case →
        </button>
      </div>
    );
  }

  if (step === "brief") {
    const uploadCopy = businessCaseUploadCopy({
      industry: orgIndustry,
      deliveryType: orgDeliveryType ?? (deliveryType || undefined),
    });

    return (
      <div className="space-y-5">
        <ProjectCreationStepper current="brief" />
        <StepHeader n={projectFormStepNumber("brief")} label="Business case" />

        <div className="flex gap-1 border border-[#E4E4DC] p-0.5">
          <button
            type="button"
            onClick={() => setInputMode("form")}
            className={`flex-1 px-3 py-2 text-xs font-medium ${
              inputMode === "form" ? "bg-[#1C4A2E] text-white" : "text-[#6B6B64] hover:bg-[#F7F7F2]"
            }`}
          >
            Paste business case
          </button>
          <button
            type="button"
            onClick={() => setInputMode("chat")}
            className={`flex-1 px-3 py-2 text-xs font-medium ${
              inputMode === "chat" ? "bg-[#1C4A2E] text-white" : "text-[#6B6B64] hover:bg-[#F7F7F2]"
            }`}
          >
            Guided questionnaire (chat)
          </button>
        </div>

        {inputMode === "chat" ? (
          <ProjectDiscoveryChat onComplete={onChatDiscoveryComplete} />
        ) : (
          <>
        <p className="text-sm text-[#6B6B64]">{uploadCopy.helper}</p>

        <label className="block">
          <span className={dxClass.label}>Business case / brief</span>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={8}
            placeholder={uploadCopy.placeholder}
            className={`${dxClass.input} mt-1.5 resize-y`}
          />
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-[#1C4A2E]">
          <Upload size={14} />
          <span>
            {extracting ? "Extracting document…" : "Upload business case (PDF, DOCX, TXT, MD, CSV)"}
          </span>
          <input
            type="file"
            accept=".pdf,.docx,.txt,.md,.csv,application/pdf"
            className="sr-only"
            disabled={extracting}
            onChange={handleFileUpload}
          />
        </label>

        {aiError ? <AiStatusBanner message={aiError} /> : null}

        <button
          type="button"
          disabled={reviewing}
          onClick={runReview}
          className={`${dxClass.btnPrimary} w-full`}
        >
          {reviewing ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Reviewing with AI…
            </>
          ) : (
            <>
              <Sparkles size={14} /> Review business case →
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => goToStep("project")}
          className="w-full text-center text-sm text-[#6B6B64] hover:text-[#1C4A2E]"
        >
          ← Back to project details
        </button>
          </>
        )}
        {reviewing ? (
          <p className="flex items-center gap-2 text-sm text-[#6B6B64]">
            <Loader2 size={14} className="animate-spin" /> Running AI review…
          </p>
        ) : null}
      </div>
    );
  }

  if (step === "review" && review) {
    const isNoGo = review.recommendation === "no_go";
    const canProceed =
      !isNoGo &&
      goAccepted &&
      (review.recommendation !== "conditional_go" || conditionalWaiver);

    return (
      <div className="space-y-5">
        <ProjectCreationStepper current="review" />
        <StepHeader n={projectFormStepNumber("review")} label="AI review" />

        <BusinessCaseReport review={review} />

        {isNoGo ? (
          <div className="border border-[#C0392B]/30 bg-[#FDF1F0] px-4 py-3 text-sm text-[#8B2E2E]">
            <p className="font-medium">Not ready to proceed</p>
            <p className="mt-1">
              This business case does not meet the readiness threshold. Revise your brief and re-run the
              review — project creation is blocked until the assessment improves.
            </p>
          </div>
        ) : (
          <div className="border border-[#C6DDD0] bg-[#EEF5F1] p-4 space-y-3">
            <p className="text-sm font-medium text-[#1C4A2E]">Confirm you&apos;re ready to proceed</p>
            <p className="text-sm text-[#6B6B64]">
              AI recommends{" "}
              <strong>{businessCaseRecommendationLabel(review.recommendation)}</strong>. Accept to
              continue setting up your project and workspaces.
            </p>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={goAccepted}
                onChange={(e) => setGoAccepted(e.target.checked)}
                className="mt-0.5 size-4"
              />
              <span>
                I accept the {businessCaseRecommendationLabel(review.recommendation)} recommendation
                and authorise proceeding to project setup.
              </span>
            </label>
            {review.recommendation === "conditional_go" ? (
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={conditionalWaiver}
                  onChange={(e) => setConditionalWaiver(e.target.checked)}
                  className="mt-0.5 size-4"
                />
                <span>
                  I acknowledge conditional GO — gaps will be addressed during discovery and delivery
                  setup.
                </span>
              </label>
            ) : null}
          </div>
        )}

        {aiError ? <AiStatusBanner message={aiError} /> : null}

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => goToStep("brief")} className={dxClass.btnGhost}>
            ← Edit brief
          </button>
          {!isNoGo ? (
            <button
              type="button"
              disabled={discovering || !canProceed}
              onClick={continueFromReview}
              className={`${dxClass.btnPrimary} flex-1`}
            >
              {discovering ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Checking…
                </>
              ) : (
                "Continue to project setup →"
              )}
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  if (step === "discovery") {
    return (
      <div className="space-y-5">
        <ProjectCreationStepper current="discovery" />
        <StepHeader n={projectFormStepNumber("discovery")} label="Delivery questions" />
        <p className="text-sm text-[#6B6B64]">
          Answer follow-up questions so DeliverX can generate a complete delivery structure.
        </p>
        {discoveryQuestions.map((q) => (
          <label key={q} className="block">
            <span className={dxClass.label}>{q}</span>
            <textarea
              value={discoveryAnswers[q] ?? ""}
              onChange={(e) =>
                setDiscoveryAnswers((prev) => ({ ...prev, [q]: e.target.value }))
              }
              rows={2}
              className={`${dxClass.input} mt-1.5 resize-y`}
            />
          </label>
        ))}
        {aiError ? <AiStatusBanner message={aiError} /> : null}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => goToStep("review")} className={dxClass.btnGhost}>
            ← Back
          </button>
          <button type="button" disabled={discovering} onClick={submitDiscovery} className={`${dxClass.btnPrimary} flex-1`}>
            {discovering ? "Processing…" : "Continue →"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <ProjectCreationStepper current="create" />
      <StepHeader n={projectFormStepNumber("create")} label="Confirm project details" />

      {playbookId ? <input type="hidden" name="playbook_id" value={playbookId} /> : null}
      {draft ? <input type="hidden" name="ai_draft" value={JSON.stringify(draft)} /> : null}
      {brief.trim() ? <input type="hidden" name="brief" value={brief.trim()} /> : null}
      {review && goAccepted ? (
        <>
          <input type="hidden" name="bc_report" value={JSON.stringify(review)} />
          <input type="hidden" name="bc_go_accepted" value="true" />
        </>
      ) : null}
      {Object.keys(discoveryAnswers).length > 0 ? (
        <input type="hidden" name="discovery_answers" value={JSON.stringify(discoveryAnswers)} />
      ) : null}

      <Field label="Project name" name="project_name" required value={projectName} onChange={setProjectName} />
      <TextareaField label="Goal" name="goal" value={goal} onChange={setGoal} />
      <SelectField
        label="Delivery type"
        name="delivery_type"
        options={deliveryTypes}
        value={deliveryType}
        onChange={setDeliveryType}
      />
      <SelectField label="Timeline" name="timeline" options={timelines} value={timeline} onChange={setTimeline} />

      {brief.trim() && review && goAccepted ? (
        <div className="border border-[#C6DDD0] bg-[#EEF5F1] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles size={14} className="text-[#1C4A2E]" />
            <span className="text-sm font-medium text-[#1C4A2E]">GO-triggered workspace generation</span>
          </div>
          <p className="text-xs text-[#6B6B64]">
            On create, DeliverX will generate delivery structure, requirements, and product roadmap
            drafts for all seven persona workspaces. AI outputs land in the{" "}
            <strong>AI output review</strong> — approve before they apply to production data.
          </p>
        </div>
      ) : brief.trim() ? (
        <div className="border border-dashed border-[#C6DDD0] bg-[#EEF5F1] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles size={14} className="text-[#1C4A2E]" />
            <span className="text-sm font-medium text-[#1C4A2E]">AI delivery structure (optional)</span>
          </div>
          <p className="mb-3 text-xs text-[#6B6B64]">
            Generate workstreams, tasks, and initial RAID from your business case.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={generating || pending}
              onClick={generateStructure}
              className={dxClass.btnGhost}
            >
              {generating ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Sparkles size={14} /> Generate structure
                </>
              )}
            </button>
            {draft ? (
              <button type="button" onClick={() => setDraft(null)} className="text-sm text-[#6B6B64]">
                Clear preview
              </button>
            ) : null}
          </div>
          {aiError ? (
            <div className="mt-3">
              <AiStatusBanner message={aiError} />
            </div>
          ) : null}
          {draft ? <StructurePreview draft={draft} /> : null}
        </div>
      ) : null}

      {state.error ? (
        <p className="border border-[#C0392B]/30 bg-[#FDF1F0] px-3 py-2 text-sm text-[#C0392B]">
          {state.error}
        </p>
      ) : null}

      {draft ? (
        <div className="border border-[#C6DDD0] bg-[#EEF5F1] p-3 text-sm">
          <p className="font-medium text-[#1C4A2E]">Governance model</p>
          <p className="mt-1 text-[#6B6B64]">{draft.governanceModel || "Standard PMO cadence"}</p>
        </div>
      ) : null}

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="publish" defaultChecked className="size-4" />
        Publish project (activate delivery workspace)
      </label>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => goToStep(discoveryQuestions.length ? "discovery" : review ? "review" : "brief")} className={dxClass.btnGhost}>
          ← Back
        </button>
        <button type="submit" disabled={pending || generating || (Boolean(review) && !goAccepted)} className={`${dxClass.btnPrimary} flex-1`}>
          {pending
            ? review && goAccepted
              ? "Creating workspaces…"
              : "Creating…"
            : draft
              ? "Create project with AI structure →"
              : review && goAccepted
                ? "Accept GO & create workspaces →"
                : "Create project →"}
        </button>
      </div>
    </form>
  );
}

function StepHeader({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-6 items-center justify-center bg-[#1C4A2E] font-[family-name:var(--font-dx-mono)] text-[10px] text-white">
        {n}
      </span>
      <span className={dxClass.label}>{label}</span>
    </div>
  );
}

function StructurePreview({ draft }: { draft: ProjectStructureDraft }) {
  return (
    <div className="mt-4 space-y-3 border border-[#E4E4DC] bg-white p-4 text-sm">
      <p className="font-medium">Preview — review before creating</p>
      <PreviewSection title={`Workstreams (${draft.workstreams.length})`} items={draft.workstreams.slice(0, 6).map((ws) => ws.name)} />
      <PreviewSection
        title={`Tasks (${draft.tasks.length})`}
        items={draft.tasks.slice(0, 8).map((t) => `[${t.priority}] ${t.title}`)}
        more={draft.tasks.length > 8 ? draft.tasks.length - 8 : 0}
      />
      <PreviewSection
        title={`Milestones (${draft.milestones.length})`}
        items={draft.milestones.slice(0, 5).map((m) => m.title)}
      />
      <PreviewSection
        title={`Stakeholders (${draft.stakeholders.length})`}
        items={draft.stakeholders.slice(0, 5).map((s) => `${s.name} (${s.roleLabel})`)}
      />
      <PreviewSection
        title={`Benefits (${draft.benefits.length})`}
        items={draft.benefits.slice(0, 5).map((b) => b.title)}
      />
      <PreviewSection
        title={`RAID (${draft.raidItems.length})`}
        items={draft.raidItems.slice(0, 5).map((r) => `[${r.type}] ${r.title}`)}
      />
    </div>
  );
}

function PreviewSection({
  title,
  items,
  more,
}: {
  title: string;
  items: string[];
  more?: number;
}) {
  return (
    <div>
      <p className={dxClass.label}>{title}</p>
      <ul className="mt-1 space-y-0.5 text-[#6B6B64]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
        {more ? <li className="text-[#A8A89E]">+{more} more</li> : null}
      </ul>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  value,
  onChange,
}: {
  label: string;
  name: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className={dxClass.label}>{label}</span>
      <input
        name={name}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${dxClass.input} mt-1.5`}
      />
    </label>
  );
}

function TextareaField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className={dxClass.label}>{label}</span>
      <textarea
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className={`${dxClass.input} mt-1.5 resize-y`}
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  value,
  onChange,
}: {
  label: string;
  name: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className={dxClass.label}>{label}</span>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${dxClass.input} mt-1.5`}
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
