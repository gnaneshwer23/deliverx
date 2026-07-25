# 07 — Intelligence Architecture

> **Product Bible:** Start at [`../README.md`](../README.md). This architecture extract is long-term vision — it does **not** authorize out-of-charter builds. Prefer bible chapters + Build Charter for what to build now.

> **Source:** Founder documentation extract (sections 00–07), edited into clean markdown for the DeliverX governance repo.


## Document control

- Version: 1.0
- Status: Core Platform Intelligence
- Depends On: Documents 00–06
- Referenced By: Every DeliverX Product


## Purpose

This document defines how DeliverX thinks.

**It explains:**

- what the platform understands
- how intelligence is created
- how intelligence is updated
- how recommendations are generated
- how AI uses intelligence
This document does not describe AI agents. It describes the intelligence layer that powers every product.


## The Intelligence Philosophy

DeliverX should never rely on a single AI model remembering everything. Instead, DeliverX builds multiple intelligence domains. Each intelligence domain owns one responsibility. Together they become the brain of DeliverX.


## DeliverX Intelligence Architecture

DeliverX Intelligence

```
──────────────────────────────────────────────────────────────
```

### Professional Intelligence


## Organisation Intelligence


## Career Intelligence


## Delivery Intelligence


## Knowledge Intelligence


## Evidence Intelligence


## Recommendation Intelligence


## Conversation Intelligence


## Learning Intelligence


## Portfolio Intelligence

```
──────────────────────────────────────────────────────────────
```


## AI Agent Layer

### Experience

### Launchpad

### Team Copilot

Notice AI sits below intelligence. Not above it.

Why This Matters AI changes. GPT changes. Claude changes. Gemini changes. Your intelligence layer should not. The platform owns the intelligence. LLMs simply reason over it.

Intelligence Lifecycle Every intelligence domain follows exactly the same lifecycle. Collect

↓

Validate

↓

Understand

↓

Connect

↓

Reason

↓

Recommend

↓

Learn

↓

Improve This makes every intelligence system consistent.

1 Professional Intelligence


## Purpose

Understand the professional. Knows

It combines:

- **Identity**
Goals

- **Capabilities**
- **Behaviours**
- **Evidence**
Growth Preferences Career Confidence Outputs


## Professional Profile

Capability Understanding Growth Understanding Career Understanding

2 Organisation Intelligence


## Purpose

Understand organisations. Knows Departments People Projects Products Culture Policies Processes Strategy Customers History Objectives Outputs Organisation Context Business Understanding Project Context Stakeholder Context

3 Career Intelligence


## Purpose

Understand careers. Knows Roles Industries Markets Employers Progression Salary Skills Demand Future Trends Outputs Career Recommendations Opportunity Matching Development Plans

4 Delivery Intelligence


## Purpose

Understand delivery. Knows Projects Programmes Portfolios Milestones Risks Dependencies Capacity Resources Meetings Delivery Health Outputs Delivery Recommendations Risk Analysis Programme Insights Leadership Support

5 Knowledge Intelligence


## Purpose

Understand organisational knowledge. Knows


## Documents

Policies Meetings Architecture Research Processes Templates Decisions Standards Everything searchable. Outputs Knowledge Search Knowledge Summaries Context Reasoning

6 Evidence Intelligence


## Purpose

Understand evidence. Knows Evidence Quality Evidence Confidence Evidence Authenticity Evidence Sources Evidence History Evidence Relationships Outputs Capability Confidence Trust Evidence Verification Portfolio Assets

7 Recommendation Intelligence


## Purpose

Decide What happens next. Knows

### Professional Intelligence


## Career Intelligence


## Organisation Intelligence


## Delivery Intelligence


## Learning Intelligence


## Evidence Intelligence

Produces Next Best Action Recommendations Priorities Career Advice Experience Suggestions Interview Suggestions Learning Suggestions Everything.

8 Conversation Intelligence


## Purpose

Maintain context. Knows Conversation History Professional Context Projects Current Goals Current Experience Relationships Preferred Communication Outputs Natural Conversations Context Awareness Continuity

9 Learning Intelligence


## Purpose

Understand learning. Knows

It combines:

- **Knowledge**
Retention Application Weaknesses Learning Style Learning Velocity Outputs Learning Recommendations Practice Opportunities Knowledge Validation

10 Portfolio Intelligence


## Purpose

Understand professional work. Knows Projects Achievements

It combines:

- **Evidence**
Presentations


## Documents

Leadership Publications Open Source Patents Research Outputs Portfolio CV Case Studies


## Professional Profile

Employer Reports

Intelligence Relationships Every intelligence talks to every other intelligence.

### Professional Intelligence

```
▲
```

```
Evidence Intelligence ◄────────► Learning Intelligence
```

```
▲                            ▲
```

```
│                            │
```

Portfolio Intelligence       Career Intelligence

```
▲                            ▲
```

```
│                            │
```

```
Organisation Intelligence ◄──► Delivery Intelligence
```

```
▲
```


## Recommendation Intelligence

```
▲
```


## Conversation Intelligence

Nothing exists independently.

Recommendation Flow Every recommendation follows the same pipeline. Professional Context

↓

Current Goal

↓

Available Evidence

↓

It combines:

- **Knowledge**
↓

Organisation Context

↓

Career Context

↓

Delivery Context

↓

Reasoning

↓

Recommendation

↓

Explanation

↓

User Decision

↓

Learning Recommendations are transparent and traceable.

Intelligence Quality Framework

**Every intelligence domain is evaluated on:**

Accuracy Is it correct?

Completeness Does it have enough information?

Freshness Is it current?

Confidence How reliable is it?


## Explainability

Can it justify itself?

Privacy Should this information be visible?

Ownership Who owns this information?

Intelligence Governance

**Each intelligence domain has:**

Owner


## Purpose

Inputs Outputs Consumers Update Rules Privacy Rules Confidence Rules Version This allows every intelligence service to evolve independently.

How AI Uses Intelligence Important. AI never owns information. AI consumes intelligence. Example Career Coach AI Reads

### Professional Intelligence


## Career Intelligence


## Learning Intelligence


## Recommendation Intelligence

Produces Career Advice. It never stores career knowledge itself. Exactly the same applies to every AI.


## Design Principles

**Every intelligence domain should be:**

Independent Composable Explainable Traceable Observable Versioned Auditable Privacy-aware Reusable

Architecture Intelligence Layer

```
────────────────────────────────────────────
```

### Professional Intelligence


## Organisation Intelligence


## Career Intelligence


## Delivery Intelligence


## Knowledge Intelligence


## Evidence Intelligence


## Learning Intelligence


## Portfolio Intelligence


## Conversation Intelligence


## Recommendation Intelligence

```
────────────────────────────────────────────
```

Shared Knowledge Graph

```
────────────────────────────────────────────
```


## AI Agent Layer

```
────────────────────────────────────────────
```

Career Coach

Manager

Recruiter

HR

Product Manager

QA

Engineer

Observer

Judge

Mentor

Customer

Executive

```
────────────────────────────────────────────
```

Product Layer

```
────────────────────────────────────────────
```

### Experience

### Launchpad

### Team Copilot

**This creates a clean separation:**

- Intelligence Layer — what the platform knows.
- AI Agent Layer — who reasons with that knowledge.
- Product Layer — where users interact with it.
Architectural Decisions This document establishes the following permanent decisions:

- DeliverX is an intelligence-first platform, not an AI-first platform.
- Intelligence domains are independent services with clearly defined responsibilities, inputs, outputs and governance.
- AI agents never own business knowledge; they consume intelligence and generate interactions.
- Recommendations are generated through multiple intelligence domains, ensuring they are explainable and evidence-backed.
- Every intelligence domain follows a common lifecycle (Collect → Validate → Understand → Connect → Reason → Recommend → Learn → Improve), making the platform consistent and extensible.
- The Intelligence Layer is reusable across all products, enabling Experience, Launchpad and Team Copilot to evolve without duplicating logic.
A major architectural improvement After completing the first seven documents, I think DeliverX has evolved beyond being just a product. It now resembles a layered operating system. I would formalise this by introducing a five-layer platform architecture that every future document must follow: Layer 5  Experience Layer Experience • Launchpad • Team Copilot

```
────────────────────────────────────────
```

Layer 4  AI Agent Layer Career Coach • Manager • Recruiter • Observer • Judge • Executive

```
────────────────────────────────────────
```

Layer 3  Intelligence Layer Professional • Organisation • Career • Delivery • Knowledge • Evidence • Recommendation • Learning • Portfolio • Conversation

```
────────────────────────────────────────
```

Layer 2  Platform Services Identity • Events • Notifications • Search • Analytics • Security • Integrations • Workflow • Files • Permissions

```
────────────────────────────────────────
```

Layer 1  Foundation Infrastructure • Databases • Knowledge Graph • Vector Store • APIs • Storage • Monitoring This layered architecture becomes the permanent blueprint for engineering. It clearly separates infrastructure, platform capabilities, intelligence, AI behaviour and user-facing experiences, making DeliverX easier to build, scale and maintain while staying aligned with the vision established in the earlier documents.

---

## Shipped reality notes (synthesis)

> **Synthesized** from desktop doc review + modular monolith.

- Treat the ten intelligence domains as **ownership/taxonomy boundaries**, not as independently deployed microservices.
- Platform intelligence today lives in typed domain modules under `src/lib/*` (evidence-ledger, capability-engine, learning-intelligence, career-intelligence, etc.) inside a Next.js + Supabase modular monolith.
- LLMs assist over structured context; chat history is not the primary database.
