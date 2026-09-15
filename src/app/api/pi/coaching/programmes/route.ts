import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  isCoachingEvidenceEnabled,
  listProgrammesWithExercises,
  COACHING_EVIDENCE_DISABLED_NOTICE,
} from "@/lib/coaching-evidence";

export const dynamic = "force-dynamic";

/** List enabled coaching programmes + exercises for the signed-in learner. */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isCoachingEvidenceEnabled()) {
    return NextResponse.json(
      { error: COACHING_EVIDENCE_DISABLED_NOTICE, enabled: false, deliverxVerified: false },
      { status: 404 },
    );
  }

  const { data, error } = await listProgrammesWithExercises(supabase, { enabledOnly: true });
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ data: data ?? [], error: null, enabled: true, deliverxVerified: false });
}
