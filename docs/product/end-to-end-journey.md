# DeliverX End-to-End Journey

**Audience:** Founder, product team, new engineers  
**Status:** Orientation (not a Build Charter expansion)  
**As of:** 2026-09-10  
**Authority:** Follow the [source-of-truth hierarchy](../README.md#source-of-truth-hierarchy). This document **summarises** how DeliverX should work under the current charter. It does not authorise new scope.

When this narrative conflicts with other docs, prefer:

1. [Build Charter](./build-charter.md)  
2. [Current Scope](./current-scope.md)  
3. Product Bible (`docs/00`–`docs/15`)  
4. [Product Decisions](./product-decisions.md)  
5. Approved engineering detail (`docs/engineering/*`)  
6. Long-term architecture (`docs/architecture/*`) — aspirational where not marked shipped  
7. Existing implementation  

---

## 1. What DeliverX is

DeliverX is an **evidence-driven Professional Intelligence Platform**. It is not a learning platform, interview toy, portfolio app, or generic AI chat.

| Surface | Role under current charter |
| --- | --- |
| **Professional Intelligence (PI)** | Permanent, evidence-backed model of a person’s capability — shared source of truth |
| **Experience** | Where capability develops through realistic simulated professional work |
| **Launchpad** | Converts evidence into career packaging, readiness, and opportunity alignment |
| **Team Copilot** | Collaborative delivery — **alias of Professional Workspace**, not a third SKU |

Everything either **generates** Professional Intelligence or **consumes** it. Nothing else belongs.

```text
Experience ──► Evidence Ledger ──► Capability Engine ──► Profile / SnapshotClaims
Workspace / Team Copilot ──► Observation (consent) ─.     │
                                                     │     ├──► Launchpad / Portfolio
AI coaches / hiring panel ──► drafts only (not verified) ──┘
```

**Shipped reality (current charter):** Pilot loop **P0–P7**, technology **T0–T8**, six-doc **B1–B9**, Contextual Home, and Experience hiring interview slice 1 are shipped. **T9** commercial code is in-repo; **live payments stay off** until founder Stripe/Vercel ops. Long-term architecture (`docs/architecture/00`–`07`) may describe deeper OS visions; those do **not** authorise building outside the Build Charter.

---

## 2. Core model

### Knowledge vs evidence vs capability

| Concept | Meaning | Who writes it |
| --- | --- | --- |
| **Knowledge** | What someone has been exposed to (courses, reading, briefings) | Learning paths, self-report — **not** capability |
| **Evidence** | Observable proof with provenance supporting a claim | Evidence Ledger (append-oriented) |
| **Capability** | What someone has repeatedly demonstrated under a versioned framework | **Capability Engine only** (ScoreRuns / judgements) |

Self-reported onboarding answers, hiring-interview replies, and AI coach drafts are **claims or drafts**, not verified evidence and not capability levels.

### AI observations ≠ verified evidence

- AI may coach, challenge, observe, summarise, and explain.  
- AI never fabricates ledger evidence and never persists ScoreRuns.  
- Workspace observation requires explicit consent (**default OFF**). Observations and interventions remain drafts until a consented, consequential path promotes them.  
- Intelligence belongs to the platform (typed schemas, rubrics, ledger), not to chat history.

### Verified = attestation (not ScoreRun)

- `deliverxVerified` lights only when a claim is **`externally_attested`** and evidence strength is **`externally_verified`** (T8 tokenised attestor flow).  
- A ScoreRun, confidence band, Experience `platform_verified` heuristic, recommendation accept/dismiss, learning completion, or hiring-interview placement **never** lights Verified.  
- Kill switch: `DELIVERX_VERIFIED_BADGE=off` suppresses the badge even if attestation exists.

### ScoreRun ≠ Verified; bands ≠ decorative readiness %

- ScoreRuns pin a framework version (pilot: `pm-core@2026.1`) and declare `run_kind` (`standard` / `baseline` / `final` / `transfer`).  
- Confidence bands (`confidence-bands@2026.1`) are explainable (“Why this band”) — not a decorative readiness percentage sold as capability truth.  
- Career readiness may fall back to labelled heuristics (`evidence_coverage_heuristic` / `mixed`) when ScoreRun data is thin; labels must stay visible.

### Decision filter (refuse if any answer is no)

1. Does it strengthen Professional Intelligence?  
2. Does it generate or consume trustworthy evidence?  
3. Does it improve professional capability or career outcomes?  
4. Does it fit naturally within Experience, Launchpad, or Team Copilot / Workspace?  
5. Can it be explained clearly to a candidate and an employer?

---

## 3. Persona journeys (current charter)

### 3.1 Individual — account → PI orientation → path

**Shipped**

```text
Landing → Sign up / Login
  → Account / gateway onboarding (org / role as applicable)
  → PI onboarding (/onboarding/profile)
      welcome → identity → targets → strengths → evidence → working_style → review → path
  → Recommended Experience | Launchpad | Profile hub
```

- Eight-step conversation is the default (`DELIVERX_ONBOARDING_STEP_SET`; rollback `v1-six-step`).  
- Strengths, evidence posture, and working style are skippable and labelled **self-reported**.  
- Onboarding creates **no** ScoreRun, ledger evidence, or Verified status.  
- Baseline assessment is **opt-in** (not a mandatory gate before Experience).  
- Contextual Home / Daily Briefing on `/profile` orients the person to what matters next (journey states A–D).

### 3.2 Individual joining Experience (simulated employment)

**Chosen shape (PD-2026-09-10), shipped:**

```text
Profile → Goals → Baseline (opt-in) → WorkStyle → Offer
  → Hiring Interview (skippable) → Entry Ceremony → Dashboard / Day-1 sim work
```

| Step | What it is | What it is not |
| --- | --- | --- |
| **Planner / Offer** | Ranked scenarios from the 12-company catalogue; user accepts a simulated offer into generated `ExperienceSimState` | A real employment contract |
| **Hiring interview (slice 1)** | Skippable practice panel after offer accept, before ceremony. Highest-trust stakeholder + lowest-trust counterpart (MediFlow: Sarah Chen / CEO + James Wilson / Sales). Finish after 2 answers; auto-complete at 4. Placement note derived from role, company, project, first-week focus | A real hire, a capability score, Verified, or Launchpad Interview Lab |
| **Entry ceremony (B6)** | Narrative: company → role → team → project → first activity (from existing sim state). Skip allowed on every step | Scores, readiness %, ledger evidence, capability, Verified |
| **Dashboard / Day-1** | Simulated professional work; reflections and contributions can become ledger evidence **with provenance** when the person acts | Instant Verified or silent capability writes |

**Honesty copy (normative):** The hiring interview is **practice placement into a simulated company**, not a real hire, not a capability judgement, and not Verified. Ceremony copy must state that evidence is recorded only once the candidate acts inside the workspace.

**Flags:** `DELIVERX_XP_HIRING_INTERVIEW` and `DELIVERX_XP_ENTRY_CEREMONY` both **default on**; set `off` to roll back without redeploy. Legacy enrolments without `hiringInterview` are not trapped.

**Not in this slice:** SimulateCareer / academy theory curriculum as a required gate; role-brief or employed-work-with-AI-teammates follow-ups (unauthorized until asked).

### 3.3 Evidence → Capability → portfolio / Launchpad

**Shipped high-level path**

```text
Work (Experience sim / Workspace contributions / assessments)
  → Artefacts (immutable versions) + Evidence Ledger (provenance)
  → Capability Engine ScoreRun (framework-pinned judgements)
  → SnapshotClaims on Profile / Career / Portfolio
  → Launchpad packaging + optional external attestation (Verified)
  → Career outcomes / calibration (honest; no auto Verified)
```

- Evidence cites immutable `artefact_version_id` when packaging submissions.  
- Learning (P6) may create knowledge routes and “apply in Experience” CTAs — **never** capability persist.  
- Recommendations (B2) are next-action suggestions with lifecycle; accept/dismiss never mutates capability or Verified.  
- Portfolio is private by default; share views strip private evidence and attestor PII.  
- Attestation: owner requests → attestor confirms via token → ledger `external_verification` → Verified may light; dispute opens a review case.

**Aspirational (architecture, not authorised now):** Broad employer marketplace liquidity, bulk employer dashboards, multi-profession framework platforms.

### 3.4 Workspace / Team Copilot — collaborative delivery

**Shipped (bounded)**

```text
Professional Workspace (/workspace)
  → Contribute artefacts / decisions / meetings
  → Optional observation + coach interventions (consent OFF by default)
  → Org departments / teams (T7) for structure — never assign capability
  → Evidence into the same PI ledger when provenance allows
```

- In-app naming prefers **Professional Workspace**; marketing may say Team Copilot → Workspace.  
- Not a separately sold SKU under T9 packaging (Complete Journey includes Workspace; Workspace is not a fourth price).  
- Legacy Mission Control / Ecosystem nav is demoted (opt-in).  
- Pilot admin (`/settings/admin`) configures org/project structure under role + flag gates; it must never rewrite verified evidence or light Verified.

**Aspirational / deferred:** Enterprise mission-control depth, executive Team Copilot surfaces, first-class messages table.

---

## 4. Trust rails (never violate)

1. **Evidence before claims** — demonstrated work over self-declared skills.  
2. **Observation ≠ evidence ≠ capability** — keep the three separate in UI and persistence.  
3. **Append-only ledger** — no silent rewrite of evidence history; privacy purge is an explicit, audited exception.  
4. **Capability Engine–only writes** — UI, Learning, Experience ceremony/interview, recommendations, and org structure must not invent levels.  
5. **Frameworks versioned** — ScoreRuns pin `framework_version_id`.  
6. **Learning ≠ competency** — course completion does not assign capability or Verified.  
7. **Consent default OFF** — continuous Workspace observation is deny-by-default.  
8. **Verified = external attestation** — never ScoreRun alone; Experience heuristics never upgrade to external verification.  
9. **No unexplained scores** — every important band or readiness figure must be explainable; no decorative readiness % as capability truth.  
10. **AI below intelligence** — drafts labelled; citations required for material claims; chat is not the primary database.  
11. **Privacy / least privilege** — evidence private by default; person export/delete supported; catalogue frameworks never purged with person data.  
12. **No third SKU / marketplace / mission-control expansion** without founder approval beyond the bounded charter.

---

## 5. Kill-switches and flags that matter for Experience

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

Unset Experience ceremony/interview flags resolve to **on** in code (safe ship with rollback via env only).

---

## 6. Explicitly out of scope (this phase)

Do **not** treat the following as authorised work from this document:

| Out of scope | Notes |
| --- | --- |
| **SimulateCareer merge / theory gates** | Not imported; not a required gate before Experience work (PD-2026-09-10) |
| **Live Stripe / payments ops** | T9 code exists; **payments later** — founder configures Stripe + Vercel; do not invent eng work whose only goal is enabling Stripe without ask |
| **Employer marketplace liquidity** | No bulk employer accounts, networking scrape, or opportunity OS liquidity |
| **Third SKU / enterprise mission-control depth** | Team Copilot remains Workspace alias |
| **Multi-profession framework expansion** | Beyond thin `pm-core` pilot seed |
| **Speculative microservice splits** | “Ten intelligence domains” are taxonomy, not services |
| **Chat-as-database** | Structured PI entities remain SoT |
| **Lighting Verified from ScoreRun, ceremony, hiring interview, or learning** | Trust violation |
| **Optional later Experience slices** | Role brief, employed work with AI teammates — unauthorized until founder asks |

Long-term architecture may describe fuller Experience OS, delivery intelligence, or employer surfaces. Prefer Current Scope + Build Charter when deciding what to build **now**.

---

## 7. Where to go next

| Need | Document |
| --- | --- |
| What may be built now | [Build Charter](./build-charter.md) |
| What is shipped vs out of scope | [Current Scope](./current-scope.md) |
| Why / refuse filter | [Vision & Principles](../00-vision-and-principles.md) |
| PI / Experience / Launchpad / Workspace / AI detail | Bible `05`–`09` |
| Recorded decisions (incl. hiring interview) | [Product Decisions](./product-decisions.md) — see **PD-2026-09-10** |
| Schema / APIs / security | [`../engineering/data-model.md`](../engineering/data-model.md), [`api-contracts.md`](../engineering/api-contracts.md), [`security-model.md`](../engineering/security-model.md) |
| Flags and ship audit | [`../engineering/ship-status.md`](../engineering/ship-status.md) |
| Remaining work | [`../engineering/remaining-work.md`](../engineering/remaining-work.md) |

**Agent one-liner:** Read the bible → refuse if out of charter → implement only the next vertical slice.
