"use client";

import { useCallback, useRef, useState } from "react";
import { FileText, Loader2, Sparkles, Upload } from "lucide-react";
import { dxClass } from "@/lib/dx-theme";
import styles from "./BusinessCaseUploadZone.module.css";

export type UploadProgressStage = "idle" | "extracting" | "uploading" | "success";

export function BusinessCaseUploadZone({
  brief,
  onBriefChange,
  onSubmit,
  disabled,
  progressStage,
  error,
}: {
  brief: string;
  onBriefChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  progressStage: UploadProgressStage;
  error?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [extracting, setExtracting] = useState(false);

  const busy = disabled || extracting || progressStage === "uploading";

  const handleFile = useCallback(
    async (file: File) => {
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      const textLocal = [".txt", ".md", ".csv"];
      const serverExtract = [".pdf", ".docx"];

      if (!textLocal.includes(ext) && !serverExtract.includes(ext)) {
        return;
      }

      if (textLocal.includes(ext)) {
        const reader = new FileReader();
        reader.onload = () => onBriefChange(String(reader.result ?? ""));
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
        if (res.ok && data.text) onBriefChange(data.text);
      } finally {
        setExtracting(false);
      }
    },
    [onBriefChange],
  );

  function onDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  const showScan =
    progressStage === "uploading" || progressStage === "extracting" || extracting;

  return (
    <div className="space-y-4" data-panel="business-case-upload">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`${styles.uploadZone} flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition ${
          dragOver || showScan ? styles.uploadZoneActive : "border-[var(--dx-rul)] bg-[var(--dx-bas)]"
        }`}
      >
        {showScan ? <span className={styles.scanLine} aria-hidden /> : null}
        <Upload size={28} className="text-[#1C4A2E]" aria-hidden />
        <p className={`${dxClass.display} mt-3 text-lg text-[#0D0D0B]`}>
          {extracting ? "Extracting document…" : "Drop your business case here"}
        </p>
        <p className="mt-1 text-sm text-[#6B6B64]">PDF, DOCX, TXT, MD, or CSV</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md,.csv,application/pdf"
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
      </div>

      <div>
        <p className={dxClass.label}>Or paste content</p>
        <textarea
          value={brief}
          onChange={(e) => onBriefChange(e.target.value)}
          rows={6}
          placeholder="Paste scope, budget, stakeholders, and success criteria…"
          className={`${dxClass.input} mt-2 resize-y`}
          disabled={busy}
        />
      </div>

      <p className="flex items-start gap-2 rounded-lg border border-[#C6DDD0] bg-[#EEF5F1] px-3 py-2.5 text-xs leading-relaxed text-[#1C4A2E]">
        <FileText size={14} className="mt-0.5 shrink-0" aria-hidden />
        Works with any business case format — AI extracts requirements, gaps, and risks into the
        Review Queue. Nothing is applied until you approve it.
      </p>

      {error ? (
        <p className="border border-[#C0392B]/30 bg-[#FDF1F0] px-3 py-2 text-sm text-[#C0392B]">
          {error}
        </p>
      ) : null}

      {progressStage === "success" ? (
        <p className="border border-[#C6DDD0] bg-[#EDF7F1] px-3 py-2 text-sm text-[#1A6B3A]">
          Business case uploaded — AI analysis queued for review.
        </p>
      ) : null}

      <button
        type="button"
        disabled={busy || !brief.trim()}
        onClick={onSubmit}
        className={`${dxClass.btnPrimary} w-full sm:w-auto`}
      >
        {progressStage === "uploading" ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Processing…
          </>
        ) : (
          <>
            <Sparkles size={14} aria-hidden />
            Upload &amp; queue AI analysis
          </>
        )}
      </button>
    </div>
  );
}
