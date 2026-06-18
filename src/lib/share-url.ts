export function shareBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function buildShareUrl(token: string) {
  return `${shareBaseUrl()}/share/${token}`;
}
