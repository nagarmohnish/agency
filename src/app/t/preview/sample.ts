// Sample data for the dev-only cockpit preview (/t/preview). Realistic DUMMY
// numbers so we can see the finished design populated — Shopify + Google
// "connected" (LIVE), Meta/subscriptions "awaiting", and real ops rows. This is
// NEVER used in production (the page 404s there); the live tenant cockpit only
// ever renders genuine data.

import type { TenantCockpit, TenantRange, TenantRangeKey } from "@/lib/engine/tenant-cockpit";

const dayISO = (i: number) => new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
const ago = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

// Build one window from a per-day revenue/spend base, with a gentle wave so the
// chart looks alive. Totals are summed from the daily series (self-consistent).
function range(days: number, dayRevPaise: number, daySpendPaise: number): TenantRange {
  const sDaily: { date: string; revenueCents: number }[] = [];
  const gDaily: { date: string; spendCents: number }[] = [];
  let rev = 0, spend = 0;
  for (let i = days - 1; i >= 0; i--) {
    const w = 1 + Math.sin(i / 3) * 0.2 + Math.cos(i / 5.3) * 0.12;
    const rc = Math.round(dayRevPaise * w);
    const sc = Math.round(daySpendPaise * w);
    const d = dayISO(i);
    sDaily.push({ date: d, revenueCents: rc });
    gDaily.push({ date: d, spendCents: sc });
    rev += rc; spend += sc;
  }
  const orders = Math.max(1, Math.round(rev / 74_468));       // ~₹744 AOV
  const installs = Math.max(1, Math.round(spend / 4_350));    // ~₹43.5 CPI
  const store = { revenueCents: rev, orders, aovCents: Math.round(rev / orders), daily: sDaily };
  const google = {
    spendCents: spend,
    installs,
    cpiCents: Math.round(spend / installs),
    impressions: Math.round(spend / 38),   // ~₹380 CPM
    clicks: Math.round(spend / 840),       // ~4.5% CTR
    daily: gDaily,
  };
  return { days, store, google, blendedMer: rev / spend };
}

export function buildSample(): TenantCockpit {
  const ranges: Record<TenantRangeKey, TenantRange> = {
    "7D": range(7, 15_000_00, 2_850_00),     // ₹15k rev/day, ₹2,850 spend/day
    "28D": range(28, 15_000_00, 2_850_00),
  };
  return {
    generatedAt: ago(0.1),
    accountName: "The Astro Time",
    currency: "INR",
    connections: { google: true, meta: false, shopify: true, subscriptions: false },
    ranges,
    ops: {
      runs: [
        { id: "r1", step: "creative", status: "done", summary: "Generated 8 creative variants for the festive push", startedAt: ago(6), finishedAt: ago(5.6) },
        { id: "r2", step: "audit", status: "done", summary: "Surfaced 3 scale opportunities across Search + PMax", startedAt: ago(14), finishedAt: ago(13.7) },
        { id: "r3", step: "audit", status: "done", summary: "Flagged unattributed store orders (UTM hygiene gap)", startedAt: ago(28), finishedAt: ago(27.8) },
      ],
      approvals: [
        { id: "a1", agent: "pilot", kind: "update_campaign_budget", summary: "Scale Advantage+ Shopping ₹3,200 → ₹4,500/day (ROAS held 4.18× for 5d)", status: "proposed", requiresApproval: true, estimatedSpendCents: 4_500_00, createdAt: ago(2) },
        { id: "a2", agent: "pilot", kind: "launch_campaign", summary: "Launch PMax — App installs (YouTube), capped at ₹2,000/day", status: "proposed", requiresApproval: true, estimatedSpendCents: 2_000_00, createdAt: ago(3.5) },
      ],
      activity: [
        { id: "x1", agent: "signal", kind: "read_metrics", summary: "Pulled 28 days of Google Ads performance", status: "executed", requiresApproval: false, estimatedSpendCents: 0, createdAt: ago(1) },
        { id: "x2", agent: "signal", kind: "read_revenue", summary: "Reconciled Shopify revenue vs ad-reported purchases", status: "executed", requiresApproval: false, estimatedSpendCents: 0, createdAt: ago(1.2) },
        { id: "x3", agent: "scout", kind: "submit_audit", summary: "Account health 78/100 — 3 opportunities ranked", status: "executed", requiresApproval: false, estimatedSpendCents: 0, createdAt: ago(14) },
        { id: "x4", agent: "forge", kind: "generate_creative", summary: "8 AI creative variants produced (disclosure-labeled)", status: "executed", requiresApproval: false, estimatedSpendCents: 0, createdAt: ago(6) },
        { id: "x5", agent: "pilot", kind: "propose_mutation", summary: "Proposed budget scale on Advantage+ Shopping", status: "proposed", requiresApproval: true, estimatedSpendCents: 4_500_00, createdAt: ago(2) },
      ],
    },
  };
}
