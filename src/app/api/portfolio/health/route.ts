import { NextResponse } from "next/server";
import { resolveDefaultPortfolio, getPortfolioSnapshot } from "@/services/portfolio";

export async function GET() {
  try {
    const portfolio = await resolveDefaultPortfolio();
    if (!portfolio) {
      return NextResponse.json({
        configured: false,
        health: 0,
        message: "No portfolio configured",
      });
    }
    const { snapshot, programmes } = await getPortfolioSnapshot(portfolio.id);
    return NextResponse.json({
      configured: true,
      portfolio: {
        id: portfolio.id,
        name: portfolio.name,
      },
      snapshot,
      programmes,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
