/** PMs and executives can manage organisation-level settings (matches invitations, approvals). */
export function isOrgAdmin(role: string | null | undefined): boolean {
  return role === "pm" || role === "executive";
}
