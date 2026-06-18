/**
 * Text chunking for RAG pipelines.
 */

const DEFAULT_MAX = 900;

export function splitTextIntoChunks(text: string, maxChunk = DEFAULT_MAX): string[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let buffer = "";

  for (const para of paragraphs) {
    if ((buffer + "\n\n" + para).length <= maxChunk) {
      buffer = buffer ? `${buffer}\n\n${para}` : para;
    } else {
      if (buffer) chunks.push(buffer);
      if (para.length <= maxChunk) {
        buffer = para;
      } else {
        for (let i = 0; i < para.length; i += maxChunk) {
          chunks.push(para.slice(i, i + maxChunk));
        }
        buffer = "";
      }
    }
  }

  if (buffer) chunks.push(buffer);
  return chunks.length > 0 ? chunks : [text.slice(0, maxChunk)];
}

export function formatRagContextBlock(
  snippets: Array<{ sourceType: string; title: string | null; content: string; similarity?: number }>,
): string {
  if (snippets.length === 0) return "";

  const lines = snippets.map((s, i) => {
    const label = s.title ? `${s.sourceType}: ${s.title}` : s.sourceType;
    const score =
      s.similarity != null ? ` (relevance ${Math.round(s.similarity * 100)}%)` : "";
    return `[${i + 1}] ${label}${score}\n${s.content.slice(0, 1200)}`;
  });

  return `Relevant project memory:\n${lines.join("\n\n")}`;
}
