# AI risk register (Phase 6 + citation hardening)

**Date:** 2026-07-26

| ID | Sev | Risk | Evidence | Mitigation / disposition |
| --- | --- | --- | --- | --- |
| AI-P1-01 | P1 | Prompt-injection defenses are regex allow/deny lists; novel jailbreaks may pass | `guardrails.ts` `INJECTION_PATTERNS` | Expand patterns + structured content separation already present; add red-team suite |
| AI-P1-02 | P1 | Legacy AI paths with `DELIVERX_AI_ORCHESTRATION_BYPASS=1` skip T4 guarantees | `run.ts` `orchestrationBypassEnabled` | Keep bypass off in prod; migrate remaining callers |
| AI-P1-03 — **Closed** | P1 | Empty citations allowed — recommendations may appear evidence-backed without ids | Was coach/line_manager validators | **Shipped 2026-07-26:** `enforceCitations` requires ≥1 citation resolving to run context for all live contracts; missing/unknown → validation_failed + non-claiming fallback; UI `AiCitationStrip` |
| AI-P2-01 | P2 | Hallucinated company/project facts when context sparse | Prompt-only control | Fail closed via citation requirement + “insufficient context” fallback (partial close with AI-P1-03) |
| AI-P2-02 | P2 | No PI-level rate limit on `runAgent` / interactions insert | No rate-limit in `src/app/api/pi/**` | Reuse `org_ai_rate_limits` or per-user quota |
| AI-P2-03 | P2 | Cost estimates are heuristic token math, not provider billing | `usage-log.ts` | Label as estimate; reconcile later |
| AI-P2-04 | P2 | Soft confirmation on coach agents (`requiresConfirmation: false`) | Prompt registry coach templates | OK for hints; ensure no auto-mutations downstream |
| AI-P2-05 | P2 | Cross-user leakage if caller builds context from wrong user/project | Context builder trust boundary | Audit all production call sites; never accept client-supplied foreign userId without auth check |
| AI-OK-01 | Info | Observer cannot mark evidence/verified in validated output | `validateObserver` | Hold |
| AI-OK-02 | Info | Capability write refused even if model returns true flags | `refusesUnstructuredCapabilityWrite` + `applyBaseGuards` | Hold on T4 path |
| AI-OK-03 | Info | Interactions append-only + self RLS | `0090` triggers/policies | Hold |
| AI-OK-04 | Info | Citation enforcement against exact run context | `citations.ts` + `runAgent` | Hold — fabricated source ids rejected |

## Relationship to data integrity

Even a perfect AI layer cannot protect Verified/capability honesty while **PostgREST ALL policies** allow users to write ScoreRuns and attestation columns (DB-P0-01/02). Fix DB first — **Batch 1 / `0095` closed that class**.
