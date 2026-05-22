import Link from "next/link";
import { AuthPanel, authLinkClass } from "@/components/marketing/auth-panel";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "./reset-form";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <AuthPanel>
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
          Reset password
        </h1>
        <p className="mt-2 text-sm text-[#9ca3af]">
          Open the reset link from your email to set a new password.
        </p>
        <Link href="/login/forgot" className={`mt-6 inline-flex text-sm ${authLinkClass}`}>
          Request a new link
        </Link>
      </AuthPanel>
    );
  }

  return (
    <AuthPanel>
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
        Choose a new password
      </h1>
      <p className="mt-2 text-sm text-[#9ca3af]">
        Signed in as {user.email}. Enter your new password below.
      </p>
      <ResetPasswordForm />
    </AuthPanel>
  );
}
