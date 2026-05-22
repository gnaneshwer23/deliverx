import { AuthPanel } from "@/components/marketing/auth-panel";
import { ForgotPasswordForm } from "./forgot-form";

export default function ForgotPasswordPage() {
  return (
    <AuthPanel>
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
        Reset password
      </h1>
      <p className="mt-2 text-sm text-[#9ca3af]">
        Enter your email and we&apos;ll send you a link to choose a new password.
      </p>
      <ForgotPasswordForm />
    </AuthPanel>
  );
}
