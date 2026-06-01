import { pp } from "@/lib/policy-pilot-theme";

/** PolicyPilot-style HTML for transactional emails (reports, invites) */
export function marketingEmailLayout({
  preheader,
  title,
  bodyHtml,
  ctaLabel,
  ctaUrl,
}: {
  preheader: string;
  title: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): string {
  const cta =
    ctaLabel && ctaUrl
      ? `<p style="margin:28px 0 0"><a href="${ctaUrl}" style="display:inline-block;background:${pp.teal};color:${pp.canvas};font-family:ui-monospace,monospace;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;padding:14px 28px;border-radius:999px">${ctaLabel}</a></p>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width"/>
  <title>${title}</title>
</head>
<body style="margin:0;background:${pp.cream};font-family:system-ui,-apple-system,sans-serif">
  <span style="display:none;max-height:0;overflow:hidden">${preheader}</span>
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:32px 16px">
        <table width="100%" style="max-width:560px" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:${pp.canvas};border-radius:16px;padding:32px 28px;color:${pp.text}">
              <p style="margin:0 0 8px;font-family:ui-monospace,monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:${pp.teal}">DeliverX</p>
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:600;line-height:1.3;color:${pp.text}">${title}</h1>
              <div style="font-size:15px;line-height:1.6;color:${pp.textMuted}">${bodyHtml}</div>
              ${cta}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 8px 0;font-size:11px;color:#6b6b64;text-align:center">
              DeliverX · AI-native delivery OS
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function reportPublishedEmail({
  projectName,
  reportTitle,
  reportUrl,
}: {
  projectName: string;
  reportTitle: string;
  reportUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `Status report published — ${projectName}`,
    html: marketingEmailLayout({
      preheader: `${reportTitle} is ready to read`,
      title: "Your status report is published",
      bodyHtml: `<p>A new report for <strong style="color:${pp.text}">${projectName}</strong> has been published: <em>${reportTitle}</em>.</p>`,
      ctaLabel: "View report",
      ctaUrl: reportUrl,
    }),
  };
}
