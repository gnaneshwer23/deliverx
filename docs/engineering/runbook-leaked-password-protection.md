# Runbook — Enable leaked-password protection (TD-006)

**Project:** DeliverX prod · `jibmyxaldetyycmtlxet`  
**Advisor:** `auth_leaked_password_protection` (WARN)  
**Status:** Open — founder action required (2026-07-25)

## Why this cannot be closed from the agent alone

| Path | Result |
| --- | --- |
| SQL migration | Not applicable — Auth GoTrue config, not Postgres |
| Supabase MCP (`plugin-supabase-supabase`) | No tool to update Auth config; `get_advisors` can only **read** the WARN |
| Management API | Documented and valid — see optional PAT path below — but no `SUPABASE_ACCESS_TOKEN` / CLI login is available in this environment |

**Prerequisite:** Leaked password protection is a **Pro Plan and above** feature ([password security docs](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)).

## Founder: three clicks (preferred)

1. Open [Auth → Attack Protection](https://supabase.com/dashboard/project/jibmyxaldetyycmtlxet/auth/protection) while signed into the Akenohealth / DeliverX org.
2. Enable **Leaked password protection** (HaveIBeenPwned / Pwned Passwords). Save if the UI asks.
3. Reply in chat (or re-run security advisors) so an agent can confirm `auth_leaked_password_protection` is gone, then mark TD-006 Closed.

Alternate UI path (same setting): [Auth → Providers → Email](https://supabase.com/dashboard/project/jibmyxaldetyycmtlxet/auth/providers?provider=Email) → password strength / leaked-password controls.

## Optional: Management API (if you have a personal access token)

Do **not** commit the token. From a trusted shell:

```bash
export SUPABASE_ACCESS_TOKEN='sbp_…'   # Account → Access Tokens
curl -sS -X PATCH \
  'https://api.supabase.com/v1/projects/jibmyxaldetyycmtlxet/config/auth' \
  -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{"password_hibp_enabled": true}'
```

Field name is confirmed in the Management API: [Updates a project's auth config](https://supabase.com/docs/reference/api/v1-update-auth-service-config) → `password_hibp_enabled`.

Then verify with MCP `get_advisors` (`type: security`) — the `auth_leaked_password_protection` lint must be absent.

## Evidence snapshot (before enable)

Checked 2026-07-25 via MCP `get_advisors` on `jibmyxaldetyycmtlxet`:

- **Present:** `auth_leaked_password_protection` · level WARN · “Leaked Password Protection Disabled”
- **Remediation:** https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

After enable, re-check advisors and update `technical-debt-register.md` TD-006 to Closed with date + SHA.
