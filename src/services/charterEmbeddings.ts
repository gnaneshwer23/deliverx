/**
 * Chunk charter content and sync pgvector embeddings (OpenAI text-embedding-3-small).
 */

import { embedTexts, cosineSimilarity, OpenAiConfigError } from "@/lib/ai/openai";
import { createClient } from "@/lib/supabase/server";
import type { CharterRow } from "@/services/charter";

const MAX_CHUNK = 900;

export function chunkCharterText(content: string): string[] {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let buffer = "";

  for (const para of paragraphs) {
    if ((buffer + "\n\n" + para).length <= MAX_CHUNK) {
      buffer = buffer ? `${buffer}\n\n${para}` : para;
    } else {
      if (buffer) chunks.push(buffer);
      if (para.length <= MAX_CHUNK) {
        buffer = para;
      } else {
        for (let i = 0; i < para.length; i += MAX_CHUNK) {
          chunks.push(para.slice(i, i + MAX_CHUNK));
        }
        buffer = "";
      }
    }
  }

  if (buffer) chunks.push(buffer);
  return chunks.length > 0 ? chunks : [content.slice(0, MAX_CHUNK)];
}

export async function syncCharterEmbeddings(
  charter: CharterRow,
): Promise<{ chunks: number; skipped?: boolean }> {
  const chunks = chunkCharterText(charter.content);
  if (chunks.length === 0) return { chunks: 0 };

  let vectors: number[][];
  try {
    vectors = await embedTexts(chunks);
  } catch (err) {
    if (err instanceof OpenAiConfigError) {
      return { chunks: 0, skipped: true };
    }
    throw err;
  }

  const supabase = await createClient();

  const { error: delErr } = await supabase
    .from("charter_chunks")
    .delete()
    .eq("charter_id", charter.id);
  if (delErr) throw delErr;

  const rows = chunks.map((content, chunk_index) => ({
    organisation_id: charter.organisation_id,
    charter_id: charter.id,
    chunk_index,
    content,
    embedding: vectors[chunk_index],
  }));

  const { error: insErr } = await supabase.from("charter_chunks").insert(rows);
  if (insErr) throw insErr;

  return { chunks: rows.length };
}

export async function semanticCharterBoost(
  charterId: string,
  deliveryText: string,
): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("charter_chunks")
    .select("content, embedding")
    .eq("charter_id", charterId)
    .not("embedding", "is", null)
    .limit(24);

  if (error || !data?.length) return 0;

  let queryVector: number[];
  try {
    [queryVector] = await embedTexts([deliveryText.slice(0, 6000)]);
  } catch (err) {
    if (err instanceof OpenAiConfigError) return 0;
    throw err;
  }

  let total = 0;
  let count = 0;
  for (const row of data) {
    const embedding = row.embedding as number[] | null;
    if (!embedding?.length) continue;
    total += cosineSimilarity(queryVector, embedding);
    count++;
  }

  if (count === 0) return 0;
  const avg = total / count;
  return Math.round(Math.max(0, Math.min(12, (avg - 0.65) * 40)));
}
