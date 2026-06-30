import Link from "next/link";
import { redirect } from "next/navigation";
import { SignupForm } from "./signup-form";
import { DxCaps } from "@/components/dx/dx-logo";
import { dxClass } from "@/lib/dx-theme";
import { createClient } from "@/lib/supabase/server";
import { resolveAuthenticatedPath } from "@/lib/auth/redirect";

type Search = Promise<{ invite?: string; join?: string }>;

export default async function SignupPage({ searchParams }: { searchParams: Search }) {
  const { invite, join } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect(
      await resolveAuthenticatedPath(
        supabase,
        join ? `/join?token=${encodeURIComponent(join)}` : invite ? `/invite/${invite}` : null,
      ),
    );
  }

  return (
    <div className="w-full max-w-[388px]">
      <h1 className={`${dxClass.display} text-[1.625rem] text-[#0D0D0B]`}>Create your workspace</h1>
      <p className="mb-7 mt-1 text-[15px] font-light text-[#6B6B64]">
        30-day free trial. No credit card needed.
      </p>

      {invite || join ? (
        <div className="mb-4 border border-[#C6DDD0] bg-[#EEF5F1] px-3 py-2 text-xs text-[#1C4A2E]">
          You&apos;ve been invited to join a DeliverX project workspace.
        </div>
      ) : null}

      <SignupForm invite={invite} joinToken={join} />

      <p className="mt-5 text-center text-sm text-[#6B6B64]">
        Already have an account?{" "}
        <Link
          href={
            join
              ? `/login?next=${encodeURIComponent(`/join?token=${encodeURIComponent(join)}`)}`
              : invite
                ? `/login?next=${encodeURIComponent(`/invite/${invite}`)}`
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
