# Xperience Build Bible

Version: 0.1  
Status: Implementation ready master specification draft  
Product: Xperience  
Category: Professional career evidence platform  
Core outcome: Build a career before you have one.

## 1. Purpose

This document consolidates the Xperience product vision, landing pages, recruitment journey, personalised onboarding, employee workspace, experience engine, career engine, AI layer, admin portal, QA strategy and release readiness into one implementation ready source of truth.

The goal is to make Xperience buildable by a full product team:

1. Designer.
2. Frontend engineer.
3. Backend engineer.
4. AI engineer.
5. QA engineer.
6. Data and analytics owner.
7. Founder or investor reviewer.

Xperience should not become another simulation platform. It should feel like a professional operating system where a user moves through a real career lifecycle.

## 2. Product Frame

Most products after onboarding show a dashboard with progress and learning continuation. Xperience must avoid that pattern.

The product should ask:

What does your company need from you today?

Every screen should reinforce that the user is inside a professional journey:

```text
Discover
Apply
Register
Verify
Create Career Identity
Upload Resume
Complete Assessment
Interview
Receive Offer
Accept Offer
Preboard
Open Workspace
Work
Decide
Experience Consequences
Review Performance
Build Portfolio
Prepare for Interviews
Apply to Real Opportunities
```

## 3. Master Product Documentation Set

The complete product documentation set should eventually include:

| Document | Purpose |
| --- | --- |
| Vision and Business Strategy | Defines category, positioning, ICP and business model |
| Functional PRD | Defines what the product must do |
| UX and Information Architecture | Defines every page, screen and navigation path |
| UI Design System | Defines visual language and reusable components |
| Backend Technical Design | Defines services, permissions, jobs and infrastructure |
| AI Architecture and Prompt Specifications | Defines AI roles, memory, context and guardrails |
| Database Schema | Defines tables, relationships, indexes and RLS |
| API Specifications | Defines endpoints, contracts, errors and auth |
| QA Strategy and Test Cases | Defines test coverage and release gates |
| Analytics and KPI Framework | Defines events, funnels and success thresholds |
| Release Readiness Checklist | Defines launch criteria |
| Operational Runbook | Defines support, incident and admin procedures |

This Build Bible is the top level index and working source of truth.

## 4. Phase 1: Marketing Website

### 4.1 Question Answered

Why should I join Xperience?

### 4.2 Required Deliverables

| Deliverable | Purpose | MVP Status |
| --- | --- | --- |
| Homepage | Category promise and primary conversion | Built prototype |
| Experiences page | Available roles and future roles | Built prototype |
| Product Manager Experience page | Sell first active experience | Built prototype |
| Career Identity page | Explain durable evidence profile | Prototype section |
| How It Works | Explain journey and credibility | Prototype section |
| Pricing | Communicate pilot offer | Built prototype |
| Employers | Future credibility for hiring teams | Not yet built |
| About | Mission and trust | Not yet built |
| Contact | Lead and support capture | Not yet built |

### 4.3 Functional Requirements

1. Hero communicates the value proposition in under five seconds.
2. Every CTA leads to a correct next step.
3. Pages use Xperience brand consistently with capital X.
4. Public copy avoids implying real employment or accreditation.
5. Product Manager is the only active experience for MVP.
6. Future roles can be shown as inactive or coming soon.
7. Pricing can be visible even if checkout is deferred.

### 4.4 QA Checklist

| Category | Checks |
| --- | --- |
| Value proposition | First time visitor can describe Xperience after one page view |
| CTA routing | Apply, Experiences, Workplace and Portfolio links resolve correctly |
| Navigation | Desktop, tablet and mobile navigation works consistently |
| States | Empty, loading and error states exist where dynamic data appears |
| Accessibility | Keyboard navigation, colour contrast and focus states meet WCAG AA target |
| Responsive | Layout works across common breakpoints |
| Performance | Largest Contentful Paint target under 2.5 seconds |
| SEO | Titles, descriptions, Open Graph and structured data are present |
| Analytics | Page views, CTA clicks and scroll depth fire correctly |

## 5. Phase 2: Recruitment Journey

### 5.1 Question Answered

Can I join this company?

### 5.2 Required Deliverables

1. Registration.
2. Email verification.
3. Mobile verification as future capability.
4. Career Identity creation.
5. Resume upload.
6. LinkedIn import as future capability.
7. AI career analysis.
8. Behaviour assessment.
9. Recruiter interview.
10. Career Readiness Report.
11. Offer Letter.

### 5.3 User Flow

```text
Landing Page
Apply
Register
Verify Email
Career Identity
Resume Upload
AI Career Analysis
Behaviour Assessment
Recruiter Interview
Career Readiness Report
Offer Letter
Accept Offer
```

### 5.4 Functional Requirements

| ID | Requirement |
| --- | --- |
| REC 01 | User can create an account with email and password or magic link |
| REC 02 | User must verify email before starting the active experience |
| REC 03 | Duplicate registration attempts are handled gracefully |
| REC 04 | Career Identity captures goals, background, sector, timezone and accessibility needs |
| REC 05 | Resume upload accepts PDF and DOCX |
| REC 06 | Resume parsing failure does not block progress |
| REC 07 | Behaviour assessment stores all answers and timestamps |
| REC 08 | Recruiter interview can be paused and resumed |
| REC 09 | Offer is generated only after prerequisites are complete |
| REC 10 | Progress persists if the user leaves midway |

### 5.5 QA Checklist

1. Email verification links expire correctly.
2. Duplicate registrations show a helpful recovery path.
3. Resume parsing extracts expected information.
4. AI analysis produces structured, explainable outputs.
5. Behaviour assessment records answers accurately.
6. Interview resume restores transcript and state.
7. Offer generation is blocked until prerequisites complete.
8. User can return later and continue from the last valid step.
9. All sensitive content is private by default.

## 6. Phase 3: Preboarding

### 6.1 Question Answered

I am hired. What happens before Day One?

### 6.2 Required Deliverables

1. Welcome pack.
2. Company handbook.
3. Organisation chart.
4. Meet your manager.
5. Meet your team.
6. Workspace preferences.
7. Notification preferences.
8. Ready for Day One.

### 6.3 User Flow

```text
Offer Accepted
Welcome Pack
Simulation Disclosure
Company Handbook
Organisation Chart
Meet Manager
Meet Team
Workspace Preferences
Notification Preferences
Ready for Day One
Open Workspace
```

### 6.4 Functional Requirements

| ID | Requirement |
| --- | --- |
| PRE 01 | Mandatory preboarding steps cannot be skipped |
| PRE 02 | Completion state persists across sessions |
| PRE 03 | Company assets load correctly |
| PRE 04 | User preferences are saved and reflected in the workspace |
| PRE 05 | Simulation disclosure is explicit and accepted |
| PRE 06 | First day agenda is generated after preboarding completion |

### 6.5 QA Checklist

1. User cannot access Day One until required modules are complete.
2. Completion state survives refresh and logout.
3. Company handbook, org chart and stakeholder content render correctly.
4. Preferences update workspace density, notifications and accessibility settings.
5. Disclosure acceptance is stored with timestamp and version.

## 7. Phase 4: Employee Workspace

### 7.1 Question Answered

What does my company need from me today?

### 7.2 Required Deliverables

1. Dashboard.
2. Inbox.
3. Calendar.
4. Tasks.
5. Team.
6. Company.
7. Documents.
8. Analytics.
9. Performance.
10. Career.
11. Portfolio.
12. AI Coach.
13. Settings.

### 7.3 Workspace Design Principle

The workspace should feel like opening a company laptop on the first day. It should not feel like a learning management system.

The user should see:

1. Role.
2. Department.
3. Manager.
4. Day of experience.
5. Today’s priority.
6. Company health.
7. Personal progress.
8. Agenda.
9. Inbox.
10. Tasks.
11. Live company feed.
12. Stakeholder feed.
13. Career progress.
14. Documents.
15. AI Coach.

### 7.4 Dashboard Requirements

| Area | Required Content |
| --- | --- |
| Employee Header | Greeting, role, department, manager, day, priority |
| Company Health | Revenue, churn risk, NPS, delivery risk |
| Your Progress | Day, experience completion, promotion readiness, interview readiness |
| Agenda | Meetings with time, title and owner |
| Inbox | Work messages from stakeholders |
| Tasks | Current work, dependencies and scenario links |
| Company Pulse | Revenue, customer satisfaction, engineering capacity, roadmap confidence, morale |
| Live Company Feed | Time stamped company activity |
| Stakeholder Feed | Trust, mood, waiting item and current priority |
| AI Coach | Developmental feedback based on behaviour |
| Career Identity | Experience score and competency signals |
| Documents | Knowledge base and user artefacts |
| Bottom Dock | Quick access to calendar, inbox, meetings, AI Coach, documents and search |

### 7.5 QA Checklist

#### Dashboard

1. Correct greeting and role displayed.
2. Company metrics refresh as expected.
3. Personal progress reflects completed work.
4. Live company feed is ordered by simulated time.
5. User can reach the next best action without confusion.

#### Inbox

1. Messages arrive in the correct order.
2. Read and unread status works.
3. Replies update conversation history.
4. Stakeholder memory is updated when commitments are made.

#### Calendar

1. Meetings display in local timezone.
2. Joining a meeting opens the correct experience.
3. Calendar updates after scenario changes.

#### Tasks

1. Task status is correct.
2. Dependencies are respected.
3. Completing tasks unlocks subsequent tasks.
4. Required artefacts are linked.

#### Company

1. Metrics reflect scenario state.
2. Org chart is accurate.
3. Product information is available.
4. Company facts remain stable unless changed by authorised content version.

#### Stakeholders

1. Trust scores update correctly.
2. Mood reflects recent interactions.
3. Conversation history is retained.
4. Previous promises are visible and can influence future behaviour.

#### Portfolio

1. New evidence is added automatically.
2. Documents are downloadable or exportable where enabled.
3. Competency links remain intact.
4. Sharing is private by default and revocable.

## 8. Phase 5: Experience Engine

### 8.1 Purpose

The Experience Engine is the core simulation system. It controls scenarios, state, relationships, consequences and scoring.

### 8.2 Required Deliverables

1. Scenario Engine.
2. Company State Engine.
3. Stakeholder Engine.
4. Relationship Engine.
5. Consequence Engine.
6. Scoring Engine.

### 8.3 QA Checklist

#### Scenario Engine

1. Correct scenario starts.
2. Preconditions are enforced.
3. Progress is saved.
4. Branching works.
5. User can complete all eight scenarios without manual intervention.

#### Company State Engine

1. Revenue updates correctly.
2. Churn updates correctly.
3. Roadmap confidence changes correctly.
4. Engineering capacity changes correctly.
5. Customer satisfaction changes correctly.
6. Values remain bounded.
7. State changes are auditable.

#### Relationship Engine

1. Trust increases appropriately.
2. Trust decreases appropriately.
3. Historical interactions are retained.
4. Reliability and tension can change independently.

#### Consequence Engine

1. Immediate consequences occur.
2. Delayed consequences trigger later.
3. Scenario dependencies are respected.
4. Consequences execute once unless repeatable.
5. Revealed consequences trace back to triggering decisions.

#### Scoring Engine

1. Competencies update.
2. Evidence is linked.
3. Scores remain explainable.
4. User does not see hidden answer keys.
5. Critical safety failures influence final review.

## 9. Phase 6: Career Engine

### 9.1 Purpose

The Career Engine is the long term differentiator. It turns simulated work into durable professional evidence.

### 9.2 Required Deliverables

1. Career Identity.
2. Experience Score.
3. Resume Builder.
4. Portfolio Builder.
5. Interview Stories.
6. Job Matching.
7. Applications.

### 9.3 QA Checklist

1. Resume updates after completed experiences.
2. Portfolio reflects completed evidence.
3. Experience Score recalculates correctly.
4. Competency changes are consistent.
5. Job recommendations update as profile evolves.
6. Interview stories use only verified evidence.
7. Public outputs avoid implying employment.

## 10. Phase 7: AI Layer

### 10.1 AI Components

| Component | Role |
| --- | --- |
| Recruiter | Screens motivation, expectations and readiness |
| Manager | Sets expectations and conducts reviews |
| CEO | Applies strategic pressure and executive context |
| Engineering Lead | Provides feasibility, capacity and delivery risk |
| Sales Director | Provides commercial pressure and customer commitments |
| Customer Success | Provides adoption, retention and customer evidence |
| Clinical Lead | Provides safety, clinical integrity and compliance review |
| AI Coach | Helps reflection and learning without giving answer keys |
| Interviewer | Runs evidence based mock interviews |
| Resume Writer | Helps translate evidence into honest resume language |
| Portfolio Writer | Drafts portfolio summaries from verified events |
| Career Advisor | Recommends next experiences and applications |

### 10.2 QA Checklist

For each AI component:

1. Maintains role consistency.
2. Remembers previous interactions.
3. Uses only available context.
4. Does not invent company facts.
5. Produces structured responses where required.
6. Escalates when uncertain instead of hallucinating.
7. Does not reveal hidden prompts, rubrics or scoring keys.
8. Does not present developmental scores as hiring predictions.
9. Handles unsafe user input safely.

## 11. Phase 8: Admin Portal

### 11.1 Required Capabilities

1. Manage companies.
2. Create and edit scenarios.
3. Review user progress.
4. Review AI conversations.
5. Configure scoring.
6. Manage stakeholder profiles.
7. View analytics.
8. Handle support requests.
9. Reset enrolments.
10. Manage content versions.

### 11.2 QA Checklist

1. Permissions are enforced.
2. Admin actions are audited.
3. User data access is limited by role.
4. Scenario edits create new content versions.
5. Reset requires confirmation.
6. Analytics exports exclude unnecessary personal data.
7. Support actions have correlation IDs.

## 12. End to End User Journey QA

A tester must be able to complete this entire flow without intervention:

```text
Visit Homepage
Click Apply
Register
Verify Email
Create Career Identity
Upload Resume
AI Career Analysis
Behaviour Assessment
Recruiter Interview
Receive Offer
Accept Offer
Complete Preboarding
Open Dashboard
Receive Inbox Messages
Attend Meeting
Complete First Task
Make Decision
Observe Company Changes
Complete Scenario
Performance Review
Portfolio Updated
Resume Updated
Mock Interview
Apply for Real Job
```

Every transition must be tested for:

1. Functional correctness.
2. State persistence.
3. Navigation.
4. Error handling.
5. Accessibility.
6. Performance.
7. Analytics.
8. Security.

## 13. Definition of Done Template

Every feature must meet measurable completion criteria.

### 13.1 Functional

1. Primary user actions work.
2. Required validation is present.
3. Data persists correctly.
4. User can recover from common mistakes.
5. Permission rules are enforced.

### 13.2 Technical

1. API responses meet agreed latency target.
2. No console errors.
3. Loading and retry behaviour is defined.
4. Error handling is observable.
5. Feature works across supported browsers.

### 13.3 UX

1. Clear empty state.
2. Loading skeletons or progress indicators.
3. Helpful error messages.
4. Clear success state.
5. Consistent interaction pattern.

### 13.4 Accessibility

1. Keyboard navigable.
2. Screen reader labels.
3. Focus management.
4. Colour contrast meets WCAG AA.
5. Reduced motion respected.

### 13.5 Analytics

1. View event fires.
2. Primary action event fires.
3. Error event fires.
4. Completion event fires.
5. Event payload excludes unnecessary sensitive content.

### 13.6 Security

1. Users cannot access another user’s data.
2. Server validates permissions.
3. Sensitive uploads are private.
4. Audit log exists for privileged actions.
5. Secrets are never exposed to the client.

### 13.7 Testing

1. Unit tests.
2. Integration tests.
3. End to end tests.
4. Accessibility checks.
5. Regression coverage for critical flows.

### 13.8 Documentation

1. API documented.
2. User facing behaviour described.
3. Admin behaviour described.
4. Known limitations documented.
5. Monitoring expectations documented.

## 14. Example Feature DoD: Inbox

### Functional

1. User can read messages.
2. User can reply to messages.
3. User can archive messages.
4. User can search messages.
5. User can mark messages as read or unread.
6. Replies are persisted in thread history.
7. Stakeholder memory updates when commitments are made.

### Technical

1. Message list API responds under target latency.
2. Message send API validates enrolment and thread access.
3. Retry behaviour is defined for failed sends.
4. Conversation history paginates.
5. No console errors.

### UX

1. Empty inbox state is clear.
2. Loading state appears before messages load.
3. Failed send shows a recoverable error.
4. Unread messages are visually distinct.
5. Thread layout feels like workplace messaging, not a chatbot.

### Accessibility

1. Message list can be navigated by keyboard.
2. Compose box has accessible label.
3. Send state is announced to screen readers.
4. Focus returns to compose after send failure.

### Analytics

1. message_opened.
2. message_replied.
3. message_archived.
4. message_search_performed.
5. time_to_first_response.

### Security

1. Users cannot access another user’s messages.
2. Message IDs are scoped to enrolment.
3. Raw sensitive content is not duplicated into analytics.

### Testing

1. Unit tests for message sorting and unread counts.
2. Integration test for reply persistence.
3. End to end test for first stakeholder interaction.
4. Permission test for cross user access.

### Documentation

1. API contract documented.
2. Message memory extraction documented.
3. User facing behaviour documented.
4. Admin review behaviour documented.

## 15. Release Readiness Checklist

### 15.1 Product

1. MVP scope signed off.
2. Public wording reviewed for honest simulation.
3. First experience content approved.
4. Pricing and pilot access confirmed.
5. Known limitations documented.

### 15.2 Design

1. Design system foundations complete.
2. Core journey screens approved.
3. Responsive views reviewed.
4. Accessibility review completed.
5. Empty, loading and error states designed.

### 15.3 Engineering

1. Production environment configured.
2. Database migrations reviewed.
3. Auth and permissions tested.
4. API contracts documented.
5. Critical E2E tests passing.
6. Backups and restore process defined.

### 15.4 AI

1. Prompt specifications versioned.
2. Structured output schemas tested.
3. Memory retrieval policy implemented.
4. Guardrail tests passing.
5. Fallback responses defined.
6. Cost controls configured.

### 15.5 QA

1. End to end journey completed without manual intervention.
2. Scenario branch tests passing.
3. Accessibility tests completed.
4. Cross browser tests completed.
5. Performance checks completed.
6. Release blocking defects resolved.

### 15.6 Operations

1. Admin support workflow ready.
2. Incident escalation path defined.
3. Error monitoring configured.
4. Analytics dashboards configured.
5. Pilot feedback collection ready.
6. Account deletion process defined.

## 16. Implementation Sequencing

### 16.1 Build Order

1. Foundation architecture.
2. Authentication and profile.
3. Recruitment flow.
4. Preboarding.
5. Employee Workspace shell.
6. Inbox, tasks, calendar and documents.
7. Scenario 1.
8. State, relationship and consequence engines.
9. AI colleague service.
10. Full eight scenario content.
11. Career Identity and portfolio.
12. Admin portal.
13. Analytics and QA hardening.
14. Closed pilot.

### 16.2 Do Not Build First

1. Open ended autonomous AI agents.
2. Multiple active companies.
3. Employer applicant tracking.
4. Voice or video meetings.
5. Public credential claims.
6. Marketplace authoring.

## 17. Current Prototype Alignment

### 17.1 Built in Current Prototype

1. Professional Xperience landing page.
2. Experiences marketplace.
3. Product Manager Experience detail.
4. Profile and consent flow.
5. Interview and offer flow.
6. MediFlow onboarding.
7. Employee Workspace style dashboard.
8. Scenario workspace.
9. Company state changes.
10. Relationship changes.
11. Decision log.
12. Performance dashboard.
13. Portfolio page.
14. PRD verification page.
15. Lightweight admin reset.

### 17.2 Still Required for Real MVP

1. Real authentication.
2. Email verification.
3. Resume upload and parsing.
4. Backend persistence.
5. Database schema and row level security.
6. True multi page routing.
7. AI services with structured outputs.
8. Analytics pipeline.
9. Full admin portal.
10. End to end automated tests.
11. Accessibility audit.
12. Release readiness runbook.

## 18. Immediate Next Engineering Epic

Epic: Turn the prototype into a routed SaaS shell.

Deliverables:

1. Next.js routes for marketing, recruitment, preboarding, workspace and portfolio.
2. Shared layout system.
3. Persistent app state backed by database.
4. Authentication and session handling.
5. Seeded MediFlow content.
6. Scenario 1 implemented against real data models.
7. Event logging for the critical journey.

Success criteria:

1. A user can register.
2. A user can complete profile and consent.
3. A user can accept the simulated offer.
4. A user can enter the Employee Workspace.
5. A user can complete Scenario 1.
6. The company state updates persist.
7. The portfolio receives its first evidence item.

