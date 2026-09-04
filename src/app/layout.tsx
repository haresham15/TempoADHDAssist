import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TempoProvider } from "@/lib/TempoContext";
import Navigation from "@/components/Navigation";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tempo | RSD Communication Buffer & Pattern Insights",
  description: "AI-assisted communication, self-awareness, and emotional regulation tool for rejection-sensitive moments.",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' }
    ]
  }
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
