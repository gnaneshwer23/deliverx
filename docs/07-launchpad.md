# 07 — Launchpad (PRD)

**Status:** Implementation-ready · **partially shipped; T7 honesty + T8 attestation shipped**  
**Canonical detail:** [`architecture/04-launchpad-career-intelligence.md`](./architecture/04-launchpad-career-intelligence.md)

---

## Purpose

Launchpad converts Professional Intelligence into career decisions and packaging: readiness, artefacts, applications, portfolio shares — **not** a keyword job board.

## User story

As a candidate, I want career readiness and portfolio packaging that cite my evidence and ScoreRuns (or clearly labelled heuristics), so I never present decorative trust as verified capability.

## Business rules

1. Prefer ScoreRun / SnapshotClaims for readiness; heuristic fallback must be labelled (`evidence_coverage_heuristic` / `mixed`) — PD-2026-07-09, T7  
2. Portfolio compile from evidence; private by default  
3. `deliverxVerified` only when `externally_attested` + `externally_verified` (PD-2026-07-06 / PD-2026-07-25c)  
4. Attestation never writes ScoreRuns  
5. No employer marketplace liquidity under current charter  
6. No Stripe / paid packaging until **T9** approval  

---

## Shipped modules & routes

| Piece | Location |
| --- | --- |
| Career intelligence | `src/lib/career-intelligence` · `/api/career/intelligence` |
| Outcomes (P7) | `src/lib/real-world-outcomes` · `/career/outcomes` · `/api/career/outcomes` |
| Verified Portfolio | `src/lib/verified-portfolio` · `/portfolio` · `/portfolio/v/[token]` |
| External attestation (T8) | `src/lib/external-attestation` · `/portfolio/attest/[token]` · attest APIs |
| Launchpad app | `/launchpad/app` · `/api/launchpad/*` |
| Marketing | `/launchpad` |

### T8 attestation flow (shipped)

1. Owner creates attestation request (consent-gated) on portfolio entry  
2. Attestor opens tokenised portal (no account required)  
3. Confirm → ledger `external_verification` / entry attested+verified strength  
4. Dispute → `pi_review_case`  
5. Kill switch `DELIVERX_VERIFIED_BADGE=off`  
6. Share views strip private evidence and attestor PII  

---

## UI states

| State | Behaviour |
| --- | --- |
| Readiness `score_run` | Cite framework pin + judgements |
| Readiness `mixed` / heuristic | Explicit label; not capability truth |
| Portfolio empty | CTA to compile from evidence / Experience |
| Attestation pending | Show status; revoke allowed |
| Verified lit | Only after confirm path; copy matches ledger |
| Kill switch off | Badge suppressed even if attested |

---

## API contracts

- `GET|POST /api/career/intelligence` · `GET|POST /api/career/outcomes`  
- `GET|POST /api/portfolio/entries` · entry detail/share/export  
- `GET|POST /api/portfolio/entries/[id]/attestations`  
- `GET|POST /api/portfolio/attest/[token]` (public token)  
- `GET /api/launchpad/me` · onboarding / progress / artefacts  

## Permissions

- Owner-only entry mutation  
- Attestor token: least privilege; self-attest denied  
- Public share: filter non-shareable evidence  

## Events

Attestation audit (`vpp_attestation_events`); domain events on verification; privacy cascade includes attestation rows.

## AI behaviour

Interview/prep assistants (where present) must not invent verified claims. Outcomes calibration stays honest.

---

## Acceptance criteria

- [ ] Readiness source visible in UI when not pure ScoreRun  
- [ ] Verified cannot light from Experience `platform_verified` alone  
- [ ] Attestor confirm/dispute paths covered by tests  
- [ ] Marketing copy does not overclaim Verified (TD-011)  

## Edge cases

- Revoke pending request  
- Token reuse after confirm  
- Export/purge includes attestation PII carefully  

---

## Aspirational (deferred)

Networking OS, salary insights marketplace, employer liquidity, interview intelligence depth — architecture 04 vision; not authorized now.
