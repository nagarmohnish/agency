import { notFound } from "next/navigation";
import TenantCockpit from "../[slug]/TenantCockpit";
import { buildSample } from "./sample";

export const dynamic = "force-dynamic";

// DEV-ONLY preview of the finished tenant cockpit with realistic dummy data
// (Shopify + Google LIVE, Meta/subscriptions awaiting, real ops rows). Never
// renders in production — the live <slug>.roilabs.in only ever shows real data.
export default function CockpitPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  return <TenantCockpit data={buildSample()} role="admin" slug="astrotime" />;
}
