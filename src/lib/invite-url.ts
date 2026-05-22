export function inviteBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function buildInviteUrl(token: string) {
  return `${inviteBaseUrl()}/invite/${token}`;
}
