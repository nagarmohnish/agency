// Canonical metric computations — the single source of truth used by every view
// and by the ⓘ tooltips. Everything is computed from daily facts at query time,
// parameterised by date range, attribution lens, and filters.

import type {
  AdDaily, AdSegmentDaily, Dataset, DateRange, Filter, FunnelStage, Lens, Order, SearchTermDaily, SourceScope,
} from "./types";

// funnel stage parsed from the campaign naming convention (tof_/bof-/mof …)
export function parseFunnel(name: string): FunnelStage {
  const n = name.toLowerCase();
  if (/\btof\b|top[\s_-]?of[\s_-]?funnel|prospect/.test(n)) return "tof";
  if (/\bmof\b|mid[\s_-]?funnel|consider/.test(n)) return "mof";
  if (/\bbof\b|bottom[\s_-]?of[\s_-]?funnel|brand|remarket|retarget/.test(n)) return "bof";
  return "unlabeled";
}

// orders whose last-click was a paid ad click (Shopify's own attribution answer)
export function isPaidOrder(o: Order): boolean {
  const m = (o.utmMedium || "").toLowerCase();
  const s = (o.utmSource || "").toLowerCase();
  return ["cpc", "ppc", "paid", "paid_social", "paidsocial"].includes(m) || ["google", "meta"].includes(s);
}
export function orderPlatform(o: Order): "google" | "meta" | null {
  const s = (o.utmSource || "").toLowerCase();
  if (s === "google") return "google";
  if (s === "meta") return "meta";
  return null;
}

// --- filtering --------------------------------------------------------------

export interface Slice {
  ad: AdDaily[];
  seg: AdSegmentDaily[];
  orders: Order[];
  terms: SearchTermDaily[];
  range: DateRange;
}

function inRange(d: string, r: DateRange) {
  return d >= r.start && d <= r.end;
}

export function buildSlice(ds: Dataset, range: DateRange, filters: Filter[], source: SourceScope = "all"): Slice {
  const f = Object.fromEntries(filters.map((x) => [x.dim, new Set(x.values)])) as Record<string, Set<string>>;
  // source scope: which platform's data is on screen (orthogonal to filters/lens)
  const adInScope = (s: string) => source === "all" || (source !== "shopify" && s === source);
  const ordInScope = (o: Order) => source === "all" || source === "shopify" || (orderPlatform(o) === source && isPaidOrder(o));
  const termInScope = source === "all" || source === "google";
  const adKeep = (r: AdDaily) =>
    (!f.platform || f.platform.has(r.source)) &&
    (!f.campaign || f.campaign.has(r.campaignId)) &&
    (!f.campaignType || f.campaignType.has(r.campaignType)) &&
    (!f.funnelStage || f.funnelStage.has(r.funnelStage));
  // campaign dim map for segment/term filtering by type/funnel
  const dim = new Map<string, AdDaily>();
  for (const r of ds.adDaily) if (!dim.has(r.campaignId)) dim.set(r.campaignId, r);
  const segKeep = (r: AdSegmentDaily) => {
    const c = dim.get(r.campaignId);
    if (f.platform && !f.platform.has(r.source)) return false;
    if (f.campaign && !f.campaign.has(r.campaignId)) return false;
    if (f.campaignType && (!c || !f.campaignType.has(c.campaignType))) return false;
    if (f.funnelStage && (!c || !f.funnelStage.has(c.funnelStage))) return false;
    if (f.device && r.segmentType === "device" && !f.device.has(r.segmentValue)) return false;
    if (f.geo && r.segmentType === "geo" && !f.geo.has(r.segmentValue)) return false;
    return true;
  };
  const ordKeep = (o: Order) =>
    (!f.platform || (orderPlatform(o) ? f.platform.has(orderPlatform(o)!) : false) || !isPaidOrder(o)) &&
    (!f.customerType || f.customerType.has(o.customerType));
  return {
    range,
    ad: ds.adDaily.filter((r) => inRange(r.date, range) && adKeep(r) && adInScope(r.source)),
    seg: ds.segmentDaily.filter((r) => inRange(r.date, range) && segKeep(r) && adInScope(r.source)),
    orders: ds.orders.filter((o) => inRange(o.date, range) && ordKeep(o) && ordInScope(o)),
    terms: ds.searchTerms.filter((t) => inRange(t.date, range) && termInScope),
  };
}

// --- platform (ad) aggregates ----------------------------------------------

export interface AdAgg {
  spendCents: number; impressions: number; clicks: number;
  platformConversions: number; platformRevenueCents: number;
  ctr: number | null; cpmCents: number | null; cvr: number | null;
}
export function adAgg(rows: AdDaily[]): AdAgg {
  const t = rows.reduce((a, r) => {
    a.spendCents += r.spendCents; a.impressions += r.impressions; a.clicks += r.clicks;
    a.platformConversions += r.platformConversions; a.platformRevenueCents += r.platformRevenueCents;
    return a;
  }, { spendCents: 0, impressions: 0, clicks: 0, platformConversions: 0, platformRevenueCents: 0 });
  return {
    ...t,
    ctr: t.impressions ? t.clicks / t.impressions : null,
    cpmCents: t.impressions ? (t.spendCents / t.impressions) * 1000 : null,
    cvr: t.clicks ? t.platformConversions / t.clicks : null,
  };
}

// --- Shopify (order) aggregates --------------------------------------------

export interface OrderAgg {
  orders: number; grossCents: number; discountCents: number; refundCents: number; netCents: number;
  newOrders: number; newNetCents: number; returningNetCents: number;
  aovCents: number | null; refundRate: number | null; discountAssistedPct: number | null; unattributedPct: number | null;
}
export function orderAgg(orders: Order[]): OrderAgg {
  const t = orders.reduce((a, o) => {
    a.orders += 1; a.grossCents += o.revenueGrossCents; a.discountCents += o.discountAmountCents;
    a.refundCents += o.refundAmountCents; a.netCents += o.revenueNetCents;
    if (o.customerType === "new") { a.newOrders += 1; a.newNetCents += o.revenueNetCents; }
    else a.returningNetCents += o.revenueNetCents;
    if (o.discountUsed) a.discountOrders += 1;
    if (!o.utmSource && !o.utmMedium) a.unattributed += 1;
    return a;
  }, { orders: 0, grossCents: 0, discountCents: 0, refundCents: 0, netCents: 0, newOrders: 0, newNetCents: 0, returningNetCents: 0, discountOrders: 0, unattributed: 0 });
  return {
    orders: t.orders, grossCents: t.grossCents, discountCents: t.discountCents, refundCents: t.refundCents, netCents: t.netCents,
    newOrders: t.newOrders, newNetCents: t.newNetCents, returningNetCents: t.returningNetCents,
    aovCents: t.orders ? Math.round(t.netCents / t.orders) : null,
    refundRate: t.grossCents ? t.refundCents / t.grossCents : null,
    discountAssistedPct: t.orders ? t.discountOrders / t.orders : null,
    unattributedPct: t.orders ? t.unattributed / t.orders : null,
  };
}

// --- the attribution lens ---------------------------------------------------

export interface LensRevenue { revenueCents: number; conversions: number | null; label: string }
export function lensRevenue(slice: Slice, lens: Lens): LensRevenue {
  const ad = adAgg(slice.ad);
  if (lens === "platform") return { revenueCents: ad.platformRevenueCents, conversions: ad.platformConversions, label: "Platform-reported" };
  if (lens === "shopify") {
    const paid = slice.orders.filter(isPaidOrder);
    return { revenueCents: paid.reduce((s, o) => s + o.revenueNetCents, 0), conversions: paid.length, label: "Shopify last-click" };
  }
  // blended — no attribution claims; all store revenue over all spend
  return { revenueCents: slice.orders.reduce((s, o) => s + o.revenueNetCents, 0), conversions: null, label: "Blended (MER)" };
}

export function roas(slice: Slice, lens: Lens): number | null {
  const spend = adAgg(slice.ad).spendCents;
  const rev = lensRevenue(slice, lens).revenueCents;
  return spend ? rev / spend : null;
}
export function cpaCents(slice: Slice, lens: Lens): number | null {
  const spend = adAgg(slice.ad).spendCents;
  const conv = lensRevenue(slice, lens).conversions;
  return conv ? Math.round(spend / conv) : null;
}

// blended truth metrics (always Shopify ÷ spend, Meta excluded automatically
// because no Meta facts exist until connected)
export function mer(slice: Slice): number | null {
  const spend = adAgg(slice.ad).spendCents;
  return spend ? orderAgg(slice.orders).netCents / spend : null;
}
export function ncMer(slice: Slice): number | null {
  const spend = adAgg(slice.ad).spendCents;
  return spend ? orderAgg(slice.orders).newNetCents / spend : null;
}
export function nCacCents(slice: Slice): number | null {
  const newCust = orderAgg(slice.orders).newOrders;
  return newCust ? Math.round(adAgg(slice.ad).spendCents / newCust) : null;
}

// platform-claimed revenue across sources (for the truth gap)
export function platformClaimedCents(slice: Slice): number {
  return adAgg(slice.ad).platformRevenueCents;
}
export function truthGap(slice: Slice): number | null {
  const net = orderAgg(slice.orders).netCents;
  return net ? platformClaimedCents(slice) / net : null;
}

// --- deltas -----------------------------------------------------------------

export function delta(cur: number | null, prev: number | null): number | null {
  if (cur == null || prev == null || !isFinite(cur) || !isFinite(prev) || prev === 0) return null;
  return (cur - prev) / prev;
}

// --- time series (bucketed) -------------------------------------------------

export function seriesByDay<T extends { date: string }>(rows: T[], value: (r: T) => number): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of rows) m.set(r.date, (m.get(r.date) || 0) + value(r));
  return m;
}

export function bucketSum(byDay: Map<string, number>, buckets: { key: string; days: string[] }[]): number[] {
  return buckets.map((b) => b.days.reduce((s, d) => s + (byDay.get(d) || 0), 0));
}

// campaign dimension lookup (for tables / labels)
export function campaignDim(ds: Dataset) {
  const m = new Map<string, AdDaily>();
  for (const r of ds.adDaily) if (!m.has(r.campaignId)) m.set(r.campaignId, r);
  return m;
}
