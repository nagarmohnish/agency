// Shopify Admin API — the revenue source of truth. NOT an ad platform (no
// campaigns/mutations), so it's separate from the AdConnector layer.
//
// EXTENDED (2026-06-11): in addition to daily revenue, getRevenue now extracts
// order-level facts the dashboard judges ads against — gross/discount/refund/net,
// new-vs-returning customer, UTM attribution, and line-item products. All of this
// is available on the REST Orders resource; it's a richer field set + per-order
// parsing, not a new integration. See data-sources/CATALOG.md.
//
// Auth: custom-app Admin API access token (shpat_...) via X-Shopify-Access-Token.
// Scopes: read_orders (required) + read_customers (for new-vs-returning).

import { config, requireShopify } from "./config";

/** One order, parsed to the fact shape the dashboard consumes (matches the v2
 *  fact_orders model so live + demo run through the same metrics). */
export interface ShopOrder {
  date: string; // YYYY-MM-DD (created_at)
  orderId: string;
  revenueGrossCents: number; // total_line_items_price (pre-discount)
  discountAmountCents: number; // total_discounts
  refundAmountCents: number; // Σ refunds[].transactions[] kind=refund
  revenueNetCents: number; // current_total_price (post discount/refund/edits)
  customerType: "new" | "returning" | "unknown"; // customer.orders_count
  utmSource: string | null; // parsed from landing_site
  utmMedium: string | null;
  utmCampaign: string | null;
  discountUsed: boolean;
  products: { title: string; quantity: number; revenueCents: number }[];
}

export interface ShopRevenue {
  currency: string;
  days: number;
  orders: number;
  revenueCents: number; // Σ net — the revenue-truth number (unchanged definition)
  grossCents: number;
  discountCents: number;
  refundCents: number;
  aovCents: number | null;
  daily: { date: string; orders: number; revenueCents: number; grossCents: number; discountCents: number; refundCents: number }[];
  orderList: ShopOrder[]; // order-level facts for attribution / new-returning / products
}

function base(): string {
  const s = requireShopify();
  return `https://${s.storeDomain}/admin/api/${s.apiVersion}`;
}

async function shopFetch(url: string): Promise<{ json: Record<string, unknown>; link: string | null }> {
  const { adminToken } = requireShopify();
  const res = await fetch(url, {
    headers: { "X-Shopify-Access-Token": adminToken, "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Shopify ${new URL(url).pathname} failed (${res.status}): ${await res.text()}`);
  }
  return { json: (await res.json()) as Record<string, unknown>, link: res.headers.get("link") };
}

/** Pull the rel="next" cursor URL out of a Shopify Link header, if present. */
function nextLink(link: string | null): string | null {
  if (!link) return null;
  const part = link.split(",").map((s) => s.trim()).find((s) => s.includes('rel="next"'));
  const m = part?.match(/<([^>]+)>/);
  return m ? m[1] : null;
}

/** Cheap connectivity/credential check. */
export async function shopifyPing(): Promise<{ ok: boolean; detail: string }> {
  try {
    const { json } = await shopFetch(`${base()}/shop.json`);
    const shop = (json.shop ?? {}) as { name?: string; currency?: string };
    return { ok: true, detail: `Connected to ${shop.name ?? config.shopify.storeDomain} (${shop.currency ?? "?"})` };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : String(e) };
  }
}

const cents = (v: string | number | null | undefined) => Math.round(parseFloat(String(v ?? "0")) * 100) || 0;

function parseUtm(landing: string | null | undefined): { source: string | null; medium: string | null; campaign: string | null } {
  if (!landing || !landing.includes("?")) return { source: null, medium: null, campaign: null };
  try {
    const p = new URLSearchParams(landing.split("?")[1]);
    return { source: p.get("utm_source"), medium: p.get("utm_medium"), campaign: p.get("utm_campaign") };
  } catch {
    return { source: null, medium: null, campaign: null };
  }
}

// --- raw Shopify order shape (only the fields we request) -------------------
interface RawOrder {
  id?: number | string;
  created_at: string;
  current_total_price?: string;
  total_price?: string;
  total_line_items_price?: string;
  subtotal_price?: string;
  total_discounts?: string;
  currency?: string;
  cancelled_at?: string | null;
  landing_site?: string | null;
  customer?: { orders_count?: number } | null;
  discount_codes?: { code: string }[];
  refunds?: { transactions?: { kind?: string; amount?: string }[] }[];
  line_items?: { title?: string; name?: string; quantity?: number; price?: string }[];
}

function toFact(o: RawOrder): ShopOrder {
  const gross = cents(o.total_line_items_price ?? o.subtotal_price ?? o.total_price);
  const discount = cents(o.total_discounts);
  let refund = 0;
  for (const rf of o.refunds ?? []) for (const tx of rf.transactions ?? []) if (tx.kind === "refund") refund += cents(tx.amount);
  const net = cents(o.current_total_price ?? o.total_price);
  const oc = o.customer?.orders_count;
  const customerType: ShopOrder["customerType"] = oc == null ? "unknown" : oc <= 1 ? "new" : "returning";
  const utm = parseUtm(o.landing_site);
  return {
    date: String(o.created_at).slice(0, 10),
    orderId: String(o.id ?? ""),
    revenueGrossCents: gross, discountAmountCents: discount, refundAmountCents: refund, revenueNetCents: net,
    customerType, utmSource: utm.source, utmMedium: utm.medium, utmCampaign: utm.campaign,
    discountUsed: (o.discount_codes?.length ?? 0) > 0 || discount > 0,
    products: (o.line_items ?? []).map((li) => ({ title: li.title ?? li.name ?? "Item", quantity: Number(li.quantity ?? 1), revenueCents: cents(li.price) * Number(li.quantity ?? 1) })),
  };
}

/** Real revenue over the last `days` days — order-level facts + daily series. */
export async function getRevenue(days: number): Promise<ShopRevenue> {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const fields = "id,created_at,current_total_price,total_price,total_line_items_price,subtotal_price,total_discounts,currency,cancelled_at,landing_site,customer,discount_codes,refunds,line_items";
  let url = `${base()}/orders.json?status=any&created_at_min=${encodeURIComponent(since)}&limit=250&fields=${fields}`;

  const orderList: ShopOrder[] = [];
  let currency = "";
  let pages = 0;
  while (url && pages < 40) {
    pages++;
    const { json, link } = await shopFetch(url);
    const batch = (json.orders ?? []) as RawOrder[];
    for (const o of batch) {
      if (o.cancelled_at) continue; // exclude cancelled orders
      if (!currency && o.currency) currency = o.currency;
      orderList.push(toFact(o));
    }
    url = nextLink(link) ?? "";
  }

  const dailyMap = new Map<string, { orders: number; revenueCents: number; grossCents: number; discountCents: number; refundCents: number }>();
  let revenueCents = 0, grossCents = 0, discountCents = 0, refundCents = 0;
  for (const o of orderList) {
    revenueCents += o.revenueNetCents; grossCents += o.revenueGrossCents; discountCents += o.discountAmountCents; refundCents += o.refundAmountCents;
    const d = dailyMap.get(o.date) ?? { orders: 0, revenueCents: 0, grossCents: 0, discountCents: 0, refundCents: 0 };
    d.orders++; d.revenueCents += o.revenueNetCents; d.grossCents += o.revenueGrossCents; d.discountCents += o.discountAmountCents; d.refundCents += o.refundAmountCents;
    dailyMap.set(o.date, d);
  }
  const daily = [...dailyMap.entries()].map(([date, v]) => ({ date, ...v })).sort((a, b) => a.date.localeCompare(b.date));

  return {
    currency: currency || "INR",
    days,
    orders: orderList.length,
    revenueCents, grossCents, discountCents, refundCents,
    aovCents: orderList.length > 0 ? Math.round(revenueCents / orderList.length) : null,
    daily,
    orderList,
  };
}
