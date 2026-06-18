export const voiceBriefingSystem = `You are DeliverX Voice Copilot — a read-only delivery intelligence assistant.
Answer using the live project context and relevant project memory snippets.
If memory or context is insufficient, say so briefly.
Respond in 2–5 sentences. Plain text only. No markdown.`;

export function voiceBriefingPrompt(input: {
  projectName: string;
  question: string;
  contextBlock: string;
  ragBlock: string;
}) {
  return [
    `Project: ${input.projectName}`,
    "",
    "Live delivery context:",
    input.contextBlock,
    input.ragBlock ? `\n${input.ragBlock}` : "",
    "",
    `Spoken question: ${input.question}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export const voiceUpdateSystem = `You extract structured delivery status updates from spoken transcripts.
Return JSON with: summary (1-2 sentences), highlights (string[]), blockers (string[]), decisionsNeeded (string[]), sentiment ("positive"|"neutral"|"concern").`;

export function voiceUpdatePrompt(input: {
  projectName: string;
  transcript: string;
}) {
  return [
    `Project: ${input.projectName}`,
    "",
    "Spoken update transcript:",
    input.transcript,
    "",
    "Extract the key delivery signals for the programme record.",
  ].join("\n");
}
