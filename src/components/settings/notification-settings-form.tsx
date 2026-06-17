"use client";

import { useActionState, useTransition } from "react";
import { Bell, Send } from "lucide-react";
import { useFormToast } from "@/hooks/use-form-toast";
import {
  saveNotificationSettingsAction,
  sendTestNotificationAction,
  type SettingsState,
} from "@/app/workspace/settings/actions";
import type { OrgNotificationSettings } from "@/services/notificationService";

const initial: SettingsState = { ok: false };

export function NotificationSettingsForm({
  settings,
  emailConfigured,
}: {
  settings: OrgNotificationSettings | null;
  emailConfigured: boolean;
}) {
  const [state, action, pending] = useActionState(saveNotificationSettingsAction, initial);
  const [testState, testAction] = useActionState(sendTestNotificationAction, initial);
  const [, startTest] = useTransition();

  useFormToast(state, { success: "Notification settings saved" });
  useFormToast(testState, { success: "Test notification sent" });

  const recipients = settings?.digest_recipients?.join(", ") ?? "";

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Bell size={20} className="mt-0.5 text-[#0F766E]" />
        <div>
          <p className="text-sm text-[#6B6B64]">
            Slack and Teams webhooks fire when proposals are applied. Daily digests and
            approval reminders run at 08:00 UTC via cron.
          </p>
          {!emailConfigured ? (
            <p className="mt-2 text-xs text-amber-700">
              Set RESEND_API_KEY to enable email digests and reminders.
            </p>
          ) : null}
        </div>
      </div>

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="slack_webhook_url" className="mb-1 block text-sm font-medium text-slate-700">
            Slack incoming webhook URL
          </label>
          <input
            id="slack_webhook_url"
            name="slack_webhook_url"
            type="url"
            defaultValue={settings?.slack_webhook_url ?? ""}
            placeholder="https://hooks.slack.com/services/…"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="teams_webhook_url" className="mb-1 block text-sm font-medium text-slate-700">
            Microsoft Teams webhook URL
          </label>
          <input
            id="teams_webhook_url"
            name="teams_webhook_url"
            type="url"
            defaultValue={settings?.teams_webhook_url ?? ""}
            placeholder="https://….webhook.office.com/…"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="digest_recipients" className="mb-1 block text-sm font-medium text-slate-700">
            Email recipients (comma-separated)
          </label>
          <input
            id="digest_recipients"
            name="digest_recipients"
            defaultValue={recipients}
            placeholder="pm@company.com, lead@company.com"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="digest_enabled"
              defaultChecked={settings?.digest_enabled ?? true}
              className="rounded border-slate-300"
            />
            Daily digest (08:00 UTC)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="notify_on_proposal_apply"
              defaultChecked={settings?.notify_on_proposal_apply ?? true}
              className="rounded border-slate-300"
            />
            Notify on proposal apply
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="notify_on_pending_reminder"
              defaultChecked={settings?.notify_on_pending_reminder ?? true}
              className="rounded border-slate-300"
            />
            Overdue approval reminders
          </label>
        </div>

        <div>
          <label
            htmlFor="reminder_threshold_hours"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Reminder threshold (hours pending)
          </label>
          <input
            id="reminder_threshold_hours"
            name="reminder_threshold_hours"
            type="number"
            min={12}
            max={168}
            defaultValue={settings?.reminder_threshold_hours ?? 48}
            className="w-32 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-9 items-center justify-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62] disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save notification settings"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTest(() => testAction())}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <Send size={14} />
            Send test
          </button>
        </div>
      </form>
    </div>
  );
}
