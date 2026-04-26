import type { Metadata } from "next";
import { Poppins, DM_Sans, Instrument_Serif, DM_Serif_Display, Montserrat } from "next/font/google";
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

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ROI Labs | Performance Marketing Agency",
  description:
    "Performance marketing agency. We run Meta and Google ads end-to-end — strategy, creative, and measurement focused on revenue, not vanity metrics.",
  keywords: ["paid ads", "Meta ads", "Google ads", "performance marketing", "paid social", "PPC agency", "ROI"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${poppins.variable} ${dmSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${dmSerifDisplay.variable} ${montserrat.variable} antialiased`}
      >
        <Navbar />
        <main>{children}</main>
        <Footer />
        <LeadPopup />
      </body>
    </html>
  );
}
