import Link from "next/link";
import { SignupForm } from "./signup-form";
import { DxCaps } from "@/components/dx/dx-logo";
import { dxClass } from "@/lib/dx-theme";

type Search = Promise<{ invite?: string }>;

export default async function SignupPage({ searchParams }: { searchParams: Search }) {
  const { invite } = await searchParams;

  return (
    <div className="w-full max-w-[388px]">
      <h1 className={`${dxClass.display} text-[1.625rem] text-[#0D0D0B]`}>Create your workspace</h1>
      <p className="mb-7 mt-1 text-[15px] font-light text-[#6B6B64]">
        30-day free trial. No credit card needed.
      </p>

      {invite ? (
        <div className="mb-4 border border-[#C6DDD0] bg-[#EEF5F1] px-3 py-2 text-xs text-[#1C4A2E]">
          You&apos;ve been invited to join a DeliverX workspace.
        </div>
      ) : null}

      <SignupForm invite={invite} />

      <p className="mt-5 text-center text-sm text-[#6B6B64]">
        Already have an account?{" "}
        <Link
          href={invite ? `/login?next=${encodeURIComponent(`/invite/${invite}`)}` : "/login"}
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
