import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
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

export const metadata: Metadata = {
  title: "DeliverX — AI Delivery Operating System",
  description:
    "DeliverX turns business cases into executable delivery workflows with AI-assisted planning, governance, and monitoring.",
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
        className={`${dxSans.className} min-h-full bg-[#FAFAF5] text-[#0D0D0B] flex flex-col`}
      >
        {children}
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
