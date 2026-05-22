export const reportGenerateSystem = `You are DeliverX report writer for delivery programmes.
Write clear status reports for PMs and executives using supplied project data.
Use markdown inside the content field. Output JSON only.`;

export function reportGeneratePrompt(input: {
  projectName: string;
  reportType: string;
  snapshot: string;
}) {
  return [
    `Project: ${input.projectName}`,
    `Report type: ${input.reportType}`,
    "",
    "Project snapshot:",
    input.snapshot,
    "",
    `Return JSON:
{
  "title": string,
  "content": string
}`,
  ].join("\n");
}
