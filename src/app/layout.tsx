import type { Metadata } from "next";
import { TempoProvider } from "@/lib/TempoContext";
import "./globals.css";

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
    <html lang="en">
      <body>
        <TempoProvider>
          {children}
        </TempoProvider>
      </body>
    </html>
  );
}
