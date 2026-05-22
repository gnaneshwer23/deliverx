/** Map Supabase Auth errors to clearer user-facing copy. */
export function formatAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("rate limit") || lower.includes("over_email_send_rate_limit")) {
    return "Too many emails sent recently. Wait up to an hour and try again, or reset your password from the Supabase dashboard.";
  }

  if (lower.includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }

  if (lower.includes("email not confirmed")) {
    return "Email confirmation is enabled in Supabase. Turn off “Confirm email” under Authentication → Providers → Email, or confirm your email first.";
  }

  return message;
}
