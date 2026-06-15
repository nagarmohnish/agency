// Demo mode for the /engine cockpit.
//
// When the dashboard is shipped as a static export (e.g. GitHub Pages) there is
// no backend, so the live `/api/engine/*` routes don't exist. Building with
// NEXT_PUBLIC_ENGINE_DEMO=1 flips the cockpit into a self-contained showcase:
// the token gate is skipped and every screen is fed realistic sample data for a
// fictional brand ("The Astro Time"). On Vercel the flag is unset, so the real
// token-gated cockpit is completely unaffected.
//
// All *_Cents values are in the currency minor unit (paise for INR), matching
// the live API — the dashboard's money() helper divides by 100.

export const DEMO = process.env.NEXT_PUBLIC_ENGINE_DEMO === "1";

const DAY = 86400000;
const iso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString();
const dateAgo = (daysAgo: number) => new Date(Date.now() - daysAgo * DAY).toISOString().slice(0, 10);

// ---- daily performance series (deterministic, brand: The Astro Time) -------

interface Day {
  date: string;
  spendCents: number;
  conversions: number;
  revenueCents: number;
  clicks: number;
  impressions: number;
}

function series(days: number): Day[] {
  const rows: Day[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const dt = new Date(Date.now() - i * DAY);
    const dow = dt.getDay();
    const weekend = dow === 0 || dow === 6 ? 0.82 : 1.06;
    const wave = 1 + Math.sin(i / 2.7) * 0.22 + Math.cos(i / 5.3) * 0.1;
    const spendCents = Math.round(1_400_000 * wave * weekend); // ~₹14k/day
    const roas = 3.1 + Math.sin(i / 4) * 0.5; // 2.6×–3.6×
    const revenueCents = Math.round(spendCents * roas);
    const clicks = Math.round(spendCents / 5500); // ~₹55 CPC
    const impressions = Math.round(clicks / 0.032); // ~3.2% CTR
    const conversions = Math.round(clicks * 0.05); // ~5% CVR
    rows.push({ date: dt.toISOString().slice(0, 10), spendCents, conversions, revenueCents, clicks, impressions });
  }
  return rows;
}

interface Kpis {
  impressions: number;
  clicks: number;
  spendCents: number;
  conversions: number;
  revenueCents: number;
  roas: number | null;
  cacCents: number | null;
  ctr: number | null;
}

function kpisOf(rows: Day[]): Kpis {
  const sum = (k: keyof Day) => rows.reduce((s, r) => s + (r[k] as number), 0);
  const spendCents = sum("spendCents");
  const revenueCents = sum("revenueCents");
  const conversions = sum("conversions");
  const clicks = sum("clicks");
  const impressions = sum("impressions");
  return {
    impressions,
    clicks,
    spendCents,
    conversions,
    revenueCents,
    roas: spendCents ? revenueCents / spendCents : null,
    cacCents: conversions ? Math.round(spendCents / conversions) : null,
    ctr: impressions ? clicks / impressions : null,
  };
}

// ---- segment helper --------------------------------------------------------

function seg(label: string, share: number, k: Kpis) {
  const spendCents = Math.round(k.spendCents * share);
  const clicks = Math.round(k.clicks * share);
  const impressions = Math.round(k.impressions * share);
  const conversions = Math.round(k.conversions * share);
  return {
    label,
    impressions,
    clicks,
    spendCents,
    conversions,
    cacCents: conversions ? Math.round(spendCents / conversions) : null,
    ctr: impressions ? clicks / impressions : null,
  };
}

const NETWORK_SHARES: [string, number][] = [
  ["Search", 0.42],
  ["Performance Max", 0.26],
  ["YouTube", 0.14],
  ["Display", 0.1],
  ["Shopping", 0.08],
];
const GENDER_SHARES: [string, number][] = [
  ["Female", 0.54],
  ["Male", 0.4],
  ["Unknown", 0.06],
];
const AGE_SHARES: [string, number][] = [
  ["18-24", 0.12],
  ["25-34", 0.34],
  ["35-44", 0.26],
  ["45-54", 0.16],
  ["55-64", 0.08],
  ["65+", 0.04],
];

// ---- campaigns -------------------------------------------------------------

const CAMPAIGNS = [
  { externalId: "g-001", name: "Search — Brand · Astro Time", status: "ACTIVE", objective: "Search", dailyBudgetCents: 250_000, weight: 0.14 },
  { externalId: "g-002", name: "Search — Kundli & Horoscope", status: "ACTIVE", objective: "Search", dailyBudgetCents: 400_000, weight: 0.24 },
  { externalId: "g-003", name: "Performance Max — Gemstones", status: "ACTIVE", objective: "Performance Max", dailyBudgetCents: 500_000, weight: 0.26 },
  { externalId: "g-004", name: "Search — Astrologer Consultation", status: "ACTIVE", objective: "Search", dailyBudgetCents: 350_000, weight: 0.18 },
  { externalId: "g-005", name: "YouTube — Daily Horoscope", status: "ACTIVE", objective: "Video", dailyBudgetCents: 180_000, weight: 0.12 },
  { externalId: "g-006", name: "Display — Remarketing", status: "PAUSED", objective: "Display", dailyBudgetCents: 120_000, weight: 0.06 },
];

// ---- audit + activity ------------------------------------------------------

const OPPORTUNITIES = [
  { title: "Split brand & non-brand budgets", detail: "Brand and non-brand keywords share one Search budget, so brand impressions soak up spend that should chase new demand. Carve brand into its own campaign and cap it.", impact: "high", effort: "low", owner: "Pilot" },
  { title: "Performance Max is eating Search brand terms", detail: "PMax is serving on branded queries already covered by Search at a lower CAC. Add brand terms to the PMax account-level negative list to stop the overlap.", impact: "high", effort: "medium", owner: "Scout" },
  { title: "No conversion value on consultation bookings", detail: "Consultation bookings fire a conversion with no value, so ROAS is understated and Smart Bidding optimises blind. Pass booking value back to Google.", impact: "high", effort: "medium", owner: "Signal" },
  { title: "Mobile CVR 40% below desktop", detail: "Mobile converts at 2.9% vs 4.8% on desktop, concentrated on the gemstone PDPs. Landing-page LCP is 4.1s on mobile — compress hero imagery and defer the chat widget.", impact: "medium", effort: "high", owner: "Pilot" },
  { title: "18-24 band spends at 2× CAC", detail: "The 18-24 age group is 12% of spend at roughly double the blended CAC with thin revenue. Apply a bid adjustment or exclude on the prospecting campaigns.", impact: "medium", effort: "low", owner: "Pilot" },
];

interface Action {
  id: string;
  agent: string;
  kind: string;
  platform: string | null;
  summary: string;
  rationale: string | null;
  status: string;
  estimated_spend_cents: number;
  dry_run: boolean;
  created_at: string;
}

const RECENT_ACTIONS: Action[] = [
  { id: "a1", agent: "Scout", kind: "audit", platform: "google", summary: "Completed opportunity audit — health 52/100, 5 opportunities surfaced.", rationale: "Scheduled daily audit over the last 30 days of Google performance.", status: "executed", estimated_spend_cents: 0, dry_run: true, created_at: iso(0.4 * 3600 * 1000) },
  { id: "a2", agent: "Pilot", kind: "budget_increase", platform: "google", summary: "Proposed raising 'Kundli & Horoscope' daily budget ₹4,000 → ₹5,500.", rationale: "Campaign ROAS 4.1× over the last 14d, well above the 3.0× target, and it is budget-limited 71% of the day.", status: "proposed", estimated_spend_cents: 550_000, dry_run: true, created_at: iso(1.2 * 3600 * 1000) },
  { id: "a3", agent: "Pilot", kind: "budget_increase", platform: "google", summary: "Proposed raising 'Performance Max — Gemstones' daily budget ₹5,000 → ₹6,500.", rationale: "Lost impression share (budget) at 38%; incremental ROAS modelled at 3.4×.", status: "proposed", estimated_spend_cents: 650_000, dry_run: true, created_at: iso(1.3 * 3600 * 1000) },
  { id: "a4", agent: "Pilot", kind: "campaign_create", platform: "google", summary: "Proposed new Search campaign 'Numerology Reports'.", rationale: "Search-term mining shows rising numerology demand with no campaign coverage; start capped at ₹3,000/day.", status: "proposed", estimated_spend_cents: 300_000, dry_run: true, created_at: iso(1.4 * 3600 * 1000) },
  { id: "a5", agent: "Pilot", kind: "pause", platform: "google", summary: "Paused 'Display — Remarketing' — CAC ₹2,140 vs ₹680 blended.", rationale: "Display remarketing CAC ran 3× blended for 9 straight days with falling volume.", status: "executed", estimated_spend_cents: 0, dry_run: true, created_at: iso(20 * 3600 * 1000) },
  { id: "a6", agent: "Guard", kind: "budget_increase", platform: "google", summary: "Rejected a +40% budget increase on 'YouTube — Daily Horoscope'.", rationale: "Requested jump exceeded the +25%/day change cap; held for operator review.", status: "rejected", estimated_spend_cents: 0, dry_run: true, created_at: iso(26 * 3600 * 1000) },
  { id: "a7", agent: "Signal", kind: "fetch", platform: "google", summary: "Pulled 30d performance, traffic-source, age & gender breakdowns across 6 campaigns.", rationale: null, status: "executed", estimated_spend_cents: 0, dry_run: true, created_at: iso(28 * 3600 * 1000) },
];

const PENDING_APPROVALS = RECENT_ACTIONS.filter((a) => a.status === "proposed");

// ---- runs ------------------------------------------------------------------

function runs() {
  return [
    {
      id: "run-aud-9f2a1c",
      step: "audit",
      agent: "Scout",
      model: "claude-opus-4",
      status: "done",
      summary: "Reviewed 30 days across 6 Google campaigns. Account is profitable (3.2× blended ROAS) but leaves money on the table: brand/non-brand budgets are entangled, Performance Max overlaps brand Search, and consultation conversions carry no value so bidding is flying partially blind. Five opportunities ranked by impact, two are low-effort and ready to action behind approval.",
      input_tokens: 18420,
      output_tokens: 3110,
      started_at: iso(0.42 * 3600 * 1000),
      finished_at: iso(0.4 * 3600 * 1000),
      fetches: [
        { id: "f1", agent: "Scout", kind: "read", platform: "google", summary: "campaign performance · 30d · 6 campaigns", rationale: null, status: "executed", estimated_spend_cents: 0, dry_run: true, created_at: iso(0.42 * 3600 * 1000) },
        { id: "f2", agent: "Scout", kind: "read", platform: "google", summary: "traffic-source / age / gender breakdowns", rationale: null, status: "executed", estimated_spend_cents: 0, dry_run: true, created_at: iso(0.42 * 3600 * 1000) },
      ],
      mutations: [],
      audit: { score: 52, summary: "Profitable but leaking efficiency — brand/non-brand entangled, PMax overlap, missing conversion values.", opportunities: OPPORTUNITIES, created_at: iso(0.4 * 3600 * 1000) },
    },
    {
      id: "run-plan-3b71d8",
      step: "plan",
      agent: "Pilot",
      model: "claude-opus-4",
      status: "done",
      summary: "Translated Scout's audit into concrete changes: two budget increases on the over-target campaigns, one new numerology Search campaign, and a pause on Display remarketing. All spend-increasing actions routed to approvals; the pause executed within the change cap.",
      input_tokens: 9240,
      output_tokens: 1880,
      started_at: iso(1.5 * 3600 * 1000),
      finished_at: iso(1.45 * 3600 * 1000),
      fetches: [],
      mutations: [
        { id: "m1", agent: "Pilot", kind: "budget_increase", platform: "google", summary: "Kundli & Horoscope ₹4,000 → ₹5,500/day", rationale: null, status: "proposed", estimated_spend_cents: 550_000, dry_run: true, created_at: iso(1.5 * 3600 * 1000) },
        { id: "m2", agent: "Pilot", kind: "pause", platform: "google", summary: "Pause Display — Remarketing", rationale: null, status: "executed", estimated_spend_cents: 0, dry_run: true, created_at: iso(1.5 * 3600 * 1000) },
      ],
      audit: null,
    },
    {
      id: "run-fetch-7c0e44",
      step: "fetch",
      agent: "Signal",
      model: "claude-haiku-4",
      status: "done",
      summary: "Nightly sync of Google Ads performance and Shopify orders, reconciled against ad-platform-reported revenue.",
      input_tokens: 4100,
      output_tokens: 420,
      started_at: iso(28 * 3600 * 1000),
      finished_at: iso(27.96 * 3600 * 1000),
      fetches: [
        { id: "f3", agent: "Signal", kind: "read", platform: "google", summary: "performance + breakdowns", rationale: null, status: "executed", estimated_spend_cents: 0, dry_run: true, created_at: iso(28 * 3600 * 1000) },
        { id: "f4", agent: "Signal", kind: "read", platform: "shopify", summary: "orders · 30d", rationale: null, status: "executed", estimated_spend_cents: 0, dry_run: true, created_at: iso(28 * 3600 * 1000) },
      ],
      mutations: [],
      audit: null,
    },
  ];
}

// ---- the mock API ----------------------------------------------------------

function shopifyRevenue(days: number) {
  const rows = series(days);
  const daily = rows.map((r) => ({
    date: r.date,
    orders: Math.round(r.conversions * 1.12), // some direct/organic on top of paid
    revenueCents: Math.round(r.revenueCents * 0.92), // store truth a touch below ad-reported
  }));
  const orders = daily.reduce((s, d) => s + d.orders, 0);
  const revenueCents = daily.reduce((s, d) => s + d.revenueCents, 0);
  const k = kpisOf(rows);
  const metaRevenue = Math.round(revenueCents * 1.12); // ad platform over-counts
  return {
    configured: true,
    shopify: { currency: "INR", days, orders, revenueCents, aovCents: orders ? Math.round(revenueCents / orders) : null, daily },
    metaReported: { revenueCents: metaRevenue, conversions: k.conversions },
    discrepancyPct: (metaRevenue - revenueCents) / revenueCents,
  };
}

function campaignsPayload(days: number) {
  const rows = series(days);
  const combined = kpisOf(rows);
  const campaigns = CAMPAIGNS.map(({ weight, ...c }) => { void weight; return c; });
  return {
    currency: "INR",
    combined,
    daily: rows.map((r) => ({ date: r.date, spendCents: r.spendCents, conversions: r.conversions, revenueCents: r.revenueCents })),
    platforms: { google: { campaigns, kpis: combined } },
  };
}

function breakdownsPayload(days: number) {
  const k = kpisOf(series(days));
  const network = NETWORK_SHARES.map(([l, s]) => seg(l, s, k));
  const gender = GENDER_SHARES.map(([l, s]) => seg(l, s, k));
  const age = AGE_SHARES.map(([l, s]) => seg(l, s, k));
  const top = CAMPAIGNS.slice(0, 3).map((c) => {
    const ck: Kpis = {
      impressions: Math.round(k.impressions * c.weight),
      clicks: Math.round(k.clicks * c.weight),
      spendCents: Math.round(k.spendCents * c.weight),
      conversions: Math.round(k.conversions * c.weight),
      revenueCents: Math.round(k.revenueCents * c.weight),
      roas: k.roas,
      cacCents: k.cacCents,
      ctr: k.ctr,
    };
    return {
      id: c.externalId,
      name: c.name,
      spendCents: ck.spendCents,
      gender: GENDER_SHARES.map(([l, s]) => seg(l, s, ck)),
      age: AGE_SHARES.map(([l, s]) => seg(l, s, ck)),
    };
  });
  return { currency: "INR", platforms: { google: { network, gender, age, campaigns: top } } };
}

function statusPayload(days = 30) {
  const k = kpisOf(series(days));
  return {
    account: { name: "The Astro Time", autonomy: "read_only", dailySpendCapCents: 2_000_000 },
    safety: { dryRun: true, globalDailyCapCents: 2_000_000 },
    connections: {
      google: { ok: true, detail: "47 campaigns · last sync 28m ago" },
      meta: { ok: false, detail: "pending Marketing API access" },
      shopify: { ok: true, detail: "store connected · orders syncing" },
    },
    recentActions: RECENT_ACTIONS,
    pendingApprovals: PENDING_APPROVALS.length,
    kpis: k,
  };
}

function parseDays(path: string): number {
  const m = path.match(/[?&]days=(\d+)/);
  return m ? Number(m[1]) : 30;
}

export function demoCall(path: string, init?: RequestInit): Promise<Record<string, unknown>> {
  const method = (init?.method || "GET").toUpperCase();
  const route = path.split("?")[0];

  let payload: Record<string, unknown>;
  if (route === "/api/engine/status") payload = statusPayload();
  else if (route === "/api/engine/campaigns") payload = campaignsPayload(parseDays(path));
  else if (route === "/api/engine/breakdowns") payload = breakdownsPayload(parseDays(path));
  else if (route === "/api/engine/revenue") payload = shopifyRevenue(parseDays(path));
  else if (route === "/api/engine/audits") payload = { audit: { score: 52, summary: "Profitable (3.2× blended ROAS) but leaking efficiency: brand and non-brand budgets are entangled, Performance Max overlaps brand Search, and consultation conversions carry no value so Smart Bidding optimises partially blind.", opportunities: OPPORTUNITIES, created_at: iso(0.4 * 3600 * 1000) } };
  else if (route === "/api/engine/runs") payload = { runs: runs() };
  else if (route === "/api/engine/approvals" && method === "GET") payload = { pending: PENDING_APPROVALS };
  else if (route === "/api/engine/approvals") payload = { ok: true };
  else if (route === "/api/engine/run") payload = { runId: "demoaudit-0001", ok: true };
  else payload = {};

  // small delay so loading spinners flash naturally, like a real fetch
  return new Promise((resolve) => setTimeout(() => resolve(payload), 220));
}
