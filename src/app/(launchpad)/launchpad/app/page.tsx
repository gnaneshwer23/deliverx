import { LaunchpadApp } from "@/components/launchpad/product-app";
import { requireLaunchpadAuth } from "@/lib/launchpad/require-auth";

export default async function LaunchpadAppPage() {
  const { user, profile, progress, artefacts } = await requireLaunchpadAuth();
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const fullName = typeof meta?.name === "string" ? meta.name : "";
  const [givenName = "", ...familyParts] = fullName.split(" ");

  return (
    <LaunchpadApp
      initialUser={{
        firstName: givenName,
        lastName: familyParts.join(" "),
        email: user.email ?? undefined,
      }}
      initialProfile={
        profile
          ? {
              firstName: profile.first_name,
              lastName: profile.last_name,
              email: profile.email,
              targetRole: profile.target_role,
              experienceLevel: profile.experience_level,
              strongestSkill: profile.strongest_skill,
              growthArea: profile.growth_area,
              careerGoal: profile.career_goal,
              timeline: profile.timeline,
              confidence: profile.confidence,
              background: profile.background,
              readinessScore: profile.readiness_score,
              twinData: profile.twin_data,
              onboardingStatus: profile.onboarding_status,
            }
          : null
      }
      initialProgress={progress}
      initialArtefacts={artefacts}
      initialScreen={profile?.onboarding_status === "completed" ? "Dashboard" : "Profile"}
    />
  );
}
