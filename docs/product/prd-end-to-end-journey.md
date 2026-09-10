# PRD — DeliverX End-to-End Journey

**Status:** Current Charter / authorized now  
**Audience:** Founder, product, engineering, UX, QA  
**As of:** 2026-09-10  
**Authority:** Summarises the shipped candidate loop under the [Build Charter](./build-charter.md) and [Current Scope](./current-scope.md). Does **not** expand charter. Narrative companion: [End-to-End Journey](./end-to-end-journey.md).

When this PRD conflicts with other docs, prefer the [source-of-truth hierarchy](../README.md#source-of-truth-hierarchy):

1. Build Charter  
2. Current Scope  
3. Product Bible (`docs/00`–`docs/15`)  
4. Product Decisions  
5. Approved engineering detail  
6. Long-term architecture (aspirational where not shipped)  
7. Existing implementation  

---

## 1. Problem / opportunity

Professional development is fragmented across learning, simulation, portfolio, and hiring tools that do not share evidence. Candidates cannot prove what they have demonstrated. Employers cannot trust self-declared skills or unexplained scores.

DeliverX closes that gap with one evidence-driven loop: realistic work generates provenance-backed evidence; the Capability Engine judges it under a versioned framework; Launchpad packages readiness honestly; Verified lights only from external attestation.

**What DeliverX is not:** a learning platform, interview toy, decorative portfolio, generic AI chat, or employer marketplace (under current charter).

---

## 2. Goals & non-goals

### Goals (authorized now)

| Goal | Measure of honesty |
| --- | --- |
| Protect the shipped P0–P7 + T0–T8 + B1–B9 + Contextual Home + Experience hiring interview (slice 1) candidate loop | Invariants hold in release gate and live pilot |
| Keep Knowledge, Evidence, and Capability separate in UI and persistence | No silent promotion from self-report / AI draft / ScoreRun to Verified |
| Make joining Experience feel like simulated employment (Offer → skippable Hiring Interview → Ceremony → Day-1) without inventing capability | Placement and ceremony remain narrative; evidence only after the person acts |
| Package career readiness from ScoreRuns / SnapshotClaims with labelled heuristic fallback | No decorative readiness % sold as capability truth |
| Preserve privacy and consent | Observation default OFF; evidence private by default |

### Non-goals (this PRD)

- Expanding charter into marketplace liquidity, multi-profession frameworks, or enterprise mission-control depth  
- Starting live Stripe / payment enforcement without founder ops (`DELIVERX_BILLING_ENFORCE` stays off until then)  
- Importing SimulateCareer / academy theory as a required gate before Experience work  
- Building optional later Experience slices (role brief, employed work with AI teammates) until founder asks  
- Treating chat history as the primary database  

---

## 3. Users / personas (pilot ICP)

| Persona | Intent | Primary surfaces |
| --- | --- | --- |
| **Aspiring / early PM** | Build evidence through Experience; understand gaps | Profile, Experience planner/sim, Learning CTAs |
| **Career switcher** | Convert adjacent experience into demonstrated PM evidence | Onboarding → Experience; baseline opt-in |
| **Practicing PM** | Package evidence; calibrate outcomes; seek attestation | Portfolio, Launchpad, Outcomes, T8 attestation |
| **Org collaborator** (bounded) | Contribute in Professional Workspace; optional observation | Workspace (Team Copilot alias) |

**Out of pilot ICP default:** bulk employer accounts, multi-profession platforms, enterprise mission-control depth.

---

## 4. Product model

| Surface | Role under current charter | Status |
| --- | --- | --- |
| **Professional Intelligence (PI)** | Permanent evidence-backed model — shared SoT | Shipped (P0–P7, T1–T5, T8 gate, B1–B5, B7–B9, Contextual Home) |
| **Experience** | Capability develops through realistic simulated work | Shipped (P3 planner/catalogue/sim, B6 ceremony, hiring interview slice 1) |
| **Launchpad** | Converts evidence into packaging, readiness, opportunity alignment | Shipped (career intelligence honesty, portfolio, T8 attestation); no marketplace liquidity |
| **Team Copilot** | Alias of **Professional Workspace** — not a third SKU | Bounded foundations shipped (T7); mission-control depth deferred |

```text
Experience ──► Evidence Ledger ──► Capability Engine ──► Profile / SnapshotClaims
Workspace / Team Copilot ──► Observation (consent) ─.     │
                                                     │     ├──► Launchpad / Portfolio
AI coaches / hiring panel ──► drafts only (not verified) ──┘
```

**Shipped reality:** Pilot loop P0–P7, technology T0–T8, six-doc B1–B9, Contextual Home, and Experience hiring interview slice 1 are shipped. **T9** commercial code is in-repo; **live payments stay off** until founder Stripe/Vercel ops. Long-term architecture (`docs/architecture/00`–`07`) may describe deeper OS visions; those do **not** authorise building outside the Build Charter.

---

## 5. End-to-end user journeys

### 5.1 Account → PI orientation → path (shipped)

```text
Landing → Sign up / Login
  → Account / gateway onboarding (org / role as applicable)
  → PI onboarding (/onboarding/profile)
      welcome → identity → targets → strengths → evidence → working_style → review → path
  → Recommended Experience | Launchpad | Profile hub
```

| Requirement | Detail |
| --- | --- |
| Must | Eight-step conversation is default (`DELIVERX_ONBOARDING_STEP_SET`; rollback `v1-six-step`) |
| Must | Strengths, evidence posture, and working style are skippable and labelled **self-reported** |
| Must | Onboarding creates **no** ScoreRun, ledger evidence, or Verified status |
| Must | Baseline assessment is **opt-in** (not a mandatory gate before Experience) |
| Should | Contextual Home / Daily Briefing on `/profile` orients journey states A–D |

### 5.2 Experience — Offer → Hiring Interview → Ceremony → Day-1 (shipped)

Chosen shape ([PD-2026-09-10](./product-decisions.md#pd-2026-09-10--experience-hiring-interview-slice-1)):

```text
Profile → Goals → Baseline (opt-in) → WorkStyle → Offer
  → Hiring Interview (skippable) → Entry Ceremony → Dashboard / Day-1 sim work
```

| Step | What it is | What it is not |
| --- | --- | --- |
| **Planner / Offer** | Ranked scenarios from the 12-company catalogue; accept into generated `ExperienceSimState` | A real employment contract |
| **Hiring interview (slice 1)** | Skippable practice panel after offer accept, before ceremony. Highest-trust stakeholder + lowest-trust counterpart (MediFlow: Sarah Chen / CEO + James Wilson / Sales). Finish after 2 answers; auto-complete at 4. Placement note from role, company, project, first-week focus | A real hire, capability score, Verified, or Launchpad Interview Lab |
| **Entry ceremony (B6)** | Narrative: company → role → team → project → first activity (from existing sim state). Skip on every step | Scores, readiness %, ledger evidence, capability, Verified |
| **Dashboard / Day-1** | Simulated professional work; reflections/contributions can become ledger evidence **with provenance** when the person acts | Instant Verified or silent capability writes |

**Honesty copy (normative):** The hiring interview is **practice placement into a simulated company**, not a real hire, not a capability judgement, and not Verified. Ceremony copy must state that evidence is recorded only once the candidate acts inside the workspace.

### 5.3 Evidence → Capability → Launchpad / Portfolio (shipped high-level)

```text
Work (Experience sim / Workspace contributions / assessments)
  → Artefacts (immutable versions) + Evidence Ledger (provenance)
  → Capability Engine ScoreRun (framework-pinned judgements)
  → SnapshotClaims on Profile / Career / Portfolio
  → Launchpad packaging + optional external attestation (Verified)
  → Career outcomes / calibration (honest; no auto Verified)
```

| Must | Detail |
| --- | --- |
| Evidence cites immutable `artefact_version_id` when packaging submissions | T3 |
| Learning creates knowledge routes / “apply in Experience” CTAs only — never capability persist | P6 |
| Recommendations have lifecycle; accept/dismiss never mutates capability or Verified | B2 |
| Portfolio private by default; share views strip private evidence and attestor PII | T8 |
| Attestation: owner requests → attestor confirms via token → ledger `external_verification` → Verified may light; dispute opens review case | T8 |

**Aspirational (architecture, not authorised now):** Broad employer marketplace liquidity, bulk employer dashboards, multi-profession framework platforms.

### 5.4 Workspace / Team Copilot (shipped, bounded)

```text
Professional Workspace (/workspace)
  → Contribute artefacts / decisions / meetings
  → Optional observation + coach interventions (consent OFF by default)
  → Org departments / teams (T7) for structure — never assign capability
  → Evidence into the same PI ledger when provenance allows
```

| Must | Detail |
| --- | --- |
| In-app naming prefers **Professional Workspace**; marketing may say Team Copilot → Workspace | T7 |
| Not a separately sold SKU under T9 packaging (Complete Journey includes Workspace) | PD T9 |
| Legacy Mission Control / Ecosystem nav demoted (opt-in) | T7 |
| Pilot admin configures org/project under role + flag gates; never rewrites verified evidence or lights Verified | B8 |

**Aspirational / deferred:** Enterprise mission-control depth, executive Team Copilot surfaces, first-class messages table.

---

## 6. Product principles & trust rails

### Knowledge vs evidence vs capability

| Concept | Meaning | Who writes it |
| --- | --- | --- |
| **Knowledge** | What someone has been exposed to | Learning paths, self-report — **not** capability |
| **Evidence** | Observable proof with provenance | Evidence Ledger (append-oriented) |
| **Capability** | Repeatedly demonstrated under a versioned framework | **Capability Engine only** (ScoreRuns / judgements) |

Self-reported onboarding answers, hiring-interview replies, and AI coach drafts are **claims or drafts**, not verified evidence and not capability levels.

### Non-negotiable rails

1. **Evidence before claims** — demonstrated work over self-declared skills.  
2. **Observation ≠ evidence ≠ capability** — keep the three separate in UI and persistence.  
3. **Append-only ledger** — no silent rewrite of evidence history; privacy purge is an explicit, audited exception.  
4. **Capability Engine–only writes** — UI, Learning, Experience ceremony/interview, recommendations, and org structure must not invent levels.  
5. **Frameworks versioned** — ScoreRuns pin `framework_version_id` (pilot: `pm-core@2026.1`).  
6. **Learning ≠ competency** — course completion does not assign capability or Verified.  
7. **Consent default OFF** — continuous Workspace observation is deny-by-default.  
8. **Verified = external attestation** — lights only when a claim is `externally_attested` and evidence strength is `externally_verified`. ScoreRun, ceremony, hiring interview, learning, and recommendation accept/dismiss **never** light Verified.  
9. **ScoreRun ≠ Verified; bands ≠ decorative readiness %** — confidence bands (`confidence-bands@2026.1`) are explainable (“Why this band”); career readiness may use labelled heuristics when ScoreRun data is thin.  
10. **AI below intelligence** — drafts labelled; citations required for material claims; chat is not the primary database.  
11. **Privacy / least privilege** — evidence private by default; person export/delete supported; catalogue frameworks never purged with person data.  
12. **No third SKU / marketplace / mission-control expansion** without founder approval beyond the bounded charter.

### Decision filter (refuse if any answer is no)

1. Does it strengthen Professional Intelligence?  
2. Does it generate or consume trustworthy evidence?  
3. Does it improve professional capability or career outcomes?  
4. Does it fit naturally within Experience, Launchpad, or Team Copilot / Workspace?  
5. Can it be explained clearly to a candidate and an employer?

---

## 7. Functional requirements

### Must (current charter / shipped loop)

| ID | Requirement | Anchors |
| --- | --- | --- |
| FR-01 | Person PI profile aggregate with next actions and Contextual Home briefing | P0, Contextual Home |
| FR-02 | Append-only evidence ledger with provenance and status transitions | P0, T3 |
| FR-03 | Capability ScoreRuns only via Capability Engine; framework pin required | P0–P5, T2, B1 |
| FR-04 | SnapshotClaims shared across Profile / Career / Portfolio | P1 |
| FR-05 | Assessments: baseline / final / transfer with distinct `run_kind`; baseline opt-in | P2, P5 |
| FR-06 | Experience planner + 12-company catalogue + Day-1 sim | P3 |
| FR-07 | Skippable Experience hiring interview after offer, before ceremony; placement only | PD-2026-09-10 |
| FR-08 | Entry ceremony narrative over existing sim state; skip every step | B6 |
| FR-09 | Consent-gated workspace observation; interventions ≠ verified evidence | P4 |
| FR-10 | Learning paths without capability writes | P6 |
| FR-11 | Outcome events + calibration without auto capability upgrade | P7 |
| FR-12 | Portfolio packaging, share tokens, external attestation gate for Verified | T8 |
| FR-13 | Privacy export/delete; notifications inbox | T1, T5 |
| FR-14 | Org departments/teams foundations without capability assignment | T7 |
| FR-15 | Recommendation lifecycle; accept/dismiss never mutates capability or Verified | B2 |
| FR-16 | Eight-step PI onboarding; self-reported steps labelled; no capability/evidence/Verified | B5 |
| FR-17 | Thin pilot admin; never rewrite verified evidence or light Verified | B8 |

### Should (ops / honesty / hardening)

| ID | Requirement | Notes |
| --- | --- | --- |
| FR-S1 | Kill-switches restore prior paths without redeploy | See §9 |
| FR-S2 | Heuristic readiness always labelled (`evidence_coverage_heuristic` / `mixed`) | T7 honesty |
| FR-S3 | Reviewer queue available behind flag when staffed | B4; default off |
| FR-S4 | Global search + help as shell utilities (no Insights product) | B7 |
| FR-S5 | PI API rate limits and honest state-machine errors | B9 |
| FR-S6 | Release gate + trust coverage protect ledger / engine / Verified invariants | T6 |

---

## 8. Explicit out of scope

Do **not** treat the following as authorised work from this PRD:

| Out of scope | Notes |
| --- | --- |
| **SimulateCareer merge / theory gates** | Not imported; not a required gate before Experience (PD-2026-09-10) |
| **Live Stripe / payments ops** | T9 code exists; **payments later** — founder configures Stripe + Vercel; do not invent eng work whose only goal is enabling Stripe without ask |
| **Employer marketplace liquidity** | No bulk employer accounts, networking scrape, or opportunity OS liquidity |
| **Third SKU / enterprise mission-control depth** | Team Copilot remains Workspace alias |
| **Multi-profession framework expansion** | Beyond thin `pm-core` pilot seed |
| **Speculative microservice splits** | “Ten intelligence domains” are taxonomy, not services |
| **Chat-as-database** | Structured PI entities remain SoT |
| **Lighting Verified from ScoreRun, ceremony, hiring interview, or learning** | Trust violation |
| **Optional later Experience slices** | Role brief, employed work with AI teammates — unauthorized until founder asks |

---

## 9. Kill-switches / flags

| Flag | Default | Effect |
| --- | --- | --- |
| `DELIVERX_XP_HIRING_INTERVIEW` | **on** | Off → offer accepts go straight to ceremony/dashboard; new enrolments do not attach a pending interview |
| `DELIVERX_XP_ENTRY_CEREMONY` | **on** | Off → restore direct-to-dashboard after offer (and interview if still on) |
| `DELIVERX_ONBOARDING_STEP_SET` | eight-step (`v2-conversation`) | `v1-six-step` rolls PI onboarding back without migration |
| `DELIVERX_VERIFIED_BADGE` | on (unless set off) | Off suppresses Verified badge even when attested |
| `DELIVERX_BILLING_ENFORCE` | **must stay off** until founder ops | T9 code shipped; live payment enforcement is founder-gated |
| `DELIVERX_REVIEWER_QUEUE` | **off** | Human ops queue (non-Verified); enable only when staffed |
| `DELIVERX_CONTEXTUAL_HOME` | on | Daily Briefing on Profile |
| `DELIVERX_RECOMMENDATION_SM` | on in pilot prod | Recommendation lifecycle UI |
| `DELIVERX_GLOBAL_SEARCH` | on | Shell search + help |
| `DELIVERX_PILOT_ADMIN` | on | Thin org/project admin (+ role gate) |

Unset Experience ceremony/interview flags resolve to **on** in code (safe ship with rollback via env only). Legacy enrolments without `hiringInterview` are not trapped.

---

## 10. Success criteria / acceptance

Evidence-based; no unexplained scores.

| Criterion | Pass condition |
| --- | --- |
| Activation | Candidate completes onboarding and reaches a meaningful next action without inventing capability |
| Experience join | Offer → (optional interview) → ceremony → Day-1 works; skip paths do not trap; neither interview nor ceremony writes capability or Verified |
| Evidence integrity | Evidence append and ScoreRun persist respect ledger / engine invariants (tested) |
| Learning honesty | Learning and outcomes never light Verified or write ScoreRuns |
| Verified honesty | `deliverxVerified` only after external attestation confirm + strength; kill switch respected |
| Access | Unauth person APIs return 401; sensitive pages redirect to login with `next` |
| Explainability | Every important band / readiness figure is explainable or explicitly labelled heuristic |
| Release | `npm run test:release-gate` green (+ live when secrets present) |

---

## 11. Open questions / next vertical slices (charter-aligned only)

These do **not** expand charter. Prefer smallest hardening slice.

| Topic | Status / next |
| --- | --- |
| ICP weight (pre-job vs employed teams) | Founder pending — affects Career vs Workspace investment weight |
| Live payments | Founder ops when ready; eng does not invent Stripe-only work |
| Reviewer queue staffing | Flip `DELIVERX_REVIEWER_QUEUE` only when staffed |
| Auth leaked-password protection (TD-006) | Founder Supabase toggle |
| FD-PACK-7 PostHog sink | Optional after Vercel analytics path |
| Optional B0 pack archive | Docs intake only if founder asks |
| Optional Experience follow-ups (role brief, AI teammates) | **Unauthorized** until founder asks |
| Launchpad-primary heuristic tightening | Candidate hardening; keep labels |

Full residual inventory: [`../engineering/remaining-work.md`](../engineering/remaining-work.md) · ordered plan: [`../engineering/next-steps.md`](../engineering/next-steps.md).

---

## 12. References

| Need | Document |
| --- | --- |
| Orientation narrative | [`end-to-end-journey.md`](./end-to-end-journey.md) |
| What may be built now | [`build-charter.md`](./build-charter.md) |
| Shipped vs out of scope | [`current-scope.md`](./current-scope.md) |
| Why / refuse filter | [`../00-vision-and-principles.md`](../00-vision-and-principles.md) |
| Master + surface PRDs | [`../01-master-prd.md`](../01-master-prd.md), bible `05`–`09` |
| Hiring interview decision | [`product-decisions.md`](./product-decisions.md) — **PD-2026-09-10** |
| Schema / APIs / security | [`../engineering/data-model.md`](../engineering/data-model.md), [`api-contracts.md`](../engineering/api-contracts.md), [`security-model.md`](../engineering/security-model.md) |
| Flags and ship audit | [`../engineering/ship-status.md`](../engineering/ship-status.md) |

**Agent one-liner:** Read the bible → refuse if out of charter → implement only the next vertical slice.
