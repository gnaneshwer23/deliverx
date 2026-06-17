import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/auth";
import { exportTrainingDataset } from "@/services/intelligenceMetrics";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 200);
    const format = url.searchParams.get("format") ?? "json";

    const rows = await exportTrainingDataset(limit);

    if (format === "csv") {
      const headers = Object.keys(rows[0] ?? { projectId: "" });
      const csv = [
        headers.join(","),
        ...rows.map((row) =>
          headers
            .map((h) => {
              const val = String((row as Record<string, unknown>)[h] ?? "");
              return val.includes(",") ? `"${val.replace(/"/g, '""')}"` : val;
            })
            .join(","),
        ),
      ].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="deliverx-training-export.csv"',
        },
      });
    }

    return NextResponse.json({ rows, count: rows.length });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
