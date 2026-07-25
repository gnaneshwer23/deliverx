import { redirect } from "next/navigation";
import { PI_LEARNING_PATH } from "@/lib/learning-intelligence/types";

export const dynamic = "force-dynamic";

/** Alias under profile — canonical surface is /learning. */
export default function ProfileLearningRedirect() {
  redirect(PI_LEARNING_PATH);
}
