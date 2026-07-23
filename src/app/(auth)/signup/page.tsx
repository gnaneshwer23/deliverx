import Link from "next/link";
import { SignupForm } from "./signup-form";
import { DxCaps } from "@/components/dx/dx-logo";
import { ROLE_PILL_LABELS } from "@/lib/marketing/landing-data";
import {
  appendRoleToPath,
  dbRoleToMarketingRole,
  parseSignupRoleParam,
} from "@/lib/marketing/role-signup";
import { dxClass } from "@/lib/dx-theme";

type Search = Promise<{ invite?: string; join?: string; role?: string; product?: string }>;

export default async function SignupPage({ searchParams }: { searchParams: Search }) {
  const { invite, join, role: roleParam, product: productParam } = await searchParams;
  const preselectedRole = parseSignupRoleParam(roleParam);
  const marketingRole = preselectedRole ? dbRoleToMarketingRole(preselectedRole) : null;
  const preselectedLabel = marketingRole ? ROLE_PILL_LABELS[marketingRole] : null;
  const product = productParam?.toLowerCase() === "xperience" ? "xperience" : null;
  const isXperience = product === "xperience";

  return (
    <div className="w-full max-w-[388px]">
      <h1 className={`${dxClass.display} text-[1.625rem] text-[#0D0D0B]`}>
        {isXperience ? "Create your Xperience account" : "Create your workspace"}
      </h1>
      <p className="mb-7 mt-1 text-[15px] font-light text-[#6B6B64]">
        {isXperience
          ? "Pay once for access. We’ll issue login credentials after signup."
          : "30-day free trial. No credit card needed."}
      </p>

      {invite || join ? (
        <div className="mb-4 border border-[#C6DDD0] bg-[#EEF5F1] px-3 py-2 text-xs text-[#1C4A2E]">
          You&apos;ve been invited to join a DeliverX project workspace.
        </div>
      ) : null}

      {isXperience && !invite && !join ? (
        <div className="mb-4 border border-[#C6DDD0] bg-[#EEF5F1] px-3 py-2 text-xs text-[#1C4A2E]">
          Starting <span className="font-semibold">Xperience</span> — £49 one-time professional
          simulation access (separate from DeliverX workspace pricing).
        </div>
      ) : null}

      {preselectedLabel && !invite && !join ? (
        <div className="mb-4 border border-[#C6DDD0] bg-[#EEF5F1] px-3 py-2 text-xs text-[#1C4A2E]">
          Starting as <span className="font-semibold">{preselectedLabel}</span> — we&apos;ll
          pre-select your role after signup.
        </div>
      ) : null}

      <SignupForm invite={invite} joinToken={join} preselectedRole={preselectedRole} />

      <p className="mt-5 text-center text-sm text-[#6B6B64]">
        Already have an account?{" "}
        <Link
          href={
            join
              ? `/login?next=${encodeURIComponent(`/join?token=${encodeURIComponent(join)}`)}`
              : invite
                ? `/login?next=${encodeURIComponent(`/invite/${invite}`)}`
                : preselectedRole
                  ? `/login?next=${encodeURIComponent(appendRoleToPath("/onboarding/organisation", preselectedRole))}`
                  : "/login"
          }
          className="font-medium text-[#1C4A2E] hover:underline"
        >
          Sign in
        </Link>
      </p>
      <DxCaps className="mt-8 block text-center text-[7px] text-[#A8A89E]">
        By signing up you agree to our Terms and Privacy Policy
      </DxCaps>
    </div>
  );
}
