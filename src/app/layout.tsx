import type { Metadata } from "next";
import { DM_Serif_Display, Nunito, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif-display",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bosco — Your Sailing Story, Traced on the Map",
  description:
    "Export your GPS track from Navionics, see your exact sailing path on a shareable map. Every tack, every course change, every mile sailed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body
        className={`${dmSerifDisplay.variable} ${nunito.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
