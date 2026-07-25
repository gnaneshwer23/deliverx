import { describe, expect, it } from "vitest";
import { detectCalibrationFindings } from "@/lib/real-world-outcomes/calibration";
import {
  reprioritiseRoadmapFromOutcomes,
  scoreRunPromptForOutcome,
} from "@/lib/real-world-outcomes/recommendations";
import type { OutcomeEventRecord } from "@/lib/real-world-outcomes/types";
import type { RoadmapAction } from "@/lib/career-intelligence/types";

let seq = 0;
function ev(overrides: Partial<OutcomeEventRecord>): OutcomeEventRecord {
  seq += 1;
  return {
    id: `o${seq}`,
    userId: "u1",
    applicationId: null,
    eventType: "interview_attended",
    occurredOn: "2026-07-01",
    title: "Event",
    detail: "",
    company: null,
    roleTitle: null,
    seniority: null,
    stageReached: null,
    sentiment: "neutral",
    artefactRef: null,
    hasArtefact: false,
    evidenceId: `ev-${seq}`,
    evidenceStrength: "self_reported",
    selfReported: true,
    externallyVerified: false,
    capabilityAssigned: false,
    confidentiality: "private",
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

describe("calibration is honest & diagnostic (never capability)", () => {
  it("suppresses conversion claims below the volume floor and reports sample size", () => {
    const findings = detectCalibrationFindings([ev({ eventType: "interview_attended" })]);
    expect(findings).toHaveLength(1);
    expect(findings[0].findingType).toBe("insufficient_data");
    expect(findings[0].metrics.volumeFloor).toBe(3);
    expect(findings[0].capabilityAssigned).toBe(false);
    expect(findings[0].diagnosticOnly).toBe(true);
  });

  it("detects N interviews, 0 offers as a diagnostic (not a capability change)", () => {
    const events = [
      ev({ eventType: "interview_attended" }),
      ev({ eventType: "interview_attended" }),
      ev({ eventType: "interview_attended" }),
    ];
    const findings = detectCalibrationFindings(events, {
      gaps: ["comp.communication: emerging — clarity in exec settings"],
    });
    const conv = findings.find((f) => f.findingType === "interview_conversion_low");
    expect(conv).toBeDefined();
    expect(conv?.severity).toBe("action");
    expect(conv?.metrics.interviews).toBe(3);
    expect(conv?.metrics.offers).toBe(0);
    // Evidence-linked (cites the underlying outcome evidence).
    expect(conv?.evidenceIds.length).toBeGreaterThan(0);
    // Diagnostic — never a capability assignment.
    expect(conv?.capabilityAssigned).toBe(false);
    expect(conv?.diagnosticOnly).toBe(true);
    // Links the implicated communication gap.
    expect(conv?.implicatedGaps.join(" ")).toMatch(/communication/i);
  });

  it("rejections never lower capability — findings only carry diagnostic guidance", () => {
    const events = [
      ev({ eventType: "rejection", roleTitle: "PM" }),
      ev({ eventType: "rejection", roleTitle: "PM" }),
      ev({ eventType: "rejection", roleTitle: "PM" }),
    ];
    const findings = detectCalibrationFindings(events, { targetSeniority: "Senior PM" });
    expect(findings.length).toBeGreaterThan(0);
    for (const f of findings) {
      expect(f.capabilityAssigned).toBe(false);
      expect(f.diagnosticOnly).toBe(true);
    }
    const seniority = findings.find((f) => f.findingType === "seniority_unsupported");
    expect(seniority?.detail).toMatch(/never from rejections/i);
  });

  it("reports healthy conversion honestly with sample size", () => {
    const events = [
      ev({ eventType: "interview_attended" }),
      ev({ eventType: "interview_attended" }),
      ev({ eventType: "interview_attended" }),
      ev({ eventType: "offer_received" }),
    ];
    const findings = detectCalibrationFindings(events);
    const healthy = findings.find((f) => f.findingType === "conversion_healthy");
    expect(healthy).toBeDefined();
    expect(healthy?.metrics.offers).toBe(1);
  });

  it("flags role targeting mismatch across many distinct rejected roles", () => {
    const events = [
      ev({ eventType: "rejection", roleTitle: "Product Manager" }),
      ev({ eventType: "rejection", roleTitle: "Data Analyst" }),
      ev({ eventType: "rejection", roleTitle: "Program Manager" }),
    ];
    const findings = detectCalibrationFindings(events);
    const mismatch = findings.find((f) => f.findingType === "role_targeting_mismatch");
    expect(mismatch).toBeDefined();
    expect(mismatch?.metrics.distinctRejectedRoles).toBe(3);
  });
});

describe("outcome-driven roadmap reprioritisation (never capability)", () => {
  const roadmap: RoadmapAction[] = [
    {
      id: "r1",
      kind: "experience_project",
      title: "Delivery under constraint",
      closesRequirementIds: ["comp.delivery_execution"],
      rationale: "Close delivery gap.",
    },
    {
      id: "r2",
      kind: "interview_prep",
      title: "Communication practice",
      closesRequirementIds: ["comp.communication"],
      rationale: "Improve exec communication.",
    },
  ];

  it("moves actions implicated by findings to the front and annotates why", () => {
    const reordered = reprioritiseRoadmapFromOutcomes(roadmap, [
      {
        findingType: "communication_gap",
        severity: "action",
        title: "Communication may be limiting outcomes",
        detail: "",
        evidenceIds: [],
        implicatedGaps: ["comp.communication: emerging"],
        metrics: {},
        diagnosticOnly: true,
        capabilityAssigned: false,
      },
    ]);
    expect(reordered[0].id).toBe("r2");
    expect(reordered[0].rationale).toMatch(/real-world outcomes/i);
  });

  it("returns the roadmap unchanged when no gaps are implicated", () => {
    const same = reprioritiseRoadmapFromOutcomes(roadmap, []);
    expect(same.map((a) => a.id)).toEqual(["r1", "r2"]);
  });
});

describe("outcomes prompt (never silently) a ScoreRun refresh", () => {
  it("prompts for material outcomes but never auto-runs", () => {
    const prompt = scoreRunPromptForOutcome({ eventType: "rejection" });
    expect(prompt.prompt).toBe(true);
    expect(prompt.scoreRunTriggered).toBe(false);
    expect(prompt.reason).toMatch(/will not run automatically/i);
  });

  it("does not prompt for a plain application submission", () => {
    const prompt = scoreRunPromptForOutcome({ eventType: "application_submitted" });
    expect(prompt.prompt).toBe(false);
    expect(prompt.scoreRunTriggered).toBe(false);
  });
});
