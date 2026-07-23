export type ReadinessInputs = {
  confidence: number;
  hasBackground: boolean;
  modulesCompleted: number;
  artefactsReady: number;
};

/** Job readiness score 0–100 from assessment + module progress. */
export function calculateReadinessScore(input: ReadinessInputs): number {
  const confidence = Math.min(5, Math.max(1, input.confidence || 3));
  const base = 28 + confidence * 8;
  const modules = Math.min(40, input.modulesCompleted * 8);
  const artefacts = Math.min(20, input.artefactsReady * 5);
  const background = input.hasBackground ? 8 : 0;
  return Math.min(100, Math.round(base + modules + artefacts + background));
}

export const LAUNCHPAD_MODULES = [
  {
    key: "assessment" as const,
    title: "Career assessment",
    body: "Map strengths, gaps and target role fit.",
  },
  {
    key: "career_twin" as const,
    title: "Career Twin",
    body: "A living profile employers can understand quickly.",
  },
  {
    key: "cv_portfolio" as const,
    title: "CV & portfolio",
    body: "Package experience into interview-ready evidence.",
  },
  {
    key: "interview_prep" as const,
    title: "Interview prep",
    body: "STAR stories, mocks and communication coaching.",
  },
  {
    key: "readiness" as const,
    title: "Readiness score",
    body: "Track how close you are to interview-ready.",
  },
] as const;

export type LaunchpadModuleKey = (typeof LAUNCHPAD_MODULES)[number]["key"];
