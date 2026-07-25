import { Suspense } from "react";
import { ProductApp } from "@/components/xperience/product-app";
import { requireXperienceAuth } from "@/lib/xperience/require-auth";

export default async function XperienceAppPage() {
  const { user, profile, enrolment } = await requireXperienceAuth();
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const fullName = typeof meta?.name === "string" ? meta.name : "";
  const [givenName = "", ...familyParts] = fullName.split(" ");

  return (
    <Suspense fallback={<p className="p-8 text-sm text-[#6B6B64]">Loading Experience…</p>}>
      <ProductApp
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
                industry: profile.industry,
                companyType: profile.company_type,
                background: profile.background,
                workStyle: profile.work_style,
                learningStyle: profile.learning_style,
                selectedSkill: profile.selected_skill,
                confidence: profile.confidence,
                startTimeline: profile.start_timeline,
              }
            : null
        }
        initialEnrolmentId={enrolment?.id ?? null}
        initialScreen={enrolment ? "Dashboard" : "Profile"}
      />
    </Suspense>
  );
}
