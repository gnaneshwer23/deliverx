# 10 — Deep Team Copilot / Professional Workspace

> **DESIGN-COMPLETE / BUILD-GATED**
>
> Thin Professional Workspace, contributions, consent controls, org structure and pilot admin remain shipped. The deep programme, delivery-health and executive-reporting designs below exceed current person-practice pilot depth and require separate founder build approval, enterprise permissions, operational ownership and data-quality validation. Team Copilot remains a Workspace alias, not a fourth SKU.

## Screen: Team Copilot overview

**Product area / Route / Primary user / Purpose:** Professional Workspace / `/workspace` / team member or delivery lead / orient work, decisions, risks and contributions around current priorities.
**Primary user question / Immediate understanding:** “What needs attention across my team’s work?” / Current work and contribution context are visible; observation state is explicit.
**Primary + secondary actions:** Open priority work; Record contribution; Review observation settings.
**Required data / source / permissions:** Org/project membership, tasks, decisions, risks, meetings, contributions, observation consent; org/project RLS.
**Layout:** Header / suite nav + Workspace local nav / attention list, active projects, contribution trail / consent and guidance context.
**Components:** AttentionList, ProjectSummary, ContributionTrail, ConsentStatus, ContextPanel.
**States:** Loading; Empty—create/join project under permission; Partial—source freshness labels; Success—contribution saved; Error—section retry; Permission denied—role-safe message.
**Desktop wireframe:** `Workspace local nav | attention + projects + contribution trail || consent + guidance`
**Mobile wireframe:** `Local tabs / attention / projects / contributions / consent disclosure`.
**Accessibility:** Dense views preserve reading order; status text; tables have mobile cards.
**Analytics events:** Canonical `collaboration_contribution`, `observation_consent_changed`; no private content.
**Acceptance criteria:** No capability from task completion; observation OFF is clear; AI drafts contextual; no mission-control claims.
**Related screens:** Programmes, Delivery health, Profile evidence.
**Cursor implementation notes:** Overview design may inform a separately approved thin evolution; deep aggregations remain gated.
**PROVISIONAL COPY:** **Professional Workspace.** Bring current work, decisions and contribution context together. AI can help in context; people remain responsible for decisions and submissions.

---

## Screen: Programmes

**Product area / Route / Primary user / Purpose:** Team Copilot / `/workspace/programmes` / programme lead / understand related projects, outcomes, dependencies and decisions.
**Primary user question / Immediate understanding:** “Which programme outcomes or dependencies need intervention?” / Programme structure and source freshness are visible without a magic health score.
**Primary + secondary actions:** Open at-risk dependency; Review programme outcome; Create/update programme if permitted.
**Required data / source / permissions:** Programmes, projects, workstreams, milestones, dependencies, decisions, benefits; org role + programme access; audited writes.
**Layout:** Header / Workspace nav / programme selector, outcome summary, dependency map/list, milestone exceptions / source/freshness context.
**Components:** ProgrammeSelector, OutcomeList, DependencyList, MilestoneExceptions, FreshnessPanel.
**States:** Loading; Empty—no programme access/create if admin; Partial—stale/missing project updates explicit; Success—save/audit; Error—retain edits; Permission denied—no programme detail leak.
**Desktop wireframe:** `Programme selector | outcomes | dependencies | exceptions || freshness / ownership`
**Mobile wireframe:** `Selector / outcomes / exception list / dependencies / source disclosure`.
**Accessibility:** Dependency graph always has ordered table alternative; no colour-only risk.
**Analytics events:** Proposed `programme_viewed`, `programme_exception_opened` after enterprise analytics approval; no programme names in third-party properties.
**Acceptance criteria:** No opaque programme score; data freshness/owner visible; writes audited; permissions proven.
**Related screens:** Delivery health, Executive reporting, project detail.
**Cursor implementation notes:** Build-gated; existing pre-pivot routes are not authorization or proof of coherent data.
**PROVISIONAL COPY:** **Programmes.** See related outcomes, milestones and dependencies in one governed view. Attention is based on named exceptions and source data—not an unexplained score.

---

## Screen: Delivery health

**Product area / Route / Primary user / Purpose:** Team Copilot / proposed `/workspace/delivery-health` / delivery lead / identify concrete flow, risk and dependency exceptions.
**Primary user question / Immediate understanding:** “Where is delivery becoming less predictable, and why?” / Named signals show trend, source, threshold and affected work.
**Primary + secondary actions:** Review exception; Assign follow-up; Open source work.
**Required data / source / permissions:** Milestones, blockers, RAID, task flow, releases, dependencies, freshness; project/org access; no PI person ranking.
**Layout:** Header / nav / exception summary, signal trends, blocked work, risk changes / definitions and source context.
**Components:** ExceptionList, SignalTrend, BlockedWork, RiskChanges, MetricDefinitionPanel.
**States:** Loading; Empty—“No current exceptions in available data”, not “healthy”; Partial—coverage/freshness warning; Success—follow-up saved; Error—per signal; Permission denied.
**Desktop wireframe:** `Exceptions | trend panels with text summary | blocked work || definitions/source/freshness`
**Mobile wireframe:** `Exceptions / signal cards / blocked work / definitions disclosure`.
**Accessibility:** Every chart has data table/text summary; thresholds described; status not colour-only.
**Analytics events:** Proposed `delivery_exception_viewed/actioned`; no team-member performance scoring.
**Acceptance criteria:** No single opaque health score; “no data” distinct from “no exception”; signals trace to source; no individual capability inference.
**Related screens:** Programmes, project RAID, Executive reporting.
**Cursor implementation notes:** Build-gated; requires metric definitions and data-quality acceptance before UI.
**PROVISIONAL COPY:** **Delivery health.** Review concrete changes in flow, risk and dependencies. Each signal explains its source, threshold and affected work.

---

## Screen: Executive reporting

**Product area / Route / Primary user / Purpose:** Team Copilot / `/workspace/executive` or `/workspace/reports` / executive sponsor / understand outcomes, exceptions and decisions without operational noise.
**Primary user question / Immediate understanding:** “What changed, what needs a decision and how reliable is this view?” / Outcome status, exceptions, decisions and data freshness are explicit.
**Primary + secondary actions:** Review decision request; Open source programme; Export approved report.
**Required data / source / permissions:** Programme outcomes, benefit measures, decisions, material risks, source timestamps; executive/org role; least privilege; export audit.
**Layout:** Header / nav / reporting period, outcomes, material exceptions, decision requests, change since last report / source and freshness context.
**Components:** PeriodSelector, OutcomeNarrative, MaterialExceptionList, DecisionRequests, ChangeSummary, ExportControl.
**States:** Loading; Empty—no approved reporting data; Partial—coverage warning; Success—report generated with timestamp; Error—no stale export represented as current; Permission denied.
**Desktop wireframe:** `Period | outcomes | material exceptions | decisions | changes || source coverage + export`
**Mobile wireframe:** `Period / outcome narratives / exceptions / decisions / coverage / export`.
**Accessibility:** Narratives precede charts; export has accessible document structure; date ranges explicit.
**Analytics events:** Proposed `executive_report_viewed/exported` in first-party audit; no sensitive report text in third-party analytics.
**Acceptance criteria:** No fabricated executive summary; AI summary labelled draft and requires human approval; report timestamp/source coverage visible; export permission/audit tested.
**Related screens:** Programmes, Delivery health, Decisions.
**Cursor implementation notes:** Build-gated enterprise depth. AI may draft from structured context but cannot publish autonomously.
**PROVISIONAL COPY:** **Executive reporting.** Review outcomes, material exceptions and decisions for the selected period. This view states its source coverage and freshness. Any AI-assisted narrative remains a draft until an authorised person approves it.

## Approval package required before build

1. Founder decision authorising exact deep surfaces without creating a fourth SKU.
2. Named enterprise personas and tenant/role matrix.
3. Canonical definitions for programme, outcome, dependency, exception and freshness.
4. Data-quality and “no data vs no issue” policy.
5. Audit/export policy and AI narrative approval workflow.
6. Smallest vertical slice recommendation: **Programmes exceptions list only**, not the four-screen suite.
