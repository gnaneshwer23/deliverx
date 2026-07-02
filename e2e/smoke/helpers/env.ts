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

export function hasLiveEngineerAuth(): boolean {
  const email =
    process.env.E2E_TEST_ENGINEER_EMAIL?.trim() ?? process.env.E2E_TEST_EMAIL?.trim();
  const password =
    process.env.E2E_TEST_ENGINEER_PASSWORD?.trim() ??
    process.env.E2E_TEST_PASSWORD?.trim();
  return Boolean(email && password && process.env.E2E_TEST_PROJECT_ID?.trim());
}

export function hasLiveProjectCreate(): boolean {
  return hasLivePmAuth();
}

export function hasLiveAllRoleInvites(): boolean {
  return hasLivePmAuth() && Boolean(process.env.E2E_TEST_PROJECT_ID?.trim());
}

export function hasLiveBaAcceptFlow(): boolean {
  return hasLiveBaAuth();
}

export function hasLiveBaShareFlow(): boolean {
  return hasLiveBaAuth() && hasLivePmAuth();
}

export function hasLiveCopilot(): boolean {
  return hasLiveSponsorAuth() && Boolean(process.env.E2E_TEST_PROJECT_ID?.trim());
}

export function hasLiveDecisionFlow(): boolean {
  return hasLiveSponsorAuth() && Boolean(process.env.E2E_TEST_PROJECT_ID?.trim());
}

export function hasLiveTeamTasks(): boolean {
  return hasLiveEngineerAuth();
}

export function authCredentials(role: "default" | "pm" | "ba" | "executive" | "engineer" = "default"): {
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
    case "engineer":
      return {
        email:
          process.env.E2E_TEST_ENGINEER_EMAIL?.trim() ?? process.env.E2E_TEST_EMAIL!.trim(),
        password:
          process.env.E2E_TEST_ENGINEER_PASSWORD?.trim() ??
          process.env.E2E_TEST_PASSWORD!.trim(),
      };
    default:
      return {
        email: process.env.E2E_TEST_EMAIL!.trim(),
        password: process.env.E2E_TEST_PASSWORD!.trim(),
      };
  }
}
