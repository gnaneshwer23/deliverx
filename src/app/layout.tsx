import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { VercelObservability } from "@/components/vercel-observability";
import { dxFontClassName, dxSans } from "@/lib/dx-fonts";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://www.deliverx.dev";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "DeliverX — Professional Intelligence Platform",
  description:
    "DeliverX builds evidence-backed Professional Intelligence — Experience, Career Intelligence, and Professional Workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${dxFontClassName} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className={`${dxSans.className} min-h-full bg-[var(--dx-page)] text-[#0D0D0B] flex flex-col`}
      >
        {children}
        <Toaster richColors closeButton position="top-right" />
        <VercelObservability />
      </body>
    </html>
  );
}
