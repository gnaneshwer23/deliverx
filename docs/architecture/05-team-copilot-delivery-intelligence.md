# 05 — Team Copilot / Delivery Intelligence

> **Product Bible:** Start at [`../README.md`](../README.md). This architecture extract is long-term vision — it does **not** authorize out-of-charter builds. Prefer bible chapters + Build Charter for what to build now.

> **Source:** Founder documentation extract (sections 00–07), edited into clean markdown for the DeliverX governance repo.

Team Copilot (Delivery Intelligence Platform)

*Version: 1.0*

*Status: Core Product Architecture*

*Depends On: Documents 00–04*

Referenced By: Enterprise Platform, Engineering, AI Architecture, Employer Platform


## Purpose

Team Copilot is DeliverX's collaborative delivery platform. Its purpose is to help multidisciplinary teams plan, collaborate, make decisions and deliver complex products while continuously generating organisational knowledge and professional evidence. Unlike Experience, which focuses on individual capability, Team Copilot focuses on collective capability.

**It answers:**

How do high-performing teams consistently deliver successful products?


## Vision

Team Copilot becomes the AI operating system for product delivery.

**It combines:**

- Human expertise
- AI specialists
- Organisational knowledge
- Delivery intelligence
- Professional Intelligence
into one collaborative workspace.

Philosophy Products are never built by one person. They are built by teams. Every decision depends on Communication Planning Leadership Trade-offs Execution Relationships Organisational context Team Copilot exists to improve those interactions.


## Platform Architecture

### Team Copilot

```
├── Delivery Intelligence
```

```
├── Collaboration Intelligence
```

```
├── Programme Intelligence
```

```
├── Decision Intelligence
```

```
├── Knowledge Intelligence
```

```
├── Portfolio Intelligence
```

```
└── Leadership Intelligence
```


## Delivery Intelligence

This becomes the core. It continuously understands Current work Upcoming work Dependencies Blockers Risks Decisions Progress Milestones Capacity Velocity Deadlines Delivery health Rather than simply displaying Jira issues, it understands how work is progressing.

Collaboration Intelligence This understands Who is working together. Examples Engineering Product QA Design Compliance Clinical Operations Finance Sales Marketing Customers Executives Every interaction updates Trust Communication Relationship quality Knowledge sharing Influence Cross-functional effectiveness

Programme Intelligence Projects never exist in isolation. Programme Intelligence understands Projects Programmes Roadmaps Initiatives Objectives Dependencies Funding Business goals Everything connects.

Decision Intelligence This is one of the biggest differentiators. Every important decision becomes organisational knowledge. Example

> "We decided not to integrate NHS Login."

The platform stores Decision Options considered

It combines:

- **Evidence**
Stakeholders Risks Outcome Owner Review date Impact Months later New team members immediately understand why the decision was made.


## Knowledge Intelligence

Every document. Every meeting. Every conversation. Every presentation. Every project. Every lesson learned. Everything becomes searchable organisational knowledge. Instead of Finding documents. Users ask

> "Why did we redesign onboarding?"

The AI explains.


## Portfolio Intelligence

Executives need Portfolio visibility. Not tasks. Portfolio Intelligence understands Programme health Investment Business value Risk Dependencies Capacity Benefits Delivery confidence Everything.

Leadership Intelligence This layer develops leaders. It measures Delegation Influence Coaching Strategic thinking Decision quality Executive communication Conflict management Transformation Organisational impact

Team Copilot Lifecycle Organisation

↓

Portfolio

↓

Programme

↓

Project

↓

Sprint

↓

Daily Work

↓

Meetings

↓

Decisions

↓

It combines:

- **Evidence**
↓

### Professional Intelligence

↓


## Organisation Intelligence

↓


## Delivery Intelligence

↓

Continuous Improvement

Daily Team Experience When someone logs in They shouldn't see Tasks. They should see Today. Example Morning Briefing Three meetings One blocker Two risks One document awaiting review Manager feedback Sprint health Customer issue Executive update AI recommendations Exactly like joining work.

AI Specialists Instead of One chatbot. Team Copilot contains specialists. Programme Director Project Manager Product Manager Business Analyst Engineering Manager Technical Architect Developer QA Lead UX Designer Scrum Master Clinical Lead Finance Partner Marketing Lead Sales Lead Customer Success Security Lead Compliance Officer Executive Sponsor Every AI owns Responsibilities Authority

It combines:

- **Knowledge**
Objectives Calendar Current workload Relationships Decision rights Communication style Professional memory

Meetings Meetings become first-class citizens. Examples Stand-up Sprint Planning Roadmap Review Discovery Workshop Executive Steering Risk Review


## Architecture Review

Retrospective Customer Workshop One-to-One Project Closure Every meeting contains Agenda Participants Preparation Discussion Actions Decisions Risks Follow-ups Evidence generated

Decision Lifecycle Question

↓

Discussion

↓

It combines:

- **Evidence**
↓

Recommendation

↓

Decision

↓

Approval

↓

Implementation

↓

Outcome

↓

Review

↓

Knowledge Base This creates organisational memory.

Project Workspace Every project contains


## Vision

Objectives Business Case Roadmap Timeline Milestones Stakeholders Organisation Chart Requirements Architecture Risks Dependencies Meetings


## Documents

Deliverables Lessons Learned Professional Contributions AI Team Health Score Decision Timeline Everything.

Leadership Journey As professionals progress Their workspace evolves. Intern ↓ Project Coordinator ↓ Project Manager ↓ Programme Manager ↓ Portfolio Manager ↓ Director ↓ Chief Product Officer ↓ Chief Operating Officer Each level unlocks Greater authority Larger teams Higher budgets Executive meetings Transformation programmes

Relationship with Experience Experience develops Individuals. Team Copilot develops Teams. Experience answers Can you do the work? Team Copilot answers Can your organisation deliver successfully?

Relationship with Launchpad Launchpad opens opportunities. Team Copilot creates Leadership evidence. That evidence returns to Professional Intelligence.

Relationship with Professional Intelligence Every contribution Meeting Decision Presentation Leadership Mentoring Strategy Everything Updates Professional Intelligence.

Dashboard The Team Copilot dashboard answers What is happening? What needs my attention? What decisions are waiting? Which teams need help? Where are the risks? How healthy is delivery? What changed overnight? What should I do next?


## Design Principles

Team Copilot should always feel Calm Professional Collaborative Transparent Evidence-driven Executive Trustworthy Organised Human

Architecture

### Professional Intelligence

```
│
▼
Experience Platform
│
▼
Team Copilot
│
▼
Delivery Intelligence
│
┌────────┼─────────┐
│        │         │
▼        ▼         ▼
Knowledge Decisions Collaboration
│        │         │
└────────┼─────────┘
▼
Organisation Intelligence
│
▼
Professional Intelligence
Notice
```

Everything becomes one loop.


## Future Vision

I actually think Team Copilot has a much bigger future than we originally imagined. Version 1 supports simulated organisations. Version 2 supports hybrid teams where people work with AI colleagues. Version 3 supports real organisations using Team Copilot as their delivery operating system. Eventually, a professional could start in Experience, progress through Launchpad, and then use Team Copilot in their real employer without ever leaving the DeliverX ecosystem.

Architectural Decisions

**This document establishes several permanent decisions:**

- Team Copilot is the collaborative delivery environment, focused on organisational rather than individual capability.
- Delivery Intelligence is introduced as a fourth intelligence layer, complementing Professional Intelligence, Organisation Intelligence and Career Intelligence.
- Decisions become organisational assets, with every significant decision traceable through its context, evidence, stakeholders and outcomes.
- Meetings, collaboration and delivery are first-class entities, not just supporting features.
- AI specialists represent realistic organisational roles, each with defined authority, responsibilities and knowledge boundaries.
- Leadership capability is developed through delivery, with evidence flowing back into Professional Intelligence.
- The architecture supports both simulated organisations and future real-world enterprise adoption, allowing Team Copilot to evolve from a learning environment into a production collaboration platform.

---

## Shipped reality notes (synthesis)

> **Synthesized** from Professional Workspace + hypotheses decisions.

- Shipped surface is **Professional Workspace** (`/workspace`), with marketing alias Team Co-pilot → Professional Workspace.
- Workspace contributions + consent-gated observation/interventions exist; full enterprise delivery OS (programmes, portfolio intelligence, multi-tenant mission control) is **out of current Build Charter**.
- Founder decision still pending: merge vs retain third SKU vs sunset.
