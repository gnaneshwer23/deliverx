# Phase 7 — Privacy audit

**Date:** 2026-07-25  
**Scope:** Person PI consent, confidentiality, export/delete, attestation PII, AI data exposure  
**Not claimed:** GDPR/CCPA legal compliance opinion

---

## Executive verdict

Pilot privacy design is coherent: **observation consent defaults OFF**, evidence **private by default**, public/attestor views are least-privilege by intent, and T1 export/delete exists with re-auth + confirmation phrase. Residual risks: **broad RLS allowing users to rewrite trust metadata**, **privacy tombstones retained by design**, **pre-pivot org/delivery data outside person purge**, and **AI context potentially containing professional content** sent to model providers.

---

## Data classes

| Class | Examples | Default access |
| --- | --- | --- |
| Account | email/auth | Supabase Auth |
| Professional profile | onboarding, career prefs | Self |
| Evidence ledger | `pi_evidence_*` | Self; confidentiality enum private default |
| Observations | `workspace_observations` | Self; gated by consent in app **and DB** (`0096`) |
| Capability | ScoreRuns / judgements | Self |
| Artefacts | versions + content | Self; private default |
| Portfolio / claims | `vpp_*` | Self; share tokens filtered |
| Attestation | attestor email/name minimal | Request owner; not on public share |
| AI logs | `ai_interactions` hashes/content | Self |
| Notifications | `pi_notifications` | Self; no client DELETE |
| Org structure | departments/teams | Org members |
| Framework catalogue | `pi_cf_*` | Authenticated read of published |

---

## Consent & observation

- Missing `pi_observation_consent` row ⇒ **denied** (`consent.ts` + `0096` INSERT triggers)  
- Column default `consented=false` (`0080`)  
- Revoke stops new observation; does not rewrite ledger history (documented)  
- Closed: DB enforces consent on insert (DB-P1-01 / `0096`)

---

## Export & deletion (T1)

| Control | Status |
| --- | --- |
| `POST/GET /api/pi/privacy/export` | Implemented; authenticated |
| `POST /api/pi/privacy/delete` | Password re-auth + phrase `DELETE_MY_PI_DATA` |
| Purge RPC | `service_role` only (0089/0092 verified) |
| Cascade | Person PI + artefacts + AI interactions + notifications + memberships + attestation rows (per cascade map / migrations through 0094) |
| Retained | `pi_cf_*`; privacy request tombstones; AI agent/prompt catalogue |
| Unauth delete | 401 |

**Residue:** tombstones intentional; pre-PI delivery/org tables may retain user-linked rows if not in cascade — track as residual (DB-P2-04).

---

## Sharing & attestation

- Public portfolio strips private/confidential evidence (product + T6)  
- Attestor token: claim summary only; no capability levels; self-attest rejected in app  
- `deliverxVerified` kill switch `DELIVERX_VERIFIED_BADGE`  
- **Integrity issue:** user JWT could still set attestation columns if calling PostgREST (SEC-P0-01) — privacy *and* honesty impact

---

## AI data exposure

- T4 sends structured org/project context + user message to model provider  
- Prompt forbids treating org JSON as instructions  
- Interaction log stores hashes + metrics; full prompt retention policy should stay minimal  
- Bypass path may send content without T4 logging guarantees  

---

## Cross-user / admin

- Person tables: self RLS  
- Review admin: elevated; uses admin client after role check  
- Org admins (`pm`/`executive`) manage departments/teams — not person evidence  

---

## Logging & sensitive professional info

- Prefer evidence ids over raw content in UI recommendations  
- Avoid logging passwords / API keys (injection patterns block some exfil attempts in user text)  
- Advisor: enable leaked-password protection (TD-006)

---

## Privacy findings

| ID | Sev | Finding | Disposition |
| --- | --- | --- | --- |
| PRIV-P0-01 | P0 | Trust-metadata self-write undermines “Verified” meaning for third parties | Same as SEC/DB-P0-02 |
| PRIV-P1-01 | P1 | Observation consent app-only | **Closed (`0096`)** — INSERT triggers + no service-role bypass |
| PRIV-P1-02 | P1 | TD-006 weak passwords | Founder |
| PRIV-P2-01 | P2 | Tombstones + pre-pivot residue | Document retention; expand cascade if needed |
| PRIV-P2-02 | P2 | Model provider sees professional context | DPA/ops; minimise payloads |
| PRIV-OK-01 | Info | Consent default OFF; private default; purge locked; export exists | Hold |

---

## Could not test live

- Authenticated cross-user Supabase queries with two real JWTs  
- Full privacy purge end-to-end against a disposable prod user (mutating)  
- Attestor email delivery / token entropy live  
- Exact model provider payload capture  

These were evaluated via migrations, grants, RLS policies, and prior T6 evidence instead.
