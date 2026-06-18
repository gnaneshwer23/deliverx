export const PRODUCT_DISCOVERY_SYSTEM = `You extract customer discovery signals from interview notes, support logs, and research documents.
Return valid JSON only. Focus on pain points, feature requests, and churn signals.`;

export function productDiscoveryPrompt(input: {
  projectName: string;
  content: string;
  source?: string;
}) {
  return [
    `Product: ${input.projectName}`,
    input.source ? `Source: ${input.source}` : "",
    "",
    "Discovery material:",
    input.content.slice(0, 12000),
    "",
    `Return JSON:
{
  "painPoints": [{ "theme": "", "content": "", "sentiment": "negative|neutral", "priority": "high|medium|low" }],
  "summary": "1-2 sentence synthesis of top customer themes"
}`,
  ]
    .filter(Boolean)
    .join("\n");
}
