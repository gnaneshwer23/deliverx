import { Inter, JetBrains_Mono } from "next/font/google";
import { dxDisplay } from "@/lib/dx-fonts";

export const mktSans = Inter({
  subsets: ["latin"],
  variable: "--font-mkt-sans",
  weight: ["300", "400", "500", "600"],
});

export const mktMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mkt-mono",
  weight: ["400", "500"],
});

export const marketingFontClassName = `${dxDisplay.variable} ${mktSans.variable} ${mktMono.variable}`;
