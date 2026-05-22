export const enrichRecommendationsSystem = `You enrich delivery recommendations with clearer rationale.
Return valid JSON only: { "items": [{ "id": string, "rationale": string }] }
Keep each rationale to 1-2 sentences. Do not change recommendation text.`;

export function enrichRecommendationsPrompt(input: {
  projectName: string;
  items: Array<{ id: string; text: string; rationale: string }>;
}) {
  return [
    `Project: ${input.projectName}`,
    "",
    "Enrich the rationale for each recommendation based on delivery context.",
    "",
    JSON.stringify(input.items, null, 2),
  ].join("\n");
}
