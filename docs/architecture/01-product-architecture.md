# 01 — Product Architecture

> **Source:** Founder documentation extract (sections 00–07), edited into clean markdown for the DeliverX governance repo.


## Document control

- Version: 1.0
- Status: Foundation Architecture
- Depends on: Document 00 – DeliverX Foundation
- Audience: Product, Engineering, UX, QA, AI Engineering, Leadership


## Purpose

This document defines the complete product architecture of DeliverX.

**It explains:**

- how every product connects
- how data flows
- how users move through the platform
- how Professional Intelligence powers every experience
- how Experience, Launchpad and Team Copilot work together
This document intentionally does not describe UI design or technical implementation. It defines the product itself.


## The DeliverX Ecosystem

DeliverX is one platform composed of four integrated experiences. DeliverX

```
┌────────────────┼────────────────┐
```

```
▼                ▼                ▼
```

Professional        Experience      Career Growth

```
Intelligence                           │
```

```
│                               │
```

```
└──────────────┬────────────────┘
```

```
▼
```

### Launchpad

```
▼
```

### Team Copilot

These are not separate products. They are connected experiences built around one Professional Intelligence Profile.


## The Core Philosophy

Every action performed by a user must satisfy one of two purposes.


## Generate Professional Intelligence

or Use Professional Intelligence Nothing else exists. Everything either creates intelligence or consumes it.

### Professional Intelligence

Professional Intelligence is the permanent professional profile. Everything contributes to it. It contains


## Professional Identity

It combines:

- **Career Goals**
- **Knowledge**
- **Evidence**
- **Capabilities**
- **Competencies**
- **Behaviours**
- **Professional Reputation**
Professional Network

- **Career Readiness**
Career History Growth Timeline Professional Preferences AI Coaching History Manager Feedback Peer Feedback Portfolio Employment History Simulation History Everything. It is never recreated. It continuously evolves.


## Product Architecture

DeliverX consists of four engines. DeliverX Platform

```
────────────────────────────────────────────────
```

Professional Intelligence Engine

```
────────────────────────────────────────────────
```

Experience Engine

```
────────────────────────────────────────────────
```

Launchpad Engine

```
────────────────────────────────────────────────
```

Team Copilot Engine Each engine owns one responsibility.

Engine One

### Professional Intelligence


## Purpose

Understand the professional. Never teach. Never hire. Never simulate. Simply understand. Responsibilities


## Professional Identity

It combines:

- **Evidence**
Capability Professional Graph Growth Recommendations


## Career Intelligence

Confidence Decision Engine Outputs Updated Professional Intelligence Profile

- **Career Readiness**
Learning Priorities Experience Recommendations Career Recommendations

Engine Two

### Experience


## Purpose

Develop professional capability. Everything inside Experience exists to generate evidence. Major modules Professional Onboarding Learning Validation Baseline Assessment Company Selection Employment Projects Meetings Stakeholders


## Documents

Deliverables Observation Reflection Performance Review Progression Outputs

It combines:

- **Evidence**
- **Capabilities**
- **Behaviours**
Professional Growth Professional Intelligence Updates

Engine Three

### Launchpad


## Purpose

Convert capability into career opportunities. Major modules Career Discovery Role Matching Portfolio CV Builder Application Tracking


## Interview Preparation

Company Research


## Networking

Salary Insights Offer Management Career Planning Outputs Career Opportunities Applications Professional Branding Career Progression

Engine Four

### Team Copilot


## Purpose

Develop advanced organisational capability. Users move from individual contributor to leader. Major modules Programme Management Cross-functional Collaboration Leadership Transformation Portfolio Management Executive Meetings Strategy Mentoring Organisational Change Outputs


## Leadership Evidence

Organisational Capability Executive Decision Making Professional Intelligence Updates

The User Journey Every user follows one lifecycle.


## Professional Identity

↓

### Professional Intelligence

↓

Career Goal

↓

Learning

↓

Knowledge Validation

↓

Capability Assessment

↓

### Experience

↓

Projects

↓

It combines:

- **Evidence**
↓

### Professional Intelligence

↓

### Launchpad

↓

Employment

↓

### Team Copilot

↓

Leadership

↓

### Professional Intelligence

↓

Career Growth

↓

Repeat Notice Professional Intelligence appears multiple times. Everything returns there.

Product Lifecycle DeliverX never ends. The user continuously moves through cycles. Understand

↓

Develop

↓

Demonstrate

↓

Evaluate

↓

Progress

↓

Lead

↓

Repeat Not Learn ↓ Interview ↓ Finished

Information Flow Information flows in one direction. Learning

Projects

Meetings


## Documents

Feedback

Assessments

↓

Evidence Engine

↓

Capability Engine

↓

### Professional Intelligence

↓

Recommendations

↓

### Experience

↓

Career

↓

Professional Growth Professional Intelligence is always the source of truth.

Product Relationships

### Professional Intelligence

```
├── Experience
```

```
│      │
```

```
│      ├── Projects
```

```
│      ├── Meetings
```

```
│      ├── Documents
```

```
│      ├── Assessments
```

```
│      └── Observation
```

```
├── Launchpad
```

```
│      │
```

```
│      ├── CV
```

```
│      ├── Portfolio
```

```
│      ├── Jobs
```

```
│      ├── Networking
```

```
│      └── Interviews
```

```
└── Team Copilot
```

```
├── Teams
```

```
├── Strategy
```

```
├── Leadership
```

```
├── Programmes
```

```
└── Portfolio Delivery
```

Platform States Every user is always in one professional state. Examples Explorer Learning Career Ready Interviewing Employee Contributor Professional Senior Leader Mentor Career Transition The platform behaves differently depending on the current state.


## AI Architecture Overview

DeliverX AI consists of specialised AI roles. Career Director Professional Coach Recruiter Hiring Manager HR Manager Engineer Designer QA Stakeholder Observer Judge Verifier Meeting Facilitator Every AI has Knowledge Boundaries Memory Responsibilities Decision Authority Professional Context Communication Style


## Product Principles

Every feature must satisfy at least one. Generate evidence. Improve Professional Intelligence. Improve professional capability. Improve career outcomes. Improve organisational capability. Everything else is noise.

Success Criteria

**The platform succeeds when a professional can answer:**

Who am I? What can I prove? How have I grown? What should I do next? What opportunities fit me? How do I become better?


## Future Architecture

The architecture has been intentionally designed to evolve.

### Stage 1

### Professional Intelligence

↓

### Stage 2

### Experience

↓

### Stage 3

### Launchpad

↓

### Stage 4

### Team Copilot

↓

### Stage 5

Enterprise Organisations ↓

### Stage 6

Real Companies ↓

### Stage 7

Professional Operating System No architectural redesign should be required to reach later stages.

Decisions Made in Document 01 This document establishes several permanent architectural decisions that later documents should inherit:

- Professional Intelligence is the platform core and the single source of truth for every user's professional development.
- Experience, Launchpad and Team Copilot are integrated experiences, not independent products.
- Every feature must either generate Professional Intelligence or consume it. Features that do neither should not be added.
- The platform is lifecycle-driven, supporting professionals from early learning through leadership and career transitions.
- AI roles are domain-specific, with clearly defined responsibilities and knowledge boundaries rather than a single general-purpose assistant.
- Architecture is designed for staged evolution, allowing a focused v1 (as defined in your Build Charter) while supporting the broader long-term vision without major redesign.

---

## Shipped reality notes (synthesis)

> **Synthesized** from shipped product surfaces + desktop doc review.

- Public marketing presents **three user products** (Experience, Launchpad, Professional Workspace / Team Copilot alias) with **Professional Intelligence as the shared core** — not a separately sold fourth SKU.
- Near-term loop shipped: Profile → baseline (opt-in) → Experience plan (12 companies) → Workspace observation (consent) → final/transfer → Learning → real-world outcomes.
- Full Team Copilot enterprise delivery OS and Launchpad opportunity marketplace remain **deferred** relative to this architecture doc.
