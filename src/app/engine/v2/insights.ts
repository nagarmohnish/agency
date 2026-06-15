// The 10 insight modules. Each computes from daily facts and returns a real,
// templated takeaway (no lorem) + a viz payload the Insights view renders.

import type { AppState, Dataset } from "./types";
import {
  adAgg, buildSlice, mer, ncMer, orderAgg, orderPlatform, seriesByDay, Slice,
} from "./metrics";
import { resolveCompare } from "./ranges";
import { addDays, DOW, dowOf, eachDay, inr, MS_DAY, pct, ratio, signedPct, parseDate } from "./format";

export interface Insight {
  id: string;
  title: string;
  status: "ok" | "pending" | "flag";
  takeaway: string;
  why: string;
  action?: { label: string };
  data: Record<string, unknown>;
}

const sum = (a: number[]) => a.reduce((s, v) => s + v, 0);
const round0 = (n: number) => Math.round(n);

// 1 — Truth gap (attribution inflation)
function truthGapModule(ds: Dataset, slice: Slice): Insight {
  const days = eachDay(slice.range.start, slice.range.end);
  const claimed = seriesByDay(slice.ad, (r) => r.platformRevenueCents);
  const net = seriesByDay(slice.orders, (o) => o.revenueNetCents);
  const series = days.map((d) => ({ date: d, claimed: claimed.get(d) || 0, net: net.get(d) || 0 }));
  const tot = adAgg(slice.ad).platformRevenueCents;
  const totNet = orderAgg(slice.orders).netCents;
  const r = totNet ? tot / totNet : null;
  return {
    id: "truth_gap", title: "Truth gap — attribution inflation", status: "ok",
    takeaway: r ? `Google claims ${ratio(r)} the revenue Shopify actually recorded this period (${inr(tot, { compact: true })} claimed vs ${inr(totNet, { compact: true })} net). Meta is pending. Judge spend on MER, not platform ROAS.` : "Awaiting data: no spend or store revenue in range.",
    why: "Every platform self-attributes the same order, so summed platform ROAS double-counts. Shopify net revenue is the only number that isn't inflated.",
    data: { series, ratio: r, claimedCents: tot, netCents: totNet },
  };
}

// 2 — MER ladder & new-customer efficiency
function merLadderModule(ds: Dataset, slice: Slice): Insight {
  const days = eachDay(slice.range.start, slice.range.end);
  const spend = seriesByDay(slice.ad, (r) => r.spendCents);
  const net = seriesByDay(slice.orders, (o) => o.revenueNetCents);
  const newNet = seriesByDay(slice.orders.filter((o) => o.customerType === "new"), (o) => o.revenueNetCents);
  const series = days.map((d) => {
    const sp = spend.get(d) || 0;
    return { date: d, mer: sp ? (net.get(d) || 0) / sp : 0, ncMer: sp ? (newNet.get(d) || 0) / sp : 0 };
  });
  const m = mer(slice), nc = ncMer(slice);
  const oa = orderAgg(slice.orders);
  const returningShare = oa.netCents ? oa.returningNetCents / oa.netCents : null;
  return {
    id: "mer_ladder", title: "MER ladder & new-customer efficiency", status: "ok",
    takeaway: m != null && nc != null ? `MER ${ratio(m)} but ncMER ${ratio(nc)} — ${pct(returningShare)} of ad-period revenue came from returning customers ads may not deserve credit for.` : "Awaiting data.",
    why: "If the gap between MER and ncMER is wide, paid is being subsidised by repeat buyers. New-customer economics (ncMER, nCAC) are the honest growth signal.",
    data: { series, mer: m, ncMer: nc, returningShare },
  };
}

// 3 — CPA decomposition (why did CPA move?)
function cpaDecompModule(ds: Dataset, state: AppState, slice: Slice): Insight {
  const cmp = resolveCompare(slice.range, state.compareMode === "off" ? "preceding" : state.compareMode, state.compareRange) ||
    resolveCompare(slice.range, "preceding", null)!;
  const prev = buildSlice(ds, cmp, state.filters, state.source);
  const cur = adAgg(slice.ad), pre = adAgg(prev.ad);
  const cpa = (a: typeof cur) => (a.platformConversions ? a.spendCents / a.platformConversions : null);
  const cpaCur = cpa(cur), cpaPre = cpa(pre);
  const ln = (x: number | null | undefined) => (x && x > 0 ? Math.log(x) : null);
  const dln = (c: number | null, p: number | null) => (ln(c) != null && ln(p) != null ? (ln(c)! - ln(p)!) : 0);
  const dCPM = dln(cur.cpmCents, pre.cpmCents);
  const dCTR = dln(cur.ctr, pre.ctr);
  const dCVR = dln(cur.cvr, pre.cvr);
  // ln(CPA) = ln(CPM) - ln(CTR) - ln(CVR) - ln(1000)  → ΔlnCPA = ΔlnCPM - ΔlnCTR - ΔlnCVR
  const terms = [
    { label: "Auction cost (CPM)", contrib: dCPM },
    { label: "Creative (CTR)", contrib: -dCTR },
    { label: "Site conversion (CVR)", contrib: -dCVR },
  ];
  const dCPA = cpaCur != null && cpaPre != null ? (cpaCur - cpaPre) / cpaPre : null;
  const driver = terms.slice().sort((a, b) => Math.abs(b.contrib) - Math.abs(a.contrib))[0];
  const ok = cpaCur != null && cpaPre != null;
  const verdict = driver?.label.includes("CPM") ? "a market-cost problem, not a creative problem" : driver?.label.includes("CTR") ? "a creative problem" : "a landing-page conversion problem";
  return {
    id: "cpa_decomp", title: "CPA decomposition", status: "ok",
    takeaway: ok ? `CPA ${signedPct(dCPA)}: auction cost (CPM) ${signedPct(dCPM)}, creative (CTR) ${signedPct(dCTR)}, site conversion (CVR) ${signedPct(dCVR)}. This is ${verdict}.` : "Awaiting data: need two comparable periods.",
    why: "CPA = CPM ÷ (CTR × CVR). Splitting its movement tells you whether to fix bids, creative, or the landing page — not guess.",
    data: { terms, cpaCur, cpaPre, dCPA },
  };
}

// 4 — Diminishing returns curve
function diminishingModule(ds: Dataset, slice: Slice): Insight {
  // weekly points within range
  const days = eachDay(slice.range.start, slice.range.end);
  const spend = seriesByDay(slice.ad, (r) => r.spendCents);
  const net = seriesByDay(slice.orders, (o) => o.revenueNetCents);
  const weeks = new Map<number, { x: number; y: number }>();
  days.forEach((d) => {
    const wk = Math.floor(parseDate(d).getTime() / (7 * MS_DAY));
    const w = weeks.get(wk) || { x: 0, y: 0 };
    w.x += (spend.get(d) || 0) / 100; w.y += (net.get(d) || 0) / 100; // rupees
    weeks.set(wk, w);
  });
  const pts = [...weeks.values()].filter((p) => p.x > 0);
  if (pts.length < 3) {
    return { id: "diminishing", title: "Diminishing returns", status: "pending", takeaway: "Awaiting data: need ≥3 full weeks in range — widen the date range to fit the spend→revenue curve.", why: "The marginal return on the next rupee can only be estimated with enough weekly spend levels to fit a curve.", data: { points: pts } };
  }
  const u = pts.map((p) => Math.log(p.x));
  const y = pts.map((p) => p.y);
  const mu = sum(u) / u.length, my = sum(y) / y.length;
  const a = sum(u.map((ui, i) => (ui - mu) * (y[i] - my))) / (sum(u.map((ui) => (ui - mu) ** 2)) || 1);
  const b = my - a * mu;
  const currentSpend = pts[pts.length - 1].x;
  const totSpend = sum(pts.map((p) => p.x)), totRev = sum(pts.map((p) => p.y));
  const avgMer = totSpend ? totRev / totSpend : null;
  const marginalMer = currentSpend ? a / currentSpend : null;
  return {
    id: "diminishing", title: "Diminishing returns curve", status: "ok",
    takeaway: avgMer != null && marginalMer != null ? `Average MER ${ratio(avgMer)}, but marginal MER at current weekly spend ≈ ${ratio(marginalMer)} — the next rupee earns roughly ${marginalMer < avgMer ? `${(marginalMer / avgMer).toFixed(2)}× the average` : "as much as the average"}.` : "Awaiting data.",
    why: "Scaling decisions should be made on the marginal return, not the average. When marginal MER drops below your floor, more budget destroys efficiency.",
    data: { points: pts, a, b, currentSpend, avgMer, marginalMer },
  };
}

// 5 — Wasted spend (Google search terms) — NOT extracted by the current connector
function wastedSpendModule(): Insight {
  return {
    id: "wasted_spend", title: "Wasted spend (search terms)", status: "pending",
    takeaway: "Unlocks when we add Google search-terms + impression-share reporting to the connector — then this flags zero-conversion terms (₹ recoverable) and budget-capped winners.",
    why: "Zero-conversion search terms are a direct, recoverable leak — but that needs a search-terms + lost-IS pull we don't make yet (see data-sources/CATALOG.md). No fabricated numbers here.",
    data: {},
  };
}

// 6 — Creative fatigue (Meta) — needs reach/frequency, not extracted even on connect
function fatigueModule(): Insight {
  return {
    id: "creative_fatigue", title: "Creative fatigue (Meta)", status: "pending",
    takeaway: "Unlocks once Meta connects and we capture reach/frequency — then this flags ad sets where frequency rises while CTR falls.",
    why: "When frequency climbs and CTR falls together, the audience has seen the creative too often and CPMs punish you. Requires Meta's reach/frequency feed (a field add on connect).",
    data: { pending: true },
  };
}

// 7 — Day-of-week pattern
function dowModule(ds: Dataset, slice: Slice): Insight {
  const spend = new Array(7).fill(0), net = new Array(7).fill(0), conv = new Array(7).fill(0);
  for (const r of slice.ad) { spend[dowOf(r.date)] += r.spendCents; conv[dowOf(r.date)] += r.platformConversions; }
  for (const o of slice.orders) net[dowOf(o.date)] += o.revenueNetCents;
  const rows = DOW.map((d, i) => ({ dow: d, mer: spend[i] ? net[i] / spend[i] : 0, cpa: conv[i] ? spend[i] / conv[i] : 0, revenue: net[i] }));
  const withMer = rows.filter((r) => r.mer > 0);
  const peak = withMer.slice().sort((a, b) => b.mer - a.mer)[0];
  const bottom = withMer.slice().sort((a, b) => a.mer - b.mer)[0];
  return {
    id: "dow", title: "Day-of-week pattern", status: "ok",
    takeaway: peak && bottom ? `MER peaks on ${peak.dow} (${ratio(peak.mer)}) and bottoms on ${bottom.dow} (${ratio(bottom.mer)}) — consider ad-scheduling or budget pacing by day.` : "Awaiting data.",
    why: "Demand and conversion quality vary by weekday. Pacing budget toward strong days lifts blended efficiency at no extra cost.",
    data: { rows },
  };
}

// 8 — Traffic quality by source (Shopify join)
function trafficQualityModule(ds: Dataset, slice: Slice): Insight {
  const groups: Record<string, typeof slice.orders> = { Google: [], Email: [], "Direct / Unattributed": [] };
  for (const o of slice.orders) {
    const p = orderPlatform(o);
    if (p === "google") groups.Google.push(o);
    else if ((o.utmMedium || "") === "email") groups.Email.push(o);
    else if (!o.utmSource) groups["Direct / Unattributed"].push(o);
    else (groups[o.utmSource] = groups[o.utmSource] || []).push(o);
  }
  const rows = Object.entries(groups).filter(([, os]) => os.length).map(([src, os]) => {
    const a = orderAgg(os);
    return { source: src, orders: a.orders, aovCents: a.aovCents, discountAssisted: a.discountAssistedPct, refundRate: a.refundRate, newPct: a.orders ? a.newOrders / a.orders : null };
  });
  const g = rows.find((r) => r.source === "Google");
  const site = orderAgg(slice.orders);
  return {
    id: "traffic_quality", title: "Traffic quality by source", status: "ok",
    takeaway: g ? `Google traffic: AOV ${inr(g.aovCents)}, ${pct(g.discountAssisted)} discount-assisted, ${pct(g.newPct)} new customers. Meta pending. Refund rate from paid vs site average ${pct(site.refundRate)}.` : "Awaiting data.",
    why: "Not all traffic is equal: a source that only converts on discounts, or skews to returning customers, is worth less than its raw ROAS suggests.",
    data: { rows, metaPending: true },
  };
}

// 9 — Tracking health
function trackingHealthModule(ds: Dataset, slice: Slice): Insight {
  const days = eachDay(slice.range.start, slice.range.end);
  const byDay = new Map<string, { tot: number; un: number }>();
  for (const o of slice.orders) {
    const e = byDay.get(o.date) || { tot: 0, un: 0 };
    e.tot += 1; if (!o.utmSource && !o.utmMedium) e.un += 1;
    byDay.set(o.date, e);
  }
  const series = days.map((d) => { const e = byDay.get(d); return { date: d, pct: e && e.tot ? e.un / e.tot : 0 }; });
  const flags: { date: string; pct: number }[] = [];
  for (let i = 1; i < series.length; i++) if (series[i - 1].pct > 0 && series[i].pct > 2 * series[i - 1].pct && series[i].pct > 0.2) flags.push(series[i]);
  const oa = orderAgg(slice.orders);
  return {
    id: "tracking_health", title: "Tracking health", status: flags.length ? "flag" : "ok",
    takeaway: `${pct(oa.unattributedPct)} of orders carried no UTMs this period${flags.length ? `, spiking on ${flags.map((f) => f.date).join(", ")} — check landing templates / redirects.` : "."}`,
    why: "Unattributed orders are invisible to every attribution model. A sudden jump usually means a broken redirect or a landing page that strips parameters.",
    data: { series, flags },
  };
}

// 10 — Anomaly flags (z-scores vs trailing 28d)
function anomalyModule(ds: Dataset, slice: Slice): Insight {
  const adByDay = seriesByDay(ds.adDaily, (r) => r.spendCents);
  const convByDay = seriesByDay(ds.adDaily, (r) => r.platformConversions);
  const netByDay = seriesByDay(ds.orders, (o) => o.revenueNetCents);
  const metricOf = (d: string, m: "spend" | "revenue" | "cpa") =>
    m === "spend" ? (adByDay.get(d) || 0) : m === "revenue" ? (netByDay.get(d) || 0) : (convByDay.get(d) ? (adByDay.get(d) || 0) / (convByDay.get(d) || 1) : 0);
  const z = (d: string, m: "spend" | "revenue" | "cpa") => {
    const hist: number[] = [];
    for (let k = 1; k <= 28; k++) hist.push(metricOf(addDays(d, -k), m));
    const mean = sum(hist) / hist.length;
    const sd = Math.sqrt(sum(hist.map((h) => (h - mean) ** 2)) / hist.length) || 1;
    return (metricOf(d, m) - mean) / sd;
  };
  const flags: { date: string; metric: string; z: number; dir: string }[] = [];
  for (const d of eachDay(slice.range.start, slice.range.end)) {
    for (const m of ["spend", "revenue", "cpa"] as const) {
      const zz = z(d, m);
      if (Math.abs(zz) >= 2) flags.push({ date: d, metric: m.toUpperCase(), z: zz, dir: zz > 0 ? "above" : "below" });
    }
  }
  flags.sort((a, b) => Math.abs(b.z) - Math.abs(a.z));
  const top = flags[0];
  return {
    id: "anomaly", title: "Anomaly flags", status: flags.length ? "flag" : "ok",
    takeaway: top ? `${top.date}: ${top.metric} ran ${Math.abs(top.z).toFixed(1)}σ ${top.dir} the trailing-28d norm${top.metric === "CPA" ? " — see CPA decomposition for the driver." : "."}` : "No daily metric moved beyond 2σ of its trailing-28-day norm this period.",
    why: "Statistical guardrails catch silent breakages — a tracking outage, a runaway campaign, a payment issue — before a weekly review would.",
    data: { flags: flags.slice(0, 8) },
  };
}

export function allInsights(ds: Dataset, state: AppState): Insight[] {
  const slice = buildSlice(ds, state.range, state.filters, state.source);
  return [
    truthGapModule(ds, slice),
    merLadderModule(ds, slice),
    cpaDecompModule(ds, state, slice),
    diminishingModule(ds, slice),
    wastedSpendModule(),
    fatigueModule(),
    dowModule(ds, slice),
    trafficQualityModule(ds, slice),
    trackingHealthModule(ds, slice),
    anomalyModule(ds, slice),
  ];
}

// Top-N for the Overview strip (skip pending; prioritise flags)
export function topInsights(ds: Dataset, state: AppState, n = 3): Insight[] {
  return allInsights(ds, state)
    .filter((i) => i.status !== "pending")
    .sort((a, b) => (a.status === "flag" ? -1 : 1) - (b.status === "flag" ? -1 : 1))
    .slice(0, n);
}
