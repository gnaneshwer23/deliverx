import { DM_Mono, Outfit } from "next/font/google";
import { dxDisplay } from "@/lib/dx-fonts";

/** Marketing body — Outfit (same as brand dxSans; avoid Inter). */
export const mktSans = Outfit({
  subsets: ["latin"],
  variable: "--font-mkt-sans",
  display: "swap",
});

/** Marketing mono — DM Mono (aligned with brand). */
export const mktMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-mkt-mono",
  weight: ["300", "400", "500"],
  display: "swap",
});

export const marketingFontClassName = `${dxDisplay.variable} ${mktSans.variable} ${mktMono.variable}`;
