/**
 * Map meeting speakers / impact roles to project workspace member user IDs.
 */

import { dbRoleToImpactRole } from "@/config/helm-copilot";
import type { DeliveryImpactRole } from "@/services/deliveryImpactEngine";
import type { SpeakerSegment } from "@/services/meetingIntelPipeline";
import type { StructuredProposal } from "@/services/proposedActionEngine";

export type MemberForAssignee = {
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  role: string;
};

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

export function resolveMemberBySpeaker(
  speaker: string,
  members: MemberForAssignee[],
): string | null {
  const needle = normalizeName(speaker);
  if (!needle) return null;

  for (const member of members) {
    const name = member.user_name ? normalizeName(member.user_name) : "";
    if (name && (name === needle || name.includes(needle) || needle.includes(name))) {
      return member.user_id;
    }

    const email = member.user_email ?? "";
    const local = email.split("@")[0]?.toLowerCase() ?? "";
    if (local && (local === needle || needle.includes(local))) {
      return member.user_id;
    }
  }

  return null;
}

export function resolveMemberByImpactRole(
  role: DeliveryImpactRole,
  members: MemberForAssignee[],
): string | null {
  for (const member of members) {
    if (dbRoleToImpactRole(member.role) === role) {
      return member.user_id;
    }
  }
  return null;
}

export function enrichProposalsWithAssigneeIds(
  proposals: StructuredProposal[],
  segments: SpeakerSegment[],
  members: MemberForAssignee[],
): StructuredProposal[] {
  if (members.length === 0) return proposals;

  return proposals.map((proposal) => {
    const speaker =
      (proposal.payload.speaker as string | undefined) ??
      segments.find((s) => {
        const haystack = `${proposal.title} ${proposal.summary}`.toLowerCase();
        return haystack.includes(s.speaker.toLowerCase());
      })?.speaker;

    const assigneeRole = proposal.payload.assigneeRole as DeliveryImpactRole | undefined;

    let assigneeId: string | null = null;
    if (speaker) {
      assigneeId = resolveMemberBySpeaker(speaker, members);
    }
    if (!assigneeId && assigneeRole) {
      assigneeId = resolveMemberByImpactRole(assigneeRole, members);
    }

    if (!assigneeId) return proposal;

    return {
      ...proposal,
      payload: {
        ...proposal.payload,
        assigneeId,
      },
    };
  });
}
