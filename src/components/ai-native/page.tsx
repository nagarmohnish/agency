// AI-native repositioning of the ROI Labs home page. Composition + metadata.
// Stored here as a design file; to go live, move into src/app/page.tsx (see README).

import type { Metadata } from "next";
import Hero from "@/components/ai-native/Hero";
import Services from "@/components/ai-native/Services";
import Contact from "@/components/ai-native/Contact";

export const metadata: Metadata = {
  title: "ROI Labs | AI-Native Growth Agency",
  description:
    "AI-native growth agency. We run Meta and Google ads, win visibility inside AI answers (ChatGPT, Perplexity, Gemini, AI Overviews), and produce the content that feeds both — measured in revenue, not vanity metrics.",
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: "ROI Labs | AI-Native Growth Agency",
    description:
      "AI-native growth agency. We run Meta and Google ads, win visibility inside AI answers, and produce the content that feeds both — measured in revenue, not vanity metrics.",
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <Contact />
    </>
  );
}
