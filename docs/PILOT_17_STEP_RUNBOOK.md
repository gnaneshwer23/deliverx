# Pilot 17-step runbook

Manual checklist for proving DeliverX end-to-end before a pilot. Derived from the [17 acceptance criteria](./CURSOR_IMPLEMENTATION.md#17-acceptance-criteria--scorecard) and mirrored by:

- **Vitest harness:** `npm run test:acceptance` (`e2e/acceptance-17-step.test.ts`)
- **Browser smoke:** `npm run test:smoke` ([E2E_SMOKE.md](./E2E_SMOKE.md))
- **Browser acceptance (17 AC):** `npm run test:e2e:acceptance` ([E2E.md](./E2E.md))

Use a real Supabase project, seeded org, and test accounts. Record pass/fail and screenshots for each step.

---

## Prerequisites

- [ ] Local or preview env passes [env-checklist.md](./env-checklist.md)
- [ ] `INVITE_JWT_SECRET` set (Production + Preview when testing invites)
- [ ] PM test account created
- [ ] Optional: BA, Engineer, Executive test accounts for join flows

---

## 17-step checklist

| Step | Criterion | How to verify | Pass |
|------|-----------|---------------|:----:|
| 1 | PM creates project + uploads BC | `/project/new` → upload business case → GO accepted | ☐ |
| 2 | AI extracts reqs, gaps, objectives, risks | PM mission / AI Review Queue shows structured extraction | ☐ |
| 3 | PM generates BA invite | pm-mission invite section or `/api/invites/generate` | ☐ |
| 4 | BA clicks link, registers, lands in workspace | `/join?token=…` → signup/login → BA mission control | ☐ |
| 5 | BA workspace from real BC (not demo) | `/workspace/ba` requirements register populated from BC | ☐ |
| 6 | BA accepts req → PM feed updates | Accept requirement → PM signal / impact feed within ~10s | ☐ |
| 7 | BA “Share with PM” → PM summary | BA handoff / signal visible on PM dashboard | ☐ |
| 8 | PM invites all 6 roles | Generate-all invites on pm-mission | ☐ |
| 9 | Engineer joins → seeded workspace | Engineer `/join` → bootstrap checklist / mission home | ☐ |
| 10 | PM uploads standup | `/project/[id]/meetings` — paste transcript or Whisper audio | ☐ |
| 11 | Speaker transcript + tasks | Meeting review shows speaker blocks + queued proposals | ☐ |
| 12 | PM approves all tasks | Approve all on meeting review → proposals applied | ☐ |
| 13 | Tasks on member dashboards | Standup tasks on persona mission dashboards | ☐ |
| 14 | PM generates Sponsor link | Executive invite with read-only view mode | ☐ |
| 15 | Sponsor read-only founder view | `/workspace/founder` — no write actions | ☐ |
| 16 | Copilot answers from live data | Ask Helm on founder/PM mission — honest empty state or live answer | ☐ |
| 17 | Sponsor approves decision → PM notified | Decision centre approve → PM signal | ☐ |

---

## Playwright mapping

| Layer | Specs | Steps covered |
|-------|-------|---------------|
| Smoke (5) | `e2e/smoke/01`–`05` | Auth, invites, BA reqs, standup, sponsor |
| Acceptance (17) | `e2e/acceptance/ac-01`–`ac-17` | All criteria 1:1 — see [E2E.md](./E2E.md) |

Run automated browser tests first, then complete this runbook for full pilot sign-off.

---

## Sign-off

| Role | Name | Date | Notes |
|------|------|------|-------|
| PM pilot lead | | | |
| Engineering | | | |

**Target:** 17/17 pass in one live project with real team members (see [CURSOR_IMPLEMENTATION.md](./CURSOR_IMPLEMENTATION.md)).
