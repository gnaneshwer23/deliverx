# 06 — User Experience Architecture

> **Product Bible:** Start at [`../README.md`](../README.md). This architecture extract is long-term vision — it does **not** authorize out-of-charter builds. Prefer bible chapters + Build Charter for what to build now.

> **Source:** Founder documentation extract (sections 00–07), edited into clean markdown for the DeliverX governance repo.


## Document control

- Version: 1.0
- Status: Product Experience Architecture
- Depends On: Documents 00–05
- Referenced By: UX, Engineering, AI, QA, Marketing, Design System


## Purpose

This document defines how users experience DeliverX from the first visit to long-term professional growth.

**It establishes:**

- Product journeys
- Navigation architecture
- Dashboard philosophy
- Personalisation
- Interaction principles
- AI interaction patterns
- Product consistency
- Design language
This document does not define visual styling. It defines the experience.


## Vision

DeliverX should feel like

> "The operating system for my professional life."

Not A learning platform. Not A job board. Not A project simulator. Every interaction should reinforce the feeling that DeliverX understands the professional, remembers previous experiences and guides meaningful progress.

Product Experience Principles Every screen should satisfy one or more of these principles. Clarity

**Users should always know:**

- where they are
- why they are there
- what they should do next
Continuity Experience, Launchpad and Team Copilot should feel like one platform. No disconnected interfaces. No duplicated navigation. No inconsistent terminology.


## Personalisation

The platform should adapt to the individual. Recommendations. Content. Projects. Opportunities. Dashboards. Everything.


## Explainability

**AI should always explain:**

Why How Based on what evidence No unexplained recommendations.

Professionalism The experience should resemble enterprise software rather than consumer social media. Calm. Minimal. Purposeful.

Growth Every session should help users improve. Users should leave feeling they moved forward professionally.

User Lifecycle Every professional follows one continuous lifecycle. Discover

↓

Understand DeliverX

↓

Create Professional Identity

↓

### Professional Intelligence

↓

### Experience

↓

### Launchpad

↓

Employment

↓

### Team Copilot

↓

Leadership

↓

Professional Growth

↓

Repeat

Product Navigation DeliverX should never expose products first. It should expose the professional journey. Top-level navigation Home

My Professional Intelligence

### Experience

### Launchpad

### Team Copilot

Portfolio

Insights

Community

Settings Users move through capabilities rather than products.

Landing Experience The homepage should answer five questions within thirty seconds. What is DeliverX? Why does it exist? How is it different? How does it help me? What should I do next? The landing page should prioritise credibility over marketing language.

Authentication Authentication should feel like joining a professional platform. Minimal friction.

**Possible methods:**

- Email
- Google
- Microsoft
- LinkedIn
- GitHub
After authentication, users immediately begin personalised onboarding.

Personalised Onboarding This is one of DeliverX's defining experiences. The platform does not ask generic profile questions. It starts a professional conversation.

**Topics include:**

Career aspirations Professional background Education

### Experience

Interests Strengths Challenges Preferred industries Working style Learning preferences Leadership aspirations Motivations Confidence Evidence already available The output is a Professional Identity rather than a simple user profile.


## First-Time User Experience

**The first session should achieve three objectives:**

- Explain DeliverX.
- Build an initial Professional Intelligence profile.
- Recommend the most appropriate first experience.
Users should reach meaningful activity within minutes.


## Dashboard Architecture

DeliverX should not have a single dashboard. Each workspace has its own purpose while maintaining a consistent design language. Home Dashboard

**Purpose:**

Provide an overview of the user's professional journey.

**Shows:**

- today's priorities
- recommended actions
- recent growth
- active opportunities
- Professional Intelligence summary
- notifications
Professional Intelligence Dashboard

**Answers:**

Who am I professionally? What evidence supports my capabilities? What should I improve next?

**Includes:**

- capability map
- evidence timeline
- growth trends
- career readiness
- strengths
- development priorities
Experience Dashboard Focuses on current work.

**Includes:**

- active organisation
- projects
- meetings
- stakeholders
- deliverables
- evidence generated
- upcoming milestones
Launchpad Dashboard Focuses on career progression.

**Includes:**

- recommended opportunities
- interview preparation
- employer insights
- portfolio
- applications
- networking
- career roadmap
Team Copilot Dashboard Focuses on organisational delivery.

**Includes:**

- programmes
- delivery health
- meetings
- blockers
- risks
- AI team
- organisational insights
Navigation Philosophy

**Navigation should answer:**

Where am I? What matters most? What should I do next? It should never require users to remember where features are located.

AI Interaction Patterns AI should feel like colleagues rather than chatbots.

**Examples include:**

Career Coach Line Manager Product Manager Recruiter Executive Sponsor

**Each AI interaction should include:**

- context
- purpose
- recommendations
- evidence references
- suggested actions
AI conversations should remain attached to relevant projects or career activities rather than existing as isolated chats.

Notifications Notifications should be intentional.

**Categories include:**

Professional Growth Projects Career Opportunities Feedback Meetings AI Recommendations System Updates Notifications should prioritise importance over frequency.


## Search

Search should be universal.

**Users should search:**

Projects Meetings People

It combines:

- **Evidence**
- **Capabilities**
Companies


## Documents

Recommendations Conversations Search becomes the primary navigation method as users accumulate information.

Mobile Experience

**Mobile should focus on:**

- daily priorities
- meetings
- notifications
- coaching
- reflections
- quick evidence capture
Complex planning remains optimised for desktop.


## Accessibility

DeliverX should meet recognised accessibility standards.

**Examples include:**

- keyboard navigation
- screen reader compatibility
- sufficient colour contrast
- scalable typography
- descriptive labels
- accessible charts
Accessibility is a product requirement, not an enhancement.


## Design Language

**The interface should communicate:**

Professionalism Trust Calm Focus Intelligence Transparency Avoid unnecessary visual complexity. Information density should increase naturally as professionals become more advanced.

Product Experience Lifecycle Discover

```
│
▼
Understand
│
▼
Onboard
│
▼
Develop
│
▼
Demonstrate
│
▼
Progress
│
▼
Lead
│
▼
Grow
```

This lifecycle should remain visible throughout the product.

Cross-Product Movement Users should move naturally between experiences.

**Example:**

A project completed in Experience strengthens Professional Intelligence. Professional Intelligence updates Launchpad recommendations. A promotion achieved through Launchpad unlocks new Team Copilot responsibilities. Leadership evidence generated in Team Copilot strengthens Professional Intelligence again. The user never "switches products". The platform simply evolves with them.


## Design Principles

**Every experience should be:**

- Human-centred
- Evidence-driven
- Calm
- Predictable
- Explainable
- Consistent
- Personalised
- Outcome-focused
Architectural Decisions

**This document establishes several permanent decisions:**

- DeliverX presents one unified journey, not three separate products.
- Navigation follows the professional lifecycle, rather than exposing internal platform modules.
- Professional Identity and personalised onboarding replace traditional account setup.
- Dashboards are purpose-built, each answering a distinct set of professional questions while sharing a common design language.
- AI interactions are contextual, attached to projects, opportunities and teams instead of isolated chat windows.
- Cross-product continuity is mandatory, with every action flowing through Professional Intelligence to maintain a coherent experience.
- Accessibility, explainability and professionalism are foundational UX principles and must be considered in every feature.

---

## Shipped reality notes (synthesis)

> **Synthesized** from IA redesign + auth smoke.

- Signed-in journey centres on Hub / Profile / Experience / Portfolio / Career / Learning / Workspace rather than exposing raw engine names as the primary IA.
- Auth gates redirect unauthenticated PI surfaces to `/login?next=…` (coach deep-link returns to `/workspace` layout fallback — residual risk).
- Calm, non-gamified UI principles match the Engineering Constitution.
