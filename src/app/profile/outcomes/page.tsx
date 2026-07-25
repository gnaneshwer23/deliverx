import { redirect } from "next/navigation";
import { OUTCOMES_PATH } from "@/lib/real-world-outcomes/types";

export const dynamic = "force-dynamic";

/** Alias under profile — canonical surface is /career/outcomes. */
export default function ProfileOutcomesRedirect() {
  redirect(OUTCOMES_PATH);
}
