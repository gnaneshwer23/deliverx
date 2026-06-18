import { sendEmail, type SendEmailResult } from "./resend";
import type { ProposalNotificationContext } from "@/services/notificationEngine";
import type { DigestSection } from "@/services/notificationEngine";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sectionsToHtml(sections: DigestSection[]): string {
  return sections
    .filter((s) => s.items.length > 0)
    .map(
      (s) =>
        `<h3 style="color:#1C4A2E;margin:16px 0 8px;">${escapeHtml(s.title)}</h3><ul>${s.items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`,
    )
    .join("");
}

export async function sendProposalAppliedEmail(input: {
  ctx: ProposalNotificationContext;
  recipients: string[];
}): Promise<SendEmailResult> {
  const { ctx, recipients } = input;
  const calendarLinks = [
    ctx.calendarUrl
      ? `<a href="${escapeHtml(ctx.calendarUrl)}">Add to Google Calendar</a>`
      : "",
    ctx.outlookCalendarUrl
      ? `<a href="${escapeHtml(ctx.outlookCalendarUrl)}">Add to Outlook</a>`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 640px; line-height: 1.5;">
      <h2 style="color: #1C4A2E;">Proposal applied</h2>
      <p><strong>${escapeHtml(ctx.proposalTitle)}</strong></p>
      <p style="color: #6B6B64;">Project: ${escapeHtml(ctx.projectName)} · ${escapeHtml(ctx.actionType.replace(/_/g, " "))}</p>
      ${ctx.summary ? `<p>${escapeHtml(ctx.summary.slice(0, 500))}</p>` : ""}
      ${calendarLinks ? `<p>${calendarLinks}</p>` : ""}
      <p><a href="${escapeHtml(ctx.appUrl)}/project/${escapeHtml(ctx.projectId)}" style="color: #0F766E;">Open project</a></p>
    </div>
  `;

  return sendEmail({
    to: recipients,
    subject: `[DeliverX] Applied: ${ctx.proposalTitle}`,
    html,
  });
}

export async function sendDailyDigestEmail(input: {
  orgName: string;
  sections: DigestSection[];
  recipients: string[];
  appUrl: string;
}): Promise<SendEmailResult> {
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 640px; line-height: 1.5;">
      <h2 style="color: #1C4A2E;">Daily digest — ${escapeHtml(input.orgName)}</h2>
      ${sectionsToHtml(input.sections)}
      <p style="margin-top: 24px;"><a href="${escapeHtml(input.appUrl)}" style="color: #0F766E;">Open workspace</a></p>
    </div>
  `;

  return sendEmail({
    to: input.recipients,
    subject: `[DeliverX] Daily digest — ${input.orgName}`,
    html,
  });
}

export async function sendReminderEmail(input: {
  orgName: string;
  items: string[];
  recipients: string[];
  appUrl: string;
}): Promise<SendEmailResult> {
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 640px; line-height: 1.5;">
      <h2 style="color: #C0392B;">Approval reminders</h2>
      <p style="color: #6B6B64;">${escapeHtml(input.orgName)}</p>
      <ul>${input.items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>
      <p style="margin-top: 24px;"><a href="${escapeHtml(input.appUrl)}/workspace/approvals" style="color: #0F766E;">Review approvals</a></p>
    </div>
  `;

  return sendEmail({
    to: input.recipients,
    subject: `[DeliverX] Approval reminders — ${input.orgName}`,
    html,
  });
}
