import type { Metadata, Viewport } from "next";
import { unstable_cache } from "next/cache";
import Shell from "./Shell";
import { getCockpitData, type CockpitData } from "@/lib/engine/cockpit-data";
import "./engine.css";

export const metadata: Metadata = {
  title: "ROI Engine",
  robots: { index: false, follow: false }, // internal ops tool, never indexed
};

// White cockpit — override the dark site-wide theme-color for this route only.
export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

// Pull real source data (Shopify + Google) once and cache for 10 min so we don't
// hammer the ad/commerce APIs on every load. Falls back to null (→ the cockpit's
// built-in modeled estimates) when the engine isn't connected (static demo / CI).
const loadCockpit = unstable_cache(
  async (): Promise<CockpitData | null> => {
    try {
      return await getCockpitData();
    } catch {
      return null;
    }
  },
  ["engine-cockpit-data-v1"],
  { revalidate: 600 }
);

export default async function EnginePage() {
  const cockpit = await loadCockpit();
  return <Shell cockpit={cockpit} />;
}
