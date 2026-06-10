// Shopify Admin API — the revenue source of truth. NOT an ad platform (no
// campaigns/mutations), so it's separate from the AdConnector layer. It reads
// real orders so Signal can reconcile platform-reported purchase value (Meta
// pixel) against what the store actually made. Importable with no env; only
// errors when a method is called (requireShopify()).
//
// Auth: a custom-app Admin API access token (shpat_...) via the
// `X-Shopify-Access-Token` header. Scope needed: read_orders.

import { config, requireShopify } from "./config";

export interface ShopRevenue {
  currency: string;
  days: number;
  orders: number;
  revenueCents: number;
  aovCents: number | null; // average order value
  daily: { date: string; orders: number; revenueCents: number }[];
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

/** Pull the `rel="next"` cursor URL out of a Shopify Link header, if present. */
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

interface Order {
  created_at: string;
  current_total_price?: string;
  total_price?: string;
  currency?: string;
  cancelled_at?: string | null;
}

/** Real revenue over the last `days` days, aggregated + daily series. */
export async function getRevenue(days: number): Promise<ShopRevenue> {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  let url =
    `${base()}/orders.json?status=any&created_at_min=${encodeURIComponent(since)}&limit=250` +
    `&fields=created_at,current_total_price,total_price,currency,cancelled_at`;

  let orders = 0;
  let revenueCents = 0;
  let currency = "";
  const dailyMap = new Map<string, { orders: number; revenueCents: number }>();
  let pages = 0;

  while (url && pages < 40) {
    pages++;
    const { json, link } = await shopFetch(url);
    const batch = (json.orders ?? []) as Order[];
    for (const o of batch) {
      if (o.cancelled_at) continue; // exclude cancelled orders from revenue
      if (!currency && o.currency) currency = o.currency;
      const cents = Math.round(parseFloat(o.current_total_price ?? o.total_price ?? "0") * 100);
      revenueCents += cents;
      orders++;
      const date = String(o.created_at).slice(0, 10);
      const d = dailyMap.get(date) ?? { orders: 0, revenueCents: 0 };
      d.orders++;
      d.revenueCents += cents;
      dailyMap.set(date, d);
    }
    const next = nextLink(link);
    url = next ?? "";
  }

  const daily = [...dailyMap.entries()]
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    currency: currency || "INR",
    days,
    orders,
    revenueCents,
    aovCents: orders > 0 ? Math.round(revenueCents / orders) : null,
    daily,
  };
}
