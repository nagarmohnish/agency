import type { Metadata, Viewport } from "next";
import Shell from "./Shell";
import "./engine.css";

export const metadata: Metadata = {
  title: "ROI Engine",
  robots: { index: false, follow: false }, // internal ops tool, never indexed
};

// White cockpit — override the dark site-wide theme-color for this route only.
export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function EnginePage() {
  return <Shell />;
}
