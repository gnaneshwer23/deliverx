# 00 — DeliverX Foundation

> **Source:** Founder documentation extract (sections 00–07), edited into clean markdown for the DeliverX governance repo.


## Purpose

This document defines the purpose, philosophy, guiding principles and architectural foundations of DeliverX. It is not a Product Requirements Document. It is not a Technical Specification. It is not a Roadmap. It is the permanent reference that every product decision, engineering decision, AI decision and user experience must align with. If a proposed feature contradicts this document, the feature should be redesigned before implementation.


## Vision

DeliverX exists to transform professional development from a collection of disconnected learning, hiring and workplace tools into one continuous evidence-driven professional journey.

**Instead of asking:**

> "Can this person do the job?"

**DeliverX answers:**

> "What has this person consistently demonstrated, how have they grown over time, and what is the most credible next step in their career?"


## Mission

**DeliverX enables every professional to:**

- understand their current capabilities
- develop through meaningful work
- generate trusted evidence
- receive personalised career guidance
- confidently progress throughout their professional life

## The Problem

Today's professional ecosystem is fragmented. Learning platforms teach. Recruitment platforms hire. Companies evaluate. Portfolio tools showcase. Performance tools review. None of these systems share a common understanding of an individual's professional capability. DeliverX connects these disconnected stages into a continuous professional lifecycle.


## The DeliverX Philosophy

DeliverX is not a learning platform. DeliverX is not an interview platform. DeliverX is not a project simulator. DeliverX is not a portfolio platform. DeliverX is not an AI assistant. DeliverX is a Professional Intelligence Operating System. Everything else exists to strengthen that purpose.


## Core Products

DeliverX consists of four integrated experiences.

### Professional Intelligence

The permanent professional profile. It continuously evolves through evidence. It never resets. It follows the user throughout their career.

### Experience

The environment where capability is developed. Users learn through realistic work. Projects generate evidence. Evidence develops capability.

### Launchpad

The career acceleration platform.

**Professional Intelligence becomes:**

- CVs
- portfolios
- interview preparation
- applications
- networking
- career planning

### Team Copilot

The collaborative workspace. Users work with multidisciplinary AI teams. The focus moves from individual capability to organisational capability.


## Product Principles

Every feature must satisfy these principles.

### Evidence before claims

DeliverX values demonstrated capability over self-declared skills.

### Professional Intelligence is the source of truth

Every product reads from and contributes to one Professional Intelligence Profile. No duplicated profiles. No conflicting capability records.

### Learning alone is insufficient

Watching a course does not demonstrate capability. Knowledge becomes capability only when applied.

### Realistic work generates meaningful evidence

Evidence should primarily originate from authentic professional activities rather than isolated quizzes.

### Trust over engagement

Features should prioritise credibility, transparency and explainability ahead of entertainment or artificial engagement.

### AI supports professional growth

AI assists. AI coaches. AI challenges. AI observes. AI explains. AI never fabricates evidence.

### Career progression must be earned

Progression is based upon accumulated evidence across multiple contexts rather than isolated performance.

### Every interaction has purpose

If an activity does not improve Professional Intelligence or career outcomes, it should not exist within DeliverX.

### Professional Intelligence

Professional Intelligence is the permanent digital representation of an individual's professional capability.

**It combines:**

It combines:

- **Identity**
- **Knowledge**
- **Evidence**
- **Capabilities**
- **Competencies**
- **Behaviours**
- **Professional Judgement**
- **Career Goals**
- **Growth History**
- **Professional Reputation**
- **Career Readiness**
Professional Intelligence becomes the foundation for every decision made throughout the platform.


## High-Level Architecture

DeliverX

```
│
┌───────────────────────┼────────────────────────┐
│                       │                        │
▼                       ▼                        ▼
```

Professional        Experience             Launchpad

```
Intelligence                                  │
│                       │                      │
│                       ▼                      │
│               Professional Work             │
│                       │                      │
│                       ▼                      │
│                 Evidence Engine             │
│                       │                      │
└───────────────────────┼──────────────────────┘
│
▼
Updated Professional Intelligence
│
▼
Team Copilot
│
▼
Continuous Career Growth
```


## Design Principles

**DeliverX should always feel:**

Professional Trustworthy Transparent Human Evidence-driven Calm Intelligent Supportive Challenging Career-focused


## Success Metrics

**DeliverX succeeds when users can confidently answer:**

Who am I professionally? What have I genuinely demonstrated? What evidence supports my capability? How have I improved? What should I develop next? What career opportunities best align with my strengths?


## Future Vision

DeliverX evolves through four maturity stages.

### Stage 1

Professional Intelligence Platform Evidence-driven professional development.

### Stage 2

Professional Experience Platform Realistic organisations. AI teams. Project delivery.

### Stage 3

Career Intelligence Platform Employment. Networking. Internal progression. External opportunities.

### Stage 4

Professional Operating System A lifelong platform connecting learning, work, capability, collaboration and career progression into one continuous ecosystem.


## Decision Filter

Every future feature should be evaluated against five questions:

- Does it strengthen Professional Intelligence?
- Does it generate or consume trustworthy evidence?
- Does it improve professional capability or career outcomes?
- Does it fit naturally within Experience, Launchpad or Team Copilot?
- Can it be explained clearly to both a candidate and an employer?
If the answer to any of these questions is "no", the feature should be redesigned or deferred.


## DeliverX Lexicon

Official meanings for core terms (founder recommendation):

- Knowledge: What a user knows.
- Capability: What a user has repeatedly demonstrated.
- Evidence: The observable proof supporting a capability.
- Experience: The environment where evidence is generated.
- Professional Intelligence: The continuously updated model of a user's professional capability.
- Launchpad: The career acceleration experience.
- Team Copilot: The collaborative work experience.

---

## Shipped reality notes (synthesis)

> **Synthesized** from post-ship audit (2026-07-25, HEAD `f3ac383`) — not in the original founder extract.

- The Foundation principles are enforced in code via: append-only Evidence Ledger, Capability Engine–only ScoreRuns, SnapshotClaims as shared claim projection, observation consent default OFF, Learning ≠ competency, and `deliverxVerified` gated on external attestation.
- Active Build Charter scope is **pilot hardening of the shipped P0–P7 candidate loop**, not Stage 3–4 of the Future Vision.
