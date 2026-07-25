# Phase 6 — AI quality & safety audit

**Date:** 2026-07-25  
**Scope:** T4 `src/lib/ai-orchestration/*`, migrations `0090`, related Experience/Workspace/Career coaches  
**Method:** Code review + unit-test posture; no live model spend against prod user data

---

## Executive verdict

The T4 orchestration layer is a **credible trust wrapper**: shared rules, prompt versioning, injection scan, authority boundaries, structured output validation, forced `mayWriteCapability=false`, interaction logging (cost/latency/provenance), and confirmation gates for consequential actions.

Residual risk is highest where **legacy delivery AI** can bypass orchestration, where **guardrails are pattern-based** (not semantic), and where **DB RLS** still allows humans to invent capability/Verified outside AI (see Phase 5) — AI is not the only threat to those invariants.

---

## Agent / workflow inventory

| Agent slug | Purpose | Model | Prompt location | Versioning | Context sources | Tools | Permissions | Memory | Structured output | Validation | Fallback | Cost/latency log | Human approval |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `line_manager` | Priorities / next actions for bound project | Default from `lib/ai/config` (Anthropic JSON path) | `prompt-registry.ts` `line_manager_briefing@v1` | Hash + DB `ai_prompt_versions` | Bound surface + org JSON + evidence citations | None (text/JSON only) | No capability / verified writes; confirmation required | Stateless per call | `line_manager_briefing_v1` | `validateAgentOutput` | Contract fallback | `ai_interactions` | Yes for consequential |
| `stakeholder` | Stakeholder pressure/questions | Same | `stakeholder_perspective@v1` | Same | Same | None | Same base authority | Stateless | `stakeholder_perspective_v1` | Same | Fallback | Same | Yes |
| `observer` | Draft observation only | Same | `observer_draft@v1` | Same | Consent-gated surfaces expected by callers | None | May draft observation; never evidence | Stateless | `observer_draft_v1` forces `isEvidence/isVerified=false` | Rejects true flags | Fallback | Same | Yes + human review flag |
| `experience_coach` | Sim coaching hint | Same / often deterministic engines primary | `experience_coach_hint@v1` | Same | Scenario context | None | Suggest only | Stateless | `coach_hint_v1` | Same | Fallback | Same | Soft (requiresConfirmation false) |
| `workspace_coach` | Delivery / Helm coach | Same | `workspace_coach_hint@v1` | Same | Project/org | None | Suggest only | Stateless | `coach_hint_v1` | Same | Fallback | Same | Soft |
| `interview_lab` | STAR rehearsal | Same | `interview_lab_hint@v1` | Same | Career evidence citations | None | Suggest only; no Verified invent | Stateless | `coach_hint_v1` | Same | Fallback | Same | Soft |

**Shared runner:** `runAgent` in `src/lib/ai-orchestration/run.ts` — guardrails → prompt → model → validate → `refusesUnstructuredCapabilityWrite` → log.

**Bypass:** `DELIVERX_AI_ORCHESTRATION_BYPASS=1` for legacy delivery AI only (documented).

---

## Safety scenario assessment

| Scenario | Assessment | Control |
| --- | --- | --- |
| Hallucination / fabricated company info | Possible if org JSON incomplete; prompts forbid invention; citations optional | Prompt rules + structured context framing (“untrusted facts”) |
| Unsupported capability claims | Output contracts force `mayWriteCapability=false`; runner refuses true flags | Strong on T4 path |
| Fabricated evidence / Verified | Observer contract forbids `isEvidence`/`isVerified`; interview prompt forbids Verified badge | Strong on T4 path; UI must not treat drafts as ledger |
| Prompt injection | Regex hard-blocks ignore-previous / reveal-system / exfil secrets / jailbreak | Bypassable with novel phrasing — **not complete** |
| Cross-user leakage | Context builder must be caller-scoped; interactions RLS self-only | Depends on callers passing only own context — review when wiring |
| Excessive confidence | Observer uses low/medium/high band; fallback forces low | Soft |
| Inconsistent / schema failure | Validators + fallbacks | Good |
| Stale context | No TTL; bound to request payload | Caller responsibility |
| Timeouts / API failure | Fallback output; should not write capability | Core ScoreRun path separate — failure shouldn’t break ledger append |
| Repeated requests | Logged per interaction; no server-side dedupe/rate limit in orchestration | Cost risk |
| Unsafe mutations | Runner does not call Capability Engine or attestation writers | Hold for `runAgent`; legacy paths TBD |

---

## Trust assertions (AI-specific)

| Assertion | Holds? |
| --- | --- |
| AI cannot create verified evidence via `runAgent` | **Yes** (contracts + no DB write to elevated status) |
| AI cannot modify capability without rules | **Yes** on T4 path; capability still writable by **user JWT** (Phase 5) |
| AI observations labelled | **Yes** in types/copy/contracts (`ai_authored`, draft flags) |
| Recommendations show rationale | **Partial** — fields exist; citations often empty |
| Consequential actions need confirmation | **Yes** when `requiresUserConfirmationForActions` + flags |
| Model/prompt provenance logged | **Yes** when persist not skipped |
| AI failure doesn’t break core workflow | **Mostly** — fallbacks; assessment/ScoreRun independent |

---

## Quality engineering notes

- Mock invoker + `orchestration.test.ts` cover injection blocks and contract refusals  
- T6 always-on gates include prompt-injection patterns  
- No live eval harness for hallucination rate / citation faithfulness in this audit  

See [`prompt-register.md`](./prompt-register.md), [`ai-risk-register.md`](./ai-risk-register.md)
