import type { Metadata, Viewport } from "next";
import { Poppins, DM_Sans, Instrument_Serif, DM_Serif_Display, Montserrat } from "next/font/google";
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

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const SITE_URL = "https://roilabs.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ROI Labs | Performance Marketing Agency",
    template: "%s | ROI Labs",
  },
  description:
    "Performance marketing agency. We run Meta and Google ads end-to-end — strategy, creative, and measurement focused on revenue, not vanity metrics.",
  keywords: ["paid ads", "Meta ads", "Google ads", "performance marketing", "paid social", "PPC agency", "ROI"],
  authors: [{ name: "ROI Labs" }],
  creator: "ROI Labs",
  publisher: "ROI Labs",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "ROI Labs",
    title: "ROI Labs | Performance Marketing Agency",
    description:
      "Performance marketing agency. We run Meta and Google ads end-to-end — strategy, creative, and measurement focused on revenue, not vanity metrics.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ROI Labs — Performance Marketing Agency" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ROI Labs | Performance Marketing Agency",
    description:
      "Performance marketing agency. We run Meta and Google ads end-to-end — strategy, creative, and measurement focused on revenue, not vanity metrics.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
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
      </body>
    </html>
  );
}
