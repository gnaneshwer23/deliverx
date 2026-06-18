/**
 * Voice project update — pure helpers.
 */

export type VoiceUpdateExtract = {
  summary: string;
  highlights: string[];
  blockers: string[];
  decisionsNeeded: string[];
  sentiment: "positive" | "neutral" | "concern";
};

export function normalizeTranscript(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

export function estimateSpeechMinutes(wordCount: number): number {
  return Math.round((wordCount / 150) * 10) / 10;
}

export function wordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function isLikelyQuestion(transcript: string): boolean {
  const t = transcript.trim();
  if (!t) return false;
  if (t.endsWith("?")) return true;
  return /^(what|why|how|when|where|who|are we|is the|can we|should we|will we)\b/i.test(t);
}

export function sanitizeVoiceUpdateExtract(raw: Partial<VoiceUpdateExtract>): VoiceUpdateExtract {
  return {
    summary: String(raw.summary ?? "").trim() || "Status update recorded.",
    highlights: (raw.highlights ?? []).map(String).filter(Boolean).slice(0, 5),
    blockers: (raw.blockers ?? []).map(String).filter(Boolean).slice(0, 5),
    decisionsNeeded: (raw.decisionsNeeded ?? []).map(String).filter(Boolean).slice(0, 5),
    sentiment:
      raw.sentiment === "positive" || raw.sentiment === "concern"
        ? raw.sentiment
        : "neutral",
  };
}
