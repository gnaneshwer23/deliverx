import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ProductSuiteShell } from "@/components/dx/product-suite-shell";
import { requireXperienceAuth } from "@/lib/xperience/require-auth";

export const metadata: Metadata = {
  title: "Experience app | DeliverX",
  description: "Build professional experience inside a simulated AI company.",
};

export default async function XperienceAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireXperienceAuth();
  return <ProductSuiteShell>{children}</ProductSuiteShell>;
}
