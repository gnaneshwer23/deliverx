import { DM_Mono, DM_Serif_Display, Outfit } from "next/font/google";

export const dxDisplay = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-dx-display",
  weight: "400",
});

export const dxSans = Outfit({
  subsets: ["latin"],
  variable: "--font-dx-sans",
});

export const dxMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dx-mono",
  weight: ["300", "400", "500"],
});

export const dxFontClassName = `${dxDisplay.variable} ${dxSans.variable} ${dxMono.variable}`;
