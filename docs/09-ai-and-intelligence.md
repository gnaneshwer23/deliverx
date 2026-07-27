# 09 — AI & Intelligence (PRD)

**Status:** Implementation-ready · **intelligence SoT shipped; AI orchestration trust layer shipped (T4)**  
**Canonical detail:** [`architecture/07-intelligence-architecture.md`](./architecture/07-intelligence-architecture.md) · `src/lib/ai-orchestration/`

---

## Purpose

DeliverX owns intelligence in structured domains. AI agents sit **below** intelligence: they consume typed context and produce explainable assistance. The platform must still work if a model vendor changes.

## User story

As a user, I want AI coaching and observation that cite context and never pretend to be verified evidence or capability scores.

## Business rules

1. Intelligence belongs to the platform, not the LLM  
2. Do not use chat history as the primary database  
3. AI never fabricates evidence; never writes Capability Engine state  
4. Observation drafts require consent + confirmation for consequential actions  
5. Prompt versions and interactions are auditable (cost/latency/provenance)  
6. Ten “intelligence domains” are **taxonomy**, not microservices  
7. **Citation requirement:** any material observation, recommendation, or organisation/project claim must cite structured context supplied to that `runAgent` run; missing/invalid citations fail validation and use a deterministic “insufficient evidence/context” fallback — never silently publish an unsupported claim  

---

## Shipped modules

| Piece | Location |
| --- | --- |
| Orchestration | `src/lib/ai-orchestration` — agents, prompt versions, `runAgent`, guardrails, **citations** |
| Citations | `citations.ts` — policy matrix, `enforceCitations`, structured `AiCitation` |
| Schema | `ai_agents`, `ai_prompt_versions`, `ai_interactions` (`0090`); usage rollup `pi_ai_usage_daily` — **no new migration for citations** (JSON fields) |
| API | `GET /api/pi/ai/interactions` |
| Agents | Manager / Stakeholder / Observer + consolidated coaches (prompt **v2** citation-aware) |
| UI | `AiCitationStrip` on PI interventions, Interview Lab, opportunity matching, recommendations |
| Legacy AI | Pre-pivot `/api/ai/*` — may remain; bypass flag `DELIVERX_AI_ORCHESTRATION_BYPASS=1` for legacy only outside production |

---

## UI states

| State | Behaviour |
| --- | --- |
| Agent running | Calm progress; no fake “verified” chips |
| Guardrail block | Explain refusal (injection / authority) |
| Citation fail | Honest insufficient-evidence fallback; uncited labelled in UI |
| Interaction log | User can list own interactions |
| Consent OFF | Observer paths idle |

---

## API / validation / permissions

- Authenticated read of own `ai_interactions`  
- Platform catalogue agents/prompts: authenticated read; no client writes  
- Append-only interactions (purge bypass for T1 delete)  
- Citation failures logged as `validation_failed` with `invalid_output` / citation flags  

## Events

Usage/cost logging per `runAgent`; privacy export includes interactions.

## AI behaviour (normative)

| Allowed | Forbidden |
| --- | --- |
| Coach, challenge, summarize, draft | Fabricate ledger evidence |
| Explain recommendations with **required** citations | Silent capability persist |
| Propose interventions as drafts | Light Verified |
| Bound to project/task/evidence/objective | Free-floating chatbot as SoT |
| Fail closed when citations missing/unknown | Publish uncited material claims |

---

## Acceptance criteria

- [x] Guardrail tests cover injection + authority boundaries  
- [x] No agent path writes ScoreRuns  
- [x] Interactions recorded with provenance fields  
- [x] UI labels AI drafts clearly  
- [x] Citation required for material outputs; fabricated source ids rejected  
- [x] Deterministic non-claiming fallback on citation failure  

## Edge cases

- Model outage: fail soft; do not invent scores  
- Bypass flag must not be enabled in pilot prod for PI paths  
- Empty citable sources: agent must not assert a professional fact  

---

## Aspirational

Full multi-domain intelligence fabric + agent swarms. Deferred; prefer modular monolith + typed contracts.
