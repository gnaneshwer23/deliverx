import type { CandidateProfileInput } from "@/lib/xperience/store";

export function parseCandidateProfile(body: unknown): CandidateProfileInput | null {
  if (!body || typeof body !== "object") return null;
  const data = body as Record<string, unknown>;

  const firstName = String(data.firstName ?? "").trim() || "Candidate";
  const lastName = String(data.lastName ?? "").trim();
  const email = String(data.email ?? "").trim().toLowerCase();
  if (!email.includes("@")) return null;

  return {
    firstName,
    lastName,
    email,
    role: optionalString(data.role),
    targetRole: optionalString(data.targetRole),
    industry: optionalString(data.industry),
    companyType: optionalString(data.companyType),
    background: optionalString(data.background),
    workStyle: optionalString(data.workStyle),
    learningStyle: optionalString(data.learningStyle),
    selectedSkill: optionalString(data.selectedSkill),
    confidence: optionalString(data.confidence),
    startTimeline: optionalString(data.startTimeline),
    planId: optionalString(data.planId),
    planEmphasis: parseEmphasis(data.planEmphasis),
  };
}

function parseEmphasis(
  value: unknown,
): "stakeholder" | "delivery" | "discovery" | "balanced" | undefined {
  if (typeof value !== "string") return undefined;
  const v = value.trim().toLowerCase();
  if (
    v === "stakeholder" ||
    v === "delivery" ||
    v === "discovery" ||
    v === "balanced"
  ) {
    return v;
  }
  return undefined;
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}
