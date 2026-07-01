export function hasLiveAuth(): boolean {
  return Boolean(process.env.E2E_TEST_EMAIL?.trim() && process.env.E2E_TEST_PASSWORD?.trim());
}

export function hasLivePmAuth(): boolean {
  const email = process.env.E2E_TEST_PM_EMAIL?.trim() ?? process.env.E2E_TEST_EMAIL?.trim();
  const password =
    process.env.E2E_TEST_PM_PASSWORD?.trim() ?? process.env.E2E_TEST_PASSWORD?.trim();
  return Boolean(email && password);
}

export function hasLiveBaAuth(): boolean {
  const email = process.env.E2E_TEST_BA_EMAIL?.trim() ?? process.env.E2E_TEST_EMAIL?.trim();
  const password =
    process.env.E2E_TEST_BA_PASSWORD?.trim() ?? process.env.E2E_TEST_PASSWORD?.trim();
  return Boolean(email && password && process.env.E2E_TEST_PROJECT_ID?.trim());
}

export function hasLiveStandupFlow(): boolean {
  return hasLivePmAuth() && Boolean(process.env.E2E_TEST_PROJECT_ID?.trim());
}

export function hasLiveSponsorAuth(): boolean {
  const email =
    process.env.E2E_TEST_EXECUTIVE_EMAIL?.trim() ?? process.env.E2E_TEST_EMAIL?.trim();
  const password =
    process.env.E2E_TEST_EXECUTIVE_PASSWORD?.trim() ??
    process.env.E2E_TEST_PASSWORD?.trim();
  return Boolean(email && password);
}

export function liveProjectId(): string {
  return process.env.E2E_TEST_PROJECT_ID?.trim() ?? "";
}

export function liveMeetingId(): string | undefined {
  const id = process.env.E2E_TEST_MEETING_ID?.trim();
  return id || undefined;
}

export function authCredentials(role: "default" | "pm" | "ba" | "executive" = "default"): {
  email: string;
  password: string;
} {
  switch (role) {
    case "pm":
      return {
        email: process.env.E2E_TEST_PM_EMAIL?.trim() ?? process.env.E2E_TEST_EMAIL!.trim(),
        password:
          process.env.E2E_TEST_PM_PASSWORD?.trim() ?? process.env.E2E_TEST_PASSWORD!.trim(),
      };
    case "ba":
      return {
        email: process.env.E2E_TEST_BA_EMAIL?.trim() ?? process.env.E2E_TEST_EMAIL!.trim(),
        password:
          process.env.E2E_TEST_BA_PASSWORD?.trim() ?? process.env.E2E_TEST_PASSWORD!.trim(),
      };
    case "executive":
      return {
        email:
          process.env.E2E_TEST_EXECUTIVE_EMAIL?.trim() ?? process.env.E2E_TEST_EMAIL!.trim(),
        password:
          process.env.E2E_TEST_EXECUTIVE_PASSWORD?.trim() ??
          process.env.E2E_TEST_PASSWORD!.trim(),
      };
    default:
      return {
        email: process.env.E2E_TEST_EMAIL!.trim(),
        password: process.env.E2E_TEST_PASSWORD!.trim(),
      };
  }
}
