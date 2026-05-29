import { SchemaNotReadyError } from "@/lib/db-errors";

export function SchemaMigrationBanner({ message }: { message: string }) {
  return (
    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-medium">Database setup required</p>
      <p className="mt-1 text-amber-800">{message}</p>
      <p className="mt-2 text-xs text-amber-700">
        Apply migrations in <code className="rounded bg-amber-100 px-1">supabase/migrations</code> via{" "}
        <code className="rounded bg-amber-100 px-1">supabase db push</code> or the Supabase SQL editor.
      </p>
    </div>
  );
}

export function schemaErrorMessage(err: unknown): string | null {
  if (err instanceof SchemaNotReadyError) return err.message;
  return null;
}
