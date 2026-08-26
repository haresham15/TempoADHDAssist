import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TempoProvider } from "@/lib/TempoContext";
import Navigation from "@/components/Navigation";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tempo | Intent-Driven Support",
  description: "AI-powered digital therapeutic tool designed specifically for the ADHD brain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <TempoProvider>
          {children}
          <Navigation />
        </TempoProvider>
      </body>
    </html>
  );
}
