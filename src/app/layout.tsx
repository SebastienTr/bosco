import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, Nunito } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegistrar } from "@/components/pwa/ServiceWorkerRegistrar";
import NativeShareListener from "@/components/native/NativeShareListener";
import "./globals.css";
import { messages } from "./messages";

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
  title: messages.meta.title,
  description: messages.meta.description,
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#1B2D4F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSerifDisplay.variable} ${nunito.variable} font-sans antialiased`}
      >
        {children}
        <Toaster richColors position="bottom-center" />
        <ServiceWorkerRegistrar />
        <NativeShareListener />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
