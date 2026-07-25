# 02 — Professional Intelligence

> **Product Bible:** Start at [`../README.md`](../README.md). This architecture extract is long-term vision — it does **not** authorize out-of-charter builds. Prefer bible chapters + Build Charter for what to build now.

> **Source:** Founder documentation extract (sections 00–07), edited into clean markdown for the DeliverX governance repo.


## Document control

- Version: 1.0
- Status: Core Platform Architecture
- Depends On: Document 00 – DeliverX Foundation, Document 01 – Product Architecture
- Referenced By: Experience, Launchpad, Team Copilot, Employer Platform, AI Architecture, Engineering, Analytics


## Purpose

Professional Intelligence (PI) is the permanent intelligence layer of DeliverX. It continuously models a professional throughout their career. Unlike a CV, Professional Intelligence evolves. Unlike LinkedIn, it is evidence-driven. Unlike learning platforms, it measures demonstrated capability rather than completed courses. Professional Intelligence becomes the single source of truth for every recommendation, assessment, simulation and career opportunity within DeliverX.

Definition

**Professional Intelligence is:**

A continuously evolving, evidence-backed digital representation of an individual's professional capability, behaviour, experience and career development. It is not a score. It is not a CV. It is not a profile. It is a living intelligence model.

Core Philosophy Professional Intelligence never asks

> "What skills does this person claim?"

Instead it asks

> "What has this person consistently demonstrated, under what conditions, supported by what evidence, and with what level of confidence?"

The Professional Intelligence Model Professional Intelligence is composed of twelve interconnected domains.

### Professional Intelligence

```
│
├── Professional Identity
├── Career Intelligence
├── Knowledge Intelligence
├── Evidence Intelligence
├── Capability Intelligence
├── Behaviour Intelligence
├── Experience Intelligence
├── Collaboration Intelligence
├── Leadership Intelligence
├── Reputation Intelligence
├── Growth Intelligence
└── Opportunity Intelligence
```

Every future feature contributes to one or more of these domains.

Domain 1 – Professional Identity This defines who the professional is. It remains relatively stable. Contains

- Personal profile
- Career aspirations
- Industries
- Preferred domains
- Languages
- Qualifications
- Certifications
- Employment history
- Professional interests
- Working preferences
- Motivation profile

## Purpose

Provide context for interpreting future evidence.

Domain 2 – Career Intelligence Understands where the professional wants to go. Contains

- Target roles
- Career roadmap
- Career confidence
- Career maturity
- Preferred industries
- Salary expectations
- Geographic preferences
- Long-term ambitions
Output Personalised development pathways.

Domain 3 – Knowledge Intelligence Captures what the user knows.

**Knowledge may originate from:**

- Courses
- Books
- Articles
- Videos
- Podcasts
- Workshops
- University
- Employer training
- Certifications
Knowledge alone never increases capability. It simply records exposure.

Domain 4 – Evidence Intelligence This is the heart of DeliverX. Every meaningful action generates evidence.

**Sources include:**

- Projects
- Assessments
- Simulations
- Meetings
- Deliverables
- Stakeholder interactions
- Presentations
- Decisions
- Feedback
- Documents
- Reflections
- Interviews
**Every evidence item records:**

- source
- context
- timestamp
- outcome
- confidence
- authenticity
- contribution
- reviewer
- linked capability
Nothing enters Professional Intelligence without evidence.

Domain 5 – Capability Intelligence

**Capability answers:**

> "What can this professional repeatedly demonstrate?"

**Examples include:**

- Product Discovery
- Stakeholder Management
- Planning
- Communication
- Leadership
- Strategic Thinking
- Commercial Awareness
- Technical Understanding
- Risk Management
- Decision Making
**Every capability includes:**

- evidence count
- confidence
- recency
- consistency
- transferability
- development trend
Capabilities grow gradually through accumulated evidence.

Domain 6 – Behaviour Intelligence Behaviour often differentiates professionals with similar technical skills.

**Examples include:**

- Curiosity
- Ownership
- Collaboration
- Adaptability
- Resilience
- Accountability
- Communication style
- Conflict resolution
- Learning mindset
- Ethical judgement
Behaviours are inferred only through repeated observations across multiple contexts.

Domain 7 – Experience Intelligence Experience is more than time spent in a role.

**DeliverX records:**

- projects completed
- industries
- company types
- project complexity
- team sizes
- stakeholder diversity
- technologies used
- responsibilities
- outcomes
The emphasis is on the richness of experience rather than duration alone.

Domain 8 – Collaboration Intelligence Modern work is collaborative. This domain evaluates how professionals work with others.

**Signals include:**

- communication quality
- responsiveness
- knowledge sharing
- teamwork
- conflict management
- mentoring
- cross-functional collaboration
- stakeholder engagement
Domain 9 – Leadership Intelligence Leadership extends beyond formal management.

**Evidence may include:**

- decision ownership
- mentoring
- delegation
- coaching
- influencing
- strategic thinking
- organisational planning
- executive communication
Leadership evidence becomes increasingly important as careers progress.

Domain 10 – Reputation Intelligence This captures how the professional is perceived.

**Potential signals include:**

- manager feedback
- peer feedback
- stakeholder reviews
- customer comments
- project outcomes
- reliability
- consistency
- trust
Reputation should always be traceable to identifiable evidence.

Domain 11 – Growth Intelligence Growth is measured over time.

**DeliverX tracks:**

- capability trends
- behaviour changes
- learning velocity
- confidence improvements
- breadth of experience
- depth of expertise
- progression milestones
Growth should be longitudinal rather than snapshot-based.

Domain 12 – Opportunity Intelligence Professional Intelligence ultimately exists to enable better opportunities.

**Recommendations may include:**

- next project
- learning priorities
- career transitions
- interview readiness
- leadership opportunities
- networking suggestions
- internal promotions
- external roles
Every recommendation must explain which evidence supports it.

Evidence Pipeline All information entering Professional Intelligence follows a consistent lifecycle. Activity

```
│
▼
Observation
│
▼
Evidence
│
▼
Verification
│
▼
Capability Mapping
│
▼
Professional Intelligence Update
│
▼
Recommendations
```

This ensures that recommendations are grounded in observed activity rather than assumptions.

Intelligence Maturity Professional Intelligence evolves through increasing levels of maturity. Level 1 – Profile Basic identity and career goals. Level 2 – Knowledge Validated learning history. Level 3 – Evidence Initial demonstrated capability. Level 4 – Professional Consistent evidence across multiple contexts. Level 5 – Advanced Professional Cross-functional expertise and sustained performance. Level 6 – Leader Evidence of organisational influence and leadership. The maturity level reflects the completeness and reliability of the intelligence model rather than seniority.

Professional Intelligence Dashboard

**The dashboard should answer six questions immediately:**

- Who am I professionally?
- What can I reliably demonstrate?
- Where is my strongest evidence?
- What are my current development priorities?
- What opportunities fit me now?
- What should I do next?
Every widget should help answer one of these questions.


## Design Principles

**Professional Intelligence should always be:**

- Evidence-driven
- Transparent
- Explainable
- Longitudinal
- Adaptive
- Context-aware
- Privacy-conscious
- User-controlled
The user should always understand why a recommendation has been made and what evidence contributed to it.

Architectural Decisions This document establishes several core decisions for the rest of the platform:

- Professional Intelligence is the single source of truth for all products.
- Knowledge, evidence and capability are distinct concepts and must not be merged.
- Recommendations must always reference supporting evidence.
- Capabilities emerge from accumulated observations across multiple contexts, not isolated events.
- Growth is measured over time through longitudinal evidence rather than single assessments.
- Every DeliverX experience—Experience, Launchpad and Team Copilot—must either contribute to or consume Professional Intelligence.
I would make one major refinement before we design the Experience platform. At the moment, Professional Intelligence is centred on the individual. I recommend introducing a parallel concept called Organisation Intelligence. While Professional Intelligence models the user, Organisation Intelligence models the company: its culture, teams, products, priorities, risks, knowledge and operating context. When a user enters a simulated (or eventually real) organisation, the interaction between Professional Intelligence and Organisation Intelligence produces the work, decisions and evidence that drive growth.

**That gives DeliverX two complementary intelligence layers:**

- Professional Intelligence — understanding the person.
- Organisation Intelligence — understanding the environment.

---

## Shipped reality notes (synthesis)

> **Synthesized** from migrations 0066–0085 and domain libs.

- Implemented domains include: PI onboarding, Evidence Ledger, Capability Engine (ScoreRuns + SnapshotClaims), assessment (baseline/final/transfer), admin competency framework (`pm-core@2026.1` pin), review/challenge, profile aggregate.
- Confidence is expressed as **bands / explainable claims**, not fake precision percentages.
- Capability writes only via Capability Engine persist paths; UI never invents levels without a ScoreRun.
