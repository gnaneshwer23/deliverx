# 06 — Authentication: Sign In and Sign Up

Both screens are **Pack-1 implementable now** and evolve the existing Supabase Auth routes.

## Screen: Sign in

**Product area / Route / Primary user / Purpose:** Authentication / `/login` / returning member / restore access and preserve intended destination.
**Primary user question / Immediate understanding:** “Can I continue where I left off?” / Sign in securely and return to the requested DeliverX screen.
**Primary + secondary actions:** Sign in; Forgot password; tertiary Create account.
**Required data / source / permissions:** Email, password, optional `next`; Supabase Auth; anonymous only; never reveal whether an email exists.
**Layout:** Minimal auth header / no product nav / two-column brand reassurance + form on desktop, form-first on mobile / trust and support note, no context panel.
**Components:** AuthHeader, SignInForm, PasswordField, ErrorSummary, TrustNote, LegalLinks.
**States:** Loading—disable one submit and announce; Empty—clean form; Partial—retain email after failure, never password; Success—redirect to validated internal `next` or `/profile`; Error—generic invalid credentials/network recovery; Permission denied—rate/allowlist message without account enumeration.
**Desktop wireframe:** `Logo | reassurance: evidence remains private || Sign in form / Forgot / Create / Legal`
**Mobile wireframe:** `Logo / Sign in / support / email / password / Sign in / Forgot / Create / Legal`.
**Accessibility:** Actual labels, password show control with name/state, error summary linked to fields, Enter submits, focus moves to summary, status live region.
**Analytics events:** No password/auth error detail. Existing auth telemetry; proposed `auth_signin_succeeded` only if privacy allowlisted.
**Acceptance criteria:** Internal deep link preserved and sanitized; no account enumeration; password never retained/logged; recovery reachable; keyboard and 320px usable.
**Related screens:** Sign up, Forgot password, PI onboarding, Profile home.
**Cursor implementation notes:** Preserve existing auth contracts and redirect guards. Do not add OAuth without scope approval.

### FINAL COPY

**Headline:** Welcome back.

Sign in to continue your experience, review your evidence and pick up your next action.

**Primary CTA:** Sign in
**Links:** Forgot your password? · Create an account

**Trust note:** Your professional information is private by default. You control what is shared.

**Generic error:** We could not sign you in with those details. Check your email and password, or reset your password.

---

## Screen: Sign up

**Product area / Route / Primary user / Purpose:** Authentication / `/signup` / new professional / create an account and begin PI onboarding with product intent preserved.
**Primary user question / Immediate understanding:** “What happens after I create an account?” / I will verify access if required, map my direction, then choose a starting path.
**Primary + secondary actions:** Create account; Sign in.
**Required data / source / permissions:** Email, password, accepted terms, `product` intent; Supabase Auth; anonymous; product intent validated against known values.
**Layout:** Minimal auth header / no product nav / expectation panel + form / legal and privacy note / no context panel.
**Components:** AuthHeader, SignupForm, PasswordRequirements, TermsConsent, NextSteps, ErrorSummary.
**States:** Loading—single submit; Empty—form + next steps; Partial—show validation and retain non-secret input; Success—verification instruction or account setup; Error—existing email response avoids unsafe enumeration where configured; Permission denied—allowlist/pilot message with safe contact route.
**Desktop wireframe:** `Logo | What happens next: account→direction→path || Create account form / terms / CTA / sign in`
**Mobile wireframe:** `Logo / Create account / next-steps summary / fields / terms / CTA / sign in`.
**Accessibility:** Password requirements available before error; terms link does not steal form state; live status; no colour-only validation.
**Analytics events:** Canonical `account_created(method, product_intent)` only after successful account creation; no email, names, password detail or free text.
**Acceptance criteria:** Product intent preserved; terms explicit; successful signup emits once; error never logs sensitive input; next step is accurately described; no purchase implication while checkout is off.
**Related screens:** Sign in, Account onboarding, PI onboarding welcome.
**Cursor implementation notes:** Evolve existing route; preserve auth verification and gateway ordering. Do not merge account/org onboarding into PI onboarding.

### FINAL COPY

**Headline:** Create your DeliverX account.

Start by mapping your direction. Then choose a realistic Experience, prepare your career in Launchpad or continue to your professional home.

**What happens next**
1. Create and, if required, verify your account.
2. Map your professional context and direction.
3. Review what you shared and choose a starting path.

**Primary CTA:** Create account
**Secondary link:** Already have an account? Sign in

**Trust note:** Onboarding answers are self-reported and private by default. They guide recommendations; they do not create capability, evidence or Verified status.
