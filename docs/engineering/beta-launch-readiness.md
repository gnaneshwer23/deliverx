# DeliverX — Beta launch readiness

**Date:** 2026-07-26  
**Authority:** Build Charter · Current Scope · [`ship-status.md`](./ship-status.md) · [`remaining-work.md`](./remaining-work.md) · [`b1-b9-outcomes-efficiency-audit.md`](./b1-b9-outcomes-efficiency-audit.md)  
**Production:** https://www.deliverx.dev  
**Companion canvas:** [`deliverx-beta-launch-readiness.canvas.tsx`](../../../.cursor/projects/Users-gnaneshwerjadav-Workspace-deliverx/canvases/deliverx-beta-launch-readiness.canvas.tsx)

---

## Verdict

**Ready with conditions** — invite-only beta is appropriate once founder ops below are done (or consciously accepted).

The P0–P7 Professional Intelligence candidate loop is shipped and trust-railed. Marketing IA now matches the four primary destinations (How it works · Experience · Launchpad · Professional Workspace). Payments may stay off for beta.

It is **not** “ready for open public launch”: leaked-password protection is still WARN (TD-006), password-reset SMTP is unproven, AT lab is open, and the human reviewer queue remains flag-off. CI is restored for the default verify path, but the live signed-in leg still depends on Actions secrets.

---

## Blockers vs nice-to-haves

### Blockers for invite-only beta (founder must decide)

| Item | Why it matters | Severity if skipped |
| --- | --- | --- |
| **SMTP password-reset proof** (R-P1-15) | Beta users will forget passwords | **Hard** if you invite people you cannot recover manually |
| **TD-006 leaked-password (HIBP)** | Weak/breached passwords accepted | **Strongly recommended**; accept only with invitee trust + monitoring |
| Invite list + support channel | No public sales motion | **Hard** — beta without a contact path fails fast |

### Not blockers for invite-only beta (keep off / document)

| Item | Status | Notes |
| --- | --- | --- |
| **Payments / `DELIVERX_BILLING_ENFORCE`** | Off by design | Correct for beta — pilot access, no Stripe chase |
| **CI follow-through (`T6_SUPABASE_*`)** | Partial | Default CI is back; live signed-in release-gate still skips until Actions secrets are present |
| **`DELIVERX_REVIEWER_QUEUE`** | Off | Human review path exists; Verified still requires attestation (T8) |
| **AT lab (VoiceOver/NVDA)** | Open | Engineering a11y core closed; do not claim WCAG 2.2 AA whole-product |
| **PostHog / FD-PACK-7** | Deferred | Optional analytics sink |

---

## Product loop vs marketing claims

| Claim surface | Shipped? | Synced? |
| --- | --- | --- |
| Experience — AI company practice + Experience Record | Yes (P3–P5) | Yes — pilot, evidence ≠ Verified |
| Launchpad — Career Intelligence, packaging, interview lab | Yes (T7 packaging honesty) | Yes — labelled readiness, no marketplace |
| Professional Workspace — AI teammates, shared shell | Yes (T7 alias, not third SKU) | Yes — Team Copilot demoted to alias |
| How it works — PI loop + trust rails | Yes | Yes — ScoreRun ≠ Verified; AI drafts labelled |
| Daily Briefing / contextual home | Yes (`/profile`) | Yes on home FAQ; Hub still exists as alternate entry |
| Paid prices / money-back | No checkout live | Honest — Pilot access; no money-back offer |
| Employer marketplace / hiring partners | Out of charter | Omitted from marketing |

Residual product risk: **Hub vs contextual Profile home** can still confuse first-run testers — brief them to land on Profile / Daily Briefing after signup.

---

## Trust rails for pilot

| Rail | State |
| --- | --- |
| Observation consent default OFF | Intact |
| Evidence private by default | Intact |
| Capability only via Capability Engine / ScoreRun | Intact |
| ScoreRun never lights Verified | Intact (T8 attestation path) |
| AI drafts labelled | Intact in product + marketing honesty tests |
| Append-oriented ledger | Intact |
| Billing enforcement | Off — entitlements not gating pilot |

---

## Payments intentionally off — OK for beta?

**Yes.** Invite-only beta should run with Pilot access and `DELIVERX_BILLING_ENFORCE` unset. Enabling Stripe mid-beta without webhook/portal proof risks locking testers out. Keep T9 founder ops as a separate gate after beta feedback.

---

## Known residual risks

1. **Auth hygiene (TD-006 + SMTP)** — recovery and breached-password path incomplete.
2. **Live signed-in CI leg** — `test:release-gate:live` still skips in Actions until `T6_SUPABASE_*` secrets are set.
3. **Reviewer queue off** — human review workflow not the default path; Verified still attestation-only.
4. **Hub vs Profile home** — competing signed-in landings.
5. **Marketing polish residual** — tablet hamburger until `lg`; long “Professional Workspace” label; mock chrome rail hidden below `md`.
6. **No whole-product AA claim** without AT lab.

---

## What beta testers can / cannot do

### Can

- Sign up / sign in (email auth)
- Complete onboarding and pin `pm-core` framework
- Run Experience planner / company work and produce evidence with provenance
- Use Profile, Daily Briefing, Career / Launchpad packaging surfaces
- Use Professional Workspace foundations (shared shell, AI drafts with human submit)
- See labelled readiness / confidence bands — explainable, not decorative %
- Request privacy export / delete paths as documented

### Cannot (or should not expect)

- Pay / subscribe (checkout not enforced; prices appear only when Stripe is configured)
- Employer marketplace liquidity or hiring-partner matching
- Enterprise mission-control depth as a product SKU
- Automatic Verified badges from ScoreRun or learning completion
- Guaranteed interviews / job outcomes
- Money-back / refund theatre

---

## Founder checklist before inviting users

1. **SMTP** — configure Supabase custom SMTP (or confirm provider); send a real password-reset email to yourself; file proof.
2. **TD-006** — enable Auth → Attack Protection → leaked password protection ([project](https://supabase.com/dashboard/project/jibmyxaldetyycmtlxet/auth/protection)).
3. **Invite list** — named emails only; share a support contact (founder email / Slack).
4. **Briefing note** — after signup go to Profile / Daily Briefing; observation consent stays OFF unless they opt in; Verified needs attestation.
5. **Confirm flags** — `DELIVERX_BILLING_ENFORCE` unset; `DELIVERX_RECOMMENDATION_SM` on; reviewer queue intentionally off unless you want to staff it.
6. **Optional** — add GitHub Actions secrets `T6_SUPABASE_URL`, `T6_SUPABASE_ANON_KEY`, and `T6_SUPABASE_SERVICE_ROLE_KEY` before a second invite wave so live signed-in CI runs automatically.
7. **Do not** enable live billing for this beta wave.

---

## Marketing shell fixes shipped with this audit

- Shared `(marketing)/layout` shell + sticky nav (no remount jump)
- Full primary nav on every product page (no current-link filter)
- Stable header CTA (“Start”); active `aria-current`
- Hero motion no longer starts at `opacity: 0` (blank first paint)
- Removed `content-visibility` intrinsic-size jumps on marketing sections
- Font `display: swap`; reserved hero min-heights; footer columns less crushed below `xl`
- Desktop primary links from `lg` up; hamburger through tablet

Screenshots: `/tmp/deliverx-marketing-header-audit/`
