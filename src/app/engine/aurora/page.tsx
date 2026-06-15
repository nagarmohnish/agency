import type { Metadata, Viewport } from "next";
import Shell from "../Shell";
import "../engine.css";

export const metadata: Metadata = {
  title: "ROI Engine — Aurora",
  robots: { index: false, follow: false }, // internal ops tool, never indexed
};

// Warm cream cockpit — override the dark site-wide theme-color for this route only.
export const viewport: Viewport = {
  themeColor: "#FAF7F0",
};

// roilabs.in-themed (Aurora) variant of the cockpit.
export default function EngineAuroraPage() {
  return <Shell variant="aurora" />;
}
