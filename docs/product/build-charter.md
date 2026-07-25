# DeliverX Build Charter

**Status:** Active  
**Effective:** July 2026  
**Authority:** Highest in the source-of-truth hierarchy (see `.cursor/rules/deliverx.mdc`)

This charter defines what may be built **now**. Long-term architecture documents describe where DeliverX may evolve; they do **not** authorise work outside this charter.

---

## Approved scope (NOW)

**Harden the shipped P0–P7 Professional Intelligence candidate loop for pilot.**

Authorized work includes:

- Fixing correctness, trust, privacy, and auth defects in the shipped loop
- Signed-in human QA of the candidate journey and closing gaps found there
- Test coverage that protects invariants (ledger append-only, Capability Engine–only writes, consent, verification honesty)
- Documentation, observability, and operational readiness for a limited pilot
- Small UX clarity fixes that make evidence, confidence, and next actions understandable
- Framework/rubric coherence for the seeded `pm-core` pilot domain (without expanding to multi-profession platforms)

### Shipped loop this charter protects

| Phase | Scope |
| --- | --- |
| P0 | Profile centre, framework pin, evidence relocate |
| P1 | SnapshotClaims coherence across Profile / Career / Portfolio |
| P2 | Baseline assessment (opt-in) |
| P3 | Experience planner + 12-company catalogue |
| P4 | Workspace observation + consent (default OFF) |
| P5 | Final / transfer assessment + growth reports |
| P6 | Learning Intelligence (learning ≠ competency) |
| P7 | Real-world outcomes + honest calibration |

Production reference: https://www.deliverx.dev · Supabase `jibmyxaldetyycmtlxet` · migrations `0066`–`0085`.

---

## Not authorized (until founder approval)

| Work | Why blocked |
| --- | --- |
| **P8 — External verification / attestation** | `deliverxVerified` must not light without a defined attestation path and legal/product meaning |
| **P9 — Commercial packaging / monetisation expansion** | Pilot loop must be trusted first |
| New product Homes / third SKU deep IA | Team Co-pilot vs Workspace branding ADR still open |
| Multi-profession framework platforms beyond pilot seed | Founder decision on single-domain sufficiency |
| Employer marketplace liquidity / broad opportunity OS | Deferred vs Launchpad packaging + readiness loop |
| Enterprise delivery OS expansion (mission-control depth) | Out of person-practice pilot ICP default |
| Speculative microservice splits of “ten intelligence domains” | Taxonomy only until scale requires separation |

If a prompt asks for P8, P9, or other out-of-charter work: **stop, cite this charter, and wait for explicit founder approval.**

---

## Core principles (non-negotiable)

1. **Evidence before claims** — demonstrated capability over self-declared skills.
2. **Observation ≠ evidence ≠ capability** — AI observations and coach drafts are not verified evidence; evidence is not capability until judged.
3. **AI provenance** — AI may assist, coach, challenge, observe, and explain; AI never fabricates evidence.
4. **No unexplained scores** — every important number or band must be explainable to a candidate and an employer.
5. **Learning ≠ competency** — course completion and learning paths must not assign capability or light Verified.
6. **Append-only ledger** — Evidence Ledger records are append-oriented with provenance; no silent rewrite of history.
7. **Capability only via Capability Engine** — ScoreRuns / judgements persist only through engine paths; UI and Learning must not invent levels.
8. **Frameworks versioned** — ScoreRuns pin `framework_version_id` (pilot pin: `pm-core@2026.1`).
9. **Privacy / consent built-in** — observation consent defaults OFF; evidence private by default; least-privilege access.

---

## Decision filter (from Foundation)

Every change must answer yes to:

1. Does it strengthen Professional Intelligence?
2. Does it generate or consume trustworthy evidence?
3. Does it improve professional capability or career outcomes?
4. Does it fit naturally within Experience, Launchpad, or Team Copilot / Workspace?
5. Can it be explained clearly to both a candidate and an employer?

If any answer is no → redesign or defer.

---

## Recommended next action

**Run signed-in human QA of the P0–P7 loop on production** (empty ScoreRun/outcome tables mean the happy path is unit-tested, not pilot-exercised). Close defects found under this charter before requesting P8/P9 authorisation.
