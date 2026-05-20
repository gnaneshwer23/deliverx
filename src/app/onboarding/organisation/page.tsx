import { OrganisationForm } from "./organisation-form";

export default function OrganisationPage() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">
        Tell us about your organisation
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        We&apos;ll use this to set up your workspace.
      </p>

      <OrganisationForm />
    </div>
  );
}
