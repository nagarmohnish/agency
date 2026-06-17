import type { Metadata } from "next";
import TenantShell from "./TenantShell";

export const metadata: Metadata = {
  title: "ROI Engine",
  robots: { index: false, follow: false }, // per-company dashboard, never indexed
};

// <slug>.roilabs.in — the company's dashboard. Reached via the rewrite in
// src/middleware.ts. TenantShell gates by membership (resolveTenant) then renders
// the cockpit; non-members see a "no access" screen.
export default async function TenantPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TenantShell slug={slug} />;
}
