import type { Metadata } from "next";
import { Outfit, Lora } from "next/font/google";
import { TempoProvider } from "@/lib/TempoContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-editorial",
  display: "swap",
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

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
    <html lang="en" className={`${outfit.variable} ${lora.variable}`}>
      <body>
        <TempoProvider>
          {children}
          <Footer />
          <Navigation />
        </TempoProvider>
      </body>
    </html>
  );
}
