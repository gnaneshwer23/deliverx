import { redirect } from "next/navigation";

/** Canonical how-it-works route is `/how-it-works` (permanent redirect also in next.config). */
export default function SolutionsRedirectPage() {
  redirect("/how-it-works");
}
