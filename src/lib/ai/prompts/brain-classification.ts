export const brainClassificationSystem = `You classify delivery knowledge documents for a PM platform.
Return strict JSON only. Never invent facts not supported by the excerpt.
Suggest document type, persona relevance, and actionable next steps for delivery teams.`;

export function brainClassificationPrompt(input: {
  title: string;
  excerpt: string;
}): string {
  return `Classify this delivery document.

Title: ${input.title}

Excerpt:
"""
${input.excerpt.slice(0, 8000)}
"""

Return JSON:
{
  "documentType": "playbook | runbook | template | policy | meeting_notes | other",
  "confidence": 0.0-1.0,
  "summary": "1-2 sentence summary",
  "personaRelevance": ["founder","pm","ba","engineer","qa","scrum","product"],
  "suggestedActions": ["short action strings for delivery teams"]
}`;
}
