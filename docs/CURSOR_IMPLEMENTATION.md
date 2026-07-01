> **Source:** Complete Cursor Implementation Prompt — preserved from the DeliverX build spec (agent transcript, March 2026). The appendix records gap analysis and H1–H7 build priorities against the live codebase.

# DeliverX — Complete Cursor Implementation Prompt
### What we are building, how it works, and exactly how to build it

---

## READ THIS FIRST — THE ONE-PARAGRAPH BRIEF

DeliverX is an AI-native project delivery platform where a Project Manager uploads
any business case document, and the platform automatically builds personalised
workspaces for every role on the delivery team — Business Analyst, Engineer, QA,
Scrum Master, Product Manager, and Sponsor — each pre-populated from the same
business case. When the team holds a standup meeting, the PM uploads the recording
and AI transcribes it, identifies each speaker, extracts their updates and action
items, and distributes tasks to each person's dashboard automatically. The PM
reviews and approves everything before it sends. The Sponsor gets a read-only
dashboard and a Copilot chat so they can ask plain-English questions about project
progress and get real answers from live data — without ever being briefed manually.

The core USP: **nothing auto-applies without human approval, and no one has to
manually update anyone else. DeliverX updates itself from what the team is doing.**

---

## TECH STACK

```
Frontend:     Next.js 14 (App Router)
Database:     Supabase (PostgreSQL + Row Level Security + Realtime)
Auth:         Supabase Auth
AI:           Anthropic Claude claude-sonnet-4-6 (all AI calls)
Transcription: OpenAI Whisper (audio → text)
Storage:      Supabase Storage (business case files, meeting recordings)
Styling:      Tailwind CSS
Hosting:      Vercel
```

## DESIGN TOKENS — use exactly these, no substitutions

```css
/* Colours */
--green:      #1C4A2E   /* primary brand, CTAs */
--green-mid:  #2D7048
--green-lt:   #3D9660
--green-bg:   #ECFDF5
--blue:       #1A3563   /* PM role colour */
--blue-mid:   #2563EB
--blue-bg:    #EFF6FF
--teal:       #0F766E   /* BA role colour */
--teal-bg:    #F0FDFA
--amber:      #B45309   /* warnings, gaps, action needed */
--amber-bg:   #FFFBEB
--red:        #BE123C   /* critical, risks */
--red-bg:     #FFF1F2
--purple:     #6D28D9   /* Product Manager */
--purple-bg:  #F5F3FF
--surface:    #F7F8FA
--border:     #E2E6EE
--text:       #0C1320
--text-2:     #64748B

/* Typography */
font-display: "DM Serif Display"   /* headings only */
font-body:    "Inter"               /* all body copy, UI */
font-mono:    "DM Mono"            /* labels, IDs, metadata, code */

/* Rules */
- No emojis in production UI
- No dark backgrounds except the AI summary bar and nav
- No placeholder text like "Illustrative" or "coming soon"
- All AI output goes through Accept / Edit / Reject — never auto-applies
- Every empty state has a clear next action
```

## ROLE COLOURS AND SYMBOLS

```
Delivery PM         ⬡   #1A3563 (blue)
Business Analyst    ⬢   #0F766E (teal)
Product Manager     ◈   #6D28D9 (purple)
Engineer            ⬟   #1A3563 (blue)
Scrum Master        ◎   #2D7048 (green)
QA / Test Manager   ◉   #B45309 (amber)
Founder / Sponsor   ◆   #BE123C (red)
```

---

## DATABASE SCHEMA — run these as Supabase migrations

```sql
-- Projects
CREATE TABLE projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  domain          TEXT,              -- 'healthcare' | 'education' | 'fintech' | 'enterprise'
  business_case   TEXT,              -- raw extracted text from uploaded document
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Invite tokens (role-scoped)
CREATE TABLE invite_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES projects(id) ON DELETE CASCADE,
  role            TEXT NOT NULL,
  view_mode       TEXT DEFAULT 'full',   -- 'full' | 'read_only' (sponsors)
  invited_by      UUID REFERENCES auth.users(id),
  token_hash      TEXT UNIQUE NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT now() + interval '7 days',
  revoked_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Workspace members (who is on what project in what role)
CREATE TABLE workspace_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id      UUID REFERENCES projects(id) ON DELETE CASCADE,
  role            TEXT NOT NULL,
  view_mode       TEXT DEFAULT 'full',
  invited_by      UUID REFERENCES auth.users(id),
  joined_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, project_id)
);

-- Requirements (extracted from business case by AI)
CREATE TABLE requirements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES projects(id) ON DELETE CASCADE,
  req_id          TEXT NOT NULL,         -- 'FR-001', 'NFR-003' etc
  title           TEXT NOT NULL,
  description     TEXT,
  priority        TEXT,                  -- 'Critical' | 'High' | 'Medium' | 'Low'
  category        TEXT,                  -- 'functional' | 'non_functional'
  standard_tag    TEXT,                  -- 'FHIR' | 'HL7' | 'DICOM' | 'Security' etc
  status          TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'gap' | 'rejected'
  gap_description TEXT,                  -- if status = 'gap', what is unclear
  approved_by     UUID REFERENCES auth.users(id),
  approved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Clarification gaps (ambiguities from business case)
CREATE TABLE clarification_gaps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES projects(id) ON DELETE CASCADE,
  requirement_id  UUID REFERENCES requirements(id),
  title           TEXT NOT NULL,
  detail          TEXT,
  severity        TEXT DEFAULT 'medium',  -- 'critical' | 'high' | 'medium' | 'low'
  blocks          TEXT,                   -- description of what this blocks
  sent_to         TEXT,                   -- who it was sent to for resolution
  status          TEXT DEFAULT 'open',    -- 'open' | 'resolved'
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Delivery signals (cross-role event propagation)
CREATE TABLE delivery_signals (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id           UUID REFERENCES projects(id) ON DELETE CASCADE,
  source_user_id       UUID REFERENCES auth.users(id),
  source_role          TEXT NOT NULL,
  signal_type          TEXT NOT NULL,
  payload              JSONB NOT NULL DEFAULT '{}',
  severity             TEXT DEFAULT 'info',  -- 'info' | 'warning' | 'critical'
  requires_pm_approval BOOLEAN DEFAULT false,
  approved_at          TIMESTAMPTZ,
  approved_by          UUID REFERENCES auth.users(id),
  created_at           TIMESTAMPTZ DEFAULT now()
);

-- Meetings (standup recordings or transcripts)
CREATE TABLE meetings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_by      UUID REFERENCES auth.users(id),
  title           TEXT,
  meeting_type    TEXT DEFAULT 'standup',  -- 'standup' | 'planning' | 'retro' | 'ad_hoc'
  source          TEXT,                   -- 'upload' | 'paste' | 'recall_ai'
  raw_transcript  TEXT,
  audio_file_url  TEXT,
  status          TEXT DEFAULT 'processing',
  -- 'processing' | 'pending_review' | 'approved' | 'distributed'
  executive_digest TEXT,                  -- for sponsor
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Speaker mapping (who said what in a meeting)
CREATE TABLE meeting_speakers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id      UUID REFERENCES meetings(id) ON DELETE CASCADE,
  speaker_label   TEXT NOT NULL,         -- 'Speaker 1', 'Speaker 2' from diarisation
  mapped_user_id  UUID REFERENCES auth.users(id),
  mapped_name     TEXT,
  mapped_role     TEXT,
  confidence      FLOAT,
  transcript_text TEXT
);

-- Extracted tasks and updates from meetings
CREATE TABLE meeting_extractions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id      UUID REFERENCES meetings(id) ON DELETE CASCADE,
  speaker_id      UUID REFERENCES meeting_speakers(id),
  extraction_type TEXT NOT NULL,
  -- 'task' | 'blocker' | 'update' | 'decision' | 'commitment'
  content         TEXT NOT NULL,
  assignee_id     UUID REFERENCES auth.users(id),
  assignee_name   TEXT,
  due_date        DATE,
  severity        TEXT,
  status          TEXT DEFAULT 'pending_review',
  -- 'pending_review' | 'approved' | 'rejected' | 'distributed'
  approved_by     UUID REFERENCES auth.users(id),
  approved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Tasks (each team member's to-do list)
CREATE TABLE tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES projects(id) ON DELETE CASCADE,
  assignee_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by      UUID REFERENCES auth.users(id),
  title           TEXT NOT NULL,
  description     TEXT,
  source          TEXT DEFAULT 'manual',
  -- 'manual' | 'meeting' | 'ai_proposal' | 'raid'
  source_id       UUID,
  due_date        DATE,
  status          TEXT DEFAULT 'todo',
  -- 'todo' | 'in_progress' | 'done' | 'blocked'
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- RAID log
CREATE TABLE raid_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES projects(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,  -- 'risk' | 'assumption' | 'issue' | 'dependency'
  title           TEXT NOT NULL,
  description     TEXT,
  severity        TEXT DEFAULT 'medium',
  owner_id        UUID REFERENCES auth.users(id),
  status          TEXT DEFAULT 'open',  -- 'open' | 'mitigated' | 'closed'
  source          TEXT,  -- 'business_case' | 'meeting' | 'manual'
  source_id       UUID,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### Row Level Security — apply to all tables

```sql
-- Users can only see data for projects they are members of
CREATE POLICY "project_members_only" ON requirements
  FOR ALL USING (
    project_id IN (
      SELECT project_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );
-- Apply the same pattern to: clarification_gaps, delivery_signals,
-- meetings, meeting_speakers, meeting_extractions, tasks, raid_items
```

---

## API ROUTES — implement all of these

```
POST   /api/projects/create                 PM creates a new project
POST   /api/projects/:id/upload             Upload business case file
POST   /api/projects/:id/extract            Trigger AI extraction from business case
GET    /api/projects/:id/extraction-status  Poll extraction progress
GET    /api/projects/:id/summary            PM-facing summary of BA extractions

POST   /api/invites/generate               PM generates a role-scoped invite link
GET    /api/invites/validate/:token        Validate token on the /join page
POST   /api/invites/accept                 Accept invite → create workspace member
DELETE /api/invites/:id/revoke             PM revokes an invite

POST   /api/workspace/bootstrap            Seed role workspace after invite accepted
GET    /api/workspace/:projectId/:role     Fetch workspace data for a specific role

GET    /api/requirements/:projectId        List all requirements
PATCH  /api/requirements/:id              Accept / edit / reject a requirement
POST   /api/requirements                   Create a requirement manually

GET    /api/signals/:projectId            Fetch signal feed for PM
POST   /api/signals                        Post a delivery signal from any role

POST   /api/meetings/upload               Upload audio file
POST   /api/meetings/paste                Paste transcript text
GET    /api/meetings/:id                  Get meeting with speakers and extractions
POST   /api/meetings/:id/extract          Trigger AI extraction
GET    /api/meetings/:id/review           PM fetches extraction for review
POST   /api/meetings/:id/approve          PM approves → distributes tasks
PATCH  /api/meetings/:id/extractions/:eid Edit an extraction before approving

GET    /api/tasks/:userId                  Fetch a user's task list
POST   /api/tasks                          Create a task
PATCH  /api/tasks/:id                     Update task status

POST   /api/copilot/chat                   Sponsor asks a question
GET    /api/raid/:projectId               Fetch RAID log
POST   /api/raid                           Add a RAID item
```

---

## THE COMPLETE USER JOURNEY — implement every step

### PHASE 1 — PM uploads business case

**Route:** `/projects/new`

**What happens:**
1. PM lands on a clean upload page
2. Drag-and-drop zone accepts PDF, DOCX, TXT, or PPT
3. Also accepts pasted text in a textarea
4. On upload: file stored in Supabase Storage → POST /api/projects/:id/extract called
5. Upload zone transitions to an animated processing state showing extraction stages:
   - "Parsing document structure…"
   - "Detecting industry and domain…"
   - "Extracting functional requirements…"
   - "Extracting non-functional requirements…"
   - "Detecting ambiguities and gaps…"
   - "Extracting objectives and success criteria…"
   - "Flagging risks and assumptions…"
   - "Building traceability stubs…"
6. On complete: PM is redirected to the BA onboarding screen (they see what BA will see)
7. PM can also skip to their own dashboard

**AI extraction call — use this exact prompt:**

```
System:
You are a senior Business Analyst AI. You have been given a business case document
for a project. Extract the following in structured JSON format:

1. project_name: The name of the project
2. domain: The industry/sector (healthcare | education | fintech | construction |
   government | retail | enterprise)
3. objectives: Array of business objectives (max 8)
4. requirements: Array of requirement objects, each with:
   - req_id: Auto-generated (FR-001, FR-002... for functional; NFR-001... for non-functional)
   - title: Single clear sentence
   - category: 'functional' | 'non_functional'
   - priority: 'Critical' | 'High' | 'Medium' | 'Low'
   - standard_tag: Any standard this maps to (FHIR, HL7, DICOM, PCI-DSS, GDPR, etc) or null
   - status: 'pending' (if clear) | 'gap' (if ambiguous or conflicting)
   - gap_description: If status is 'gap', describe what is unclear
5. clarification_gaps: Array of ambiguities that MUST be resolved before sprint 1:
   - title: Clear description of what is unclear
   - severity: 'critical' | 'high' | 'medium'
   - blocks: What cannot proceed until this is resolved
6. risks: Array of risks with title, description, severity ('high' | 'medium' | 'low')
7. ai_summary: One paragraph summary for the PM (plain English, specific, no jargon)
8. pm_summary: One paragraph delivery summary — what the PM needs to know to
   plan the project

Return ONLY valid JSON. No markdown, no preamble, no explanation.
```

---

### PHASE 2 — BA receives invite and reviews extractions

**Route:** `/join?token=<jwt>`

**What happens:**
1. Token is validated against invite_tokens table
2. BA sees branded join page showing:
   - Project name
   - Role (Business Analyst)
   - Who invited them (PM name)
3. BA creates account or signs in
4. POST /api/invites/accept called → creates workspace_members record
5. POST /api/workspace/bootstrap called → seeds BA workspace from extracted data
6. BA redirected to onboarding review screen showing extraction summary:
   - Requirements count
   - Clarification gaps count
   - Objectives identified
   - Traceability stubs
   - Risks flagged
7. BA clicks "Open my workspace" → goes to full BA dashboard

**BA Dashboard — /workspace/ba**

Sidebar navigation:
- Dashboard (home)
- Requirements (with count badge)
- Clarifications (with count badge, amber if > 0)
- Traceability
- Standup log
- Project name
- Team
- Settings

Main content:
1. AI summary bar (dark gradient, white text) — "X requirements extracted from the
   [Project] business case. Y clarification gaps need resolution…"

2. KPI strip (5 tiles):
   - Requirements (blue) — total extracted
   - Approved (green) — BA-confirmed
   - Gaps (amber) — clarifications needed
   - Traceability % (teal) — links built
   - Risks (red) — flagged count

3. Requirements register (left column):
   - Tabs: All / Pending / Approved / Gaps
   - Each row: Req ID | Title | Status chip | Priority | Standard tag | Accept / Edit / Clarify buttons
   - Gap rows highlighted in amber background
   - Accept → updates requirement status, creates signal to PM
   - Clarify → opens clarification modal, sends to stakeholders

4. Traceability matrix (left column, below requirements):
   - 4 columns: Requirement | Story | Test case | Release
   - Rows populated as BA accepts requirements
   - Empty cells show "— Pending" in italic
   - Progress bar at footer

5. Clarification queue (right column):
   - Each row: Severity bar (red/amber) | Title | Req ref | What it blocks | Days open
   - Sorted by severity then age

6. Cross-role impact (right column):
   - What Engineering needs from BA
   - What QA needs from BA
   - PM watching status
   - Product Manager waiting on scope

**"Share with PM" button:**
- Appears in sidebar footer and as a header action
- Triggers: POST /api/signals with type 'ba_workspace_shared'
- PM receives a dashboard notification and their BC summary card updates
- Does NOT require BA to do anything else — it propagates automatically

---

### PHASE 3 — PM dashboard receives BA summary and invites team

**Route:** `/workspace/pm`

**What happens automatically when BA shares:**
- BC summary card appears on PM dashboard with stats from BA workspace
- Intelligence feed updates with "BA shared workspace summary"
- PM sees notification in nav

**PM Dashboard layout:**

1. BC summary card (top, spans full width):
   - Dark gradient header with project name
   - 4 stat tiles: Requirements | Gaps | Risks | Objectives
   - PM delivery summary (AI-generated plain English)
   - Warning banner (amber) if gaps > 0

2. Invite team section below BC card:
   - Header: "Generate invite links for your team"
   - One row per role (6 roles — BA is already joined):
     - Role symbol + name + description
     - Status: "Workspace live ✓" (if joined) OR "Generate link" button (if not)
     - Once generated: shows shortened URL + Copy button
   - Footer: "Generate all links" button
   - Links expire in 7 days, can be revoked

**Invite link generation:**
```javascript
// POST /api/invites/generate
// Body: { project_id, role, view_mode }

const token = jwt.sign(
  { project_id, role, invited_by: pm_user_id, view_mode, exp: now + 7days },
  process.env.INVITE_SECRET
);
// Store hash in invite_tokens table
// Return: { url: `https://deliverx.dev/join?token=${token}` }
```

**Sponsor invite is different:**
- view_mode: 'read_only'
- After joining → /workspace/founder (read-only variant)
- No edit controls anywhere
- Copilot chat + approve decisions only

---

### PHASE 4 — Team members join and get workspaces

**Route:** `/join?token=<jwt>` (same join flow as BA)

**What happens when any team member clicks their link:**
1. Validate token
2. Show branded join page (project name, role, who invited them)
3. Create account / sign in
4. Accept invite → create workspace_members record
5. Bootstrap workspace from business case + accepted BA requirements
6. Redirect to role-specific mission control

**Role-specific routes and their dominant elements:**

```
/workspace/pm       → Milestones, RAID, team status, signal feed
/workspace/ba       → Requirements register, traceability, clarifications
/workspace/product  → Now/Next/Later roadmap, RICE backlog, feature adoption
/workspace/engineer → Sprint stories, PRs, dependencies, blockers
/workspace/qa       → Release readiness ring, defect board, test coverage
/workspace/scrum    → Sprint burndown, impediments, ceremony calendar
/workspace/founder  → Executive briefing, 3 KPIs, decision queue, Copilot (READ ONLY)
```

**Every workspace must:**
- Show a welcome bridge banner on first login:
  "Your workspace was built from the [Project] business case.
   Review the suggestions below — nothing applies until you accept it."
- Show real data or honest "—" — never "Illustrative" or placeholder numbers
- Have an AI Review Queue for all AI-generated content (Accept / Edit / Reject)
- Update in real-time when signals arrive from other roles (Supabase Realtime)

**Signal propagation rules — which signals go where:**

| Event | Created by | PM sees | Sponsor sees | Auto-applies |
|-------|-----------|---------|--------------|--------------|
| Requirement accepted | BA | Yes | No | Yes → traceability |
| Gap clarified | BA | Yes | No | Yes → unblocks stories |
| Story completed | Engineer | Yes | No | Yes → sprint % |
| Critical defect | QA | Yes | Yes | No → PM approves |
| Milestone moved | PM | Yes | Yes | No → approval needed |
| Blocker raised | Any | Yes | If critical | No → PM reviews |
| Meeting summary | AI | Yes | Yes (digest) | No → PM approves |
| Sprint complete | Scrum Master | Yes | No | Yes → velocity |

---

### PHASE 5 — Meeting intelligence (THE CORE USP)

**Route:** `/workspace/pm/meetings/new`

**What happens:**

**Step A — Upload or paste**
- PM uploads audio file (MP3, MP4, WAV, M4A) OR pastes transcript text
- Audio → POST /api/meetings/upload → stored in Supabase Storage → Whisper transcription
- Paste → POST /api/meetings/paste → stored directly

**Step B — AI extraction (use these exact prompts)**

**Prompt 1 — Speaker diarisation:**
```
System:
You are analysing a meeting transcript for a delivery project called "{project_name}".
The known team members are: {team_members_json}

Identify which speaker label corresponds to which team member based on:
- Names mentioned by others
- Role-specific language (e.g. "stories" = engineer, "test cases" = QA)
- Context clues

Return ONLY valid JSON:
{
  "speaker_mapping": [
    {
      "speaker_label": "Speaker 1",
      "matched_name": "Marcus Thompson",
      "matched_role": "engineer",
      "matched_user_id": "uuid-here-or-null",
      "confidence": 0.94,
      "evidence": "Called by name at 00:02:14"
    }
  ]
}
```

**Prompt 2 — Content extraction per speaker:**
```
System:
You are extracting delivery intelligence from a meeting transcript.
Project: {project_name}
Speaker mapping: {speaker_mapping_json}

For each identified speaker, extract:
- status_updates: Things they completed or progressed
- blockers: Things stopping them or others (flag severity: critical/high/medium)
- commitments: Things they said they will do, with any deadlines mentioned
- decisions: Things the group agreed on

Also extract:
- executive_digest: 2-3 sentences for a Sponsor. Cover: overall status, main risks,
  decisions needed. Plain English. No jargon. No delivery terminology.
- pm_summary: What the PM needs to action today.

Return ONLY valid JSON. No markdown. No preamble.

Schema:
{
  "speakers": [
    {
      "name": "Marcus Thompson",
      "role": "engineer",
      "status_updates": ["Reports API complete"],
      "blockers": [
        { "description": "Auth API from platform team — 5 days waiting",
          "severity": "high", "action": "Escalate to PM" }
      ],
      "commitments": [
        { "task": "Chase platform team by EOD", "due": "today" }
      ]
    }
  ],
  "decisions": [],
  "executive_digest": "Sprint is on track at 72%...",
  "pm_summary": "Two items need your action today..."
}
```

**Step C — PM Review interface**

**Route:** `/workspace/pm/meetings/:id/review`

Three sections:

**Section 1 — Speaker transcript**
- One block per identified speaker
- Shows their name, role, what they said verbatim
- Confidence score of speaker identification

**Section 2 — Tasks to distribute**
- One card per extracted task
- Shows: Assignee name + avatar | Task text | Type chip (blocker/action/decision) | Due date
- Each card has: Approve (green) | Edit | Remove buttons
- "Approve all" button at top right
- Nothing is distributed until PM approves

**Section 3 — Executive digest**
- Read-only paragraph
- Label: "For Sponsor — sent after your approval"
- Approve button sends digest to Sponsor's dashboard

**Step D — Distribution (after PM approves)**

Each team member's dashboard:
- New section appears: "From today's standup"
- Shows their specific task with:
  - Task text
  - Source: "Added by PM · From daily standup [date]"
  - Mark done button
  - View full transcript link (always available)

RAID log:
- Blockers auto-added as RAID items (status: 'open')
- Sponsor gets executive digest in their Intelligence Feed
- PM signal feed updates with "Meeting summary distributed to 4 team members"

---

### PHASE 6 — Sponsor view

**Route:** `/workspace/founder`

**Rules — enforce strictly:**
- All edit controls are hidden (CSS: `display:none` + disabled)
- No task assignment
- No RAID editing
- No project settings access
- Read-only badge in nav

**Layout:**

1. AI Briefing (top, dark gradient):
   - Auto-generated after every meeting summary is approved
   - Plain English, 3-4 sentences
   - Mentions: health score, main risk, decisions needed

2. Three KPI tiles:
   - Project health % (green)
   - Budget status (blue)
   - High-severity risks (red)

3. Decisions needed card:
   - Shows escalated decisions with Approve / Decline / Ask Copilot buttons
   - Approving a decision creates a signal that routes back to PM

4. Milestone timeline (simple list):
   - Each milestone: status dot | name | target date | chip (Done/Active/At risk)

5. Copilot chat (right column):
   - Dark gradient header
   - Chat interface (messages + input)
   - Quick question buttons below input
   - AI answers ONLY from live project data — never invents

6. Signal feed (bottom right):
   - High-severity signals from all workspaces
   - Read-only, auto-updating via Supabase Realtime

**Copilot prompt — use exactly this:**
```
System:
You are the DeliverX Delivery Copilot for the project "{project_name}".
You have access to the following live project data:
- Health score: {health_score}
- Budget: {budget_spent} of {budget_total}
- Open milestones: {milestones_json}
- RAID items (open): {raid_json}
- Recent signals (last 7 days): {signals_json}
- Recent meeting summaries: {summaries_json}

Rules you must follow:
1. Answer in plain English. The person asking is a senior stakeholder, not a PM.
2. Be specific — use actual numbers, dates, names, and item references.
3. If you do not have data to answer, say "I don't have that in the project data yet."
4. Never invent data. Never guess.
5. Never make decisions — present options and let the human decide.
6. If the question implies a decision is needed, surface it clearly.
7. Keep answers under 120 words unless the question genuinely requires more.
8. Never use delivery jargon without explaining it.

Conversation history: {history_json}

User question: {question}
```

---

## FILE STRUCTURE — create exactly this

```
deliverx/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── join/
│   │   └── page.tsx                  ← invite acceptance page
│   ├── projects/
│   │   └── new/page.tsx              ← upload business case
│   ├── workspace/
│   │   ├── pm/page.tsx               ← PM dashboard
│   │   ├── ba/page.tsx               ← BA dashboard
│   │   ├── product/page.tsx          ← Product Manager dashboard
│   │   ├── engineer/page.tsx         ← Engineer dashboard
│   │   ├── qa/page.tsx               ← QA dashboard
│   │   ├── scrum/page.tsx            ← Scrum Master dashboard
│   │   └── founder/page.tsx          ← Sponsor read-only dashboard
│   └── api/
│       ├── projects/
│       │   ├── create/route.ts
│       │   ├── [id]/upload/route.ts
│       │   ├── [id]/extract/route.ts
│       │   └── [id]/summary/route.ts
│       ├── invites/
│       │   ├── generate/route.ts
│       │   ├── validate/[token]/route.ts
│       │   ├── accept/route.ts
│       │   └── [id]/revoke/route.ts
│       ├── workspace/
│       │   ├── bootstrap/route.ts
│       │   └── [projectId]/[role]/route.ts
│       ├── requirements/
│       │   ├── [projectId]/route.ts
│       │   └── [id]/route.ts
│       ├── signals/
│       │   └── [projectId]/route.ts
│       ├── meetings/
│       │   ├── upload/route.ts
│       │   ├── paste/route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       ├── extract/route.ts
│       │       ├── review/route.ts
│       │       └── approve/route.ts
│       ├── tasks/
│       │   └── [userId]/route.ts
│       └── copilot/
│           └── chat/route.ts
├── components/
│   ├── nav/
│   │   ├── TopNav.tsx
│   │   └── Sidebar.tsx
│   ├── upload/
│   │   ├── DropZone.tsx
│   │   └── ProcessingState.tsx
│   ├── workspace/
│   │   ├── AIBar.tsx                 ← dark gradient AI summary bar
│   │   ├── KPIStrip.tsx
│   │   ├── RequirementsTable.tsx
│   │   ├── TraceabilityMatrix.tsx
│   │   ├── ClarificationQueue.tsx
│   │   ├── SignalFeed.tsx
│   │   ├── CrossRoleImpact.tsx
│   │   ├── InviteSection.tsx
│   │   └── WelcomeBridge.tsx         ← first-login banner
│   ├── meeting/
│   │   ├── SpeakerCard.tsx
│   │   ├── TaskExtraction.tsx
│   │   └── ExecDigest.tsx
│   └── copilot/
│       └── CopilotChat.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── ai/
│   │   ├── extract-business-case.ts  ← Prompt 1
│   │   ├── diarise-speakers.ts       ← Prompt 2
│   │   ├── extract-meeting.ts        ← Prompt 3
│   │   └── copilot.ts                ← Prompt 4
│   └── signals/
│       └── propagate.ts              ← Signal routing logic
└── types/
    └── index.ts                      ← All TypeScript interfaces
```

---

## CRITICAL PRODUCT RULES — never break these

1. **Human approval gate.** Every AI output — extraction, task, RAID item, summary —
   goes through an Accept / Edit / Reject queue. Nothing auto-applies. Ever.

2. **Honest empty states.** If a field has no data, show "—" with a reason
   ("Waiting for BA to upload business case"). Never show "Illustrative",
   "Coming soon", "N/A", or placeholder data.

3. **One entry point.** The PM generates invite links. Team members do not self-assign
   roles. Sponsors do not get full access. Role = what the token says.

4. **Read-only sponsor.** The /workspace/founder route checks view_mode = 'read_only'
   on the workspace_members record. If this is not 'read_only', hide the entire page
   and show an access error. Never show edit controls to a sponsor.

5. **No jargon in sponsor view.** The Copilot and AI briefing on the founder dashboard
   must never use: RAID, RICE, sprint velocity, burndown, epic, story points, PR,
   WIP limit, or any delivery tool terminology without plain-English explanation.

6. **Full transcript always accessible.** After meeting intelligence runs, every team
   member can access the full transcript. DeliverX surfaces the right information
   first but never hides information from the team.

7. **Supabase Realtime for live updates.** Signal feed, task list, and KPI tiles
   must update without page refresh. Use Supabase Realtime subscriptions on the
   delivery_signals and tasks tables.

8. **No dark backgrounds except:** the AI summary bar (aibar), the nav, and the
   Copilot header. All dashboard backgrounds are white (#FFFFFF) or surface (#F7F8FA).

---

## ACCEPTANCE CRITERIA — THE SYSTEM IS WORKING WHEN

1. PM creates a project and uploads any business case (any industry)
2. AI extracts requirements, gaps, objectives, risks — PM sees the extraction
3. PM generates a BA invite link and shares it
4. BA clicks the link, creates an account, lands in their workspace
5. BA workspace shows extracted requirements from the business case — not demo data
6. BA accepts a requirement — PM's dashboard signal feed updates within 10 seconds
7. BA clicks "Share with PM" — PM dashboard shows BA workspace summary card
8. PM generates invite links for all 6 remaining roles
9. An engineer clicks their link, registers, lands in their Engineer workspace
   pre-populated from the same business case
10. PM uploads a standup recording
11. Within 3 minutes: PM sees speaker-separated transcript and extracted tasks
12. PM approves all tasks
13. Each team member sees their task in their dashboard under "From today's standup"
14. PM generates a Sponsor link
15. Sponsor registers, lands on /workspace/founder (read-only)
16. Sponsor asks Copilot "What is blocking go-live?" and gets a specific answer
    referencing real project data — not a generic response
17. Sponsor approves a decision from the decision queue — PM receives notification

**If all 17 steps work end-to-end with a real project and real team members,
the DeliverX USP is live.**

---

## WHAT TO BUILD FIRST — IMPLEMENTATION ORDER

```
Week 1: Auth + project creation + business case upload + AI extraction
Week 2: Invite system + join flow + workspace_members + BA dashboard
Week 3: PM dashboard + BC summary card + invite link generator
Week 4: 5 remaining role workspaces (Product, Engineer, QA, Scrum, Sponsor)
Week 5: Signal propagation + Supabase Realtime subscriptions
Week 6: Meeting upload + Whisper transcription + speaker diarisation
Week 7: Meeting extraction review + PM approval interface + task distribution
Week 8: Sponsor Copilot + exec digest + decision escalation
Week 9: RAID log + traceability matrix + cross-role impact panels
Week 10: Polish, performance, mobile responsiveness, RLS audit
```

---

## ENVIRONMENT VARIABLES NEEDED

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=           # for Whisper transcription only
INVITE_SECRET=            # JWT signing secret for invite tokens
NEXT_PUBLIC_APP_URL=      # https://deliverx.dev
```

**IMPORTANT:** The SUPABASE_SERVICE_ROLE_KEY and OPENAI_API_KEY must NEVER be
exposed to the browser. All AI calls go through Next.js API routes (server-side).
The ANTHROPIC_API_KEY must also never be in client-side code.

---

## ONE FINAL NOTE FOR CURSOR

This is a real product being built for real delivery teams. The prototype at
/mnt/user-data/outputs/DeliverX_Complete_Workflow.html shows exactly what every
screen should look and feel like. Use it as the visual reference for every
component. The design tokens above are non-negotiable. The product rules above
are non-negotiable. Everything else is implementation detail — use your judgment
on what is most efficient to build given the constraints above.

The most important thing to get right first is the invite system and workspace
bootstrap. Everything else depends on having real users in real workspaces.
Build that first. Build it well.


---

## APPENDIX — Gap list (H1–H7) and implementation status

This appendix consolidates the gap analysis from the implementation spec review (March 2026). It maps what the prompt describes as greenfield against what is live on [deliverx.dev](https://www.deliverx.dev), and lists the remaining build priorities.

### Bottom line

**~70–75% of the spec is implemented** in spirit, with different routes, table names, and AI providers. The **invite → bootstrap → BC → proposals → signals → meetings → sponsor** loop exists. Gaps are mostly **naming alignment**, **BA requirements as first-class rows**, **realtime everywhere**, and **17-step E2E proof in browser**.

### Spec vs what is built today

| Spec says | DeliverX today | Status |
|-----------|----------------|--------|
| Next.js 14 + Anthropic only | Next.js 16; OpenAI (BC, Whisper, Helm) + optional Anthropic/MiniMax | ⚠️ Diverged — works, not spec-exact |
| `/workspace/pm` | `/workspace/pm-mission` | ✅ Same role, different path |
| `/projects/new` upload BC | PM: `/workspace/pm-mission?onboard=1`; Sponsor: `/project/new` GO gate | ⚠️ Split path |
| `delivery_signals` table | `delivery_impact_events` + loop propagation | ✅ Same job, different schema |
| `POST /api/invites/*` | JWT invites, email (Resend), generate-all (F2) | ✅ |
| `bootstrapRoleWorkspace` | On accept | ✅ |
| BA dashboard (reqs, traceability, gaps) | `/workspace/ba` — panels exist; not all as separate DB tables | ⚠️ Partial |
| Meeting Whisper + review + distribute | Paste + Whisper, F3 flow | ✅ |
| Sponsor read-only + Copilot | `/workspace/founder` + Helm (F5), read-only guards | ✅ |
| Supabase Realtime on all feeds | Partial — `DeliveryImpactLiveRefresh` on some routes | ⚠️ |
| Design tokens (DM Serif, no emojis) | `dx-theme` + marketing tokens; some emoji in dev UI | ⚠️ Polish gap |

### 17 acceptance criteria — scorecard

| # | Criterion | Status |
|---|-----------|--------|
| 1 | PM creates project + uploads any BC | ✅ PM onboard + `/project/new` |
| 2 | AI extracts reqs, gaps, objectives, risks | ✅ Structured BC review |
| 3 | PM generates BA invite | ✅ Auto + manual on pm-mission |
| 4 | BA clicks link, registers, lands in workspace | ✅ `/join` → bootstrap |
| 5 | BA workspace from real BC, not demo | ✅ With honest empty states |
| 6 | BA accepts req → PM feed updates <10s | ⚠️ Propagation exists; browser E2E unproven |
| 7 | BA "Share with PM" → PM summary card | ⚠️ Signals yes; exact "Share" button may differ |
| 8 | PM invites all 6 roles | ✅ Generate all (F2) |
| 9 | Engineer joins → seeded workspace | ✅ `bootstrapRoleWorkspace` |
| 10 | PM uploads standup | ✅ Audio (Whisper) or paste |
| 11 | Speaker transcript + tasks in ~3 min | ⚠️ Text speaker parse yes; full diarisation partial |
| 12 | PM approves all tasks | ✅ Proposals / meeting intel review |
| 13 | Tasks on each member dashboard | ⚠️ Kanban + signals; "From today's standup" UX partial |
| 14 | PM generates Sponsor link | ✅ Executive read-only row |
| 15 | Sponsor read-only founder | ✅ F5 |
| 16 | Copilot answers from live data | ✅ Helm |
| 17 | Sponsor approves decision → PM notified | ⚠️ Decision centre exists; full loop partial |

**Rough score: 12–13 / 17** — strong for pilot; not all 17 proven in one live run.

### Schema and API routes

You do not need to rerun the full SQL block as-is. Migrations **0058–0060+** already cover invites, brain storage, workspace members, etc.

| Spec table | Likely exists as |
|------------|------------------|
| `invite_tokens`, `workspace_members` | Migration 0059 |
| `requirements`, `clarification_gaps` | Partially in charter/artifacts/proposals — not 1:1 |
| `meetings`, `meeting_speakers`, `meeting_extractions` | Proposals + meeting intel pipeline — different shape |
| `delivery_signals` | `delivery_impact_events` |

**Recommendation:** Gap doc, not wholesale schema replace — migrate incrementally where BA register needs durable rows.

### Remaining build priorities (H1–H7)

| Priority | Build | Closes |
|----------|-------|--------|
| **H1** | Browser E2E for 17 acceptance steps | Pilot proof |
| **H2** | BA requirement rows + Accept → signal (persist to DB) | Spec §Phase 2 |
| **H3** | "From today's standup" on task/kanban | AC #13 |
| **H4** | Dedicated meeting review page (or deep-link alias) | Spec §Phase 5 |
| **H5** | Realtime subscriptions on impact feed + tasks | Spec rule #7 |
| **H6** | Save this prompt as `docs/CURSOR_IMPLEMENTATION.md` + link from README | Team alignment |
| **H7** | Merge prototype HTML to `main` | Visual reference on repo |

### Environment variables (spec vs production)

| Spec | Vercel / app today |
|------|---------------------|
| `ANTHROPIC_API_KEY` | Optional fallback |
| `OPENAI_API_KEY` | Primary — Whisper + Helm + BC (or `open_api_key` alias) |
| `INVITE_SECRET` | `INVITE_JWT_SECRET` |
| Recall | Skip — Whisper replaces it |

### One sentence for Cursor

> **Don't rebuild from scratch — extend the F1–F5 + G1–G7 spine:** pm-mission BC → proposals → `/join` bootstrap → dashboard signals → Whisper meetings → founder/Helm; close H1–H4 to hit all 17 acceptance criteria.

### Visual reference

The interactive prototype lives at [docs/prototypes/deliverx-complete-workflow.html](prototypes/deliverx-complete-workflow.html). Use it as the visual reference for every component.
