<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

These notes come from recent Cloud Agent work in this environment. They describe how to test DeliverX changes here; they do not change product behaviour.

### Auth-gated pages and the placeholder env

- The dev server boots with a placeholder `.env.local`. Public marketing pages render, but any auth-gated page redirects to `/login`. You cannot exercise signed-in UI with `curl` or ordinary browser automation against the shared dev server.
- To verify an auth-gated component visually, render it through a **temporary preview route** (a throwaway page that mounts the component with mock props) and screenshot it with Playwright. **Remove the temporary route and any scaffolding afterwards** so the working tree stays clean.
- To check a flag-on variant in isolation without disturbing the shared dev server, run a **second dev server alongside it** using a separate Next build output directory (e.g. set `NEXT_DIST_DIR` / a `distDir` override) so the two servers do not clobber each other's `.next` cache. Revert this setup once the check is done.

### Exercising real auth / data / AI flows

- To drive real authentication, Supabase data, or AI calls, supply real keys via **Cursor Secrets** (never commit them): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `OPENAI_API_KEY`. Secrets are injected as environment variables into the agent VM.

### Standard checks

- `npx tsc --noEmit` — type check. Note: there are **6 pre-existing errors in `e2e/t6-security-journeys.test.ts`** that are unrelated to new work; do not treat them as regressions introduced by your change.
- `npm run lint` — expect **0 errors** (some pre-existing warnings remain).
- `npm run test:pi` — the Professional Intelligence trust-rail suite; run it when touching trust rails (evidence ledger, capability engine, consent, Verified, related `src/lib/*`).

### Production database safety

- Production Supabase DDL must **never** be applied as part of routine testing or environment setup. Migrations are applied only as an explicit, verified, founder-gated step. Read-only inspection (e.g. Supabase MCP advisors, policy/grant checks) is fine; `apply_migration` and any schema-changing SQL against prod are not.
