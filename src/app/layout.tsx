import { Inter, Playfair_Display } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import ConditionalFooter from "@/components/conditionalFooter";
import { Analytics } from '@vercel/analytics/react';
import { UserProvider } from "@/context/userContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Skooli – Verktyg som gör lärardagen lättare",
  description: "Skooli samlar AI-verktyg för lärare på ett ställe. Planera lektioner efter Läroplanen och bygg presentationer med Grej of the Day på några sekunder.",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfairDisplay.variable} font-inter antialiased`}
      >
        <UserProvider>
          {children}
          <ConditionalFooter />
          <Analytics />
        </UserProvider>
      </body>
    </html>
  );
}