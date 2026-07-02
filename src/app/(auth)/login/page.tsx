import Link from "next/link";
import { LoginForm } from "./login-form";
import { DxCaps } from "@/components/dx/dx-logo";
import { dxClass } from "@/lib/dx-theme";

type Search = Promise<{ next?: string; reset?: string; error?: string; checkEmail?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { next, reset, error, checkEmail } = await searchParams;

  return (
    <div className="w-full max-w-[388px]">
      <h1 className={`${dxClass.display} text-[1.625rem] text-[#0D0D0B]`}>Welcome back</h1>
      <p className="mb-7 mt-1 text-[15px] font-light text-[#6B6B64]">
        Sign in to your DeliverX workspace.
      </p>

      {reset ? (
        <div className="mb-4 border border-[#C6DDD0] bg-[#EEF5F1] px-3 py-2 text-sm text-[#1C4A2E]">
          Password updated. Sign in with your new password.
        </div>
      ) : null}

      {checkEmail ? (
        <div className="mb-4 border border-[#C6DDD0] bg-[#EEF5F1] px-3 py-2 text-sm text-[#1C4A2E]">
          Check your email for a confirmation link. After confirming, sign in below to continue
          your personalised onboarding.
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 border border-[#C0392B]/30 bg-[#FDF1F0] px-3 py-2 text-sm text-[#C0392B]">
          {error}
        </div>
      ) : null}

      <LoginForm next={next} />

      <p className="mt-5 text-center text-sm text-[#6B6B64]">
        No account?{" "}
        <Link href="/signup" className="font-medium text-[#1C4A2E] hover:underline">
          Create one
        </Link>
      </p>
      <DxCaps className="mt-8 block text-center text-[7px] text-[#A8A89E]">
        30-day free trial · No credit card
      </DxCaps>
    </div>
  );
}
