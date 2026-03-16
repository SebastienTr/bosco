import type { Metadata } from "next";
import { DM_Serif_Display, Nunito } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
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
        <Analytics />
      </body>
    </html>
  );
}
