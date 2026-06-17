import { notFound } from "next/navigation";
import EngineV5 from "../v5";
import { getCockpitData } from "@/lib/engine/cockpit-data";
import "../engine.css";

export const dynamic = "force-dynamic";

// DEV-ONLY: the FULL operator cockpit for Astro Time with no auth gate — real
// metrics where a connector is live (LIVE badges) + the modeled assumptions
// (subscriptions / Meta / GA4, flagged EST) + the tickets board + the runs flow.
// 404s in production; the live /engine keeps its auth.
export default async function EngineDemoPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  const cockpit = await getCockpitData().catch(() => null);
  return <EngineV5 cockpit={cockpit} />;
}
