import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "./reset-form";
import { DxCaps } from "@/components/dx/dx-logo";
import { dxClass } from "@/lib/dx-theme";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="w-full max-w-[388px]">
        <h1 className={`${dxClass.display} text-[1.625rem] text-[#0D0D0B]`}>Reset password</h1>
        <p className="mb-7 mt-1 text-[15px] font-light text-[#6B6B64]">
          Open the reset link from your email to set a new password.
        </p>
        <Link href="/login/forgot" className="text-sm font-medium text-[#1C4A2E] hover:underline">
          Request a new link
        </Link>
        <DxCaps className="mt-8 block text-[7px] text-[#A8A89E]">Check spam if you don&apos;t see the email</DxCaps>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[388px]">
      <h1 className={`${dxClass.display} text-[1.625rem] text-[#0D0D0B]`}>Choose a new password</h1>
      <p className="mb-7 mt-1 text-[15px] font-light text-[#6B6B64]">
        Signed in as {user.email}. Enter your new password below.
      </p>
      <ResetPasswordForm />
    </div>
  );
}
