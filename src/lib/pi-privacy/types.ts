export type PrivacyRequestType = "export" | "delete";

export type PrivacyRequestStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export type PrivacyRequestRecord = {
  id: string;
  userId: string | null;
  requestType: PrivacyRequestType;
  status: PrivacyRequestStatus;
  exportSummary: Record<string, unknown>;
  tablesTouched: string[];
  retentionNote: string;
  errorMessage: string | null;
  requestedAt: string;
  completedAt: string | null;
};

export type PersonPrivacyExport = {
  schemaVersion: 1;
  exportedAt: string;
  userId: string;
  email: string | null;
  tables: Record<string, unknown[]>;
  notes: string[];
};

export type PrivacyDeleteResult = {
  requestId: string;
  tablesTouched: string[];
  authUserDeleted: boolean;
  completedAt: string;
};
