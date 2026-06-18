"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  saveOrgNotificationSettings,
  sendTestNotification,
} from "@/services/notificationService";
import {
  getOrgIntegrationSettings,
  saveOrgIntegrationSettings,
  saveProjectIntegrationSettings,
  testGitHubConnection,
} from "@/services/githubIntegration";
import { saveOrgSsoSettings } from "@/services/orgSso";

export type SettingsState = { ok: boolean; error?: string };

export async function updateOrganisationAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const name = String(formData.get("name") ?? "").trim();
  const industry = String(formData.get("industry") ?? "").trim() || null;
  const teamSize = String(formData.get("team_size") ?? "").trim() || null;
  const deliveryType = String(formData.get("delivery_type") ?? "").trim() || null;

  if (!name) return { ok: false, error: "Organisation name is required." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id")
    .single();
  if (!profile?.organisation_id) {
    return { ok: false, error: "No organisation linked to your account." };
  }

  const { error } = await supabase
    .from("organisations")
    .update({
      name,
      industry,
      team_size: teamSize,
      delivery_type: deliveryType,
    })
    .eq("id", profile.organisation_id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/workspace/settings");
  revalidatePath("/workspace/dashboard");
  return { ok: true };
}

export async function updateProfileAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const name = String(formData.get("name") ?? "").trim() || null;
  const avatarUrl = String(formData.get("avatar_url") ?? "").trim() || null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const { error } = await supabase
    .from("users")
    .update({
      name,
      avatar_url: avatarUrl,
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/workspace/settings");
  revalidatePath("/workspace/dashboard");
  return { ok: true };
}

export async function saveNotificationSettingsAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  try {
    const recipientsRaw = String(formData.get("digest_recipients") ?? "");
    const digestRecipients = recipientsRaw
      .split(/[,;\n]/)
      .map((e) => e.trim())
      .filter(Boolean);

    const threshold = Number(formData.get("reminder_threshold_hours") ?? 48);

    await saveOrgNotificationSettings({
      slackWebhookUrl: String(formData.get("slack_webhook_url") ?? "").trim() || null,
      teamsWebhookUrl: String(formData.get("teams_webhook_url") ?? "").trim() || null,
      digestEnabled: formData.get("digest_enabled") === "on",
      digestRecipients,
      notifyOnProposalApply: formData.get("notify_on_proposal_apply") === "on",
      notifyOnPendingReminder: formData.get("notify_on_pending_reminder") === "on",
      reminderThresholdHours: Number.isFinite(threshold) ? threshold : 48,
    });

    revalidatePath("/workspace/settings");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not save notification settings",
    };
  }
}

export async function sendTestNotificationAction(): Promise<SettingsState> {
  try {
    const result = await sendTestNotification();
    return result.ok ? { ok: true } : { ok: false, error: result.message };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Test notification failed",
    };
  }
}

export async function saveGitHubOrgSettingsAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  try {
    const tokenRaw = String(formData.get("github_token") ?? "").trim();
    const existing = await getOrgIntegrationSettings().catch(() => null);

    await saveOrgIntegrationSettings({
      githubToken: tokenRaw || existing?.github_token || null,
      githubWebhookSecret:
        String(formData.get("github_webhook_secret") ?? "").trim() ||
        existing?.github_webhook_secret ||
        null,
      enabled: formData.get("enabled") === "on",
    });

    revalidatePath("/workspace/settings");
    revalidatePath("/workspace/engineer");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not save GitHub settings",
    };
  }
}

export async function saveGitHubProjectSettingsAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  try {
    const projectId = String(formData.get("project_id") ?? "").trim();
    const githubOwner = String(formData.get("github_owner") ?? "").trim();
    const githubRepo = String(formData.get("github_repo") ?? "").trim();

    if (!projectId) return { ok: false, error: "Project is required." };
    if (!githubOwner || !githubRepo) {
      return { ok: false, error: "GitHub owner and repository are required." };
    }

    await saveProjectIntegrationSettings({
      projectId,
      githubOwner,
      githubRepo,
    });

    revalidatePath("/workspace/settings");
    revalidatePath("/workspace/engineer");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not save project mapping",
    };
  }
}

export async function testGitHubConnectionAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  try {
    const owner = String(formData.get("github_owner") ?? "").trim();
    const repo = String(formData.get("github_repo") ?? "").trim();
    let token = String(formData.get("github_token") ?? "").trim();

    if (!token) {
      const org = await getOrgIntegrationSettings();
      token = org?.github_token ?? "";
    }

    if (!owner || !repo || !token) {
      return { ok: false, error: "Owner, repo, and token are required to test." };
    }

    const result = await testGitHubConnection({ owner, repo, token });
    return result.ok ? { ok: true } : { ok: false, error: result.message };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Connection test failed",
    };
  }
}

export async function saveOrgSsoSettingsAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  try {
    await saveOrgSsoSettings({
      enabled: formData.get("enabled") === "on",
      allowedDomainsRaw: String(formData.get("allowed_domains") ?? ""),
      idpName: String(formData.get("idp_name") ?? "").trim() || null,
      ssoRequired: formData.get("sso_required") === "on",
    });

    revalidatePath("/workspace/settings");
    revalidatePath("/login");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not save SSO settings",
    };
  }
}
