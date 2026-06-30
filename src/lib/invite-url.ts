export function inviteBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/** Legacy org-scoped email invite flow. */
export function buildInviteUrl(token: string) {
  return `${inviteBaseUrl()}/invite/${token}`;
}

/** Project-scoped JWT invite link (Phase 1 join page). */
export function buildJoinUrl(token: string, view?: "sponsor") {
  const params = new URLSearchParams({ token });
  if (view === "sponsor") params.set("view", "sponsor");
  return `${inviteBaseUrl()}/join?${params.toString()}`;
}
