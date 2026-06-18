/**
 * Voice project updates — Whisper transcription, RAG Q&A, update extraction.
 */

import { createClient } from "@/lib/supabase/server";
import { throwIfMissingTable } from "@/lib/db-errors";
import { generateJSON, generateText } from "@/lib/ai/anthropic";
import { formatRagContextBlock } from "@/lib/ai/text-chunks";
import {
  voiceBriefingPrompt,
  voiceBriefingSystem,
  voiceUpdatePrompt,
  voiceUpdateSystem,
} from "@/lib/ai/prompts/voice-copilot";
import { transcribeAudio, OpenAiConfigError } from "@/lib/ai/openai";
import { buildNarratorContextBlock } from "./deliveryNarrator";
import { searchProjectMemory, type ProjectMemoryHit } from "./projectMemoryRag";
import {
  normalizeTranscript,
  sanitizeVoiceUpdateExtract,
  type VoiceUpdateExtract,
} from "./voiceUpdateEngine";

export type VoiceProjectLogRow = {
  id: string;
  organisation_id: string;
  project_id: string;
  created_by: string | null;
  kind: "question" | "update";
  transcript: string;
  summary: string | null;
  answer: string | null;
  rag_sources: ProjectMemoryHit[];
  metadata: Record<string, unknown>;
  created_at: string;
};

export type VoiceAskResult = {
  answer: string;
  projectName: string;
  ragSources: ProjectMemoryHit[];
  logId: string;
};

export type VoiceUpdateResult = {
  extract: VoiceUpdateExtract;
  projectName: string;
  logId: string;
};

async function getOrgContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organisation_id) throw new Error("No organisation");

  return {
    supabase,
    userId: user.id,
    orgId: profile.organisation_id as string,
  };
}

function mapLogRow(row: Record<string, unknown>): VoiceProjectLogRow {
  return {
    id: String(row.id),
    organisation_id: String(row.organisation_id),
    project_id: String(row.project_id),
    created_by: row.created_by ? String(row.created_by) : null,
    kind: row.kind as VoiceProjectLogRow["kind"],
    transcript: String(row.transcript),
    summary: row.summary ? String(row.summary) : null,
    answer: row.answer ? String(row.answer) : null,
    rag_sources: (row.rag_sources as ProjectMemoryHit[]) ?? [],
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    created_at: String(row.created_at),
  };
}

export async function transcribeProjectVoice(file: File): Promise<string> {
  const transcript = await transcribeAudio(file, file.name || "voice.webm");
  return normalizeTranscript(transcript);
}

export async function askProjectVoiceQuestion(
  projectId: string,
  question: string,
  options?: { persist?: boolean },
): Promise<VoiceAskResult> {
  const trimmed = normalizeTranscript(question);
  if (!trimmed) throw new Error("Question is required");

  const { supabase, userId, orgId } = await getOrgContext();

  const [{ projectName, contextBlock }, ragSources] = await Promise.all([
    buildNarratorContextBlock(projectId),
    searchProjectMemory(projectId, trimmed, 6).catch(() => [] as ProjectMemoryHit[]),
  ]);

  const ragBlock = formatRagContextBlock(
    ragSources.map((s) => ({
      sourceType: s.sourceType,
      title: s.title,
      content: s.content,
      similarity: s.similarity ?? undefined,
    })),
  );

  const answer = await generateText({
    system: voiceBriefingSystem,
    prompt: voiceBriefingPrompt({
      projectName,
      question: trimmed,
      contextBlock,
      ragBlock,
    }),
    maxTokens: 450,
  });

  const trimmedAnswer = answer.trim();

  if (options?.persist === false) {
    return {
      answer: trimmedAnswer,
      projectName,
      ragSources,
      logId: "",
    };
  }

  const { data, error } = await supabase
    .from("voice_project_logs")
    .insert({
      organisation_id: orgId,
      project_id: projectId,
      created_by: userId,
      kind: "question",
      transcript: trimmed,
      answer: trimmedAnswer,
      rag_sources: ragSources,
      metadata: { ragCount: ragSources.length },
    })
    .select("*")
    .single();

  if (error) {
    throwIfMissingTable(error, "voice_project_logs");
    throw error;
  }

  return {
    answer: trimmedAnswer,
    projectName,
    ragSources,
    logId: String(data.id),
  };
}

export async function submitVoiceProjectUpdate(
  projectId: string,
  transcript: string,
): Promise<VoiceUpdateResult> {
  const normalized = normalizeTranscript(transcript);
  if (!normalized) throw new Error("Update transcript is required");

  const { supabase, userId, orgId } = await getOrgContext();
  const { projectName } = await buildNarratorContextBlock(projectId);

  const raw = await generateJSON<VoiceUpdateExtract>({
    system: voiceUpdateSystem,
    prompt: voiceUpdatePrompt({ projectName, transcript: normalized }),
    maxTokens: 500,
  });

  const extract = sanitizeVoiceUpdateExtract(raw);

  const { data, error } = await supabase
    .from("voice_project_logs")
    .insert({
      organisation_id: orgId,
      project_id: projectId,
      created_by: userId,
      kind: "update",
      transcript: normalized,
      summary: extract.summary,
      metadata: extract,
    })
    .select("*")
    .single();

  if (error) {
    throwIfMissingTable(error, "voice_project_logs");
    throw error;
  }

  return {
    extract,
    projectName,
    logId: String(data.id),
  };
}

export async function listVoiceProjectLogs(
  projectId: string,
  limit = 12,
): Promise<VoiceProjectLogRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("voice_project_logs")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === "42P01") return [];
    throw error;
  }

  return (data ?? []).map((row) => mapLogRow(row as Record<string, unknown>));
}

export { OpenAiConfigError };
export type { VoiceUpdateExtract } from "./voiceUpdateEngine";
