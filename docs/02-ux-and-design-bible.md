# 02 — UX & Design Bible

**Status:** Active UX governance  
**Audience:** Design, Engineering, Product, QA  
**Canonical detail:** [`architecture/06-user-experience-architecture.md`](./architecture/06-user-experience-architecture.md) · in-app `src/components/dx*` · `src/lib/dx-theme.ts`

---

## Design posture

Professional, calm, minimal. Enterprise clarity over consumer social energy.

- No emojis  
- No artificial gamification  
- No unexplained scores or decorative capability %  
- No excessive gradients or visual noise  
- AI is never the primary chrome; it is attached to a project, task, evidence item, or career objective  
- Every screen answers: **where am I / what matters / what next**

Align with existing calm professional UI already shipped — do not introduce a parallel design system.

---

## Navigation model (person journey)

Prefer journey over product silos:

| Area | Route(s) | Purpose |
| --- | --- | --- |
| Home / Hub | `/hub`, `/profile` | Orientation + next actions |
| Profile / PI | `/profile`, `/profile/evidence`, baseline/final | Who am I; evidence; judgements |
| Experience | `/experience/app`, `/start/experience` | Practice generating evidence |
| Workspace | `/workspace/*` | Collaborative work (Team Copilot alias) |
| Portfolio | `/portfolio`, share/attest tokens | Package + attestation |
| Launchpad | `/launchpad/app` | Career packaging / readiness |
| Learning | `/learning`, `/profile/learning` | Knowledge gaps → apply CTAs |
| Outcomes | `/career/outcomes` | Real-world calibration |
| Settings | `/settings/*` | Account, privacy, consent, developer |

Legacy Mission Control / Ecosystem nav is **demoted** (opt-in `NEXT_PUBLIC_DELIVERX_LEGACY_WORKSPACE_NAV`) — T7.

---

## Major screens — purpose & user questions

### Home / Profile

**Questions:** Who am I professionally? What should I do next? What evidence supports my claims?  
**Shows:** SnapshotClaims, next actions, framework pin context, notifications entry.  
**Must not:** Invent capability levels in the UI.

### Experience

**Questions:** What should I practice? Which company/scenario fits my gaps? What did I demonstrate today?  
**Shows:** Ranked plan, catalogue, sim state, contribution → evidence path.  
**Empty:** Explain how to start a plan; no fake progress.

### Workspace

**Questions:** What work is in flight? What did I contribute? Is observation on?  
**Shows:** Contributions, coach only under consent, contextual assistant.  
**Consent OFF:** No continuous observation; no surprise “verified” coaching.

### Portfolio

**Questions:** What can I share? What is attested? What is still private?  
**Shows:** Entries, evidence links, share/attest status, Verified only when earned.  
**Honesty:** Copy must not imply Verified without attestation (TD-011).

### Launchpad

**Questions:** Am I ready? What is ScoreRun vs heuristic? What artefact should I produce next?  
**Shows:** Readiness with `readinessSource` discrimination (`score_run` | `mixed` | `evidence_coverage_heuristic`).

### Learning

**Questions:** What knowledge gap blocks application? Where do I apply next?  
**Must not:** Show completion as competency or light Verified.

### Outcomes

**Questions:** What happened in the real world? How does that calibrate claims?  
**Must not:** Auto-upgrade ScoreRuns.

### Settings

**Questions:** Privacy, export/delete, observation consent, visibility defaults.  
**Critical:** Password re-auth + confirm phrase for delete (T1).

### Attestor portal (`/portfolio/attest/[token]`)

**Questions:** What claim am I confirming? Confirm or dispute?  
**Least privilege:** Claim summary only; no private evidence; no capability levels; no self-attest.

---

## Layout model

- Clear page title + one-line purpose  
- Primary next action above the fold when possible  
- Secondary metadata (framework pin, consent state, readiness source) visible but quiet  
- Prefer lists and structured claims over dashboards of unexplained KPIs  

---

## Components (behaviour contract)

For interactive components, specify:

| Concern | Expectation |
| --- | --- |
| Purpose | One job |
| Behaviour | Explicit success/failure |
| Loading | Skeleton or calm spinner; no fake data |
| Empty | Explain next step |
| Error | Recoverable message; no stack traces in UI |
| Responsive | Usable on mobile for person journey; dense workspace may scroll |
| A11y | Labels, focus order, keyboard submit, sufficient contrast |

### Patterns already in product

- **Why we ask** callouts (PI onboarding)  
- **Confidence bands / citations** over fake %  
- **Source labels** on readiness (`mixed`, heuristic)  
- **Verified badge** gated + kill-switchable  

---

## Copy rules

- No buzzwords (“AI-powered synergy”, “unlock your potential”)  
- No emoji  
- No unexplained scores  
- Prefer: “Based on N evidence items under framework pm-core@2026.1…”  
- Marketing and in-app Verified copy must match T8 meaning (attestation-only)  

## Motion / colour / type / whitespace

- Motion: purposeful transitions only (presence/hierarchy), not celebration gamification  
- Colour: existing DeliverX theme tokens (`dx-theme`); avoid purple-glow AI clichés on product surfaces  
- Type: existing brand fonts (`dx-fonts`); calm hierarchy  
- Whitespace: prefer breathing room over card stacks  

**Marketing** may use stronger brand atmosphere (see [`03-marketing-website.md`](./03-marketing-website.md)) but must not overclaim Verified or capability %.

---

## AI in the UI

- Bound to context objects  
- Show provenance when showing AI output  
- Draft interventions clearly labelled as drafts  
- Never present coach text as ledger evidence  

---

## Shipped reality

Profile, Experience app, Workspace, Portfolio (+ attest), Launchpad app, Learning, Outcomes, Settings privacy panels, and Hub are live. Treat this bible as the quality bar for changes — not a greenfield redesign mandate.
