import { describe, expect, it } from "vitest";
import { generateMediFlowExperience } from "@/lib/experience-sim/mediflow";
import {
  attachPendingHiringInterview,
  canFinishHiringInterview,
  candidateAnswerCount,
  deriveHiringPlacement,
  deterministicHiringQuestion,
  hiringContextSources,
  HIRING_PLACEMENT_HONESTY,
  isHiringInterviewFinished,
  isXpHiringInterviewEnabled,
  makeHiringTurn,
  nextHiringSpeakerRole,
  normaliseHiringClaims,
  prepareHiringInterviewState,
  selectHiringPanel,
  shouldAutoCompleteHiringInterview,
  shouldResumeHiringInterview,
  shouldShowHiringInterview,
} from "@/lib/xperience/hiring-interview";

describe("Experience hiring interview (slice 1)", () => {
  it("selects MediFlow CEO plus a sceptical stakeholder as the panel", () => {
    const state = generateMediFlowExperience({ userRole: "Associate Product Manager" });
    const panel = selectHiringPanel(state);
    expect(panel.manager.name).toBe("Sarah Chen");
    expect(panel.manager.role).toBe("CEO");
    expect(panel.stakeholder.id).not.toBe(panel.manager.id);
    expect(panel.stakeholder.name).toBe("James Wilson");
  });

  it("attaches a pending interview without assigning capability", () => {
    const generated = generateMediFlowExperience({});
    const state = attachPendingHiringInterview(generated);
    expect(state.hiringInterview?.status).toBe("pending");
    expect(shouldShowHiringInterview(state)).toBe(true);
    expect(isHiringInterviewFinished(state)).toBe(false);
    expect(state.hiringInterview?.placement).toBeNull();
    const { hiringInterview: _attached, ...rest } = state;
    expect(rest).toEqual(generated);
    expect(JSON.stringify(state.hiringInterview)).not.toMatch(
      /mayWriteCapability|scoreRun|deliverxVerified/i,
    );
  });

  it("does not re-attach over an existing interview", () => {
    const once = attachPendingHiringInterview(generateMediFlowExperience({}));
    const twice = attachPendingHiringInterview({
      ...once,
      hiringInterview: { ...once.hiringInterview!, status: "in_progress" },
    });
    expect(twice.hiringInterview?.status).toBe("in_progress");
  });

  it("derives placement from company, role and project — never a score", () => {
    const state = generateMediFlowExperience({ userRole: "Associate Product Manager" });
    const placement = deriveHiringPlacement(state);
    expect(placement.companyName).toBe("MediFlow");
    expect(placement.roleTitle).toBe("Associate Product Manager");
    expect(placement.projectName).toContain("TrustCare");
    expect(placement.firstWeekFocus.length).toBeGreaterThan(0);
    expect(placement.honesty).toBe(HIRING_PLACEMENT_HONESTY);
    expect(placement).not.toHaveProperty("score");
    expect(placement).not.toHaveProperty("capability");
    expect(placement).not.toHaveProperty("verified");
    expect(placement.honesty).toMatch(/not a capability score/i);
    expect(placement.honesty).toMatch(/not a real hiring decision/i);
  });

  it("alternates manager and stakeholder questions", () => {
    const state = attachPendingHiringInterview(generateMediFlowExperience({}));
    const interview = state.hiringInterview!;
    expect(nextHiringSpeakerRole(interview)).toBe("manager");
    const withManager = {
      ...interview,
      turns: [
        makeHiringTurn({
          role: "manager",
          speakerId: interview.panel.manager.id,
          speakerName: interview.panel.manager.name,
          text: "Opening question",
        }),
      ],
    };
    expect(nextHiringSpeakerRole(withManager)).toBe("stakeholder");
  });

  it("requires two answers to finish and auto-completes at four", () => {
    const state = attachPendingHiringInterview(generateMediFlowExperience({}));
    let interview = state.hiringInterview!;
    expect(canFinishHiringInterview(interview)).toBe(false);
    interview = {
      ...interview,
      turns: [
        makeHiringTurn({
          role: "candidate",
          speakerId: "candidate",
          speakerName: "You",
          text: "First answer with enough detail.",
        }),
        makeHiringTurn({
          role: "candidate",
          speakerId: "candidate",
          speakerName: "You",
          text: "Second answer with enough detail.",
        }),
      ],
    };
    expect(candidateAnswerCount(interview)).toBe(2);
    expect(canFinishHiringInterview(interview)).toBe(true);
    expect(shouldAutoCompleteHiringInterview(interview)).toBe(false);
    interview = {
      ...interview,
      turns: [
        ...interview.turns,
        makeHiringTurn({
          role: "candidate",
          speakerId: "candidate",
          speakerName: "You",
          text: "Third.",
        }),
        makeHiringTurn({
          role: "candidate",
          speakerId: "candidate",
          speakerName: "You",
          text: "Fourth.",
        }),
      ],
    };
    expect(shouldAutoCompleteHiringInterview(interview)).toBe(true);
  });

  it("deterministic questions cite company, project and speaker", () => {
    const state = attachPendingHiringInterview(generateMediFlowExperience({}));
    const speaker = state.hiringInterview!.panel.manager;
    const q = deterministicHiringQuestion(state, speaker, "manager", {
      background: "Career switcher from delivery",
      selectedSkill: "Prioritisation",
    });
    expect(q.text).toContain("MediFlow");
    expect(q.text).toMatch(/self-reported/i);
    expect(q.citations.map((c) => c.sourceId)).toEqual(
      expect.arrayContaining([state.company.id, state.project.id, speaker.id]),
    );
  });

  it("exposes citable source ids for T4 citation enforcement", () => {
    const state = attachPendingHiringInterview(generateMediFlowExperience({}));
    const ctx = hiringContextSources(state, { background: "Nursing background" });
    expect(ctx.boundRef.projectId).toBe(state.project.id);
    expect(ctx.extraSources.map((s) => s.ref)).toEqual(
      expect.arrayContaining([
        state.company.id,
        state.project.id,
        state.hiringInterview!.panel.manager.id,
        "claim:background",
      ]),
    );
  });

  it("discards non-string claim fields instead of throwing", () => {
    expect(
      normaliseHiringClaims({
        background: 12,
        targetRole: "APM",
        selectedSkill: null,
        workStyle: { nested: true },
      }),
    ).toEqual({
      background: undefined,
      targetRole: "APM",
      selectedSkill: undefined,
      workStyle: undefined,
    });
  });

  it("kill-switch defaults on and rolls back for off/0/false/disabled", () => {
    expect(isXpHiringInterviewEnabled({})).toBe(true);
    expect(isXpHiringInterviewEnabled({ DELIVERX_XP_HIRING_INTERVIEW: "on" })).toBe(true);
    for (const value of ["off", "0", "false", "disabled"]) {
      expect(isXpHiringInterviewEnabled({ DELIVERX_XP_HIRING_INTERVIEW: value })).toBe(false);
    }
  });

  it("legacy enrolments without hiringInterview are not trapped", () => {
    const state = generateMediFlowExperience({});
    expect(state.hiringInterview).toBeUndefined();
    expect(shouldShowHiringInterview(state)).toBe(false);
    expect(shouldResumeHiringInterview(state)).toBe(false);
  });

  it("attaches a pending interview only when the kill-switch is on", () => {
    const generated = generateMediFlowExperience({});
    expect(prepareHiringInterviewState(generated, {}).hiringInterview?.status).toBe("pending");
    expect(
      prepareHiringInterviewState(generated, { DELIVERX_XP_HIRING_INTERVIEW: "off" }).hiringInterview,
    ).toBeUndefined();
  });

  it("does not resume the interview after Day-1 work has started", () => {
    const pending = attachPendingHiringInterview(generateMediFlowExperience({}));
    expect(shouldResumeHiringInterview(pending)).toBe(true);
    expect(
      shouldResumeHiringInterview({
        ...pending,
        completion: { ...pending.completion, decisionMade: true },
      }),
    ).toBe(false);
    expect(
      shouldResumeHiringInterview({
        ...pending,
        lifecycle: "completed",
      }),
    ).toBe(false);
  });
});
