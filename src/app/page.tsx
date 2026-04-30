import type { Metadata } from "next";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Contact from "@/components/Contact";

export const metadata: Metadata = {
  title: "ROI Labs | Performance Marketing Agency",
  description:
    "Performance marketing agency. We run Meta and Google ads end-to-end — strategy, creative, and measurement focused on revenue, not vanity metrics.",
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: "ROI Labs | Performance Marketing Agency",
    description:
      "Performance marketing agency. We run Meta and Google ads end-to-end — strategy, creative, and measurement focused on revenue, not vanity metrics.",
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
