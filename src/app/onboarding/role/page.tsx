import { RoleForm } from "./role-form";

export default function RolePage() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">
        What&apos;s your role?
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        We&apos;ll tailor your workspace based on what you do.
      </p>
      <RoleForm />
    </div>
  );
}
