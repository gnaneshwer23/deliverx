"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { dxClass } from "@/lib/dx-theme";

type DeptOption = { id: string; name: string };

export function OrgStructureAdminForm({ departments }: { departments: DeptOption[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deptName, setDeptName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamDeptId, setTeamDeptId] = useState("");

  async function createDepartment() {
    setError(null);
    const res = await fetch("/api/org/departments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: deptName }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(json.error ?? "Could not create department");
      return;
    }
    setDeptName("");
    startTransition(() => router.refresh());
  }

  async function createTeam() {
    setError(null);
    const res = await fetch("/api/org/teams", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: teamName,
        departmentId: teamDeptId || undefined,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(json.error ?? "Could not create team");
      return;
    }
    setTeamName("");
    setTeamDeptId("");
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[#6B6B64]">
        Admin — create structure
      </p>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs text-[#6B6B64]">
          Department
          <input
            className="mt-1 block w-48 border border-[#E5E2D9] bg-white px-2 py-1.5 text-sm"
            value={deptName}
            onChange={(e) => setDeptName(e.target.value)}
            placeholder="e.g. Delivery"
            disabled={pending}
          />
        </label>
        <button
          type="button"
          className={dxClass.btnPrimary}
          disabled={pending || !deptName.trim()}
          onClick={() => void createDepartment()}
        >
          Add department
        </button>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs text-[#6B6B64]">
          Team
          <input
            className="mt-1 block w-48 border border-[#E5E2D9] bg-white px-2 py-1.5 text-sm"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g. Platform"
            disabled={pending}
          />
        </label>
        <label className="text-xs text-[#6B6B64]">
          Department (optional)
          <select
            className="mt-1 block w-48 border border-[#E5E2D9] bg-white px-2 py-1.5 text-sm"
            value={teamDeptId}
            onChange={(e) => setTeamDeptId(e.target.value)}
            disabled={pending}
          >
            <option value="">None</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className={dxClass.btnPrimary}
          disabled={pending || !teamName.trim()}
          onClick={() => void createTeam()}
        >
          Add team
        </button>
      </div>
    </div>
  );
}
