import { Inter, Playfair_Display } from "next/font/google";

export const marketingDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

export const marketingSans = Inter({
  subsets: ["latin"],
  variable: "--font-marketing",
});

export const marketingFontClassName = `${marketingDisplay.variable} ${marketingSans.variable}`;
