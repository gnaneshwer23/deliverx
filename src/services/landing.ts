import { createClient } from "@/lib/supabase/server";
import { getWorkspaceDashboard } from "./dashboard";

export type LandingPreviewStats = {
  live: boolean;
  confidence: number;
  atRisk: number;
  blocked: number;
  signals: Array<{ tone: "red" | "amber" | "green"; text: string; badge: string }>;
};

const DEMO: LandingPreviewStats = {
  live: false,
  confidence: 84,
  atRisk: 3,
  blocked: 4,
  signals: [
    {
      tone: "red",
      text: "NHS EHR scope increased 34%. Finance approval outstanding 12 days.",
      badge: "High",
    },
    {
      tone: "amber",
      text: "Sprint velocity down 22% — QA bottleneck detected.",
      badge: "Med",
    },
    {
      tone: "green",
      text: "Architecture sign-off received. Phase 2 can proceed.",
      badge: "OK",
    },
  ],
};

export async function getLandingPreviewStats(): Promise<LandingPreviewStats> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return DEMO;

    const { data: profile } = await supabase
      .from("users")
      .select("organisation_id")
      .maybeSingle();
    if (!profile?.organisation_id) return DEMO;

    const data = await getWorkspaceDashboard();
    const top = data.projectHealth[0];
    const confidence = top?.confidenceScore ?? data.portfolioHealth ?? 84;
    const atRisk = data.projectHealth.filter((p) => p.healthTier === "at-risk").length;
    const blocked = data.delivery.blockedTasks;

    const signals: LandingPreviewStats["signals"] = [];
    for (const risk of data.openRisks.slice(0, 2)) {
      signals.push({
        tone: risk.severity === "critical" || risk.severity === "high" ? "red" : "amber",
        text: `${risk.title} — ${risk.project_name}`,
        badge: risk.severity === "critical" ? "High" : "Med",
      });
    }
    if (data.delivery.blockedTasks > 0) {
      signals.push({
        tone: "amber",
        text: `${data.delivery.blockedTasks} task(s) blocked across your portfolio.`,
        badge: "Med",
      });
    }
    if (signals.length === 0 && top) {
      signals.push({
        tone: "green",
        text: `${top.name} tracking at ${top.healthScore}% health.`,
        badge: "OK",
      });
    }
    while (signals.length < 3) {
      signals.push(DEMO.signals[signals.length]!);
    }

    return {
      live: true,
      confidence: Math.round(confidence),
      atRisk,
      blocked,
      signals: signals.slice(0, 3),
    };
  } catch {
    return DEMO;
  }
}
