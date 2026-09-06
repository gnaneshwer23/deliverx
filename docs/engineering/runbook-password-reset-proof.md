# Runbook — Prove password-reset delivery (R-P1-15)

**Project:** DeliverX prod · `jibmyxaldetyycmtlxet`  
**Status:** Open — founder / ops proof required

## Goal

Prove that a real DeliverX user can request a password reset, receive the email, open the link, and reach the reset screen in production.

## Preconditions

1. DeliverX prod is live at `https://www.deliverx.dev`.
2. Supabase Auth URL Configuration still includes:
   - `https://www.deliverx.dev/auth/callback`
   - `https://www.deliverx.dev/**` if wildcard support is enabled
3. The mailbox you will test with can receive external email.
4. You know the current password for the test account, or the account is disposable.

## Founder proof steps

1. Open `https://www.deliverx.dev/login/forgot`.
2. Submit the email address of a real test account you control.
3. Check the inbox and spam folder for the reset email.
4. Open the reset link in the **same browser** where you requested it.
5. Confirm that DeliverX lands on `https://www.deliverx.dev/login/reset`.
6. Set a new password, then sign in with the new password.

## What counts as success

- Reset email arrives in the inbox or spam folder.
- The link opens DeliverX rather than a Supabase error page.
- The reset form accepts the new password.
- Sign-in succeeds with the new password.

## If it fails

- No email arrives: check Supabase email provider / SMTP sender setup first.
- Link opens in the wrong browser and errors: retry by copying the link into the same browser where step 2 happened.
- Link opens a callback error or wrong origin: re-check Supabase Auth URL Configuration and `NEXT_PUBLIC_APP_URL`.

## Closure reply

Reply with this exact phrase after a successful proof:

`SMTP proof complete — reset email received in prod, /login/reset opened, and sign-in worked with the new password.`
