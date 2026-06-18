/**
 * Delivery slip model v1 — lightweight ridge regression on closed-project outcomes.
 * Trains in-process from org history; blends with rules-based forecast when enough samples exist.
 */

import type { ProjectSignals } from "./intelligenceEngine";

export type SlipTrainingSample = {
  features: number[];
  label: number;
  projectId: string;
  projectName: string;
};

export type TrainedSlipModel = {
  weights: number[];
  featureLabels: string[];
  sampleCount: number;
  trainingMae: number | null;
  lambda: number;
  trainedAt: string;
};

export const SLIP_FEATURE_LABELS = [
  "intercept",
  "overdueTasks",
  "blockers",
  "risks",
  "velocity",
  "milestoneProgress",
  "healthScore",
  "confidenceScore",
] as const;

const FEATURE_COUNT = SLIP_FEATURE_LABELS.length;
const MIN_SAMPLES = 3;
const DEFAULT_LAMBDA = 0.8;

export function extractSlipFeatures(input: {
  signals: ProjectSignals;
  healthScore: number;
  confidenceScore: number;
}): number[] {
  const { signals, healthScore, confidenceScore } = input;
  return [
    1,
    signals.overdueTasks,
    signals.blockers,
    signals.risks,
    signals.velocity,
    signals.milestoneProgress,
    healthScore / 100,
    confidenceScore / 100,
  ];
}

export function predictSlipDays(model: TrainedSlipModel, features: number[]): number {
  const days = features.reduce(
    (sum, value, index) => sum + value * (model.weights[index] ?? 0),
    0,
  );
  return Math.max(0, Math.round(days));
}

export function trainSlipModel(
  samples: SlipTrainingSample[],
  lambda = DEFAULT_LAMBDA,
): TrainedSlipModel | null {
  if (samples.length < MIN_SAMPLES) return null;

  const weights = ridgeRegression(
    samples.map((s) => s.features),
    samples.map((s) => s.label),
    lambda,
  );

  const predictions = samples.map((s) => predictSlipDays({ weights } as TrainedSlipModel, s.features));
  const errors = samples.map((s, i) => Math.abs(s.label - predictions[i]));
  const trainingMae =
    errors.length > 0
      ? Math.round((errors.reduce((a, b) => a + b, 0) / errors.length) * 10) / 10
      : null;

  return {
    weights,
    featureLabels: [...SLIP_FEATURE_LABELS],
    sampleCount: samples.length,
    trainingMae,
    lambda,
    trainedAt: new Date().toISOString(),
  };
}

/** Ramp ML influence as closed-project samples accumulate (max 70%). */
export function mlBlendWeight(sampleCount: number): number {
  if (sampleCount < MIN_SAMPLES) return 0;
  return Math.min(0.7, sampleCount / 25);
}

export function blendDelayDays(
  rulesDelay: number,
  mlDelay: number,
  sampleCount: number,
): { blended: number; mlWeight: number } {
  const mlWeight = mlBlendWeight(sampleCount);
  const blended = Math.round(rulesDelay * (1 - mlWeight) + mlDelay * mlWeight);
  return { blended: Math.max(0, blended), mlWeight };
}

function ridgeRegression(
  X: number[][],
  y: number[],
  lambda: number,
): number[] {
  const n = FEATURE_COUNT;
  const xtx = Array.from({ length: n }, () => Array(n).fill(0));
  const xty = Array(n).fill(0);

  for (let i = 0; i < X.length; i++) {
    const row = X[i];
    const target = y[i];
    for (let a = 0; a < n; a++) {
      xty[a] += row[a] * target;
      for (let b = 0; b < n; b++) {
        xtx[a][b] += row[a] * row[b];
      }
    }
  }

  for (let i = 0; i < n; i++) {
    xtx[i][i] += lambda;
  }

  return solveLinearSystem(xtx, xty);
}

function solveLinearSystem(matrix: number[][], vector: number[]): number[] {
  const n = vector.length;
  const aug = matrix.map((row, i) => [...row, vector[i]]);

  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[pivot][col])) pivot = row;
    }
    [aug[col], aug[pivot]] = [aug[pivot], aug[col]];

    const pivotVal = aug[col][col];
    if (Math.abs(pivotVal) < 1e-10) continue;

    for (let row = col + 1; row < n; row++) {
      const factor = aug[row][col] / pivotVal;
      for (let j = col; j <= n; j++) {
        aug[row][j] -= factor * aug[col][j];
      }
    }
  }

  const result = Array(n).fill(0);
  for (let row = n - 1; row >= 0; row--) {
    let sum = aug[row][n];
    for (let col = row + 1; col < n; col++) {
      sum -= aug[row][col] * result[col];
    }
    const diag = aug[row][row];
    result[row] = Math.abs(diag) < 1e-10 ? 0 : sum / diag;
  }

  return result;
}

export function buildErrorHistogram(
  errorDays: number[],
  bucketSize = 7,
): Array<{ label: string; count: number }> {
  if (errorDays.length === 0) return [];

  const buckets = new Map<string, number>();
  for (const err of errorDays) {
    const abs = Math.abs(err);
    const bucketStart = Math.floor(abs / bucketSize) * bucketSize;
    const bucketEnd = bucketStart + bucketSize - 1;
    const label =
      bucketStart === 0 ? `0–${bucketSize - 1}d` : `${bucketStart}–${bucketEnd}d`;
    buckets.set(label, (buckets.get(label) ?? 0) + 1);
  }

  return [...buckets.entries()].map(([label, count]) => ({ label, count }));
}
