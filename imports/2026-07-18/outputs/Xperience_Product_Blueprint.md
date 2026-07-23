# Xperience Product Blueprint

Version: 0.1  
Status: Founder architecture draft  
Product: Xperience  
Category: Professional career evidence platform  
Core belief: Build a career before you have one.

## 1. Executive Definition

Xperience is not a course, a generic AI tool, a virtual internship or a portfolio builder.

Xperience is a professional simulation platform where users enter realistic companies, apply for roles, work with AI colleagues, make decisions, create work artefacts, experience consequences and leave with inspectable evidence of how they perform.

The product is the journey. Every screen should feel like part of a recruitment and employment lifecycle:

Discovery, application, assessment, offer, onboarding, day one, workplace execution, performance review, portfolio and career activation.

## 2. Product Principles

1. Work, not learning.
Every interaction should feel like professional work rather than online education.

2. Evidence, not certificates.
The user should leave with inspectable proof of decisions, documents, stakeholder interactions and outcomes.

3. Journey, not dashboard.
The product should make users feel they are progressing through a real career lifecycle.

4. Calm under pressure.
The UI should feel composed, credible and operational even when scenarios are tense.

5. Professional credibility first.
Language, structure and design must feel appropriate for users, hiring teams, universities and investors.

6. Honest simulation.
Xperience must never imply real employment, accreditation or guaranteed hiring outcomes.

## 3. Product Architecture

```text
Marketing Website
|
|-- Home
|-- Experiences
|   |-- Product Manager
|   |-- Business Analyst
|   |-- Project Manager
|   |-- Product Owner
|   |-- Clinical Product Lead
|-- Career Identity
|-- How It Works
|-- Portfolio
|-- Pricing
|-- For Hiring Teams
|-- For Universities
|-- About
|-- Apply
|-- Login

Authentication
|
|-- Register
|-- Login
|-- Verify Email
|-- Verify Mobile
|-- Forgot Password
|-- Session Recovery

Recruitment
|
|-- Career Profile
|-- Resume Import
|-- AI Resume Analysis
|-- Behaviour Assessment
|-- Recruiter Interview
|-- Hiring Manager Interview
|-- Career Report
|-- Offer Letter
|-- Development Route

Preboarding
|
|-- Welcome
|-- Simulation Disclosure
|-- Company Handbook
|-- Product Overview
|-- Organisation
|-- Meet Team
|-- Workspace Setup
|-- Ready for Day One

Workspace
|
|-- Dashboard
|-- Inbox
|-- Calendar
|-- Tasks
|-- Stakeholders
|-- Meetings
|-- Company
|-- Documents
|-- Analytics
|-- Decisions
|-- Performance
|-- Portfolio
|-- Career
|-- Settings

Administration
|
|-- Cohorts
|-- Users
|-- Enrolments
|-- Scenario Progress
|-- Content Versions
|-- AI Logs
|-- Error Review
|-- Manual Reset
|-- Feedback Export
```

## 4. Information Architecture Model

Every screen must be specified before implementation.

Each screen specification should include:

| Field | Required Definition |
| --- | --- |
| Purpose | Why this screen exists |
| User goal | What the user is trying to accomplish |
| Primary data | Data required to render the screen |
| Primary actions | Main user actions |
| Secondary actions | Optional or supporting actions |
| Permissions | Who can view or modify this screen |
| Success state | What good completion looks like |
| Empty state | What appears before content exists |
| Error state | What happens when something fails |
| Loading state | What appears while data is fetched |
| Analytics events | Events emitted by the screen |
| AI involvement | Whether AI reads, writes or evaluates anything |
| Safety notes | Risks, disclosures or guardrails |

## 5. Core Screen Specifications

### 5.1 Home

Purpose: Establish Xperience as a new category.  
User goal: Understand that Xperience helps users build career evidence before employment.  
Primary actions: Apply for first role, explore workplace, view experiences.  
Success state: Visitor understands the promise in under five seconds.  
Analytics events: home_viewed, primary_cta_clicked, workplace_preview_clicked.

### 5.2 Experiences

Purpose: Present available and future role simulations.  
User goal: Choose the first role experience.  
Primary data: roles, companies, level, status, duration, difficulty, price.  
Primary actions: View role, apply, join waitlist.  
Success state: User selects Product Manager or joins future role interest list.  
Analytics events: experiences_viewed, role_card_clicked, waitlist_clicked.

### 5.3 Career Identity

Purpose: Show the user’s accumulated professional evidence profile.  
User goal: Understand demonstrated strengths, gaps and interview readiness.  
Primary data: experience score, competency scores, evidence count, portfolio completeness, role history.  
Primary actions: View evidence, generate interview story, update profile.  
Success state: User sees a credible professional identity based on work evidence.  
Analytics events: career_identity_viewed, competency_opened, story_generated.

### 5.4 Apply

Purpose: Begin the recruitment style journey.  
User goal: Apply for a simulated role.  
Primary data: selected role, account status, invitation code, consent state.  
Primary actions: create account, sign in, continue application.  
Success state: Application record created and user moves to career profile.  
Analytics events: application_started, invite_code_submitted.

### 5.5 Career Profile

Purpose: Capture baseline professional context.  
User goal: Explain background, goals and target role.  
Primary data: name, email, work history, education, goals, sector background, accessibility needs.  
Primary actions: save, continue, upload resume.  
Success state: Profile is complete enough for assessment and onboarding.  
Analytics events: profile_started, profile_completed.

### 5.6 Resume Import

Purpose: Extract professional background from resume.  
User goal: Avoid retyping career history.  
Primary data: uploaded file, parsed experience, skills, education, projects.  
Primary actions: upload, review parsed content, edit, continue.  
Success state: Resume version saved and editable.  
Error state: File unsupported, parse failed, user may continue manually.  
Analytics events: resume_uploaded, resume_parse_failed, resume_confirmed.

### 5.7 Behaviour Assessment

Purpose: Establish baseline judgement before the simulation.  
User goal: Answer realistic workplace questions.  
Primary data: questions, responses, rubric, baseline score.  
Primary actions: answer, save, submit.  
Success state: Baseline assessment complete and separate from final performance.  
Analytics events: assessment_started, assessment_completed.

### 5.8 Recruiter Interview

Purpose: Make the application feel like a real role entry path.  
User goal: Discuss motivation, expectations and readiness.  
Primary data: profile, resume summary, approved question set, interview transcript.  
Primary actions: respond, continue, retry.  
Success state: Structured interview evidence saved.  
AI involvement: AI recruiter asks bounded questions and returns structured evidence.  
Analytics events: recruiter_interview_started, recruiter_interview_completed.

### 5.9 Offer Letter

Purpose: Transition from candidate to simulated employee.  
User goal: Understand role, manager, objectives and disclosure.  
Primary data: role, company, manager, start date, objectives, disclosure.  
Primary actions: accept offer, decline, download.  
Success state: Enrolment moves to preboarding.  
Safety notes: Must clearly state simulation and not employment.  
Analytics events: offer_viewed, offer_accepted.

### 5.10 Preboarding

Purpose: Prepare the user for Day One.  
User goal: Learn company context and set up workspace.  
Primary data: company handbook, product overview, org chart, stakeholders, objectives.  
Primary actions: complete modules, meet team, continue.  
Success state: User is ready for first workplace task.  
Analytics events: preboarding_started, module_completed, ready_for_day_one.

### 5.11 Workspace Dashboard

Purpose: Provide today’s operational view.  
User goal: Understand priorities, messages, meetings, tasks and company state.  
Primary data: day, tasks, inbox, meetings, company health, stakeholder updates, performance signals.  
Primary actions: open task, reply to message, join meeting, inspect evidence.  
Success state: User knows the next best action.  
Analytics events: dashboard_viewed, next_action_clicked.

### 5.12 Inbox

Purpose: Hold stakeholder messages and company notices.  
User goal: Read, reply and retain conversation history.  
Primary data: threads, messages, sender, urgency, linked tasks, memory references.  
Primary actions: reply, mark done, create task, open evidence.  
Success state: Conversation and extracted commitments are saved.  
AI involvement: Stakeholder responses are generated within persona and context constraints.  
Analytics events: inbox_viewed, message_sent, stakeholder_response_received.

### 5.13 Calendar

Purpose: Represent meetings and simulated work rhythm.  
User goal: See scheduled meetings and obligations.  
Primary data: calendar events, participants, agenda, preparation documents, outcomes.  
Primary actions: open meeting, prepare, join, review notes.  
Success state: Meeting record saved with actions and memories.  
Analytics events: calendar_viewed, meeting_opened, meeting_completed.

### 5.14 Tasks

Purpose: Manage scenario work and workplace commitments.  
User goal: Track what must be done by when.  
Primary data: task title, owner, status, deadline, scenario, required artefact.  
Primary actions: open, update status, submit artefact, create follow up.  
Success state: Required task completed and progression gate updated.  
Analytics events: task_opened, task_status_changed, task_completed.

### 5.15 Stakeholders

Purpose: Show colleagues as persistent professional relationships.  
User goal: Understand role, priorities, trust and previous commitments.  
Primary data: stakeholder profile, relationship dimensions, conversation history, unresolved commitments.  
Primary actions: message, schedule meeting, review history.  
Success state: User chooses communication with context.  
Analytics events: stakeholder_profile_viewed, stakeholder_contacted.

### 5.16 Documents

Purpose: Store company evidence and user artefacts.  
User goal: Inspect evidence and produce professional work.  
Primary data: source docs, templates, drafts, submitted artefacts, comments.  
Primary actions: open, search, edit, submit, version.  
Success state: Submitted artefact is immutable and linked to decision evidence.  
Analytics events: document_opened, artefact_created, artefact_submitted.

### 5.17 Decision Submission

Purpose: Capture reasoned professional judgement.  
User goal: Decide, explain rationale and commit to a course of action.  
Primary data: scenario, evidence reviewed, stakeholder consultations, artefact, options, custom recommendation.  
Primary actions: submit decision, save draft, request feedback.  
Success state: Decision emits state change, relationship update, immediate response and scheduled consequence.  
Analytics events: decision_started, decision_submitted, consequence_scheduled.

### 5.18 Performance

Purpose: Explain competency development and evidence.  
User goal: Understand strengths, gaps and trends.  
Primary data: scores, rubrics, evidence links, stakeholder feedback, decision outcomes.  
Primary actions: inspect evidence, reflect, generate development plan.  
Success state: User understands why scores exist.  
Analytics events: performance_viewed, evidence_opened, development_plan_created.

### 5.19 Portfolio

Purpose: Convert simulated work into shareable career evidence.  
User goal: Select and present evidence for interviews.  
Primary data: artefacts, decisions, consequence chains, competency evidence, reflections, verification metadata.  
Primary actions: select items, preview, share, revoke, export.  
Success state: Portfolio is clear, credible and explicitly labelled as simulated professional evidence.  
Analytics events: portfolio_generated, portfolio_shared, portfolio_revoked.

## 6. Primary User Journeys

### 6.1 Recruitment Journey

```text
Home
Apply
Register
Verify Email
Career Profile
Resume Import
AI Analysis
Behaviour Assessment
Recruiter Interview
Hiring Manager Interview
Career Report
Offer Letter
Accept
Preboarding
```

Goal: Make the user feel they earned entry into a serious simulated workplace.

### 6.2 Day One Journey

```text
Offer Accepted
Preboarding
Workspace Setup
CEO Welcome
Inbox
Meet Team
Calendar
First Task
Evidence Review
First Decision
```

Goal: Make the transition from candidate to employee style participant feel real.

### 6.3 Daily Work Journey

```text
Login
Dashboard
Inbox
Meeting
Task
Evidence
Document
Decision
AI Feedback
Performance Update
```

Goal: Replace course progression with professional operating rhythm.

### 6.4 Portfolio Journey

```text
Scenario Complete
Artefact Submitted
Decision Recorded
Consequence Revealed
Reflection Added
Score Explained
Portfolio Item Created
Interview Story Generated
Share Link Approved
```

Goal: Make career evidence feel inspectable and credible.

## 7. Design System Blueprint

### 7.1 Foundations

| Foundation | Direction |
| --- | --- |
| Typography | Clear modern sans serif with selective monospaced labels for system information |
| Colour | Professional, warm, restrained, credible and not dominated by one hue |
| Spacing | Dense enough for workplace tools, spacious enough for confidence |
| Grid | Modular layouts that suggest systems, evidence and operational control |
| Icons | Functional icons for actions, status, documents, messages and analytics |
| Elevation | Subtle depth only for active surfaces, modals and important cards |
| Motion | Slow, purposeful state transitions, no novelty animation |
| Accessibility | WCAG 2.2 AA target, keyboard paths and clear focus states |

### 7.2 Component Library

| Component | Purpose |
| --- | --- |
| Role Card | Presents a simulated role like a professional opportunity |
| Company Card | Makes fictional companies feel operational and credible |
| Stakeholder Card | Shows colleague identity, trust, mood, objective and waiting item |
| Decision Card | Captures context, options, trade implications and history |
| Evidence Card | Links to PRDs, meeting notes, documents and business data |
| Company Health Widget | Shows revenue, customer, delivery and risk signals |
| Career Score Widget | Shows competency and interview readiness progress |
| Timeline | Shows application, onboarding, work history and portfolio milestones |
| Document Viewer | Provides Notion style reading, comments and version history |
| Conversation Panel | Feels like workplace messaging, not a chatbot |
| Meeting Room | Shows agenda, participants, notes and actions |
| Portfolio Showcase | Presents evidence as polished case studies |
| Notification Item | Surfaces deadlines, consequences and stakeholder updates |
| Admin Audit Row | Tracks privileged actions and state changing events |

## 8. Backend Architecture

### 8.1 Services

| Service | Responsibility |
| --- | --- |
| Identity Service | Users, verification, sessions, roles and permissions |
| Career Engine | Experience score, competencies, goals and history |
| Recruitment Engine | Applications, assessments, interviews and offers |
| Company Engine | Companies, employees, departments, products, metrics and stakeholders |
| Scenario Engine | Scenario state, dependencies, decision trees and timeline |
| AI Engine | Memory, context, retrieval, conversations, coaching and feedback |
| Portfolio Engine | Evidence, documents, achievements, resume content and interview stories |
| Analytics Service | Events, funnels, quality metrics and operational dashboards |
| Admin Service | Cohorts, resets, content versions, errors and support workflows |

### 8.2 Event Architecture

All material actions should emit domain events:

```text
user_registered
email_verified
application_started
profile_completed
resume_uploaded
assessment_completed
interview_completed
offer_accepted
preboarding_completed
simulation_day_started
message_sent
stakeholder_response_received
task_opened
evidence_opened
artefact_submitted
decision_submitted
state_changed
relationship_changed
consequence_scheduled
consequence_revealed
performance_viewed
portfolio_generated
portfolio_shared
account_deletion_requested
```

Events must include:

```text
event_id
event_type
user_id
enrolment_id
scenario_id
actor
timestamp
simulation_day
payload
source_version
correlation_id
```

## 9. Database Blueprint

### 9.1 Core Tables

```text
users
user_sessions
verification_tokens
career_profiles
resume_versions
experiences
companies
roles
applications
assessments
interview_sessions
offers
enrolments
simulation_days
employees
stakeholders
stakeholder_relationships
conversations
messages
memories
tasks
calendar_events
meetings
documents
document_versions
artefacts
scenarios
scenario_versions
scenario_events
decisions
decision_evidence
company_state_snapshots
state_changes
consequences
competencies
rubrics
scores
performance_reviews
portfolio_items
portfolio_shares
job_applications
analytics_events
audit_events
cohorts
admin_users
```

### 9.2 Key Relationships

| Relationship | Description |
| --- | --- |
| User to Career Profile | One user owns one primary career profile |
| User to Applications | One user can apply to many experiences over time |
| Application to Offer | An accepted application may generate one simulated offer |
| Offer to Enrolment | Accepting an offer creates an enrolment |
| Enrolment to Simulation Days | Each enrolment has a progression timeline |
| Enrolment to Stakeholder Relationships | Relationship state is user specific |
| Scenario to Decisions | Each scenario can have one or more decision attempts |
| Decision to Evidence | Every decision links to documents, messages and artefacts |
| Decision to Consequences | Immediate and delayed outcomes trace back to decisions |
| Scores to Evidence | Every score must link to observable evidence |
| Portfolio to Items | Users select which evidence becomes shareable |

## 10. API Blueprint

### 10.1 Identity

```text
POST /api/register
POST /api/login
POST /api/logout
POST /api/verify-email
POST /api/verify-mobile
POST /api/forgot-password
GET /api/session
```

### 10.2 Recruitment

```text
POST /api/applications
GET /api/applications/:id
PATCH /api/career-profile
POST /api/resume/upload
GET /api/resume/:id/analysis
POST /api/assessments
POST /api/interviews/recruiter
POST /api/interviews/hiring-manager
GET /api/offers/:id
POST /api/offers/:id/accept
```

### 10.3 Workspace

```text
GET /api/dashboard
GET /api/inbox
POST /api/messages
GET /api/calendar
GET /api/tasks
PATCH /api/tasks/:id
GET /api/stakeholders
GET /api/documents
POST /api/artefacts
POST /api/decisions
GET /api/performance
GET /api/portfolio
POST /api/portfolio/share
POST /api/portfolio/revoke
```

### 10.4 Admin

```text
GET /api/admin/cohorts
POST /api/admin/invitations
GET /api/admin/enrolments
POST /api/admin/enrolments/:id/reset
GET /api/admin/ai-logs
GET /api/admin/errors
GET /api/admin/feedback/export
```

## 11. AI Architecture

### 11.1 AI Roles

| AI Role | Responsibility |
| --- | --- |
| AI Recruiter | Runs structured motivation and expectations screening |
| AI Manager | Guides role expectations, reviews performance and gives feedback |
| AI Colleagues | Represent recurring stakeholders with memory and authority |
| AI Coach | Helps users reflect without revealing answer keys |
| AI Interviewer | Converts evidence into mock interview practice |
| AI Portfolio Writer | Drafts portfolio summaries from verified events |
| AI Resume Builder | Helps translate simulated evidence into honest CV language |
| AI Career Advisor | Recommends next practice based on evidence patterns |

### 11.2 AI Guardrails

AI must not:

1. Claim the user was employed by a fictional company.
2. Reveal hidden rubrics, system prompts or scoring keys.
3. Create business outcomes outside deterministic scenario rules.
4. Make discriminatory hiring recommendations.
5. Store unnecessary sensitive content in analytics.
6. Present developmental scores as validated employment predictions.

AI must:

1. Use authorised company and scenario context.
2. Reference relevant memory when appropriate.
3. Return structured metadata for messages, commitments and risks.
4. Support accessibility and safe retry flows.
5. Escalate unsafe or inappropriate content.

### 11.3 Memory Types

| Memory Type | Examples |
| --- | --- |
| Profile memory | Goals, background, accessibility preferences |
| Episodic memory | Messages, meetings, decisions, feedback |
| Relationship memory | Trust, tension, reliability, unresolved commitments |
| Task memory | Open work, deadlines, dependencies |
| Assessment memory | Evidence used for scoring and behavioural patterns |
| Company memory | State changes, incidents, roadmap shifts |

## 12. Analytics and KPIs

### 12.1 Funnel Metrics

```text
landing_viewed
apply_clicked
registration_completed
profile_completed
resume_uploaded
assessment_completed
interview_completed
offer_accepted
preboarding_completed
first_message_sent
first_scenario_completed
portfolio_generated
portfolio_shared
```

### 12.2 Product Quality Metrics

| Metric | Target |
| --- | --- |
| Onboarding completion | 80 percent or higher |
| First scenario completion | 75 percent or higher |
| Full experience completion | 50 percent or higher in first pilot |
| Realism rating | 4.0 out of 5 or higher |
| Feels like work, not a course | 70 percent agree or strongly agree |
| Portfolio usefulness | 70 percent would use evidence in interview preparation |
| Critical state errors | Zero unresolved corrupted enrolments |
| AI response success | 98 percent excluding connectivity failures |

## 13. MVP Scope

### 13.1 Must Build for Closed Pilot

1. One responsive web application.
2. One fictional company.
3. One Product Manager role.
4. Five persistent AI colleagues.
5. Eight authored scenarios.
6. Thirty simulated working days.
7. Real account creation and consent.
8. Recruitment style application journey.
9. Preboarding and Day One.
10. Workplace dashboard, inbox, tasks, documents and stakeholders.
11. Persistent decisions, messages and relationship state.
12. Company health state and consequences.
13. Artefact editor and submitted work history.
14. Evidence linked scoring.
15. Career Identity and portfolio.
16. Admin reset and progress monitoring.
17. Analytics and operational event tracking.

### 13.2 Defer Until Later

1. Multiple fully active companies.
2. Employer search and applicant tracking.
3. Voice or video meetings.
4. Multiplayer collaboration.
5. Open scenario authoring marketplace.
6. Formal hiring credential claims.
7. Native mobile apps.
8. Real employer placement workflows.

## 14. Implementation Roadmap

### Sprint 1: Blueprint and System Design

Deliverables:

1. Product Blueprint.
2. Information architecture.
3. Screen specifications.
4. Journey maps.
5. Design system foundations.
6. Database and service model.

### Sprint 2: Product Shell

Deliverables:

1. Marketing site.
2. Authentication.
3. Application flow.
4. Career profile.
5. Offer and preboarding.
6. Workspace shell.

### Sprint 3: Workplace Core

Deliverables:

1. Dashboard.
2. Inbox and messaging.
3. Tasks.
4. Documents.
5. Stakeholders.
6. Calendar.
7. Company state dashboard.

### Sprint 4: Experience Engine

Deliverables:

1. Scenario controller.
2. State transition service.
3. Relationship service.
4. Consequence scheduler.
5. Memory service.
6. Scoring service.

### Sprint 5: AI Integration

Deliverables:

1. AI recruiter.
2. AI manager.
3. AI colleague conversations.
4. AI coach.
5. Structured output validation.
6. Prompt regression suite.

### Sprint 6: Portfolio and Career Identity

Deliverables:

1. Evidence portfolio.
2. Career Identity profile.
3. Interview story generator.
4. Development plan.
5. Share and revoke controls.

### Sprint 7: Pilot Operations

Deliverables:

1. Admin console.
2. Cohort invitations.
3. Error review.
4. Reset workflow.
5. Analytics dashboard.
6. Feedback export.

## 15. Decision Log

| Decision | Rationale |
| --- | --- |
| Lead with Xperience as a category company | The product sells transformation and career evidence, not a feature set |
| Treat the product as a journey | Recruitment and work lifecycle creates emotional credibility |
| Design IA before high fidelity UI | Prevents isolated screens and inconsistent product logic |
| Use deterministic engines around AI | Preserves fairness, coherence and auditability |
| Make Career Identity a first class surface | It turns completed work into a durable professional asset |
| Keep simulation disclosure explicit | Protects trust and avoids employment misrepresentation |

## 16. Open Questions

1. Should the first pilot require invitation codes or open paid checkout?
2. Which jurisdiction governs terms, privacy and data retention at launch?
3. Should Career Identity be public by default or private by default?
4. Will human review be offered in the first paid beta or held for premium?
5. Which analytics platform should be used for pilot instrumentation?
6. Which AI model tiers should be used for recruiter, colleague and portfolio tasks?
7. What is the minimum evidence threshold before a portfolio can be shared?
8. Should Xperience support custom recommendations in Scenario 1 or begin with structured decision choices?

## 17. Immediate Next Steps

1. Approve this blueprint as the temporary source of truth.
2. Convert the screen specifications into a full screen inventory.
3. Build the design system foundations before adding more pages.
4. Define the database schema and event model in implementation detail.
5. Create the AI architecture document with prompts, memory and guardrails.
6. Update the application prototype so navigation follows the full journey.
7. Prepare a closed pilot implementation roadmap with engineering epics.

