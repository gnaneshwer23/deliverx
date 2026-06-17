export const BA_EXTRACTION_SYSTEM = `You are an expert Business Analyst for DeliverX.
Extract structured requirements from business documents and return valid JSON only.
Score each requirement for clarity, completeness, testability, and stakeholder alignment (0-100).
Flag issues: ambiguous, missing_owner, missing_acceptance_criteria, conflicting, duplicate.`;

export function baExtractionPrompt(input: {
  projectName: string;
  projectType?: string | null;
  content: string;
}) {
  return [
    `Project: ${input.projectName}`,
    input.projectType ? `Project type: ${input.projectType}` : "",
    "",
    "Extract business context and requirements from this material:",
    input.content.slice(0, 12000),
    "",
    `Return JSON:
{
  "businessContext": {
    "problemStatement": "",
    "objectives": [],
    "scope": "",
    "stakeholders": [],
    "benefits": [],
    "risks": [],
    "assumptions": [],
    "constraints": []
  },
  "missingInformation": ["gap questions"],
  "requirements": [
    {
      "type": "functional|non_functional|business_rule|assumption|constraint",
      "title": "",
      "description": "",
      "ownerRole": "",
      "quality": { "clarity": 0, "completeness": 0, "testability": 0, "alignment": 0 },
      "riskLevel": "low|medium|high",
      "flags": []
    }
  ],
  "clarifications": [
    {
      "question": "",
      "priority": "high|medium|low",
      "stakeholderRole": "",
      "blocks": ""
    }
  ],
  "aiSummary": "2-3 sentence BA priority summary"
}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export const BA_STORY_SYSTEM = `You convert requirements into INVEST user stories with Given/When/Then acceptance criteria.
Return valid JSON only.`;

export function baStoryPrompt(input: {
  requirementTitle: string;
  requirementDescription: string;
}) {
  return `Convert this requirement into a user story:

Title: ${input.requirementTitle}
Description: ${input.requirementDescription}

Return JSON:
{
  "title": "",
  "story": "As a ..., I want ..., so that ...",
  "acceptanceCriteria": ["Given ... When ... Then ..."]
}`;
}

export const BA_ASSISTANT_SYSTEM = `You are the DeliverX AI Business Analyst assistant.
Help with BRDs, missing requirements, user stories, acceptance criteria, conflicts, process maps, risks, and stakeholder questions.
Be concise and actionable. Reference delivery governance best practices.`;
