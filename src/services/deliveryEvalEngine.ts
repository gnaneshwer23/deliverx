/**
 * Delivery intelligence evaluation — forecast accuracy, proposal rates, learning signals.
 */

export type ForecastAccuracyRow = {
  projectId: string;
  projectName: string;
  predictedDate: string | null;
  actualCloseDate: string | null;
  errorDays: number | null;
};

export type DeliveryEvalMetrics = {
  closedProjectCount: number;
  activeProjectCount: number;
  forecastSamples: number;
  meanAbsoluteErrorDays: number | null;
  proposalTotal: number;
  proposalApproved: number;
  proposalRejected: number;
  proposalApprovalRate: number | null;
  estimationPacksApproved: number;
  recentForecastAccuracy: ForecastAccuracyRow[];
  /** ML v1 model trained on closed projects */
  slipModel: SlipModelEval | null;
  errorHistogram: Array<{ label: string; count: number }>;
  weeklyMaeTrend: Array<{ label: string; mae: number | null; samples: number }>;
};

export type SlipModelEval = {
  sampleCount: number;
  trainingMae: number | null;
  mlWeightCap: number;
  trainedAt: string;
  topFeatures: Array<{ feature: string; weight: number }>;
};

export function computeMeanAbsoluteError(rows: ForecastAccuracyRow[]): number | null {
  const errors = rows
    .map((r) => r.errorDays)
    .filter((e): e is number => e != null && Number.isFinite(e));
  if (errors.length === 0) return null;
  return Math.round((errors.reduce((s, e) => s + Math.abs(e), 0) / errors.length) * 10) / 10;
}

export function computeApprovalRate(approved: number, total: number): number | null {
  if (total === 0) return null;
  return Math.round((approved / total) * 100);
}
