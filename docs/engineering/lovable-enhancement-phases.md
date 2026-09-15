# DeliverX — Lovable-Derived Enhancement Phases

**As of:** 2026-09-15
**Authority:** [`../product/build-charter.md`](../product/build-charter.md) · [`../product/current-scope.md`](../product/current-scope.md) · [`../00-vision-and-principles.md`](../00-vision-and-principles.md) · SoT hierarchy in [`../README.md`](../README.md)
**Companion phase docs (style mirrored):** [`six-doc-build-phases.md`](./six-doc-build-phases.md) · [`technology-build-phases.md`](./technology-build-phases.md) · [`next-steps.md`](./next-steps.md) · [`remaining-work.md`](./remaining-work.md)
**Source prototype:** Lovable / TanStack-Start `swift-deliveries` (https://github.com/gnaneshwer23/swift-deliveries) — a subset reimplementation of DeliverX on a **separate** Supabase project (`vxpdwxzlbofqmquhqbrh`, not DeliverX prod `jibmyxaldetyycmtlxet`).

---

## 0. How to read this

This is a **planning deliverable**. It does not implement anything. It sequences a small number of additive vertical slices that harvest value from the `swift-deliveries` prototype into canonical DeliverX, plus the hardening/ops that must land first.

**Framing rules (non-negotiable):**

- **DeliverX stays canonical.** `swift-deliveries` is a source of workflow/UX ideas only. Nothing is ported wholesale; every idea is re-implemented natively against DeliverX schema, trust rails, and conventions.
- **Additive only.** Every phase enhances an existing surface or adds a new, flag-gated one. No phase overwrites shipped behaviour, and each ships behind a `DELIVERX_*` kill-switch defaulting to a safe value.
- **Smallest coherent vertical slice per phase.** Dependency-ordered; hardening/security before net-new features.
- **Trust rails preserved.** Evidence Ledger append-only; capability written **only** via the Capability Engine; observation consent default OFF; `deliverxVerified` lights **only** from external attestation (T8); no unexplained scores; learning ≠ capability.
- **No calendar estimates.** Difficulty is characterised in technical terms only (which subsystems change, how invasive, dependencies/risks).

**Two tracks:**

- **Track A — Hardening / Ops** (Phases 1–2): migration drift reconciliation and pilot-auth/delivery hygiene. These gate the enhancement track because Phase 4 writes to the append-only ledger and must not land on an unverified DB state.
- **Track B — Lovable-derived enhancements** (Phases 3–4): owner-facing portfolio share controls, then the coaching evidence workflow.

**Migration head (verified in-repo, 2026-09-15):** `supabase/migrations/0105_fix_mutable_search_path_residuals.sql`. The **next** new migration number is **`0106`**. Only one phase in this plan (Phase 4) needs a migration.

---

## Phase 0 — Capability Coverage Map (DONE on branch — do not re-plan)

Delivered as PD-2026-09-15 on branch `cursor/lovable-capability-coverage-map-73cc` (PR #188): a read-only per-capability basis view on `/profile/evidence` (`src/lib/capability-coverage/`, `src/components/pi/capability-coverage-panel.tsx`), flag `DELIVERX_CAPABILITY_COVERAGE` (default on), no migration. Adapted from the `swift-deliveries` Launchpad "capability story" surface. This roadmap **builds on top of it** and does not touch it.

> **Note for readers on `main`:** this branch is based on `origin/main`, where PR #188 (and PD-2026-09-15 in `product-decisions.md`) is **not yet merged**, so `src/lib/capability-coverage/` and the coverage-map decision are not present on `main` at time of writing. The paths above are accurate on the PR #188 branch. Treat Phase 0 as delivered-pending-merge; the phases below do not depend on the coverage-map code, only on its precedent.

---

## Track A — Hardening / Ops

### Phase 1 — Migration drift reconciliation (`0103`–`0105`) — **security objective verified already-applied (2026-09-15)**

> **Finding (verified 2026-09-15 via read-only inspection of prod `jibmyxaldetyycmtlxet`):** the security hardening from `0103`–`0105` is **already enforced in production at the schema level**. There is **no security or functional gap**. Only the migration **history ledger** lags — `schema_migrations` stops at `0102` and uses timestamp-style versions that never matched the repo's numeric file prefixes (a **pre-existing** divergence). This is a **bookkeeping/tooling** gap, not a trust-rail gap. The remaining work is optional ledger reconciliation only; **no prod DDL is run**. Recorded as PD-2026-09-15d.

- **Outcome:** Production DB (`jibmyxaldetyycmtlxet`) is **confirmed** to enforce the capability-child lockdowns and `search_path` fix from `0103`–`0105` at the schema level, so later evidence-writing work already lands on a verified trust-rail state.
- **Source:** ops / hardening (operational finding, not a `swift-deliveries` surface).
- **Evidence (read-only, 2026-09-15):**
  - `pi_capability_judgements` and `pi_capability_snapshots`: only `*_select_own` SELECT policies exist (role `authenticated`); **no insert-own policies**. `authenticated` holds SELECT + REFERENCES/TRIGGER only (no INSERT/UPDATE/DELETE); `service_role` retains full DML; `anon` has **no** SELECT (only REFERENCES/TRIGGER). This matches the end-state of `0103` (insert lockdown) and `0104` (anon SELECT revoke).
  - The `pi_forbid_capability_mutation()` trigger function exists (SECURITY DEFINER, `search_path=public`).
  - `match_project_memory_chunks`, `match_org_memory_chunks`, and `pi_cf_version_is_immutable` already have `search_path=public` (matches `0105`); the Supabase security advisor does **not** flag them.
- **Scope (in):** None required for security. The only optional residual is migration-**ledger** reconciliation so `schema_migrations` reflects that `0103`–`0105` are effectively enforced; and doc consistency (`six-doc-build-phases.md` schema-vs-ledger distinction, this doc, and `current-scope.md`).
- **Scope (out):** **No prod DDL.** Re-running `0103`–`0105` against prod is unnecessary (the end-state is already present) and applying them via MCP would append **fresh timestamp-style versions**, deepening the pre-existing ledger/file-prefix mismatch rather than resolving it. No new migration; no schema change; no feature work.
- **Affected modules/routes/files:** Docs only for this reconciliation — [`six-doc-build-phases.md`](./six-doc-build-phases.md) (schema-vs-ledger wording), this doc, and [`../product/current-scope.md`](../product/current-scope.md). The migration files `supabase/migrations/0103_*.sql`, `0104_*.sql`, `0105_*.sql` remain the record of intent; they are **not** re-applied.
- **Data/migration needs:** **None.** The `0103`/`0104` capability-child INSERT lockdown + anon SELECT revoke (extends PD-2026-07-25d) and the `0105` `search_path=public` pins are already the live schema state. Ledger-only reconciliation (if ever pursued) is a founder-gated tooling task, must not run DDL, and must avoid MCP `apply_migration` which would only add more timestamp versions.
- **Kill-switch flag:** None (no DB change).
- **Trust-rail & charter compliance:** Purely confirmatory. The "capability only via Capability Engine" and least-privilege rails are already enforced at Postgres. Nothing user-facing; nothing additive to overwrite.
- **Acceptance criteria:**
  - [x] Prod applied-ledger version recorded: `schema_migrations` head is `0102` (timestamp-style versions; never matched numeric file prefixes — pre-existing).
  - [x] `0103`–`0105` end-state **confirmed enforced** on prod at the schema level (policies, grants, trigger, and `search_path` as cited above), even though the ledger does not list those version numbers.
  - [x] Supabase security advisor: no `search_path` residual WARN for the `0105` functions; no new WARN/ERROR from this work.
  - [x] Owner/non-owner RLS posture confirmed: `authenticated`/`anon` cannot INSERT capability child rows and `anon` cannot SELECT them (matches T6 security-journey expectations).
  - [x] Repo docs reconciled to the verified prod state (schema enforced; ledger lags).
  - [ ] *(Optional, founder-gated)* migration-ledger reconciliation so `schema_migrations` reflects `0103`–`0105` — **no DDL, no MCP apply**.
- **Test plan:** Verification was read-only (Supabase MCP inspection of policies/grants/functions + advisor scan). No prod DDL was run. `npm run test:pi` / `npm run test:release-gate` and `e2e/t6-security-journeys.test.ts` continue to assert the capability-child/anon lockdowns hold against a DB at this state. No UI, so no preview-route/Playwright leg.
- **Dependencies / sequencing:** Effectively complete for security purposes; later phases already assume the verified schema state. Any optional ledger reconciliation is independent and non-blocking.
- **Difficulty / risk (technical):** Security objective is **done** (verified already-applied), so residual risk is only bookkeeping. The historical risk (applying to the wrong project, or masking real drift) is avoided by **not** running DDL. Applying via MCP would actively worsen the ledger/file-prefix mismatch. Subsystems touched: none live; docs only.

---

### Phase 2 — Pilot auth & delivery hygiene proofs (TD-006, SMTP, reviewer-queue staffing)

- **Outcome:** The founder-owned pilot-readiness gaps are closed or explicitly decided, so the enhancement track (especially the coaching queue in Phase 4) does not sit behind unresolved auth/ops risk.
- **Source:** ops / hardening (current-scope founder ops; `swift-deliveries` `.env` hygiene note folded in as reference only).
- **Scope (in):** (a) Enable Supabase Auth leaked-password protection (TD-006) via dashboard/Management API; (b) prove SMTP password-reset delivery in prod; (c) record a decision on `DELIVERX_REVIEWER_QUEUE` staffing (who reviews, SLA) since Phase 4 reuses the same human-review posture.
- **Scope (out):** No product code. No enabling of billing, reviewer queue, or WCAG AA claims. The `swift-deliveries` committed `.env` (publishable/anon key only, low sensitivity) is **their** repo — noted for hygiene reference; **no action in DeliverX**.
- **Affected modules/routes/files:** Founder/ops only — [`runbook-leaked-password-protection.md`](./runbook-leaked-password-protection.md), [`runbook-password-reset-proof.md`](./runbook-password-reset-proof.md), [`reviewer-ops-playbook.md`](./reviewer-ops-playbook.md); status updates in [`technical-debt-register.md`](./technical-debt-register.md) and [`current-scope.md`](../product/current-scope.md).
- **Data/migration needs:** None.
- **Kill-switch flag:** None (config/ops). Reviewer queue remains gated by the existing `DELIVERX_REVIEWER_QUEUE` (default **off**).
- **Trust-rail & charter compliance:** Auth/privacy hardening only; no evidence, capability, or Verified paths touched. TD-006 stays a founder/ops toggle per PD-2026-07-16 (do not invent SQL/MCP workarounds).
- **Acceptance criteria:**
  - [ ] Supabase advisor `auth_leaked_password_protection` clears; TD-006 marked Closed.
  - [ ] Prod password-reset email received and note filed.
  - [ ] Reviewer-queue staffing decision recorded (or explicit "keep off for pilot").
- **Test plan:** Advisor re-scan (read-only) confirms TD-006; manual reset-email receipt logged per runbook. No automated code tests (no code change).
- **Dependencies / sequencing:** After Phase 1 (clean DB), before Phase 4 (which leans on the human-review posture). Independent of Phase 3.
- **Difficulty / risk (technical):** Low technical invasiveness; entirely founder/ops-owned. Risk is scheduling (agent cannot flip the Auth toggle or send prod mail). Subsystems: Supabase Auth config, SMTP, ops docs.

---

## Track B — Lovable-derived enhancements

### Phase 3 — Verified Portfolio share controls (revocable / expiring / view-count)

- **Outcome:** An owner-facing surface to create a private, **expiring** portfolio share link, **revoke** it, and see its **view count** and last-viewed time — surfacing rails that already exist in the DB but have no owner UI/API.
- **Source:** `swift-deliveries` `src/routes/_authenticated/workspace.launchpad.tsx` (create/revoke share, "expires in 90 days") and public `src/routes/portfolio.$token.tsx`. Scoped as an **enhancement to DeliverX's existing Verified Portfolio + T8 share**, not a parallel share system.
- **Scope (in):** A settings/portfolio panel that lists an entry's shares with status (`active`/`revoked`/`expired`), expiry, view count, and last-viewed; create with a chosen expiry window; revoke. Reuses the existing store functions and public read path unchanged.
- **Scope (out):** No new token model, no new public view route (the existing `/portfolio/v/[token]` stays canonical), no marketplace/networking, no change to what the public view discloses. Not a T8 attestation change.
- **Affected modules/routes/files (concrete):**
  - Reuse: `src/lib/verified-portfolio/store.ts` — `createPortfolioShare` (already accepts `expiresAt`), `listPortfolioShares` (already returns `viewCount`/`lastViewedAt`/`status`), `revokePortfolioShare`.
  - Reuse (unchanged): `src/lib/verified-portfolio/public.ts` — expiry is already enforced (`public.ts` marks `expired` and refuses) and `view_count` is already incremented on public read.
  - New: an owner-facing route `src/app/api/portfolio/entries/[id]/shares/route.ts` (GET list, POST create-with-expiry, PATCH/DELETE revoke) — no store function currently has an API/UI caller (verified: nothing under `src/app`/`src/components` calls `createPortfolioShare`/`listPortfolioShares`/`revokePortfolioShare`).
  - New: owner UI panel under the portfolio workspace (`src/app/workspace/portfolio/` or the `/portfolio` entry detail) reusing shadcn primitives.
- **Data/migration needs:** **None expected.** `vpp_shares` already has `token`, `status`, `expires_at`, `view_count`, `last_viewed_at`, `hidden_fields`. If a column is found missing during build, add it as `0106` (then Phase 4 becomes `0107`) — prefer none.
- **Kill-switch flag:** `DELIVERX_PORTFOLIO_SHARE_CONTROLS` — default **off** (safe: no owner UI/API exposed until enabled; existing public view is unaffected either way).
- **Trust-rail & charter compliance:** Read/manage own shares only (owner-scoped, self-only RLS on `vpp_shares`). The public view already strips private evidence and attestor PII and never lights Verified from a share (PD-2026-07-25c). Creating/revoking a share never writes capability, never appends evidence, never changes `verifier_status`/`evidence_strength`. Additive: it only exposes existing rails.
- **Acceptance criteria:**
  - [ ] Owner can create a share with an expiry; link resolves at `/portfolio/v/[token]`.
  - [ ] Expired link returns "expired" and revoked link returns "revoked/unavailable" (behaviour already in `public.ts`).
  - [ ] Owner sees accurate view count and last-viewed after a public visit.
  - [ ] Revoke immediately invalidates the link.
  - [ ] Public view still hides private/hidden fields and shows no Verified badge unless T8-attested.
  - [ ] Flag `off` hides the panel and 404s the new API with no redeploy.
- **Test plan:** Unit tests for the new API handler and any share view-model mapping added to `src/lib/verified-portfolio` (joins `test:pi`, which already includes `verified-portfolio`); reuse/extend `verified-portfolio/compile.test.ts` for disclosure invariants. Dev-server manual check of create→view→revoke→expire. For the **auth-gated UI**, follow the repo's CI-safe pattern: a preview render behind a `data-testid` with the network mocked (see `e2e/acceptance/ac-04-ba-join.spec.ts` `join-invite-preview`) plus an axe smoke in `e2e/a11y` (see `public-axe.spec.ts`).
- **Dependencies / sequencing:** After Phase 1 (verified DB). Independent of Phase 2 and Phase 4. Lower risk than Phase 4, so sequenced first within Track B.
- **Difficulty / risk (technical):** Low. Mostly UI + a thin owner API over existing typed store functions; no schema change expected. Subsystems: Next.js route handler + a client panel; no trust-rail write paths. Main risk is accidentally widening what the public view discloses — mitigated by leaving `public.ts` untouched and asserting disclosure in tests.

---

### Phase 4 — Coaching evidence workflow (structured submission + human-coach confirm → supported evidence)

- **Outcome:** A candidate can submit structured coaching work against an approved exercise; a **human coach** confirms or rejects it; confirmation appends **supported** (non-Verified) evidence to the ledger with honest provenance. AI never approves; nothing enters the ledger until a human confirms.
- **Source:** `swift-deliveries` `src/routes/_authenticated/workspace.coaching.tsx` + `src/lib/coaching.functions.ts` (`submitCoachingEvidence` / `reviewCoachingSubmission`), which reuse artefact versions and write to the ledger only on coach confirm.
- **Scope (in):** Programme/exercise catalogue (founder-enabled, off by default per programme); candidate submission (structured text / file / external link) captured as an **immutable artefact version**; a coach review queue with mandatory rationale; on confirm, append one evidence record citing the `artefact_version_id`. Honest copy throughout: "coach confirmation is not external verification."
- **Scope (out):** No capability write, no ScoreRun, no `deliverxVerified`. Not a replacement for T8 attestation or the B4 dispute queue. No AI auto-approval. No new SKU. No multi-profession framework expansion (exercises pin the seeded `pm-core@2026.1`).
- **Affected modules/routes/files (concrete):**
  - Reuse: `src/lib/artefacts/` + `0088` artefact versioning (submission = new immutable version; evidence must cite `artefact_version_id`, enforced by `assertEvidenceCitesArtefactVersion`).
  - Reuse: `src/lib/evidence-ledger/append.ts` (`appendEvidence`) — append with `initialStatus: "supported"` (never `platform_verified`), `provenance.actorType` a human coach actor, citing the artefact version.
  - Reuse: B4 human-review posture — `src/lib/pi-review/` (`admin-access.ts` coach/reviewer gate, `trust-guards.ts` rejecting capability/Verified payloads, `notifications.ts`, `status-machine.ts`). Prefer to extend these guards rather than invent parallel review truth.
  - New: `src/lib/coaching/` (typed SoT — catalogue, submission, review, evidence-emit) with colocated tests; `src/app/api/pi/coaching/*` routes; a candidate submit surface and a coach queue surface (reuse the reviewer-queue UI patterns).
- **Data/migration needs:** **Migration `0106_coaching_evidence.sql`** (assuming Phase 3 needs none; else `0107`). New tables: `coaching_programmes` (enabled flag, framework ref), `coaching_exercises` (title/instructions/artefact type, capability ref), `coaching_submissions` (owner, exercise, `artefact_version_id`, intake method, content hash, self-confidence, state, attempt), and a review record (prefer reusing `pi_review_*` semantics; add a `coaching_submission_reviews` table only if the pi-review shape does not fit). RLS: candidate self-only on own submissions; coach/reviewer role (as in `pi-review/admin-access.ts`) on the queue; catalogue readable to authenticated, writable service-role/admin only. Evidence append uses the existing service path; new SECURITY DEFINER functions (if any) must declare fixed `search_path` and explicit EXECUTE grants (PD-2026-07-21). Include all new person rows in the T1 privacy export/purge cascade.
- **Kill-switch flag:** `DELIVERX_COACHING_EVIDENCE` — default **off** (safe: no submission/queue surfaces, APIs 404, no evidence path active until enabled). Individual programmes also default disabled until founder approves their exercises.
- **Trust-rail & charter compliance:** This introduces a **new evidence-generating path**, so it gets the highest scrutiny. Confirmation appends evidence at `supported` strength only — it is **observation/attestation-adjacent, not external verification** and never lights `deliverxVerified` (T8 only). No capability/ScoreRun write (Capability Engine remains the only writer). Ledger stays append-only; rejections create no evidence. AI may draft/assist but cannot confirm (guards in `pi-review/trust-guards.ts`). Self-reported confidence is labelled a claim, not evidence. Consent/privacy defaults respected; submissions private by default.
- **Acceptance criteria:**
  - [ ] Submission creates an immutable artefact version; resubmission creates a new version, never mutates a prior one.
  - [ ] No ledger evidence exists until a human coach confirms.
  - [ ] Confirm appends exactly one evidence record, status `supported`, citing `artefact_version_id`, provenance = human coach; reject appends nothing and records rationale.
  - [ ] Coaching never writes `pi_capability_score_runs`/judgements and never sets `verifier_status=externally_attested` or `evidence_strength=externally_verified` (proven by trust-guard tests + DB regression).
  - [ ] AI-assisted review decisions require citations; AI cannot auto-confirm.
  - [ ] Flag `off` (and per-programme disabled) hides all surfaces and 404s APIs; legacy data untouched.
  - [ ] New person rows included in privacy export/purge.
- **Test plan:** `src/lib/coaching/*.test.ts` joins `test:pi`; invariant tests that confirm → `supported` evidence only and reject → no evidence; trust-rail regression that capability/Verified writes are rejected (extend `pi-review/b4-trust.test.ts` patterns and `evidence-ledger/append.test.ts`); artefact-immutability assertion reused from `artefacts`. Owner/non-owner + coach-role RLS added to `e2e/t6-security-journeys.test.ts`. Dev-server manual walkthrough of submit → coach confirm → evidence appears (status `supported`, not Verified). Auth-gated UI: CI-safe preview render + `e2e/a11y` axe smoke, per the Phase 3 pattern.
- **Dependencies / sequencing:** Last. Requires Phase 1 (verified DB before adding an evidence writer) and leans on Phase 2's human-review staffing decision. Independent of Phase 3 but sequenced after it (higher risk).
- **Difficulty / risk (technical):** Highest in this plan. Invasive: new migration, new tables/RLS, a new ledger-writing path, a review queue, and file upload. Subsystems touched: Postgres schema/RLS/storage, evidence-ledger append, artefacts, pi-review, new API + two UIs. Risks: (1) accidentally treating coach confirmation as verification — mitigated by fixing strength to `supported` and trust-guard/DB regression; (2) scope creep into a capability writer — mitigated by keeping Capability Engine the only writer; (3) overlap/duplication with B4 — mitigated by reusing `pi-review` guards/notifications rather than forking. **Because it opens a new evidence source, it requires founder sign-off (see §Needs founder decision).**

---

## Needs founder decision / out of charter

| Item | Why it needs a decision / is blocked | Recommended handling |
| --- | --- | --- |
| **Phase 4 coaching evidence path** | Introduces a **new evidence-generating workflow** that appends to the append-only ledger. Charter-compatible (human, non-Verified, no capability write) but a new evidence source and a new human-ops queue. | Founder approval to build + confirm the trust-rail shape (`supported` strength, coach ≠ external verification) before implementation. |
| **`DELIVERX_REVIEWER_QUEUE` / coaching-queue staffing** | Human review only works if staffed; both B4 and Phase 4 depend on it. | Founder decides staffing/SLA in Phase 2; keep flags off until staffed. |
| **TD-006 leaked-password protection** | Founder/ops Auth toggle; not agent-automatable (PD-2026-07-16). | Founder one-click in Phase 2. |
| **SMTP password-reset proof** | Requires sending real prod mail. | Founder/ops in Phase 2. |
| **Coaching programme content / framework breadth** | Exercises pin `pm-core@2026.1`; expanding beyond the seed is founder-gated (TD-007). | Keep single-domain; per-programme enable stays founder-approved. |
| **New/third SKU, employer marketplace liquidity, enterprise mission-control depth, T9/Stripe/payments** | Explicitly out of charter. | **Not scheduled.** No phase here touches these. `swift-deliveries` `pricing`/marketplace surfaces are deliberately **not** harvested. |
| **`swift-deliveries` committed `.env`** | Their repo, publishable/anon key only (low sensitivity). | Informational hygiene note; **no DeliverX action**. |

---

## Summary table

| Phase | Track | Outcome | Migration? | Flag (default) | Founder approval needed? |
| --- | --- | --- | --- | --- | --- |
| 0 | Baseline (done on branch) | Capability Coverage Map on `/profile/evidence` (PR #188, pending merge to `main`) | No | `DELIVERX_CAPABILITY_COVERAGE` (on) | Done (PD-2026-09-15) |
| 1 | Hardening/ops | **Verified already-applied (2026-09-15):** `0103`–`0105` enforced on prod at schema level; ledger lags at `0102`; optional ledger reconciliation only | No (no prod DDL; do not re-apply) | None | None for security (verified); ledger reconciliation is founder-gated |
| 2 | Hardening/ops | TD-006 on, SMTP reset proven, reviewer-queue staffing decided | No | None (reviewer queue stays `DELIVERX_REVIEWER_QUEUE` off) | Yes — founder/ops toggles + staffing |
| 3 | Lovable-derived | Owner-facing revocable/expiring portfolio share + view count | No expected | `DELIVERX_PORTFOLIO_SHARE_CONTROLS` (off) | No (additive over existing rails) |
| 4 | Lovable-derived | Coaching submission → human confirm → `supported` evidence | Yes — `0106_coaching_evidence.sql` | `DELIVERX_COACHING_EVIDENCE` (off) + per-programme enable | Yes — new evidence source + trust-rail sign-off |

---

## Appendix — `swift-deliveries` surface inventory (what we harvest vs skip)

| `swift-deliveries` surface | Disposition |
| --- | --- |
| Launchpad "capability story" | Harvested → Capability Coverage Map (Phase 0, done). |
| Launchpad readiness-pack share (`workspace.launchpad.tsx`) + public `portfolio.$token.tsx` | Harvested → Phase 3 (owner controls over existing `vpp_shares`). |
| Coaching (`workspace.coaching.tsx`, `coaching.functions.ts`) | Harvested → Phase 4 (native, human-confirm, non-Verified). |
| `workspace.capability` / `workspace.evidence` / `workspace.profile` / `workspace.organisation` / `workspace.team` | Skip — DeliverX already has richer canonical equivalents (SnapshotClaims, evidence ledger, `/profile`, org-structure `0093`, teams). |
| `workspace.experience` | Skip — DeliverX Experience (12-company catalogue `0079`, planner, Day-1 sim, B6 ceremony, hiring interview slice 1) is ahead. |
| `pricing` / payments | Skip — T9/Stripe out of charter for this initiative. |
| `attest.$token` | Skip — DeliverX T8 attestation (`0094`, `/portfolio/attest/[token]`) is canonical and ahead. |
| Committed `.env` | Hygiene note only; not our repo. |

---

## Related

- [`six-doc-build-phases.md`](./six-doc-build-phases.md)
- [`next-steps.md`](./next-steps.md) · [`remaining-work.md`](./remaining-work.md)
- [`../product/product-decisions.md`](../product/product-decisions.md) (PD-2026-09-15 coverage map — on PR #188 branch; PD-2026-07-25c/d Verified + DB trust lockdown)
- [`security-model.md`](./security-model.md) · [`data-model.md`](./data-model.md)
