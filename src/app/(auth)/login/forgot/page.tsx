import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-form";
import { DxCaps } from "@/components/dx/dx-logo";
import { dxClass } from "@/lib/dx-theme";

export const metadata: Metadata = {
  title: "Reset password | DeliverX",
  description: "Request a password reset link for your DeliverX account.",
  alternates: { canonical: "/login/forgot" },
};

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-[388px]">
      <h1 className={`${dxClass.display} text-[1.625rem] text-[#0D0D0B]`}>Reset password</h1>
      <p className="mb-7 mt-1 text-[15px] font-light text-[#6B6B64]">
        Enter your email and we&apos;ll send you a link to choose a new password.
      </p>
      <ForgotPasswordForm />
      <p className="mt-5 text-center text-sm text-[#6B6B64]">
        <Link href="/login" className="font-medium text-[#1C4A2E] hover:underline">
          Back to sign in
        </Link>
      </p>
      <DxCaps className="mt-8 block text-center text-[7px] text-[#A8A89E]">
        Links expire after 24 hours
      </DxCaps>
    </div>
  );
}
