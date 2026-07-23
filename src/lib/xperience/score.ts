export type CareerScoreInput = {
  decisions: number;
  evidenceItems: number;
  stakeholderScore: number;
};

export function calculateCareerScore(input: CareerScoreInput) {
  const decisionPoints = Math.min(input.decisions * 8, 40);
  const evidencePoints = Math.min(input.evidenceItems * 10, 40);
  const stakeholderPoints = Math.min(Math.max(input.stakeholderScore, 0), 20);
  return Math.min(decisionPoints + evidencePoints + stakeholderPoints, 100);
}

export type ScenarioChoice = {
  id: string;
  label: string;
  impact: {
    trust: number;
    delivery: number;
    clarity: number;
  };
};

export function applyScenarioDecision(decision: {
  choice: ScenarioChoice;
  rationale?: string;
}) {
  const { trust, delivery, clarity } = decision.choice.impact;
  const evidenceScore = Math.max(0, Math.min(100, 50 + trust + delivery + clarity));

  return {
    evidenceScore,
    summary: `${decision.choice.label} changed trust by ${trust}, delivery by ${delivery}, and clarity by ${clarity}.`,
    capturedEvidence: {
      type: "decision" as const,
      rationale: decision.rationale || "No rationale provided.",
      choiceId: decision.choice.id,
    },
  };
}
