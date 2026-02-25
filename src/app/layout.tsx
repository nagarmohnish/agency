import type { Metadata } from "next";
import { Poppins, DM_Sans } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadPopup from "@/components/LeadPopup";

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

export const metadata: Metadata = {
  title: "ROIlabs | Performance Marketing Agency",
  description:
    "We focus on ROI, not ROAS. ROIlabs is a paid media agency managing millions in ad spend across Meta, Google, Snapchat & LinkedIn — driving real revenue growth.",
  keywords: ["paid ads", "Meta ads", "Google ads", "Snapchat ads", "creative agency", "ad creatives", "social media marketing", "performance marketing", "ROI"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${poppins.variable} ${dmSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        <main>{children}</main>
        <Footer />
        <LeadPopup />
      </body>
    </html>
  );
}
