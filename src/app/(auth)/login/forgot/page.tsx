import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-form";

export default function ForgotPasswordPage() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
      <p className="mt-1 text-sm text-slate-500">
        Enter your email and we&apos;ll send you a link to choose a new password.
      </p>

      <ForgotPasswordForm />

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/login" className="font-medium text-[#0F766E] hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
