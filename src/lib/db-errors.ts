/** Postgres undefined_table — migration not applied. */
export function isMissingTableError(error: { code?: string } | null): boolean {
  return error?.code === "42P01";
}

export class SchemaNotReadyError extends Error {
  readonly table: string;

  constructor(table: string) {
    super(
      `Database table "${table}" is missing. Run Supabase migrations (e.g. supabase db push or apply via dashboard).`,
    );
    this.name = "SchemaNotReadyError";
    this.table = table;
  }
}

export function throwIfMissingTable(
  error: { code?: string; message?: string } | null,
  table: string,
): void {
  if (isMissingTableError(error)) {
    throw new SchemaNotReadyError(table);
  }
}
