// Deterministic demo dataset for ROI Engine v2 — 120 days of daily-grain facts
// following the fact schema in types.ts, for the fictional brand "The Astro Time".
// Seeded RNG (no Math.random) so SSR and CSR agree and the data is stable.
// Meta generates NO facts (integration in_progress) so the pending pattern is real.

import type {
  AdDaily, AdSegmentDaily, CampaignType, Dataset, Order, OrderProduct, SearchTermDaily,
} from "./types";
import { addDays, dowOf, eachDay } from "./format";
import { parseFunnel } from "./metrics";

const DAYS = 120;

// --- seeded RNG -------------------------------------------------------------
function hash(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed: string): () => number {
  let a = hash(seed);
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const jitter = (r: () => number, lo: number, hi: number) => lo + r() * (hi - lo);

// --- campaign catalog (Google) ---------------------------------------------
interface Camp { id: string; name: string; type: CampaignType; base: number; cpc: number; ctr: number; cvr: number; roas: number; capped: boolean; }
const CAMPAIGNS: Camp[] = [
  { id: "g-brand", name: "Search · Brand · bof", type: "search", base: 0.10, cpc: 2200, ctr: 0.115, cvr: 0.085, roas: 6.4, capped: false },
  { id: "g-kundli", name: "Search · Kundli & Horoscope · tof", type: "search", base: 0.20, cpc: 5200, ctr: 0.041, cvr: 0.052, roas: 4.1, capped: true },
  { id: "g-consult", name: "Search · Astrologer Consultation · bof", type: "search", base: 0.16, cpc: 6100, ctr: 0.038, cvr: 0.061, roas: 3.6, capped: false },
  { id: "g-numero", name: "Search · Numerology · tof", type: "search", base: 0.07, cpc: 4800, ctr: 0.034, cvr: 0.040, roas: 2.7, capped: false },
  { id: "g-pmax", name: "PMax · Gemstones", type: "pmax", base: 0.22, cpc: 4300, ctr: 0.030, cvr: 0.048, roas: 3.4, capped: true },
  { id: "g-shop", name: "Shopping · Gemstones Catalog", type: "shopping", base: 0.11, cpc: 3600, ctr: 0.026, cvr: 0.044, roas: 3.2, capped: false },
  { id: "g-rmkt", name: "Display · Remarketing · bof", type: "retargeting", base: 0.06, cpc: 1400, ctr: 0.006, cvr: 0.030, roas: 2.1, capped: false },
  { id: "g-yt", name: "Video · Daily Horoscope · tof", type: "other", base: 0.08, cpc: 900, ctr: 0.012, cvr: 0.018, roas: 1.6, capped: false },
];

const DAILY_BASE_CENTS = 1_400_000; // ~₹14k/day total across Google

// --- segment shares ---------------------------------------------------------
const AGE = [["18–24", 0.12], ["25–34", 0.34], ["35–44", 0.26], ["45–54", 0.16], ["55–64", 0.08], ["65+", 0.04]] as const;
const GENDER = [["Female", 0.54], ["Male", 0.42], ["Unknown", 0.04]] as const;
const GEO = [["Maharashtra", 0.22], ["Delhi", 0.15], ["Karnataka", 0.13], ["Uttar Pradesh", 0.12], ["Gujarat", 0.10], ["Tamil Nadu", 0.10], ["West Bengal", 0.09], ["Rajasthan", 0.09]] as const;
// device: mobile dominant + high CTR but LOW CVR (the mobile-LP problem)
const DEVICE = [
  { v: "Mobile", spend: 0.62, ctrMul: 1.25, cvrMul: 0.66 },
  { v: "Desktop", spend: 0.30, ctrMul: 0.78, cvrMul: 1.5 },
  { v: "Tablet", spend: 0.08, ctrMul: 0.9, cvrMul: 1.0 },
];

// --- product catalog (Shopify) ---------------------------------------------
const PRODUCTS: [string, number][] = [
  ["Certified Gemstone Ring", 480000], ["Rudraksha Mala", 190000], ["Personalised Kundli Report", 49900],
  ["Astrologer Consultation (30m)", 120000], ["Numerology Report", 69900], ["Brass Yantra", 85000], ["Gemstone Pendant", 320000],
];

const SEARCH_TERMS: Record<string, { term: string; wasted: boolean; vol: number }[]> = {
  "g-kundli": [
    { term: "free kundli online", wasted: true, vol: 1.0 }, { term: "kundli matching", wasted: false, vol: 0.8 },
    { term: "horoscope today", wasted: true, vol: 0.7 }, { term: "janam kundli in hindi", wasted: false, vol: 0.6 },
    { term: "kundli pdf download", wasted: true, vol: 0.5 }, { term: "astrology prediction 2026", wasted: false, vol: 0.5 },
  ],
  "g-consult": [
    { term: "talk to astrologer", wasted: false, vol: 1.0 }, { term: "free astrologer chat", wasted: true, vol: 0.9 },
    { term: "best astrologer near me", wasted: false, vol: 0.7 }, { term: "astrologer phone number", wasted: true, vol: 0.6 },
    { term: "online astrology consultation", wasted: false, vol: 0.6 }, { term: "astrologer salary", wasted: true, vol: 0.3 },
  ],
  "g-numero": [
    { term: "numerology calculator", wasted: true, vol: 0.9 }, { term: "numerology report", wasted: false, vol: 0.6 },
    { term: "lucky number by name", wasted: true, vol: 0.7 }, { term: "name numerology", wasted: false, vol: 0.5 },
  ],
  "g-brand": [
    { term: "the astro time", wasted: false, vol: 1.0 }, { term: "astrotime app", wasted: false, vol: 0.5 },
    { term: "astro time review", wasted: false, vol: 0.3 },
  ],
};

let CACHE: { today: string; ds: Dataset } | null = null;

export function generateDataset(today: string): Dataset {
  if (CACHE && CACHE.today === today) return CACHE.ds;
  const start = addDays(today, -(DAYS - 1));
  const days = eachDay(start, today);
  const spikeDate = addDays(today, -17); // tracking-health anomaly (UTMs drop)

  const adDaily: AdDaily[] = [];
  const segmentDaily: AdSegmentDaily[] = [];
  const orders: Order[] = [];
  const searchTerms: SearchTermDaily[] = [];

  days.forEach((date, i) => {
    const dow = dowOf(date);
    const weekend = dow === 0 || dow === 6 ? 0.84 : 1.05;
    const trend = 0.9 + (i / (DAYS - 1)) * 0.26; // ~+26% growth across the window
    const wave = 1 + Math.sin(i / 3.1) * 0.16 + Math.cos(i / 6.7) * 0.08;
    let dayTrueConversions = 0;
    let dayGoogleClicks = 0;

    for (const c of CAMPAIGNS) {
      const r = rng(`${c.id}:${date}`);
      const spendCents = Math.round(DAILY_BASE_CENTS * c.base * weekend * trend * wave * jitter(r, 0.88, 1.12));
      const cpc = c.cpc * jitter(r, 0.9, 1.12);
      const clicks = Math.max(0, Math.round(spendCents / cpc));
      const ctr = c.ctr * jitter(r, 0.9, 1.1);
      const impressions = Math.max(clicks, Math.round(clicks / ctr));
      const cvr = c.cvr * jitter(r, 0.85, 1.15);
      const platformConversions = +(clicks * cvr).toFixed(0);
      const platformRevenueCents = Math.round(spendCents * c.roas * jitter(r, 0.9, 1.12));
      const isSearch = c.type === "search" || c.type === "shopping" || c.type === "pmax";
      adDaily.push({
        date, source: "google", campaignId: c.id, campaignName: c.name, campaignType: c.type,
        funnelStage: parseFunnel(c.name), impressions, clicks, spendCents, platformConversions, platformRevenueCents,
        searchImpressionShare: isSearch ? jitter(r, 0.42, 0.74) : undefined,
        lostIsBudget: c.capped ? jitter(r, 0.18, 0.4) : jitter(r, 0.0, 0.06),
        lostIsRank: isSearch ? jitter(r, 0.05, 0.2) : undefined,
      });
      dayTrueConversions += platformConversions * 0.8; // platform over-counts vs store truth
      dayGoogleClicks += clicks;

      // search terms for search campaigns
      const terms = SEARCH_TERMS[c.id];
      if (terms) {
        for (const t of terms) {
          const tr = rng(`${c.id}:${t.term}:${date}`);
          const tSpend = Math.round(spendCents * 0.12 * t.vol * jitter(tr, 0.6, 1.3));
          const tClicks = Math.max(0, Math.round(tSpend / cpc));
          const tImpr = Math.max(tClicks, Math.round(tClicks / ctr));
          const tConv = t.wasted ? 0 : Math.max(0, Math.round(tClicks * cvr * jitter(tr, 0.7, 1.3)));
          if (tSpend > 0) searchTerms.push({ date, campaignId: c.id, campaignName: c.name, searchTerm: t.term, impressions: tImpr, clicks: tClicks, spendCents: tSpend, conversions: tConv });
        }
      }
    }

    // account-level Google totals for the day (for segment distribution)
    const dayAd = adDaily.filter((a) => a.date === date);
    const sSpend = dayAd.reduce((s, a) => s + a.spendCents, 0);
    const sClicks = dayAd.reduce((s, a) => s + a.clicks, 0);
    const sImpr = dayAd.reduce((s, a) => s + a.impressions, 0);
    const sConv = dayAd.reduce((s, a) => s + a.platformConversions, 0);
    const sRev = dayAd.reduce((s, a) => s + a.platformRevenueCents, 0);
    const pushSeg = (segmentType: AdSegmentDaily["segmentType"], value: string, share: number, ctrMul = 1, cvrMul = 1) => {
      segmentDaily.push({
        date, source: "google", campaignId: "acct-google", segmentType, segmentValue: value,
        impressions: Math.round(sImpr * share * ctrMul), clicks: Math.round(sClicks * share * ctrMul),
        spendCents: Math.round(sSpend * share), conversions: Math.round(sConv * share * cvrMul),
        revenueCents: Math.round(sRev * share * cvrMul),
      });
    };
    AGE.forEach(([v, s]) => pushSeg("age", v, s));
    GENDER.forEach(([v, s]) => pushSeg("gender", v, s));
    GEO.forEach(([v, s]) => pushSeg("geo", v, s));
    DEVICE.forEach((d) => pushSeg("device", d.v, d.spend, d.ctrMul, d.cvrMul));

    // --- Shopify orders for the day ---
    const organicBase = 7 + Math.round(jitter(rng(`org:${date}`), 0, 5));
    const orderCount = Math.max(1, Math.round(dayTrueConversions + organicBase * trend));
    const unattrShare = date === spikeDate ? 0.32 : jitter(rng(`unattr:${date}`), 0.07, 0.13);
    for (let k = 0; k < orderCount; k++) {
      const r = rng(`order:${date}:${k}`);
      // line items
      const nItems = r() < 0.7 ? 1 : 2;
      const products: OrderProduct[] = [];
      let gross = 0;
      for (let p = 0; p < nItems; p++) {
        const [title, price] = PRODUCTS[Math.floor(r() * PRODUCTS.length)];
        const qty = r() < 0.85 ? 1 : 2;
        products.push({ title, quantity: qty, revenueCents: price * qty });
        gross += price * qty;
      }
      const discountUsed = r() < 0.36;
      const discount = discountUsed ? Math.round(gross * jitter(r, 0.1, 0.25)) : 0;
      const refunded = r() < 0.06;
      const refund = refunded ? Math.round((gross - discount) * (r() < 0.5 ? 1 : jitter(r, 0.4, 0.8))) : 0;
      const net = Math.max(0, gross - discount - refund);
      const customerType = r() < 0.62 ? "new" : "returning";
      // attribution
      let utmSource: string | null = null, utmMedium: string | null = null, utmCampaign: string | null = null;
      const a = r();
      if (a < unattrShare) { /* unattributed */ }
      else if (a < unattrShare + 0.12) { utmSource = "klaviyo"; utmMedium = "email"; utmCampaign = "newsletter"; }
      else {
        utmSource = "google"; utmMedium = "cpc";
        const sc = CAMPAIGNS.filter((c) => c.type !== "other")[Math.floor(r() * 6)] || CAMPAIGNS[1];
        utmCampaign = sc.id;
      }
      orders.push({
        date, orderId: `AT-${date.replace(/-/g, "")}-${k}`, revenueGrossCents: gross, discountAmountCents: discount,
        refundAmountCents: refund, revenueNetCents: net, customerType, utmSource, utmMedium, utmCampaign, products, discountUsed,
      });
    }
  });

  const ds: Dataset = {
    currency: "INR",
    generatedAt: today,
    adDaily, segmentDaily, orders, searchTerms,
    integrations: [
      { source: "google", status: "connected", lastSyncAt: addDays(today, 0) + "T" + "06:00:00.000Z" },
      { source: "shopify", status: "connected", lastSyncAt: addDays(today, 0) + "T" + "07:00:00.000Z" },
      { source: "meta", status: "in_progress", lastSyncAt: null },
    ],
  };
  CACHE = { today, ds };
  return ds;
}
