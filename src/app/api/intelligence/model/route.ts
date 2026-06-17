import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/auth";
import { trainOrgSlipModel } from "@/services/deliverySlipModelTrain";

export async function GET() {
  try {
    const model = await trainOrgSlipModel();
    if (!model) {
      return NextResponse.json({
        ready: false,
        minSamples: 3,
        message: "Need at least 3 closed projects with outcome labels to train.",
      });
    }

    return NextResponse.json({
      ready: true,
      sampleCount: model.sampleCount,
      trainingMae: model.trainingMae,
      lambda: model.lambda,
      trainedAt: model.trainedAt,
      featureLabels: model.featureLabels,
      weights: model.weights,
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
