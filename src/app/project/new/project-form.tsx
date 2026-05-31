"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Loader2, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import { AiStatusBanner } from "@/components/ai/ai-status-banner";
import { DxBadge } from "@/components/dx/dx-badge";
import { aiErrorMessage, postAi } from "@/lib/ai/client-fetch";
import { dxClass } from "@/lib/dx-theme";
import type { BusinessCaseReview } from "@/services/aiBusinessCaseReview";
import type { ProjectStructureDraft } from "@/services/aiProjectStructuring";
import { ProjectCreationStepper } from "@/components/project/project-creation-stepper";
import { ProjectDiscoveryChat } from "@/components/project/project-discovery-chat";
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

type Step = "brief" | "review" | "discovery" | "create";
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
}: {
  playbookId?: string;
  deliveryTypeDefault?: string;
  initialMode?: InputMode;
}) {
  const [state, formAction, pending] = useActionState(createProjectDraftAction, initial);
  const errorSeen = useRef("");

  useEffect(() => {
    if (state.error && state.error !== errorSeen.current) {
      errorSeen.current = state.error;
      toast.error(state.error);
    }
  }, [state.error]);

  const [step, setStep] = useState<Step>("brief");
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
    setProjectName(r.suggestedProjectName);
    setGoal(r.suggestedGoal);
    if (deliveryTypes.includes(r.suggestedDeliveryType)) {
      setDeliveryType(r.suggestedDeliveryType);
    }
    setStep("review");
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
      setStep("create");
      return;
    }
    setDiscoveryQuestions(res.data.questions);
    setStep("discovery");
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
    void runReviewFromBrief(payload.brief, true);
  }

  async function runReviewFromBrief(text: string, skipToCreate = false) {
    setReviewing(true);
    setAiError(null);
    const res = await postAi<ReviewResponse>("/api/ai/review-business-case", { content: text });
    setReviewing(false);
    if (!res.ok) {
      setAiError(aiErrorMessage(res));
      setStep("brief");
      return;
    }
    const r = res.data.review;
    setReview(r);
    setProjectName(r.suggestedProjectName);
    setGoal(r.suggestedGoal);
    if (deliveryTypes.includes(r.suggestedDeliveryType)) {
      setDeliveryType(r.suggestedDeliveryType);
    }
    setStep(skipToCreate ? "create" : "review");
  }

  if (step === "brief") {
    return (
      <div className="space-y-5">
        <ProjectCreationStepper current="brief" />
        <StepHeader n={1} label="Business case" />

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
        <p className="text-sm text-[#6B6B64]">
          Paste or upload your business case. AI will review readiness and pre-fill project details.
        </p>

        <label className="block">
          <span className={dxClass.label}>Business case / brief</span>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={8}
            placeholder="Paste scope, budget, stakeholders, success criteria, constraints…"
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
          onClick={() => setStep("create")}
          className="w-full text-center text-sm text-[#6B6B64] hover:text-[#1C4A2E]"
        >
          Skip — enter project details manually
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
    const scoreTone =
      review.score >= 75 ? "green" : review.score >= 50 ? "amber" : "red";

    return (
      <div className="space-y-5">
        <ProjectCreationStepper current="review" />
        <StepHeader n={2} label="AI review" />
        <div className={`${dxClass.cardPad} flex items-center justify-between gap-4`}>
          <div>
            <p className={dxClass.label}>Readiness score</p>
            <p className={`${dxClass.display} text-3xl`}>{review.score}%</p>
          </div>
          <DxBadge tone={scoreTone}>{review.score >= 75 ? "Ready" : review.score >= 50 ? "Gaps" : "Needs work"}</DxBadge>
        </div>
        <p className="text-sm text-[#2C2C28]">{review.summary}</p>

        {review.strengths.length > 0 ? (
          <ReviewList title="Strengths" items={review.strengths} tone="green" />
        ) : null}
        {review.gaps.length > 0 ? (
          <ReviewList title="Gaps to address" items={review.gaps} tone="amber" />
        ) : null}
        {review.initialRisks.length > 0 ? (
          <ReviewList title="Initial risks detected" items={review.initialRisks} tone="red" />
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setStep("brief")} className={dxClass.btnGhost}>
            ← Edit brief
          </button>
          <button type="button" disabled={discovering} onClick={continueFromReview} className={`${dxClass.btnPrimary} flex-1`}>
            {discovering ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Checking…
              </>
            ) : (
              "Continue to project setup →"
            )}
          </button>
        </div>
      </div>
    );
  }

  if (step === "discovery") {
    return (
      <div className="space-y-5">
        <ProjectCreationStepper current="discovery" />
        <StepHeader n={3} label="AI discovery questionnaire" />
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
          <button type="button" onClick={() => setStep("review")} className={dxClass.btnGhost}>
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
      <StepHeader n={review ? 4 : 3} label="Project setup" />

      {playbookId ? <input type="hidden" name="playbook_id" value={playbookId} /> : null}
      {draft ? <input type="hidden" name="ai_draft" value={JSON.stringify(draft)} /> : null}
      {brief.trim() ? <input type="hidden" name="brief" value={brief.trim()} /> : null}

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

      {brief.trim() ? (
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
        <button type="button" onClick={() => setStep(discoveryQuestions.length ? "discovery" : review ? "review" : "brief")} className={dxClass.btnGhost}>
          ← Back
        </button>
        <button type="submit" disabled={pending || generating} className={`${dxClass.btnPrimary} flex-1`}>
          {pending ? "Creating…" : draft ? "Create project with AI structure →" : "Create project →"}
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

function ReviewList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "green" | "amber" | "red";
}) {
  const bg =
    tone === "green" ? "bg-[#EDF7F1]" : tone === "amber" ? "bg-[#FEF6EC]" : "bg-[#FDF1F0]";
  return (
    <div className={`${dxClass.cardPad} ${bg}`}>
      <p className={`${dxClass.label} mb-2`}>{title}</p>
      <ul className="list-inside list-disc space-y-1 text-sm text-[#2C2C28]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
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
