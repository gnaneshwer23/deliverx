import { sendEmail, type SendEmailResult } from "./resend";
import { formatInviteRoleLabel } from "@/lib/invite-role-labels";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendProjectInviteEmail(input: {
  to: string;
  projectName: string;
  role: string;
  invitedByName: string;
  joinUrl: string;
  readOnly?: boolean;
}): Promise<SendEmailResult> {
  const roleLabel = formatInviteRoleLabel(input.role);
  const accessNote = input.readOnly
    ? "You&apos;ll have read-only sponsor visibility in this project workspace."
    : "You&apos;ll land in a mission workspace tailored to your role.";

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 640px; line-height: 1.5;">
      <h2 style="color: #1C4A2E;">You&apos;re invited to ${escapeHtml(input.projectName)}</h2>
      <p style="color: #6B6B64;">
        ${escapeHtml(input.invitedByName)} invited you to join as
        <strong>${escapeHtml(roleLabel)}</strong>.
      </p>
      <p style="color: #6B6B64;">${accessNote}</p>
      <p style="margin: 28px 0;">
        <a href="${escapeHtml(input.joinUrl)}"
           style="display: inline-block; background: #1C4A2E; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Accept invitation
        </a>
      </p>
      <p style="color: #A8A89E; font-size: 13px;">
        Or copy this link: ${escapeHtml(input.joinUrl)}
      </p>
      <p style="color: #A8A89E; font-size: 13px; margin-top: 24px;">
        This link expires in 7 days. If you didn&apos;t expect this invite, you can ignore this email.
      </p>
    </div>
  `;

  return sendEmail({
    to: [input.to],
    subject: `[DeliverX] Join ${input.projectName} as ${roleLabel}`,
    html,
  });
}
