import { redirect } from "next/navigation";

/** Alias for audit/UX expectation of /cookie as well as /cookies. */
export default function CookieAliasPage() {
  redirect("/cookies");
}
