import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Welcome to the Complete Journey | DeliverX",
  description:
    "Your DeliverX account is ready for the Complete Journey — Experience, Launchpad and Professional Workspace.",
};

/** Legacy entry — Complete Journey signups now land on /hub. */
export default function StartBundlePage() {
  redirect("/hub");
}
