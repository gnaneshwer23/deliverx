# 03 — Experience Platform

> **Source:** Founder documentation extract (sections 00–07), edited into clean markdown for the DeliverX governance repo.


## Document control

- Version: 1.0
- Status: Core Product Architecture
- Depends On: Document 00 – Foundation, Document 01 – Product Architecture, Document 02 – Professional Intelligence
- Referenced By: Launchpad, Team Copilot, AI Architecture, Employer Platform, Engineering, UX


## Purpose

The Experience Platform is where Professional Intelligence grows. Its purpose is not to teach. Its purpose is not to assess. Its purpose is to create meaningful professional experiences that generate trustworthy evidence through authentic work. Professional Intelligence is the brain. Experience is the environment where that brain develops.


## Vision

Experience transforms learning into demonstrated capability.

**Instead of asking:**

> "Did the user finish the course?"

**Experience asks:**

> "What did the user actually demonstrate while solving realistic professional problems?"

Every interaction should contribute to professional growth.

Core Philosophy Experience should feel like joining a real organisation, not entering a training platform. The user is not a student. The user is a professional. Every task, meeting, conversation and decision exists because it mirrors work that happens in real organisations.

The Experience Ecosystem The Experience Platform is built from seven interconnected layers.


## Experience Platform

```
│
├── Professional Onboarding
├── Organisation Intelligence
├── Professional Work
├── Observation & Evidence
├── Reflection & Feedback
├── Growth Review
└── Professional Intelligence Update
```

Each layer feeds the next.

Experience Lifecycle Every experience follows the same lifecycle. Career Goal

```
│
▼
Experience Selection
│
▼
Professional Onboarding
│
▼
Organisation Context
│
▼
Professional Work
│
▼
Observation
│
▼
Evidence
│
▼
Reflection
│
▼
Growth Review
│
▼
Professional Intelligence
│
▼
Next Experience
```

Notice there is no "finish". Experience is continuous.

Layer 1 – Professional Onboarding The objective is to prepare the user for meaningful work.

**This includes:**

- understanding career goals
- reviewing existing Professional Intelligence
- identifying capability gaps
- selecting an experience
- setting learning objectives
- establishing success criteria
The platform adapts the experience based on current capability rather than presenting identical journeys to everyone.

Layer 2 – Organisation Intelligence This is one of DeliverX's most distinctive concepts. Every experience takes place within an organisation that has its own operating context.

**Organisation Intelligence includes:**

- company mission
- products and services
- customers
- organisational structure
- departments
- stakeholders
- policies
- terminology
- business objectives
- culture
- current challenges
- active initiatives
- knowledge base
The organisation should feel coherent and internally consistent.

Layer 3 – Professional Work This is where evidence is created.

**Professional work includes:**

Discovery

- reviewing business cases
- analysing customer feedback
- understanding problems
- stakeholder interviews
- market research
Planning

- defining outcomes
- prioritisation
- roadmap development
- project planning
- risk identification
Delivery

- collaboration
- documentation
- workshops
- decision making
- presentations
- reviews
Improvement

- retrospectives
- optimisation
- process improvements
- lessons learned
The goal is authentic work rather than artificial exercises.

Layer 4 – Observation & Evidence Every professional action generates observations.

**Examples include:**

- decisions made
- questions asked
- stakeholder interactions
- documents created
- meeting participation
- collaboration
- prioritisation choices
- communication quality
Observations become structured evidence after verification.

Layer 5 – Reflection & Feedback Growth requires reflection.

**After significant activities, users receive:**

- manager feedback
- peer feedback
- stakeholder feedback
- AI coaching
- self-reflection prompts
Reflection helps users understand why an outcome occurred rather than simply recording that it occurred.

Layer 6 – Growth Review At defined milestones, DeliverX evaluates development.

**Growth reviews include:**

- capability progression
- behavioural trends
- evidence quality
- confidence levels
- strengths
- development priorities
**The review should explain:**

- what improved
- what remains uncertain
- which evidence contributed
- what experience should come next
Layer 7 – Professional Intelligence Update The experience concludes by updating Professional Intelligence.

**Possible updates include:**

- new evidence
- stronger capabilities
- revised confidence
- behavioural observations
- portfolio artefacts
- career recommendations
- future learning priorities
Professional Intelligence always reflects the latest validated understanding of the user.

Experience Components Every experience is composed from reusable components.

**Core components include:**

- Organisations
- Departments
- Teams
- Roles
- Projects
- Stakeholders
- Meetings
- Documents
- Deliverables
- Communications
- Decisions
- Risks
- Events
- Feedback
- Reviews
These components can be assembled into different experiences without redesigning the platform.

Experience Types The platform should support progressively richer experiences. Guided Experience Highly structured, with extensive support. Collaborative Experience Working with AI colleagues on shared objectives. Leadership Experience Managing teams, priorities and stakeholders. Transformation Experience Leading organisational change across multiple projects. Each type introduces greater complexity while reusing the same underlying architecture.

AI Within Experience AI represents professional roles rather than generic assistants.

**Examples include:**

- Line Manager
- Product Manager
- Engineer
- Designer
- QA Analyst
- Customer
- Executive Sponsor
- HR Partner
- Scrum Master
- Business Analyst
**Each AI role should have:**

- defined responsibilities
- domain knowledge
- communication style
- authority limits
- organisational relationships
- current objectives
This creates believable workplace interactions.


## Evidence Model

Every activity contributes to the Evidence Ledger through a consistent pipeline. Professional Activity

```
│
▼
Observation
│
▼
Verification
│
▼
Evidence
│
▼
Capability Mapping
│
▼
Professional Intelligence
```

This pipeline ensures that all capability claims remain traceable.

Dashboard Objectives

**The Experience dashboard should answer:**

- What am I working on?
- Why does this matter?
- Who am I collaborating with?
- What evidence have I generated?
- How am I progressing?
- What should I focus on next?
The dashboard should encourage purposeful work rather than task completion alone.


## Design Principles

**Experience should always feel:**

- Authentic
- Purposeful
- Collaborative
- Context-aware
- Evidence-driven
- Challenging
- Reflective
- Progressive
Every activity should have a clear connection to professional growth.

Relationship with Other Documents Professional Intelligence defines who the user is. Experience defines how the user develops. Launchpad will define how the user converts capability into career opportunities. Team Copilot will define how the user scales from individual contributor to organisational leader. Together, these documents form the core lifecycle of DeliverX.

Architectural Decisions This document establishes the following permanent decisions:

- Experience is a professional environment, not a learning management system.
- Organisation Intelligence is a first-class architectural concept, providing the business context in which work occurs.
- Professional work is the primary source of evidence, replacing traditional quiz-centric assessments.
- Reflection is an integral part of capability development, not an optional add-on.
- Every experience follows the same evidence pipeline, ensuring consistency across all future scenarios.
- Reusable experience components (organisations, projects, stakeholders, meetings and documents) allow new experiences to be created without redesigning the platform.
- Experience exists to strengthen Professional Intelligence, which remains the platform's single source of truth.
I would introduce one more architectural concept that ties everything together: The DeliverX Experience Catalogue Rather than treating each simulation or project as a standalone activity, every experience should be published as a reusable "Experience Blueprint".

**Each blueprint would define:**

- Target personas
- Target roles
- Industries
- Capability outcomes
- Professional Intelligence domains affected
- Organisation template
- Projects included
- AI roles involved
- Evidence opportunities
- Portfolio outputs
- Estimated complexity
- Estimated duration
- Success criteria

---

## Shipped reality notes (synthesis)

> **Synthesized** from P3 catalogue + Experience runtime.

- Experience planner ranks scenarios across **12 seeded companies** (including MediFlow) and writes evidence through the ledger via the shared Day-1 simulation runtime.
- Experience heuristic `platform_verified` scores **must not** become ledger external verification or light `deliverxVerified`.
