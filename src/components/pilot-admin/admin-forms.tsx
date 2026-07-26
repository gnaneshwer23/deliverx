"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { dxClass } from "@/lib/dx-theme";
import {
  PILOT_PROJECT_STATUSES,
  type OrgConfigSnapshot,
  type ProjectConfigSnapshot,
} from "@/lib/pilot-admin";

export function OrgConfigForm({ organisation }: { organisation: OrgConfigSnapshot }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(organisation.name);
  const [industry, setIndustry] = useState(organisation.industry ?? "");
  const [teamSize, setTeamSize] = useState(organisation.teamSize ?? "");
  const [deliveryType, setDeliveryType] = useState(organisation.deliveryType ?? "");

  async function save() {
    setError(null);
    const res = await fetch("/api/org/config", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        industry,
        teamSize,
        deliveryType,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(json.error ?? "Could not save organisation");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs text-[#6B6B64]">
          Organisation name
          <input
            className="mt-1 block w-full border border-[#E5E2D9] bg-white px-2 py-1.5 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={pending}
            required
          />
        </label>
        <label className="text-xs text-[#6B6B64]">
          Industry
          <input
            className="mt-1 block w-full border border-[#E5E2D9] bg-white px-2 py-1.5 text-sm"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            disabled={pending}
          />
        </label>
        <label className="text-xs text-[#6B6B64]">
          Team size
          <input
            className="mt-1 block w-full border border-[#E5E2D9] bg-white px-2 py-1.5 text-sm"
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
            disabled={pending}
          />
        </label>
        <label className="text-xs text-[#6B6B64]">
          Primary delivery type
          <input
            className="mt-1 block w-full border border-[#E5E2D9] bg-white px-2 py-1.5 text-sm"
            value={deliveryType}
            onChange={(e) => setDeliveryType(e.target.value)}
            disabled={pending}
          />
        </label>
      </div>
      <button
        type="button"
        className={dxClass.btnPrimary}
        disabled={pending || !name.trim()}
        onClick={() => void save()}
      >
        {pending ? "Saving…" : "Save organisation"}
      </button>
    </div>
  );
}

export function ProjectConfigForm({ project }: { project: ProjectConfigSnapshot }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(project.name);
  const [goal, setGoal] = useState(project.goal ?? "");
  const [deliveryType, setDeliveryType] = useState(project.deliveryType ?? "");
  const [status, setStatus] = useState(project.status);

  async function save() {
    setError(null);
    const res = await fetch(`/api/org/projects/${project.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        goal,
        deliveryType,
        status,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(json.error ?? "Could not save project");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-3 border-t border-[#F0F0E8] pt-4 first:border-t-0 first:pt-0">
      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-[#6B6B64]">
          Project name
          <input
            className="mt-1 block w-full border border-[#E5E2D9] bg-white px-2 py-1.5 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={pending}
          />
        </label>
        <label className="text-xs text-[#6B6B64]">
          Status
          <select
            className="mt-1 block w-full border border-[#E5E2D9] bg-white px-2 py-1.5 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            disabled={pending}
          >
            {PILOT_PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-[#6B6B64] sm:col-span-2">
          Goal
          <textarea
            className="mt-1 block w-full border border-[#E5E2D9] bg-white px-2 py-1.5 text-sm"
            rows={2}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            disabled={pending}
          />
        </label>
        <label className="text-xs text-[#6B6B64]">
          Delivery type
          <input
            className="mt-1 block w-full border border-[#E5E2D9] bg-white px-2 py-1.5 text-sm"
            value={deliveryType}
            onChange={(e) => setDeliveryType(e.target.value)}
            disabled={pending}
          />
        </label>
      </div>
      <button
        type="button"
        className={dxClass.btnPrimary}
        disabled={pending || !name.trim()}
        onClick={() => void save()}
      >
        {pending ? "Saving…" : "Save project"}
      </button>
    </div>
  );
}

type MemberOption = { id: string; label: string };
type UnitOption = { id: string; name: string };

export function OrgMemberAssignForm({
  departments,
  teams,
  members,
}: {
  departments: UnitOption[];
  teams: UnitOption[];
  members: MemberOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState<"department" | "team">("department");
  const [unitId, setUnitId] = useState("");
  const [userId, setUserId] = useState("");
  const [memberRole, setMemberRole] = useState<"member" | "lead">("member");

  const units = kind === "department" ? departments : teams;

  async function assign() {
    setError(null);
    const res = await fetch("/api/org/members", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind,
        departmentId: kind === "department" ? unitId : undefined,
        teamId: kind === "team" ? unitId : undefined,
        userId,
        memberRole,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(json.error ?? "Could not assign member");
      return;
    }
    setUnitId("");
    setUserId("");
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs text-[#6B6B64]">
          Assign to
          <select
            className="mt-1 block w-36 border border-[#E5E2D9] bg-white px-2 py-1.5 text-sm"
            value={kind}
            onChange={(e) => {
              setKind(e.target.value as "department" | "team");
              setUnitId("");
            }}
            disabled={pending}
          >
            <option value="department">Department</option>
            <option value="team">Team</option>
          </select>
        </label>
        <label className="text-xs text-[#6B6B64]">
          {kind === "department" ? "Department" : "Team"}
          <select
            className="mt-1 block w-48 border border-[#E5E2D9] bg-white px-2 py-1.5 text-sm"
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            disabled={pending}
          >
            <option value="">Select…</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-[#6B6B64]">
          Member
          <select
            className="mt-1 block w-48 border border-[#E5E2D9] bg-white px-2 py-1.5 text-sm"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            disabled={pending}
          >
            <option value="">Select…</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-[#6B6B64]">
          Role
          <select
            className="mt-1 block w-28 border border-[#E5E2D9] bg-white px-2 py-1.5 text-sm"
            value={memberRole}
            onChange={(e) => setMemberRole(e.target.value as "member" | "lead")}
            disabled={pending}
          >
            <option value="member">Member</option>
            <option value="lead">Lead</option>
          </select>
        </label>
        <button
          type="button"
          className={dxClass.btnPrimary}
          disabled={pending || !unitId || !userId}
          onClick={() => void assign()}
        >
          Assign
        </button>
      </div>
    </div>
  );
}
