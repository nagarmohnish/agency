import type { Metadata, Viewport } from "next";
import EngineV4 from "./EngineV4";

export const metadata: Metadata = {
  title: "ROI Studio — demo",
  robots: { index: false, follow: false }, // internal demo, never indexed
};

// Light PM-dashboard aesthetic — override the dark site-wide theme-color here.
export const viewport: Viewport = {
  themeColor: "#F5F6FA",
};

// Dutask-inspired design exploration of the cockpit. Isolated route /engine/v4.
export default function EngineV4Page() {
  return <EngineV4 />;
}
