# 04 — Launchpad / Career Intelligence

> **Source:** Founder documentation extract (sections 00–07), edited into clean markdown for the DeliverX governance repo.

Launchpad – Career Intelligence Platform

*Version: 1.0*

*Status: Core Product Architecture*

*Depends On: Document 00 – Foundation, Document 01 – Product Architecture, Document 02 – Professional Intelligence, Document 03 – Experience Platform*

Referenced By: Team Copilot, Employer Platform, Enterprise Platform, Analytics


## Purpose

Launchpad transforms Professional Intelligence into meaningful career opportunities. Unlike traditional recruitment platforms that match keywords to job descriptions, Launchpad understands demonstrated capability, career aspirations and long-term professional development. Its purpose is not simply to help users find jobs. Its purpose is to help professionals make the right career decisions at the right time.


## Vision

Launchpad becomes every professional's career operating companion.

**Instead of asking:**

> "Which jobs are available?"

**Launchpad asks:**

> "What is the most valuable next step in this person's professional journey?"

That next step may or may not be a new job.

Core Philosophy Career progression is continuous. A career is built through many interconnected opportunities.

**Launchpad continuously evaluates:**

- readiness
- aspirations
- evidence
- market demand
- organisational context
- professional growth
to recommend the highest-value next opportunity.

Career Intelligence Model Launchpad is composed of eight interconnected services.

### Launchpad

```
│
├── Career Discovery
├── Career Readiness
├── Opportunity Intelligence
├── Professional Branding
├── Employer Intelligence
├── Interview Intelligence
├── Career Planning
└── Career Progression
```

Career Discovery Every professional should understand where they could go.

**Launchpad analyses:**

- interests
- motivations
- strengths
- evidence
- behaviours
- transferable capabilities
- experience
- market demand
**Outputs include:**

- suitable career paths
- adjacent careers
- emerging professions
- leadership pathways
- entrepreneurial opportunities
The goal is exploration before application.

It combines:

- **Career Readiness**
Professional Intelligence continuously measures readiness.

**Readiness is evaluated across multiple dimensions:**

- capability
- evidence quality
- experience breadth
- behavioural maturity
- communication
- leadership
- domain knowledge
- confidence
**Every readiness assessment explains:**

- what is strong
- what is missing
- what evidence supports the assessment
- how to improve
Readiness should always be transparent.

Opportunity Intelligence This is the recommendation engine.

**Launchpad continuously identifies opportunities such as:**

Internal Opportunities

- stretch assignments
- mentoring
- leadership opportunities
- project ownership
- cross-functional collaboration
External Opportunities

- employment
- consulting
- freelancing
- speaking engagements
- startups
- partnerships
- research collaborations
Development Opportunities

- learning
- certifications
- conferences
- communities
- networking
- coaching
Every recommendation links back to Professional Intelligence.

Professional Branding Launchpad automatically transforms Professional Intelligence into professional assets.

**Examples include:**

- CVs
- résumés
- portfolios
- case studies
- capability reports
- evidence summaries
- executive profiles
- speaker biographies
- consultant profiles
These assets remain synchronised with Professional Intelligence. Users no longer maintain multiple versions manually.

Employer Intelligence Launchpad helps users understand employers before they apply.

**For each employer, the platform provides:**

- organisation overview
- mission
- products
- strategy
- culture
- technologies
- market position
- competitors
- recent developments
- role expectations
- hiring process
- success factors
The aim is informed applications rather than mass applications.

Interview Intelligence Interview preparation becomes evidence-driven.

**Launchpad generates:**

- competency-based questions
- behavioural scenarios
- case studies
- technical discussions
- presentation exercises
- executive conversations
Each interview simulation uses the user's Professional Intelligence to focus on genuine strengths and development areas. After each session, the platform updates readiness while clearly separating simulated performance from real-world evidence.

Career Planning Career planning extends beyond the next role.

**Launchpad helps professionals define:**

- long-term goals
- milestones
- development plans
- capability priorities
- leadership ambitions
- industry transitions
Career plans remain dynamic and evolve as Professional Intelligence changes.

Career Progression Career progression is supported through evidence rather than assumptions.

**Examples include:**

- promotions
- internal mobility
- role transitions
- leadership preparation
- succession planning
Launchpad explains why a professional appears ready for the next step and identifies remaining gaps.

Launchpad Lifecycle

### Professional Intelligence

```
│
▼
Career Readiness
│
▼
Opportunity Discovery
│
▼
Preparation
│
▼
Application / Participation
│
▼
Interview / Selection
│
▼
Outcome
│
▼
Reflection
│
▼
Professional Intelligence Update
```

Career outcomes always feed back into Professional Intelligence.

Personalised Career Dashboard

**The dashboard should answer:**

- What opportunities are most relevant today?
- Why are they recommended?
- What evidence supports my readiness?
- What gaps remain?
- Which activities will have the greatest impact?
- What has changed since my last review?
Recommendations should be prioritised by expected career impact.

AI Within Launchpad Launchpad includes specialist AI roles.

**Examples:**

- Career Coach
- Recruiter
- Hiring Manager
- Executive Mentor
- Interviewer
- CV Reviewer
- Portfolio Reviewer
- Networking Advisor
- Salary Advisor
- Industry Analyst
Each role has defined responsibilities, data sources and decision boundaries.

Relationship with Professional Intelligence Launchpad never creates capability. It interprets capability. It never invents evidence. It explains evidence. It never replaces Professional Intelligence. It consumes Professional Intelligence.

Relationship with Experience Experience develops professionals. Launchpad positions professionals. Experience generates evidence. Launchpad converts evidence into opportunities. Both rely on the same Professional Intelligence profile.


## Design Principles

**Launchpad should always be:**

- Personalised
- Transparent
- Evidence-driven
- Opportunity-focused
- Aspirational
- Honest
- Long-term oriented
- User-controlled
The goal is not to maximise applications but to maximise meaningful career progress.

Architectural Decisions

**This document establishes several permanent decisions:**

- Launchpad is a Career Intelligence Platform, not a conventional recruitment tool.
- Jobs are one category of opportunity, alongside projects, leadership experiences, mentoring, consulting and entrepreneurship.
- Professional branding is generated from Professional Intelligence, ensuring CVs, portfolios and profiles remain consistent.
- Recommendations must be explainable, with every suggestion linked to supporting evidence and career goals.
- Career planning is continuous, adapting as Professional Intelligence evolves.
- Launchpad consumes Professional Intelligence but does not modify capability directly, preserving a clear separation between development and career positioning.
There is one final architectural refinement I would introduce.

**At the moment we have:**

- Professional Intelligence — understanding the person.
- Organisation Intelligence — understanding the organisation.
- Career Intelligence — understanding opportunities.

---

## Shipped reality notes (synthesis)

> **Synthesized** from career-intelligence + P7 outcomes + verified portfolio.

- Launchpad/Career consume SnapshotClaims; readiness may fall back to a **labelled** evidence-coverage heuristic — never treated as capability truth.
- Real-world outcomes (applications, interviews, offers, hires, promotions, feedback) are self-reported with calibration diagnostics; they do **not** auto-run ScoreRuns or set `externally_verified`.
- Broad opportunity marketplace / salary / networking depth remain partial vs this architecture vision.
