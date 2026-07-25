# 05 — Professional Intelligence (PRD)

**Status:** Implementation-ready · **largely shipped (P0–P7 + T1–T5, T8 gate)**  
**Canonical detail:** [`architecture/02-professional-intelligence.md`](./architecture/02-professional-intelligence.md) · [`engineering/data-model.md`](./engineering/data-model.md) · [`engineering/api-contracts.md`](./engineering/api-contracts.md)

---

## Purpose

Professional Intelligence is the permanent, evidence-backed model of a person’s capability. It never resets. Products read from and contribute to it — they do not fork parallel capability stores.

## User story

As a professional, I want an explainable record of what I have demonstrated (with evidence and confidence), so that recommendations and packaging are credible to me and to employers.

## Business rules

1. Evidence before claims  
2. Append-only ledger; provenance required  
3. Capability levels / ScoreRuns **only** via Capability Engine  
4. Frameworks versioned; pilot pin `pm-core@2026.1`  
5. SnapshotClaims are the shared claim projection  
6. Observation ≠ evidence ≠ capability  
7. Learning ≠ competency  
8. `deliverxVerified` requires external attestation (T8) — never ScoreRun alone  
9. Person data export/delete supported (T1); catalogue `pi_cf_*` never purged  

---

## Shipped modules (`src/lib`)

| Module | Role |
| --- | --- |
| `evidence-ledger` | Append, provenance, transitions, domain events |
| `capability-engine` | ScoreRuns, judgements, snapshots, SnapshotClaims, rubric resolve |
| `pi-assessment` | Baseline / final / transfer |
| `pi-profile` | Aggregate + next actions |
| `pi-onboarding` | Progressive onboarding sessions |
| `pi-review` | Challenge / review cases |
| `pi-privacy` | Export / purge cascade |
| `artefacts` | Versioned artefacts; evidence cites `artefact_version_id` |
| `admin-framework` | `pi_cf_*` lifecycle |
| `notifications` | Person inbox |
| `access` | Optional PI surface gates |

---

## UI states

| State | Behaviour |
| --- | --- |
| Empty ScoreRun | Show guidance + Experience CTA; optional labelled heuristic elsewhere — never fake levels |
| Thin evidence | Confidence bands / citations; gaps → planner |
| Consent missing | Observation denied |
| Review open | Inbox + review case UX |
| Privacy delete in progress | Clear status; irreversible warning |

Routes: `/profile`, `/profile/evidence`, `/profile/baseline`, `/profile/final`, `/pi/review`, `/settings/profile`.

---

## API contracts (real)

See full table in [`engineering/api-contracts.md`](./engineering/api-contracts.md).

Core: `GET /api/pi/profile` · `GET|POST /api/pi/evidence` · `GET|POST /api/pi/capability/run` · assessment `*/api/pi/assessment/*` · `GET|POST /api/pi/experience-plan` · consent / interventions / learning / growth-report / review · privacy · artefacts · notifications · `GET /api/pi/ai/interactions`.

Auth: session required → **401** anonymous.

---

## Validation & permissions

- Self-only RLS on person PI tables  
- Users cannot self-set `platform_verified` / external verification without attestation path  
- ScoreRun persist asserts published framework pin when DB required (T2)  
- Artefact evidence must cite immutable version id  

## Events

`pi_domain_events` for evidence lifecycle / privacy / related flows (monolith outbox — not a separate bus).

## AI behaviour

AI may draft interpretations / interventions under orchestration rules; never fabricates ledger evidence; never persists capability. See [`09-ai-and-intelligence.md`](./09-ai-and-intelligence.md).

---

## Acceptance criteria

- [ ] Append evidence creates provenance + transition history  
- [ ] Only engine persist writes ScoreRuns  
- [ ] SnapshotClaims consistent across Profile / Career / Portfolio  
- [ ] Learning/outcomes paths never call capability persist  
- [ ] Invariant tests green in `npm run test:pi`  

## Edge cases

- Cross-framework-version compare refused  
- Rubric `in_code_fallback` labelled when DB thin  
- Purge RPC service_role only; tombstones retained  

---

## Aspirational (architecture 02; not authorized now)

Full twelve-domain depth (behaviour/reputation graphs, employer platform, multi-profession). Treat as vision unless charter expands.
