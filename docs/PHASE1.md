# Phase 1 — Product workflows

Shipped on branch `cursor/phase-1`. Four user-facing workflows plus env/docs.

## 1A — Business case upload (PDF / DOCX)

- **API:** `POST /api/documents/extract-text` (auth required, max 12 MB)
- **Libs:** `pdf-parse`, `mammoth` (`serverExternalPackages` in `next.config.ts`)
- **UI:** `/project/new` — upload PDF, DOCX, TXT, MD, or CSV into the brief field

## 1B — Report publish email (Resend)

- **Service:** `src/lib/email/resend.ts`
- **Flow:** `publishReport` in `src/services/governance.ts` sends HTML email when stakeholder emails are provided
- **Env:** `RESEND_API_KEY`, `EMAIL_FROM` (optional — publish succeeds without email; UI shows amber warning)

## 1C — Assistant approve-to-apply

- **Propose:** `proposeAssistantActions` after assistant reply when `projectId` is set
- **Apply:** `POST /api/ai/assistant/apply` — creates RAID items or tasks
- **UI:** `AssistantActionCards` on workspace assistant (`/workspace/assistant`)

Select a project in the assistant sidebar so proposed actions can be applied.

## 1D — Workspace search

- **API:** `GET /api/search?q=...`
- **Page:** `/workspace/search?q=...` — projects, tasks, RAID, documents
- **Nav:** top bar search (desktop) and sidebar **Search**

## Deploy checklist

1. Merge PR to `main`
2. Vercel env (optional for email): `RESEND_API_KEY`, `EMAIL_FROM`
3. Smoke test:
   - Upload a PDF on `/project/new`
   - Publish a report with stakeholder emails
   - Assistant: “Create a high risk for vendor delay” with project selected → Approve & apply
   - Search from nav bar

## Related docs

- `docs/API_KEYS.md` — Resend variables
- `docs/PHASE0_CHECKLIST.md` — prior stabilization
