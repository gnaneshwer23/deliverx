import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/auth";
import { buildPmInviteRoleRows, rolesNeedingInviteLinks } from "@/lib/workspace-flow-invites";
import { generateAllRoleInviteLinks } from "@/services/inviteTokenService";

type Body = {
  projectId?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const projectId = body.projectId?.trim();

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const rows = await buildPmInviteRoleRows(projectId);
    const roles = rolesNeedingInviteLinks(rows);

    if (roles.length === 0) {
      return NextResponse.json({
        ok: true,
        generated: 0,
        skipped: rows.length,
        invites: [],
      });
    }

    const invites = await generateAllRoleInviteLinks({ projectId, roles });

    return NextResponse.json({
      ok: true,
      generated: invites.length,
      skipped: rows.length - roles.length,
      invites,
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
