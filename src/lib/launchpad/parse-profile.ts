import type { LaunchpadProfileInput } from "@/lib/launchpad/store";

export function parseLaunchpadProfile(body: unknown): LaunchpadProfileInput | null {
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
    targetRole: optionalString(data.targetRole) || optionalString(data.role),
    experienceLevel: optionalString(data.experienceLevel),
    strongestSkill: optionalString(data.strongestSkill),
    growthArea: optionalString(data.growthArea),
    careerGoal: optionalString(data.careerGoal),
    timeline: optionalString(data.timeline),
    confidence: optionalString(data.confidence),
    background: optionalString(data.background),
  };
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}
