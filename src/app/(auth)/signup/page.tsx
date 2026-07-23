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
  const productRaw = productParam?.toLowerCase();
  const product =
    productRaw === "xperience" ||
    productRaw === "launchpad" ||
    productRaw === "team-copilot" ||
    productRaw === "team_copilot"
      ? productRaw === "team_copilot"
        ? "team-copilot"
        : productRaw
      : null;
  const isXperience = product === "xperience";
  const isLaunchpad = product === "launchpad";
  const isTeamCopilot = product === "team-copilot";

  return (
    <div className="w-full max-w-[388px]">
      <h1 className={`${dxClass.display} text-[1.625rem] text-[#0D0D0B]`}>
        {isLaunchpad
          ? "Create your Launchpad account"
          : isXperience
            ? "Create your Xperience account"
            : isTeamCopilot
              ? "Create your Team Co-pilot account"
              : "Create your workspace"}
      </h1>
      <p className="mb-7 mt-1 text-[15px] font-light text-[#6B6B64]">
        {isLaunchpad
          ? "Explore open roles or start free. We’ll issue login credentials after signup."
          : isXperience
            ? "Pay once for access. We’ll issue login credentials after signup."
            : isTeamCopilot
              ? "30-day free trial for Team Co-pilot. No credit card needed."
              : "30-day free trial. No credit card needed."}
      </p>

      {invite || join ? (
        <div className="mb-4 border border-[#C6DDD0] bg-[#EEF5F1] px-3 py-2 text-xs text-[#1C4A2E]">
          You&apos;ve been invited to join a DeliverX project workspace.
        </div>
      ) : null}

      {isLaunchpad && !invite && !join ? (
        <div className="mb-4 border border-[#C6DDD0] bg-[#EEF5F1] px-3 py-2 text-xs text-[#1C4A2E]">
          Starting <span className="font-semibold">Launchpad</span> — join an AI-powered company
          and build your Career Record (separate from Team Co-pilot pricing).
        </div>
      ) : null}

      {isXperience && !invite && !join ? (
        <div className="mb-4 border border-[#C6DDD0] bg-[#EEF5F1] px-3 py-2 text-xs text-[#1C4A2E]">
          Starting <span className="font-semibold">Xperience</span> — £49 one-time professional
          experience access (separate from Team Co-pilot pricing).
        </div>
      ) : null}

      {isTeamCopilot && !invite && !join ? (
        <div className="mb-4 border border-[#C6DDD0] bg-[#EEF5F1] px-3 py-2 text-xs text-[#1C4A2E]">
          Starting <span className="font-semibold">Team Co-pilot</span> — delivery intelligence
          for your real team (a DeliverX product).
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
