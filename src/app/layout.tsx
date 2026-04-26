import type { Metadata } from "next";
import { Poppins, DM_Sans, Instrument_Serif, DM_Serif_Display } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-logo-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "ROI Labs | Performance Marketing + AI Automation",
  description:
    "Performance marketing and custom AI automation for ambitious brands. ROI Labs builds revenue-focused paid media programs and bespoke AI systems — measured in real revenue, not vanity metrics.",
  keywords: ["paid ads", "Meta ads", "Google ads", "performance marketing", "AI automation", "custom AI", "ROI"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${poppins.variable} ${dmSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${dmSerifDisplay.variable} antialiased`}
      >
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
