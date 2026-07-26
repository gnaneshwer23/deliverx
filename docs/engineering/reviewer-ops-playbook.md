# Human reviewer ops playbook (B4 / PACK-E5)

**Status:** Pilot ops · **non-Verified path**  
**Related:** FR-007 remainder · FLOW-REVIEWER · R-P2-09 · CX-04 · migration `0073_pi_review_challenge.sql`  
**Flag:** `DELIVERX_REVIEWER_QUEUE=on` (default off; rollback = unset / `off`)

---

## Purpose

Structured human review for disputes and submissions **without** pretending reviewers light `deliverxVerified`.

| Review can do | Review must not do |
| --- | --- |
| Accept / challenge findings | Light Verified badge |
| Add context or evidence references | Write Capability Engine levels |
| Uphold / revise / escalate cases | Treat ScoreRun alone as attestation |
| Request more evidence | Bypass consent or ledger append-only rules |
| Notify the subject on transitions | Invent parallel capability truth |

**Verified** remains **T8 external attestation only** (named third party + claim + evidence). Human review is an optional ops path for disputes — CX-04 modify.

---

## Surfaces

| Role | Route | API |
| --- | --- | --- |
| Subject (candidate) | `/pi/review` | `GET/POST /api/pi/review`, `GET/POST /api/pi/review/[id]` |
| Admin reviewer | `/pi/review/admin` | `GET/POST /api/pi/review/admin` |
| Notifications | Product inbox | Transitions emit via `src/lib/pi-review/notifications.ts` → T5 `pi_notifications` |

Admin access: developer metadata **or** org admin (`canAccessPiReviewAdmin`).

---

## Case lifecycle (summary)

```
pending_review
  → accept → accepted (closed)
  → add_context / correct_factual → user_context_added
  → challenge_judgement / request_reassessment → challenged
  → report_inappropriate → escalated_to_human_review

challenged / escalated / user_context_added / pending_review
  → start_review (admin) → under_review
  → uphold (admin, rationale required) → upheld (closed)
  → revise (admin, rationale; evidence if proposing level) → revised (closed signal; queues reassessment)
  → request_evidence → additional_evidence_required
  → escalate → escalated_to_human_review

revised → mark_reassessed → reassessed (closed)
closed statuses → reopen (admin) → pending_review
```

Events are **append-only** (`pi_review_events`). Cases hold projected status only. History is never overwritten.

---

## Decision rules for reviewers

1. **Rationale mandatory** for challenge, uphold, revise, escalate, report (min 8 characters).
2. **Evidence mandatory** when proposing a capability level change on revise / correct_factual.
3. **Revise ≠ write capability.** A proposed level is recorded on the event and signals reassessment; Capability Engine remains the only writer of levels.
4. **Never set Verified.** Payloads containing `deliverxVerified` / verified badge keys are rejected.
5. **AI / Observer drafts** may propose observations. The human decides. If the decision used an AI draft, mark `aiAssisted` and supply citation source ids (draft labels only — citations do not create evidence).
6. **SLA guidance** (priority → hours): urgent 24 · high 72 · normal 120 · low 336.

---

## Trust checklist (every decision)

- [ ] Rationale recorded (where required)
- [ ] Evidence ids attached if proposing a level change
- [ ] No Verified / capability write attempted in payload
- [ ] Subject notified via in-app notification on transition
- [ ] If AI-assisted: citations present; draft clearly treated as proposal

---

## Ops enablement

1. Confirm migration `0073` present (already on prod).
2. Set Vercel env `DELIVERX_REVIEWER_QUEUE=on` for Production (and Preview if needed).
3. Redeploy so the env is live.
4. Open `/pi/review/admin` as an admin reviewer and process challenged / escalated cases.
5. Rollback: set flag `off` or unset and redeploy — data retained; UI/APIs return `enabled: false`.

---

## Out of scope

- Replacing T8 attestation as the Verified path
- Employer marketplace review
- Payments / T9 enforce
- Treating learning completion as capability
- Seed / demo “sample finding” affordances on trust surfaces
