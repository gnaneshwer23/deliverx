export type SendEmailInput = {
  to: string[];
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailResult =
  | { sent: true; id?: string }
  | { sent: false; reason: string };

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim() || "DeliverX <onboarding@resend.dev>";

  if (!apiKey) {
    return { sent: false, reason: "RESEND_API_KEY is not configured" };
  }

  const to = input.to.map((e) => e.trim()).filter(Boolean);
  if (to.length === 0) {
    return { sent: false, reason: "No recipient addresses" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: input.subject,
      html: input.html,
      text: input.text ?? stripHtml(input.html),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return {
      sent: false,
      reason: detail.slice(0, 300) || `Resend API error (${res.status})`,
    };
  }

  const payload = (await res.json()) as { id?: string };
  return { sent: true, id: payload.id };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function sendReportPublishedEmail(input: {
  reportTitle: string;
  projectName: string;
  content: string;
  recipients: string[];
  appUrl: string;
}): Promise<SendEmailResult> {
  const preview = input.content.slice(0, 4000);
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 640px; line-height: 1.5;">
      <h2 style="color: #1C4A2E;">${escapeHtml(input.reportTitle)}</h2>
      <p style="color: #6B6B64;">Project: <strong>${escapeHtml(input.projectName)}</strong></p>
      <p style="color: #6B6B64;">This report was published from DeliverX.</p>
      <hr style="border: none; border-top: 1px solid #E4E4DC;" />
      <pre style="white-space: pre-wrap; font-size: 14px; color: #2C2C28;">${escapeHtml(preview)}</pre>
      <p style="margin-top: 24px;">
        <a href="${escapeHtml(input.appUrl)}" style="color: #1C4A2E;">Open workspace</a>
      </p>
    </div>
  `;

  return sendEmail({
    to: input.recipients,
    subject: `[DeliverX] ${input.reportTitle} — ${input.projectName}`,
    html,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
