import type { Metadata } from "next";
import "./aurora.css";
import AuroraHome from "./AuroraHome";

export const metadata: Metadata = {
  title: "ROI Labs",
  description:
    "ROI Labs helps brands scale customer acquisition and subscription revenue through AI-powered paid media, creative intelligence, and growth strategy.",
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: "ROI Labs",
    description:
      "ROI Labs helps brands scale customer acquisition and subscription revenue through AI-powered paid media, creative intelligence, and growth strategy.",
  },
};

export default function Home() {
  return <AuroraHome />;
}
