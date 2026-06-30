"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { dxClass } from "@/lib/dx-theme";
import type { BrainDocumentRow } from "@/services/brainDocumentService";

const ACCEPT = ".pdf,.docx,.txt,.md,.csv";

export function BrainUploadZone({
  disabled,
  healthMessage,
  onUploaded,
}: {
  disabled?: boolean;
  healthMessage?: string;
  onUploaded: (document: BrainDocumentRow) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);

      const body = new FormData();
      body.append("file", file);

      try {
        const res = await fetch("/api/brain/ingest", { method: "POST", body });
        const data = (await res.json()) as {
          ok?: boolean;
          document?: BrainDocumentRow;
          error?: string;
        };

        if (!res.ok || !data.document) {
          setError(data.error ?? "Upload failed");
          return;
        }

        onUploaded(data.document);
      } catch {
        setError("Could not reach the server");
      } finally {
        setUploading(false);
      }
    },
    [onUploaded],
  );

  function onDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file && !disabled && !uploading) void handleFile(file);
  }

  const busy = disabled || uploading;

  return (
    <div className={`${dxClass.cardPad}`}>
      <div className="mb-4 flex items-center gap-2">
        <Upload size={18} className="text-[#1C4A2E]" />
        <h2 className="font-semibold">Upload zone</h2>
      </div>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!busy) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !busy && inputRef.current?.click()}
        className={`flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-12 text-center transition ${
          dragOver
            ? "border-[#1C4A2E] bg-[#EEF5F1]"
            : "border-[#C6DDD0] bg-[#EEF5F1]/40"
        } ${busy ? "cursor-not-allowed opacity-70" : ""}`}
      >
        {uploading ? (
          <Loader2 size={28} className="animate-spin text-[#1C4A2E]" />
        ) : (
          <Upload size={28} className="text-[#1C4A2E]" />
        )}
        <p className="mt-3 text-sm font-medium text-[#0D0D0B]">
          {uploading ? "Uploading and classifying…" : "Drop delivery documents here"}
        </p>
        <p className="mt-2 max-w-sm text-xs text-[#6B6B64]">
          PDF, Word, and markdown supported. AI suggestions land in the review queue — nothing is
          auto-applied.
        </p>
        {healthMessage ? (
          <p className="mt-3 max-w-sm text-xs text-[#A8A89E]">{healthMessage}</p>
        ) : null}
        <button type="button" className={`${dxClass.btnGhost} mt-6`} disabled={busy}>
          Choose files
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
