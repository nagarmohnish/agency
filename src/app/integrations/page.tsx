import type { Metadata } from "next";
import "../aurora.css";
import "./integrations.css";
import Integrations from "./Integrations";

export const metadata: Metadata = {
  title: "Integrations",
  description:
    "Connect ROI Labs to your revenue stack — Google Ads, Meta, Shopify and more. Every campaign measured against real revenue, reconciled to Shopify, not platform-reported ROAS.",
  alternates: { canonical: "/integrations" },
  openGraph: {
    url: "/integrations",
    title: "Integrations | ROI Labs",
    description:
      "Bring ad spend, store revenue and conversion signals into one AI-native engine — measured in revenue, not ROAS.",
  },
};

export default function IntegrationsPage() {
  return <Integrations />;
}
