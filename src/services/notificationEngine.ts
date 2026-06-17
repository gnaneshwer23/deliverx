/**
 * Notification formatting — Slack blocks, Teams cards, digest sections.
 */

import type { ProposedActionRow } from "./proposedActions";

export type DigestSection = {
  title: string;
  items: string[];
};

export type ProposalNotificationContext = {
  proposalTitle: string;
  actionType: string;
  projectName: string;
  projectId: string;
  summary?: string;
  calendarUrl?: string;
  outlookCalendarUrl?: string;
  appUrl: string;
};

export function buildProposalAppliedSlackBlocks(ctx: ProposalNotificationContext) {
  const fields = [
    { type: "mrkdwn", text: `*Project:*\n${ctx.projectName}` },
    { type: "mrkdwn", text: `*Action:*\n${ctx.actionType.replace(/_/g, " ")}` },
  ];

  const blocks: Record<string, unknown>[] = [
    {
      type: "header",
      text: { type: "plain_text", text: "Proposal applied", emoji: true },
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: `*${ctx.proposalTitle}*` },
      fields,
    },
  ];

  if (ctx.summary) {
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: ctx.summary.slice(0, 500) },
    });
  }

  const actions: Record<string, unknown>[] = [
    {
      type: "button",
      text: { type: "plain_text", text: "Open project" },
      url: `${ctx.appUrl}/project/${ctx.projectId}`,
    },
  ];

  if (ctx.calendarUrl) {
    actions.push({
      type: "button",
      text: { type: "plain_text", text: "Add to Google Calendar" },
      url: ctx.calendarUrl,
    });
  }
  if (ctx.outlookCalendarUrl) {
    actions.push({
      type: "button",
      text: { type: "plain_text", text: "Add to Outlook" },
      url: ctx.outlookCalendarUrl,
    });
  }

  if (actions.length > 0) {
    blocks.push({ type: "actions", elements: actions });
  }

  return {
    text: `Proposal applied: ${ctx.proposalTitle}`,
    blocks,
  };
}

export function buildProposalAppliedTeamsCard(ctx: ProposalNotificationContext) {
  const facts = [
    { name: "Project", value: ctx.projectName },
    { name: "Action", value: ctx.actionType.replace(/_/g, " ") },
  ];

  const actions: Record<string, unknown>[] = [
    {
      type: "Action.OpenUrl",
      title: "Open project",
      url: `${ctx.appUrl}/project/${ctx.projectId}`,
    },
  ];

  if (ctx.calendarUrl) {
    actions.push({
      type: "Action.OpenUrl",
      title: "Google Calendar",
      url: ctx.calendarUrl,
    });
  }
  if (ctx.outlookCalendarUrl) {
    actions.push({
      type: "Action.OpenUrl",
      title: "Outlook Calendar",
      url: ctx.outlookCalendarUrl,
    });
  }

  return {
    "@type": "MessageCard",
    "@context": "https://schema.org/extensions",
    summary: `Proposal applied: ${ctx.proposalTitle}`,
    themeColor: "0F766E",
    title: "DeliverX — Proposal applied",
    sections: [
      {
        activityTitle: ctx.proposalTitle,
        facts,
        text: ctx.summary?.slice(0, 500) ?? undefined,
      },
    ],
    potentialAction: actions,
  };
}

export function buildDigestSlackBlocks(
  orgName: string,
  sections: DigestSection[],
  appUrl: string,
) {
  const blocks: Record<string, unknown>[] = [
    {
      type: "header",
      text: { type: "plain_text", text: `Daily digest — ${orgName}`, emoji: true },
    },
  ];

  for (const section of sections) {
    if (section.items.length === 0) continue;
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${section.title}*\n${section.items.map((i) => `• ${i}`).join("\n")}`,
      },
    });
  }

  blocks.push({
    type: "actions",
    elements: [
      {
        type: "button",
        text: { type: "plain_text", text: "Open workspace" },
        url: appUrl,
      },
    ],
  });

  return {
    text: `DeliverX daily digest — ${orgName}`,
    blocks,
  };
}

export function buildReminderSlackBlocks(
  orgName: string,
  items: string[],
  appUrl: string,
) {
  return {
    text: `DeliverX reminders — ${orgName}`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "Approval reminders", emoji: true },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: items.map((i) => `• ${i}`).join("\n"),
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Review approvals" },
            url: `${appUrl}/workspace/approvals`,
          },
        ],
      },
    ],
  };
}

export function proposalToNotificationContext(
  proposal: ProposedActionRow,
  applyResult: Record<string, unknown>,
  projectName: string,
  appUrl: string,
): ProposalNotificationContext {
  return {
    proposalTitle: proposal.title,
    actionType: proposal.action_type,
    projectName,
    projectId: proposal.project_id,
    summary: proposal.summary,
    calendarUrl: applyResult.calendarUrl ? String(applyResult.calendarUrl) : undefined,
    outlookCalendarUrl: applyResult.outlookCalendarUrl
      ? String(applyResult.outlookCalendarUrl)
      : undefined,
    appUrl,
  };
}
