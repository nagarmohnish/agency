"use client";

// Analytics views — Overview, Performance, Segments, Revenue, Insights.
// Views only render: every number comes from metrics.ts / insights.ts computed
// from daily facts, parameterised by the global state (range, lens, filters).

import { useMemo, useState, type ReactNode } from "react";
import type { AdDaily, AppState, Dataset, Lens, Source } from "./types";
import {
  adAgg, buildSlice, bucketSum, delta, isPaidOrder, mer, ncMer, nCacCents,
  orderAgg, orderPlatform, seriesByDay, Slice,
} from "./metrics";
import { allInsights, Insight } from "./insights";
import { bucketize, resolveCompare } from "./ranges";
import { count, daysBetween, fmtDay, inr, pct, ratio } from "./format";
import {
  AxisLineChart, Card, COL, DeltaChip, Empty, Heatmap, InlineBar, Info, KpiCard, Pending,
  ScatterCurve, StackedBarLine, Takeaway, Tip, Waterfall,
} from "./ui";

const vsum = (a: number[]) => a.reduce((s, v) => s + v, 0);

const LENS_LABEL: Record<Lens, string> = { platform: "Platform-reported", shopify: "Shopify last-click", blended: "Blended (MER)" };
const CMP_LABEL: Record<string, string> = { preceding: "preceding period", preceding_dow: "preceding period", yoy: "same period last year", custom: "comparison period", off: "" };

interface VP { ds: Dataset; state: AppState; demo: boolean; goto: (v: string) => void; pending?: number | null }

// shared per-view computation
function useSlices(ds: Dataset, state: AppState) {
  return useMemo(() => ({
    slice: buildSlice(ds, state.range, state.filters, state.source),
    cmp: state.compareRange ? buildSlice(ds, state.compareRange, state.filters, state.source) : null,
    buckets: bucketize(state.range, state.granularity),
  }), [ds, state]);
}
const cmpLabel = (state: AppState) => (state.compareMode === "off" ? "no comparison" : `vs ${CMP_LABEL[state.compareMode]}`);

// metric tooltips (canonical)
const TIP = (lens: Lens): Record<string, Tip> => ({
  spend: { def: "Total ad spend across connected platforms.", formula: "Σ spend", source: "Google Ads (live); Meta on connect.", caveat: "Excludes platform & agency fees." },
  revenue: { def: "Revenue Shopify recorded, net of discounts and refunds — the truth ads are judged against.", formula: "Σ (gross − discount − refund)", source: "Shopify orders.", caveat: "All channels, not only paid." },
  mer: { def: "Marketing efficiency ratio — store revenue per ₹1 of total spend.", formula: "Shopify net ÷ total spend", source: "Shopify ÷ platforms.", caveat: "Blended; makes no per-platform attribution claim. Meta excluded until connected." },
  ncMer: { def: "New-customer MER — new-customer revenue per ₹1 spend.", formula: "new-customer net ÷ total spend", source: "Shopify (customer type) ÷ platforms.", caveat: "The honest growth signal; strips returning-customer subsidy." },
  nCac: { def: "New-customer acquisition cost.", formula: "total spend ÷ new customers", source: "Shopify new customers ÷ spend.", caveat: "Counts all spend against new customers only." },
  orders: { def: "Orders Shopify recorded in range.", formula: "count(orders)", source: "Shopify.", caveat: "All channels." },
  aov: { def: "Average order value, net.", formula: "net revenue ÷ orders", source: "Shopify.", caveat: "Skewed by refunds and high-ticket items." },
  roas: { def: "Return on ad spend under the active attribution lens.", formula: "revenue (lens) ÷ spend", source: LENS_LABEL[lens] + ".", lens: LENS_LABEL[lens], caveat: lens === "platform" ? "Self-attributed by the platform; inflated vs MER." : lens === "shopify" ? "Shopify last-click via UTMs; ignores assists." : "Blended — no attribution claim." },
  cpa: { def: "Cost per acquisition under the active lens.", formula: "spend ÷ conversions (lens)", source: LENS_LABEL[lens] + ".", lens: LENS_LABEL[lens], caveat: "Blended lens has no conversion count." },
  truthGap: { def: "How much platforms claim vs what Shopify recorded.", formula: "Σ platform revenue ÷ Shopify net", source: "Platforms ÷ Shopify.", caveat: ">1 means platforms over-claim." },
});


// ============================================================ Overview
// mini sparkline for the KPI strip (58×18, colored by delta favorability)
function miniSpark(values: number[], color: string) {
  if (!values || values.length < 2) return null;
  const W = 58, H = 18, P = 2, mx = Math.max(...values), mn = Math.min(...values), sp = mx - mn || 1;
  const x = (i: number) => P + (i / (values.length - 1)) * (W - 2 * P);
  const y = (v: number) => H - P - ((v - mn) / sp) * (H - 2 * P);
  const d = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  return <svg width="58" height="18" viewBox="0 0 58 18" fill="none"><path d={d} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" /></svg>;
}
function kdelta(d: number | null, dir: "up" | "down") {
  if (d == null || !isFinite(d)) return { arrow: "", cls: "", txt: "—" };
  const up = d > 0, good = (dir === "up" && up) || (dir === "down" && !up);
  return { arrow: up ? "▲" : "▼", cls: good ? "pos" : "neg", txt: `${(Math.abs(d) * 100).toFixed(1)}%` };
}
function KCell({ label, value, dir, d, spark, accent, tip }: { label: string; value: string; dir: "up" | "down"; d: number | null; spark: number[]; accent?: boolean; tip: Tip }) {
  const k = kdelta(d, dir), col = k.cls === "pos" ? "var(--pos)" : "var(--neg)";
  return (
    <div className="kcell">
      <Info label={label} tip={tip} />
      <div className="klabel">{label}</div>
      <div className={`kval ${accent ? "accent" : ""}`}>{value}</div>
      <div className="kdelta"><span className={`kd ${k.cls}`}>{k.arrow} {k.txt}</span>{miniSpark(spark, col)}</div>
    </div>
  );
}
// blended-performance area chart (revenue area+line vs spend line), theme-aware
function AreaChart({ rev, spend }: { rev: number[]; spend: number[] }) {
  const n = rev.length;
  if (n < 2) return <div className="empty">Not enough data in range.</div>;
  const W = 1000, H = 250, PT = 20, PB = 12, max = Math.max(...rev, ...spend, 1);
  const x = (i: number) => (i / (n - 1)) * W, y = (v: number) => PT + (1 - v / max) * (H - PT - PB);
  const line = (a: number[]) => a.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const grid = [0.25, 0.5, 0.75].map((f) => PT + f * (H - PT - PB));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      {grid.map((gy, i) => <line key={i} x1="0" y1={gy} x2={W} y2={gy} stroke="var(--chart-grid)" strokeWidth="1" />)}
      <path d={`${line(rev)} L${W} ${H} L0 ${H} Z`} fill="var(--chart-rev-fill)" />
      <path d={line(rev)} fill="none" stroke="var(--chart-rev)" strokeWidth="2.3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <path d={line(spend)} fill="none" stroke="var(--chart-spend)" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
// campaign rollup with a derived status, shared by the Overview table + Scout rail
function campaignRollup(slice: Slice) {
  const m = new Map<string, { id: string; name: string; spend: number; rev: number; lb: number }>();
  for (const r of slice.ad) {
    const e = m.get(r.campaignId) || { id: r.campaignId, name: r.campaignName, spend: 0, rev: 0, lb: 0 };
    e.spend += r.spendCents; e.rev += r.platformRevenueCents; e.lb = Math.max(e.lb, r.lostIsBudget || 0);
    m.set(r.campaignId, e);
  }
  const tot = vsum([...m.values()].map((c) => c.spend)) || 1;
  return [...m.values()].map((c) => ({ ...c, roas: c.spend ? c.rev / c.spend : 0, share: c.spend / tot })).sort((a, b) => b.spend - a.spend);
}
// status from REAL signals only (platform ROAS). Impression-share "capped" needs
// lost-IS, which we don't extract — so we don't claim it.
function campStatus(c: { roas: number }) {
  if (c.roas >= 4.5) return { t: "STRONG", color: "var(--pos)" };
  if (c.roas < 3.0) return { t: "DRIFTING", color: "var(--neg)" };
  return { t: "STEADY", color: "var(--ink-3)" };
}
function feedRows(ds: Dataset, state: AppState) {
  const slice = buildSlice(ds, state.range, state.filters, state.source), ins = allInsights(ds, state), end = state.range.end;
  const rows: { date: string; tone: string; node: ReactNode }[] = [];
  const th = ins.find((i) => i.id === "tracking_health");
  const thFlags = (th?.data.flags as { date: string; pct: number }[]) || [];
  if (thFlags.length) rows.push({ date: thFlags[0].date, tone: "neg", node: <>Unattributed orders spiked to <b>{(thFlags[0].pct * 100).toFixed(0)}%</b> — check tracking.</> });
  const camps = campaignRollup(slice).filter((c) => c.spend);
  const best = camps.slice().sort((a, b) => b.roas - a.roas)[0];
  if (best) rows.push({ date: end, tone: "pos", node: <>{best.name} hit <b>{best.roas.toFixed(1)}×</b> ROAS — your top performer.</> });
  const weak = camps.filter((c) => c.roas > 0 && c.roas < 3).sort((a, b) => b.spend - a.spend)[0];
  if (weak) rows.push({ date: end, tone: "warn", node: <>{weak.name} at <b>{weak.roas.toFixed(1)}×</b> on {inr(weak.spend, { compact: true })} — under the 3× floor.</> });
  const an = ins.find((i) => i.id === "anomaly");
  const af = (an?.data.flags as { date: string; metric: string; z: number; dir: string }[]) || [];
  if (af.length) rows.push({ date: af[0].date, tone: af[0].dir === "above" && af[0].metric !== "REVENUE" ? "neg" : "pos", node: <>{af[0].metric} ran <b>{Math.abs(af[0].z).toFixed(1)}σ</b> {af[0].dir} the 28d norm.</> });
  return rows.slice(0, 4);
}

// ── Overview (the design: KPI strip · chart+anomaly split · campaign table) ──
export function Overview({ ds, state, goto }: VP) {
  if (state.source === "meta") return <Pending source="Meta">Meta isn’t connected yet — its spend, conversions and reconciliation appear here once Marketing API access is approved. Until then, use <b>Overall</b> (Google + Shopify) or <b>Google</b>.</Pending>;
  const { slice, buckets } = useSlices(ds, state);
  const tip = TIP(state.lens);
  const auto = buildSlice(ds, resolveCompare(state.range, "preceding", null)!, state.filters, state.source);
  const spend = adAgg(slice.ad).spendCents, net = orderAgg(slice.orders).netCents, oa = orderAgg(slice.orders);
  const pSpend = adAgg(auto.ad).spendCents, pNet = orderAgg(auto.orders).netCents, pOa = orderAgg(auto.orders);
  const m = mer(slice), ncac = nCacCents(slice), pm = mer(auto), pncac = nCacCents(auto);
  const bSpend = bucketSum(seriesByDay(slice.ad, (r) => r.spendCents), buckets);
  const bNet = bucketSum(seriesByDay(slice.orders, (o) => o.revenueNetCents), buckets);
  const bMer = buckets.map((_, i) => (bSpend[i] ? bNet[i] / bSpend[i] : 0));
  const bOrd = bucketSum(seriesByDay(slice.orders, () => 1), buckets);
  const bNewOrd = bucketSum(seriesByDay(slice.orders.filter((o) => o.customerType === "new"), () => 1), buckets);
  const bNcac = buckets.map((_, i) => (bNewOrd[i] ? bSpend[i] / bNewOrd[i] : 0));
  const labels = buckets.map((b) => b.days[0]);
  const ax = [0, Math.floor(labels.length / 4), Math.floor(labels.length / 2), Math.floor((labels.length * 3) / 4), labels.length - 1].map((i) => labels[i]).filter(Boolean);
  const camps = campaignRollup(slice), feed = feedRows(ds, state);

  return (
    <>
      <div className="kstrip">
        <KCell label="Spend" value={inr(spend)} dir="down" d={delta(spend, pSpend)} spark={bSpend} tip={tip.spend} />
        <KCell label="Revenue · truth" value={inr(net)} dir="up" d={delta(net, pNet)} spark={bNet} accent tip={tip.revenue} />
        <KCell label="MER" value={ratio(m)} dir="up" d={delta(m, pm)} spark={bMer} tip={tip.mer} />
        <KCell label="nCAC" value={inr(ncac)} dir="down" d={delta(ncac, pncac)} spark={bNcac} tip={tip.nCac} />
        <KCell label="Orders" value={count(oa.orders)} dir="up" d={delta(oa.orders, pOa.orders)} spark={bOrd} tip={tip.orders} />
      </div>

      <div className="splitcols">
        <div className="chcard">
          <div className="chhead">
            <div><div className="chtitle">Blended performance</div><div className="chsub">Revenue vs. spend · {state.granularity} · {daysBetween(state.range.start, state.range.end) + 1}d</div></div>
            <div className="chlegend"><span><i style={{ background: "var(--chart-rev)" }} />Revenue</span><span><i style={{ background: "var(--chart-spend)" }} />Spend</span></div>
          </div>
          <div className="areawrap"><AreaChart rev={bNet} spend={bSpend} /></div>
          <div className="chaxis">{ax.map((d, i) => <span key={i}>{fmtDay(d)}</span>)}</div>
        </div>
        <div className="afeed">
          <div className="afeed-h">Anomaly feed</div>
          <div className="afeed-list">
            {feed.length === 0 ? <div className="atext">Nothing unusual this period.</div> : feed.map((r, i) => (
              <div key={i} className="arow"><span className="adate">{fmtDay(r.date)}</span><span className="adot" style={{ background: r.tone === "neg" ? "var(--neg)" : r.tone === "pos" ? "var(--pos)" : "var(--warn)" }} /><span className="atext">{r.node}</span></div>
            ))}
          </div>
        </div>
      </div>

      <div className="ctable">
        <div className="ct-top"><span className="t">Campaigns</span><span className="a" onClick={() => goto("google")}>view all {camps.length} →</span></div>
        <div className="ct-grid ct-head"><span>Campaign</span><span style={{ textAlign: "right" }}>Spend</span><span style={{ textAlign: "right" }}>ROAS</span><span>Share of spend</span><span style={{ textAlign: "right" }}>Status</span></div>
        {camps.slice(0, 4).map((c) => {
          const st = campStatus(c), roasCol = st.t === "DRIFTING" ? "var(--neg)" : "var(--pos)";
          return (
            <div key={c.id} className="ct-grid ct-row">
              <span className="ct-name"><span className="ct-dot" style={{ background: st.color }} /><span className="nm">{c.name}</span></span>
              <span className="ct-num">{inr(c.spend)}</span>
              <span className="ct-num" style={{ color: roasCol }}>{ratio(c.roas)}</span>
              <span className="ct-share"><span className="ct-bar"><i style={{ width: `${Math.round(c.share * 100)}%`, background: st.color }} /></span><span className="ct-barpct">{Math.round(c.share * 100)}%</span></span>
              <span className="ct-status" style={{ color: st.color }}>{st.t}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── sync ticker (Terminal) — shown on analytics views ──
export function Ticker({ ds, state }: { ds: Dataset; state: AppState }) {
  const sl = buildSlice(ds, state.range, state.filters, state.source);
  const m = mer(sl), ncac = nCacCents(sl), win = daysBetween(state.range.start, state.range.end) + 1;
  return (
    <div className="ticker">
      {ds.integrations.map((it) => (
        <span key={it.source} className="tk-stat"><span className={`tk-dot ${it.status === "connected" ? "ok" : "wait"}`} />{it.source} · {it.status === "connected" ? "synced" : "connecting…"}</span>
      ))}
      <div className="tk-right">
        <span>MER <b>{ratio(m)}</b></span><span className="tk-sep">|</span>
        <span>nCAC <b>{inr(ncac)}</b></span><span className="tk-sep">|</span>
        <span>WINDOW <b>{win}D</b></span>
      </div>
    </div>
  );
}

// ── Scout rail (Atlas) — proposed actions from real insight data ──
export function scoutProposals(ds: Dataset, state: AppState) {
  const slice = buildSlice(ds, state.range, state.filters, state.source), ins = allInsights(ds, state);
  const days = daysBetween(state.range.start, state.range.end) + 1;
  const out: { id: string; impact: "high" | "medium" | "low"; title: string; desc: string; save: number }[] = [];
  const camps = campaignRollup(slice).filter((c) => c.spend > 0);
  // 1 — low-ROAS, high-spend → trim/reallocate (the clearest revenue leak we can see)
  const weak = camps.filter((c) => c.roas > 0 && c.roas < 3).sort((a, b) => b.spend - a.spend)[0];
  if (weak) {
    const monthly = Math.round((weak.spend * 30) / Math.max(1, days));
    out.push({ id: "trim-" + weak.id, impact: "high", title: `Trim ${weak.name}`, desc: `${ratio(weak.roas)} ROAS on ${inr(weak.spend, { compact: true })} — under the 3× floor. Reallocating frees ~${inr(Math.round(monthly * 0.4), { compact: true })}/mo.`, save: Math.round(monthly * 0.4) });
  }
  // 2 — top ROAS winner → measured scale-up
  const star = camps.filter((c) => c.roas >= 5).sort((a, b) => b.roas - a.roas)[0];
  if (star) out.push({ id: "scale-" + star.id, impact: "medium", title: `Scale ${star.name}`, desc: `${ratio(star.roas)} ROAS — your strongest. Test a measured budget increase.`, save: Math.round((star.spend * 0.15 * 30) / Math.max(1, days)) });
  // 3 — CPA rising (from the real CPA decomposition) → fix the actual driver
  const cpa = ins.find((i) => i.id === "cpa_decomp");
  const dCPA = (cpa?.data.dCPA as number | null) ?? null;
  if (dCPA != null && dCPA > 0.15) {
    const terms = (cpa!.data.terms as { label: string; contrib: number }[]) || [];
    const driver = terms.slice().sort((a, b) => Math.abs(b.contrib) - Math.abs(a.contrib))[0];
    const fix = driver?.label.includes("CPM") ? "Market cost — tighten targeting / dayparting." : driver?.label.includes("CTR") ? "Refresh creative." : "Fix the landing page.";
    out.push({ id: "cpa", impact: "high", title: "CPA is rising", desc: `CPA +${(dCPA * 100).toFixed(0)}% — mostly ${driver?.label.toLowerCase()}. ${fix}`, save: 0 });
  }
  return out.slice(0, 3);
}
export function ScoutRail({ ds, state, dismissed, onDismiss, goto, pending }: { ds: Dataset; state: AppState; dismissed: Set<string>; onDismiss: (id: string) => void; goto: (v: string) => void; pending: number | null }) {
  const props = scoutProposals(ds, state).filter((p) => !dismissed.has(p.id));
  const m = mer(buildSlice(ds, state.range, state.filters, state.source)), save = vsum(props.map((p) => p.save));
  return (
    <div className="scoutrail">
      <div className="scouthead">
        <span className="scoutav">✦</span>
        <div><div className="scoutname">Scout</div><div className="scoutlive"><i />analyzing live</div></div>
        <span className="scoutbadge">{props.length}</span>
      </div>
      <p className="scoutsum">Your <b>MER is {ratio(m)}</b> this period. {props.length ? <>I found <b className="acc">{props.length} move{props.length > 1 ? "s" : ""}</b> worth ~{inr(save, { compact: true })}/mo.</> : "No moves needed — you're optimised."}</p>
      <div className="actlbl">Proposed actions</div>
      {props.length === 0 ? <div className="actioncard"><div className="acttitle">All caught up</div><p className="actdesc" style={{ margin: 0 }}>Nothing waiting on you right now.</p></div> : props.map((p) => (
        <div key={p.id} className="actioncard">
          <span className={`actimpact ${p.impact}`}>{p.impact === "high" ? "HIGH IMPACT" : p.impact.toUpperCase()}</span>
          <div className="acttitle">{p.title}</div>
          <p className="actdesc">{p.desc}</p>
          <div className="actbtns"><button className="ap" onClick={() => onDismiss(p.id)}>Approve</button><button className="lt" onClick={() => onDismiss(p.id)}>Later</button></div>
        </div>
      ))}
      <div className="scoutcta" onClick={() => goto("approvals")}>
        <span className="ic">⚑</span><span className="lbl">{pending ?? 0} change{pending === 1 ? "" : "s"} waiting on sign-off</span><span className="ic" style={{ marginLeft: "auto" }}>→</span>
      </div>
    </div>
  );
}

// ============================================================ Performance
type SortKey = "spend" | "roas" | "cpa" | "revenue" | "ctr" | "clicks";
export function Performance({ ds, state, demo }: VP) {
  const { slice, cmp } = useSlices(ds, state);
  const [sort, setSort] = useState<{ k: SortKey; dir: 1 | -1 }>({ k: "spend", dir: -1 });
  const [open, setOpen] = useState<string | null>(null);
  const lens = state.lens;
  const cur = inr;

  const paidNetByCampaign = (s: Slice) => {
    const m = new Map<string, number>();
    for (const o of s.orders) if (isPaidOrder(o) && o.utmCampaign) m.set(o.utmCampaign, (m.get(o.utmCampaign) || 0) + o.revenueNetCents);
    return m;
  };
  const build = (s: Slice) => {
    const net = paidNetByCampaign(s);
    const m = new Map<string, { id: string; name: string; source: Source; type: string; funnel: string; spend: number; impr: number; clicks: number; pconv: number; prev: number }>();
    for (const r of s.ad) {
      const e = m.get(r.campaignId) || { id: r.campaignId, name: r.campaignName, source: r.source, type: r.campaignType, funnel: r.funnelStage, spend: 0, impr: 0, clicks: 0, pconv: 0, prev: 0 };
      e.spend += r.spendCents; e.impr += r.impressions; e.clicks += r.clicks; e.pconv += r.platformConversions; e.prev += r.platformRevenueCents;
      m.set(r.campaignId, e);
    }
    return [...m.values()].map((e) => {
      const revenue = lens === "platform" ? e.prev : (net.get(e.id) || 0);
      const conv = lens === "platform" ? e.pconv : null;
      return { ...e, revenue, roas: e.spend ? revenue / e.spend : null, cpa: conv ? e.spend / conv : null, ctr: e.impr ? e.clicks / e.impr : null, cpm: e.impr ? (e.spend / e.impr) * 1000 : null };
    });
  };
  const rows = build(slice);
  const prevRows = cmp ? new Map(build(cmp).map((r) => [r.id, r])) : null;
  const sorted = rows.slice().sort((a, b) => {
    const va = (a[sort.k] as number) ?? -Infinity, vb = (b[sort.k] as number) ?? -Infinity;
    return (va - vb) * sort.dir;
  });
  const th = (k: SortKey, label: string, extra = "") => <th className={`r srt ${extra}`} onClick={() => setSort((s) => ({ k, dir: s.k === k && s.dir === -1 ? 1 : -1 }))}>{label}{sort.k === k ? (sort.dir === -1 ? " ↓" : " ↑") : ""}</th>;
  const drawer = open ? rows.find((r) => r.id === open) : null;
  const drawerDaily = open ? bucketize(state.range, state.granularity).map((bk) => ({ d: bk.days[0], spend: slice.ad.filter((r) => r.campaignId === open && bk.days.includes(r.date)).reduce((s, r) => s + r.spendCents, 0), conv: slice.ad.filter((r) => r.campaignId === open && bk.days.includes(r.date)).reduce((s, r) => s + r.platformConversions, 0) })) : [];

  if (state.source === "meta") return <Pending source="Meta">Campaign performance appears here once Meta connects (Marketing API approval).</Pending>;
  if (state.source === "shopify") return <div className="empty big">Performance is per-campaign ad data — switch <b>Source</b> to Overall or Google. Shopify is the store-truth view (see <b>Revenue</b>).</div>;

  return (
    <div className="stack">
      <Card title="Campaigns" subtitle={`${sorted.length} in scope · Revenue / CPA / ROAS use the ${LENS_LABEL[lens]} lens · click a row for its daily trend`} right={demo ? <span className="src demo">DEMO</span> : undefined}>
        {sorted.length === 0 ? <Empty>No campaigns match the current source / filters.</Empty> : (
          <div className="tblwrap"><table className="tbl perf">
            <thead>
              <tr className="grouprow">
                <th>Campaign</th>
                <th className="grp gdiv" colSpan={4}>Delivery</th>
                <th className="grp gdiv" colSpan={4}>Economics · {LENS_LABEL[lens]}</th>
                <th className="grp gdiv r">Trend</th>
              </tr>
              <tr className="colrow">
                <th></th>
                <th className="r cdiv">Impr.</th>{th("clicks", "Clicks")}{th("ctr", "CTR")}<th className="r">CPM</th>
                {th("spend", "Spend", "cdiv")}{th("revenue", "Revenue")}{th("cpa", "CPA")}{th("roas", "ROAS")}
                <th className="r cdiv">Δ ROAS</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => {
                const prev = prevRows?.get(r.id);
                const st = campStatus({ roas: r.roas ?? 0 });
                return (
                  <tr key={r.id} onClick={() => setOpen(r.id)} className={open === r.id ? "open" : ""}>
                    <td className="pf-camp">
                      <div className="pf-id">
                        <span className={`pf-dot ${r.source}`} title={r.source} />
                        <div className="pf-meta">
                          <div className="pf-name">{r.name}</div>
                          <div className="pf-chips"><span className="pf-chip">{r.type}</span><span className="pf-chip">{r.funnel.toUpperCase()}</span><span className="pf-status" style={{ color: st.color }}>● {st.t}</span></div>
                        </div>
                      </div>
                    </td>
                    <td className="r cdiv">{count(r.impr)}</td><td className="r">{count(r.clicks)}</td><td className="r">{pct(r.ctr)}</td><td className="r">{cur(r.cpm)}</td>
                    <td className="r cdiv">{cur(r.spend)}</td><td className="r">{cur(r.revenue)}</td><td className="r">{cur(r.cpa)}</td>
                    <td className="r" style={{ color: r.roas == null ? undefined : r.roas >= 3 ? "var(--pos)" : "var(--neg)", fontWeight: 600 }}>{ratio(r.roas)}</td>
                    <td className="r cdiv">{prev ? <DeltaChip delta={delta(r.roas, prev.roas)} dir="up" /> : <span className="muted">—</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        )}
      </Card>
      {drawer && (
        <div className="drawer" role="dialog">
          <div className="drawerhead"><div><span className="cpl">{drawer.source}</span><b>{drawer.name}</b><span className="muted sm"> · {drawer.type} · {drawer.funnel.toUpperCase()}</span></div><button className="ghost sm" onClick={() => setOpen(null)}>Close</button></div>
          <div className="kpis">
            <KpiCard demo={demo} label="Spend" sources={[drawer.source.toUpperCase()]} value={cur(drawer.spend)} explainer="Spend in range." />
            <KpiCard demo={demo} label={`Revenue · ${LENS_LABEL[lens]}`} sources={[lens === "platform" ? drawer.source.toUpperCase() : "SHOPIFY"]} value={cur(drawer.revenue)} explainer="Under active lens." />
            <KpiCard demo={demo} label="ROAS" sources={[lens === "platform" ? drawer.source.toUpperCase() : "SHOPIFY"]} value={ratio(drawer.roas)} explainer="Revenue ÷ spend (lens)." />
            <KpiCard demo={demo} label="CTR" sources={[drawer.source.toUpperCase()]} value={pct(drawer.ctr)} explainer="Clicks ÷ impressions." />
          </div>
          <Card title="Daily spend & conversions" subtitle={`${drawer.name} · ${state.granularity}`}>
            <AxisLineChart labels={drawerDaily.map((d) => d.d)} series={[{ name: "Spend", color: COL.ink, values: drawerDaily.map((d) => d.spend), fmt: (x) => inr(x, { compact: true }) }, { name: "Conversions", color: COL.ink3, values: drawerDaily.map((d) => d.conv), dashed: true, fmt: (x) => count(x) }]} />
          </Card>
        </div>
      )}
    </div>
  );
}

// ============================================================ Segments
// only cuts we can actually extract: Platform/Type/Funnel + Google Age/Gender +
// Shopify New-vs-Returning/Product. Placement is Meta-pending. (Device/Geo/Search-terms
// need new connector pulls — see data-sources/CATALOG.md — so they're omitted.)
const SEG_TABS = ["Platform", "Campaign type", "Funnel", "Age", "Gender", "New vs Returning", "Product", "Placement"] as const;
type SegRow = { label: string; spend: number; revenue: number; conv: number; extra?: Record<string, string> };

export function Segments({ ds, state, demo }: VP) {
  const { slice, cmp } = useSlices(ds, state);
  const [tab, setTab] = useState<(typeof SEG_TABS)[number]>("Platform");
  const lens = state.lens;
  const cur = inr;

  const groupAd = (s: Slice, key: (r: AdDaily) => string): SegRow[] => {
    const m = new Map<string, { spend: number; prev: number; conv: number }>();
    const net = new Map<string, number>();
    for (const o of s.orders) if (isPaidOrder(o)) { const k = orderPlatform(o) || ""; net.set(k, (net.get(k) || 0) + o.revenueNetCents); }
    for (const r of s.ad) { const k = key(r); const e = m.get(k) || { spend: 0, prev: 0, conv: 0 }; e.spend += r.spendCents; e.prev += r.platformRevenueCents; e.conv += r.platformConversions; m.set(k, e); }
    return [...m.entries()].map(([label, e]) => ({ label, spend: e.spend, conv: e.conv, revenue: lens === "platform" ? e.prev : (net.get(label) ?? e.prev) }));
  };
  const groupSeg = (s: Slice, type: string): SegRow[] => {
    const m = new Map<string, { spend: number; conv: number; rev: number; clicks: number; impr: number }>();
    for (const r of s.seg.filter((x) => x.segmentType === type)) { const e = m.get(r.segmentValue) || { spend: 0, conv: 0, rev: 0, clicks: 0, impr: 0 }; e.spend += r.spendCents; e.conv += r.conversions; e.rev += r.revenueCents; e.clicks += r.clicks; e.impr += r.impressions; m.set(r.segmentValue, e); }
    return [...m.entries()].map(([label, e]) => ({ label, spend: e.spend, conv: e.conv, revenue: e.rev, extra: { CTR: pct(e.impr ? e.clicks / e.impr : null), CVR: pct(e.clicks ? e.conv / e.clicks : null) } }));
  };

  let rows: SegRow[] = [];
  let pending: string | null = null;
  if (tab === "Platform") { rows = groupAd(slice, (r) => r.source); rows.push({ label: "meta (pending)", spend: 0, revenue: 0, conv: 0 }); }
  else if (tab === "Campaign type") rows = groupAd(slice, (r) => r.campaignType);
  else if (tab === "Funnel") rows = groupAd(slice, (r) => r.funnelStage.toUpperCase());
  else if (tab === "Age") rows = groupSeg(slice, "age");
  else if (tab === "Gender") rows = groupSeg(slice, "gender");
  else if (tab === "New vs Returning") {
    const g = (ct: string) => { const os = slice.orders.filter((o) => o.customerType === ct); const a = orderAgg(os); return { label: ct, spend: 0, revenue: a.netCents, conv: a.orders, extra: { AOV: cur(a.aovCents), Orders: count(a.orders) } }; };
    rows = [g("new"), g("returning")];
  } else if (tab === "Product") {
    const m = new Map<string, { rev: number; qty: number }>();
    for (const o of slice.orders) for (const p of o.products) { const e = m.get(p.title) || { rev: 0, qty: 0 }; e.rev += p.revenueCents; e.qty += p.quantity; m.set(p.title, e); }
    rows = [...m.entries()].map(([label, e]) => ({ label, spend: 0, revenue: e.rev, conv: e.qty, extra: { Units: count(e.qty) } })).sort((a, b) => b.revenue - a.revenue);
  } else if (tab === "Placement") pending = "Meta";

  const cmpRows = cmp && !pending ? new Map((tab === "Platform" ? groupAd(cmp, (r) => r.source) : tab === "Campaign type" ? groupAd(cmp, (r) => r.campaignType) : tab === "Funnel" ? groupAd(cmp, (r) => r.funnelStage.toUpperCase()) : ["Age", "Gender"].includes(tab) ? groupSeg(cmp, tab.toLowerCase()) : []).map((r) => [r.label, r])) : null;
  const sortBy = tab === "Product" ? "keep" : "spend";
  const display = sortBy === "keep" ? rows : rows.slice().sort((a, b) => (b.spend || b.revenue) - (a.spend || a.revenue));
  const peak = Math.max(...display.map((r) => r.spend || r.revenue), 1);
  const extraKeys = display.find((r) => r.extra) ? Object.keys(display.find((r) => r.extra)!.extra!) : [];

  return (
    <div className="stack">
      <div className="segtabs">{SEG_TABS.map((t) => <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}</div>
      {pending ? <Pending source={pending}>Placement breakdown (Feed / Reels / Stories / Audience Network) fills automatically when Meta connects.</Pending> : (
        <Card right={demo ? <span className="src demo">DEMO</span> : undefined}>
          <div className="tblwrap"><table className="tbl">
            <thead><tr><th>{tab}</th><th className="r">Spend</th><th className="r">Revenue{tab !== "Platform" && tab !== "Campaign type" && tab !== "Funnel" ? "" : ` (${lens === "platform" ? "plat" : lens === "shopify" ? "Shopify" : "blended"})`}</th>{extraKeys.map((k) => <th key={k} className="r">{k}</th>)}<th className="r">Δ Spend</th><th className="share">Share</th></tr></thead>
            <tbody>
              {display.map((r) => {
                const p = cmpRows?.get(r.label);
                return (
                  <tr key={r.label}>
                    <td><b>{r.label}</b></td>
                    <td className="r">{r.spend ? cur(r.spend) : "—"}</td>
                    <td className="r">{r.revenue ? cur(r.revenue) : "—"}</td>
                    {extraKeys.map((k) => <td key={k} className="r">{r.extra?.[k] ?? "—"}</td>)}
                    <td className="r">{p ? <DeltaChip delta={delta(r.spend, p.spend)} dir="neutral" /> : <span className="muted">—</span>}</td>
                    <td className="share"><InlineBar value={r.spend || r.revenue} peak={peak} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        </Card>
      )}
      {(tab === "Age" || tab === "Gender") && <p className="muted sm noteline">Joint age × gender distribution needs joint segment data (the platform export is marginal) — shown as separate cuts.</p>}
    </div>
  );
}

// ============================================================ Revenue
const REFUND_TIP: Tip = { def: "Share of gross revenue refunded.", formula: "refunds ÷ gross", source: "Shopify orders.", caveat: "Lagging — recent orders may still refund." };
const DISC_TIP: Tip = { def: "Orders that used a discount code.", formula: "discount orders ÷ orders", source: "Shopify orders.", caveat: "High values can erode margin." };
const UNATTR_TIP: Tip = { def: "Orders carrying no UTM parameters.", formula: "no-UTM orders ÷ orders", source: "Shopify landing_site.", caveat: "A jump usually means broken tracking." };
const axTicks = (labels: string[]) => [0, Math.floor(labels.length / 4), Math.floor(labels.length / 2), Math.floor((labels.length * 3) / 4), labels.length - 1].map((i) => labels[i]).filter(Boolean);

export function Revenue({ ds, state, demo }: VP) {
  const { slice, cmp, buckets } = useSlices(ds, state);
  const a = orderAgg(slice.orders), pa = cmp ? orderAgg(cmp.orders) : null;
  const cur = inr, tip = TIP(state.lens);
  const labels = buckets.map((b) => b.days[0]), ax = axTicks(labels);
  const bNet = bucketSum(seriesByDay(slice.orders, (o) => o.revenueNetCents), buckets);
  const bGross = bucketSum(seriesByDay(slice.orders, (o) => o.revenueGrossCents), buckets);
  const bOrd = bucketSum(seriesByDay(slice.orders, () => 1), buckets);
  const bRef = bucketSum(seriesByDay(slice.orders, (o) => o.refundAmountCents), buckets);
  const bUn = bucketSum(seriesByDay(slice.orders.filter((o) => !o.utmSource && !o.utmMedium), () => 1), buckets);
  const bNewNet = bucketSum(seriesByDay(slice.orders.filter((o) => o.customerType === "new"), (o) => o.revenueNetCents), buckets);
  const bRetNet = bucketSum(seriesByDay(slice.orders.filter((o) => o.customerType === "returning"), (o) => o.revenueNetCents), buckets);
  const bAov = buckets.map((_, i) => (bOrd[i] ? bNet[i] / bOrd[i] : 0));
  const bUnPct = buckets.map((_, i) => (bOrd[i] ? bUn[i] / bOrd[i] : 0));
  const bRefRate = buckets.map((_, i) => (bGross[i] ? bRef[i] / bGross[i] : 0));

  const sources = (() => {
    const g: Record<string, typeof slice.orders> = {};
    for (const o of slice.orders) { const k = orderPlatform(o) === "google" ? "Google" : orderPlatform(o) === "meta" ? "Meta" : (o.utmMedium === "email" ? "Email" : !o.utmSource ? "Direct / Unattributed" : o.utmSource!); (g[k] = g[k] || []).push(o); }
    return Object.entries(g).map(([src, os]) => ({ src, ...orderAgg(os) })).sort((x, y) => y.netCents - x.netCents);
  })();
  const topProducts = (() => {
    const m = new Map<string, { rev: number; qty: number }>();
    for (const o of slice.orders) for (const p of o.products) { const e = m.get(p.title) || { rev: 0, qty: 0 }; e.rev += p.revenueCents; e.qty += p.quantity; m.set(p.title, e); }
    return [...m.entries()].map(([title, e]) => ({ title, ...e })).sort((x, y) => y.rev - x.rev).slice(0, 6);
  })();

  if (state.source === "meta") return <Pending source="Meta">Meta-attributed store revenue appears here once Meta connects. Use <b>Overall</b>, <b>Google</b> or <b>Shopify</b>.</Pending>;
  if (a.orders === 0) return <div className="empty big">No Shopify orders in this range / scope.</div>;

  return (
    <div className="stack">
      <div className="kstrip k6">
        <KCell label="Revenue · net" value={cur(a.netCents)} dir="up" d={delta(a.netCents, pa?.netCents ?? null)} spark={bNet} accent tip={tip.revenue} />
        <KCell label="Orders" value={count(a.orders)} dir="up" d={delta(a.orders, pa?.orders ?? null)} spark={bOrd} tip={tip.orders} />
        <KCell label="AOV" value={cur(a.aovCents)} dir="up" d={delta(a.aovCents, pa?.aovCents ?? null)} spark={bAov} tip={tip.aov} />
        <KCell label="Refund rate" value={pct(a.refundRate)} dir="down" d={delta(a.refundRate, pa?.refundRate ?? null)} spark={bRefRate} tip={REFUND_TIP} />
        <KCell label="Disc-assist" value={pct(a.discountAssistedPct)} dir="down" d={delta(a.discountAssistedPct, pa?.discountAssistedPct ?? null)} spark={[]} tip={DISC_TIP} />
        <KCell label="Unattributed" value={pct(a.unattributedPct)} dir="down" d={delta(a.unattributedPct, pa?.unattributedPct ?? null)} spark={bUnPct} tip={UNATTR_TIP} />
      </div>

      <Card title="Daily revenue" subtitle={`net (truth) vs gross · ${state.granularity}`} right={<div className="chlegend"><span><i style={{ background: "var(--chart-rev)" }} />Net</span><span><i style={{ background: "var(--chart-spend)" }} />Gross</span></div>}>
        <div className="areawrap"><AreaChart rev={bNet} spend={bGross} /></div>
        <div className="chaxis">{ax.map((d, i) => <span key={i}>{fmtDay(d)}</span>)}</div>
      </Card>

      <div className="grid2">
        <Card title="Revenue composition" subtitle={`gross ${cur(a.grossCents, { compact: true })} → net ${cur(a.netCents, { compact: true })}`}>
          <div className="compbar">
            <i className="comp-net" style={{ flexGrow: a.netCents || 1 }} title={`Net ${cur(a.netCents)}`} />
            <i className="comp-disc" style={{ flexGrow: a.discountCents }} title={`Discounts ${cur(a.discountCents)}`} />
            <i className="comp-ref" style={{ flexGrow: a.refundCents }} title={`Refunds ${cur(a.refundCents)}`} />
          </div>
          <div className="complegend">
            <span><i className="comp-net" />Net <b>{cur(a.netCents, { compact: true })}</b></span>
            <span><i className="comp-disc" />Discounts <b>{cur(a.discountCents, { compact: true })}</b> ({pct(a.grossCents ? a.discountCents / a.grossCents : null)})</span>
            <span><i className="comp-ref" />Refunds <b>{cur(a.refundCents, { compact: true })}</b> ({pct(a.refundRate)})</span>
          </div>
        </Card>
        <Card title="New vs returning" subtitle={`net revenue over time · ${pct(a.netCents ? a.newNetCents / a.netCents : null)} from new`}>
          <StackedBarLine labels={labels} bars={[{ name: "New", color: COL.shopify, values: bNewNet, fmt: (x) => inr(x, { compact: true }) }, { name: "Returning", color: COL.ink3, values: bRetNet, fmt: (x) => inr(x, { compact: true }) }]} line={{ name: "Net", color: COL.ink, values: bNet, fmt: (x) => inr(x, { compact: true }) }} />
        </Card>
      </div>

      <div className="grid2">
        <Card title="Channel contribution" subtitle="share of Shopify net revenue, by last-click source">
          <div className="splitbars">
            {sources.map((s) => { const share = a.netCents ? s.netCents / a.netCents : 0; return (
              <div key={s.src} className="splitrow"><span className="sr-label" style={{ textTransform: "none" }}>{s.src}</span><span className="sr-track"><i style={{ width: `${share * 100}%`, background: s.src === "Google" ? "var(--accent)" : s.src.startsWith("Direct") ? "var(--warn)" : "var(--ink-3)" }} /></span><span className="sr-val">{cur(s.netCents, { compact: true })} · {pct(share)}</span></div>
            ); })}
          </div>
        </Card>
        <Card title="AOV trend" subtitle={state.granularity}>
          <div className="areawrap" style={{ minHeight: 150 }}><AxisLineChart labels={labels} series={[{ name: "AOV", color: COL.ink, values: bAov, fmt: (x) => inr(x) }]} /></div>
        </Card>
      </div>

      <div className="grid2">
        <Card title="Quality by source" subtitle="AOV · discount-assist · refund · new %">
          <div className="tblwrap"><table className="tbl">
            <thead><tr><th>Source</th><th className="r">Orders</th><th className="r">Net</th><th className="r">AOV</th><th className="r">Disc</th><th className="r">Refund</th><th className="r">New %</th></tr></thead>
            <tbody>{sources.map((s) => <tr key={s.src}><td><b>{s.src}</b></td><td className="r">{count(s.orders)}</td><td className="r">{cur(s.netCents)}</td><td className="r">{cur(s.aovCents)}</td><td className="r">{pct(s.discountAssistedPct)}</td><td className="r">{pct(s.refundRate)}</td><td className="r">{pct(s.orders ? s.newOrders / s.orders : null)}</td></tr>)}</tbody>
          </table></div>
        </Card>
        <Card title="Top products" subtitle="by net revenue in range">
          <div className="tblwrap"><table className="tbl"><thead><tr><th>Product</th><th className="r">Units</th><th className="r">Revenue</th></tr></thead>
            <tbody>{topProducts.map((p) => <tr key={p.title}><td>{p.title}</td><td className="r">{count(p.qty)}</td><td className="r">{cur(p.rev)}</td></tr>)}</tbody></table></div>
        </Card>
      </div>
    </div>
  );
}

// ============================================================ Insights
export function Insights({ ds, state, demo, goto }: VP) {
  const list = useMemo(() => allInsights(ds, state), [ds, state]);
  return (
    <div className="insgrid">
      {list.map((ins) => <InsightCard key={ins.id} ins={ins} state={state} demo={demo} goto={goto} />)}
    </div>
  );
}

function InsightCard({ ins, state, demo, goto }: { ins: Insight; state: AppState; demo: boolean; goto: (v: string) => void }) {
  return (
    <Card className={`inscard ${ins.status === "flag" ? "attn" : ""}`} title={ins.title} right={<span className={`insbadge ${ins.status}`}>{ins.status === "flag" ? "needs attention" : ins.status === "pending" ? "pending" : "ok"}{demo && ins.status !== "pending" ? "" : ""}</span>}>
      {ins.status === "pending" ? <Pending source="Meta">{ins.takeaway || ins.why}</Pending> : <InsightViz ins={ins} />}
      {ins.status !== "pending" && <Takeaway>{ins.takeaway}</Takeaway>}
      <p className="inswhy">{ins.why}</p>
      {ins.action && <button className="ghost sm" onClick={() => goto("approvals")}>{ins.action.label} →</button>}
    </Card>
  );
}

function InsightViz({ ins }: { ins: Insight }) {
  const d = ins.data;
  if (ins.id === "truth_gap") {
    const series = d.series as { date: string; claimed: number; net: number }[];
    return <AxisLineChart labels={series.map((s) => s.date)} series={[{ name: "Platform claims", color: COL.ink3, values: series.map((s) => s.claimed), dashed: true, fmt: (x) => inr(x, { compact: true }) }, { name: "Shopify net", color: COL.ink, values: series.map((s) => s.net), fmt: (x) => inr(x, { compact: true }) }]} />;
  }
  if (ins.id === "mer_ladder") {
    const series = d.series as { date: string; mer: number; ncMer: number }[];
    return <AxisLineChart labels={series.map((s) => s.date)} series={[{ name: "MER", color: COL.ink, values: series.map((s) => s.mer), fmt: ratio }, { name: "ncMER", color: COL.ink3, values: series.map((s) => s.ncMer), dashed: true, fmt: ratio }]} />;
  }
  if (ins.id === "cpa_decomp") return <Waterfall items={d.terms as { label: string; contrib: number }[]} />;
  if (ins.id === "diminishing") return <ScatterCurve points={d.points as { x: number; y: number }[]} a={d.a as number} b={d.b as number} fmtX={(x) => inr(x * 100, { compact: true })} fmtY={(y) => inr(y * 100, { compact: true })} />;
  if (ins.id === "wasted_spend") {
    const w = d.wasted as { term: string; campaign: string; spend: number; clicks: number }[];
    const scaling = d.scaling as { name: string; lostBudget: number; roas: number }[];
    return (
      <div className="tblwrap"><table className="tbl"><thead><tr><th>Zero-conv search term</th><th className="r">Spend</th><th className="r">Clicks</th></tr></thead>
        <tbody>{w.slice(0, 6).map((x) => <tr key={x.term}><td><b>{x.term}</b><span className="muted sm"> · {x.campaign}</span></td><td className="r">{inr(x.spend)}</td><td className="r">{count(x.clicks)}</td></tr>)}
        {scaling.length > 0 && scaling.slice(0, 3).map((s) => <tr key={s.name} className="okrow"><td><b>{s.name}</b><span className="chip chip-pos sm" style={{ marginLeft: 6 }}>scale</span></td><td className="r" colSpan={2}>budget-capped {pct(s.lostBudget)} · ROAS {ratio(s.roas)}</td></tr>)}
        </tbody></table></div>
    );
  }
  if (ins.id === "dow") {
    const rows = d.rows as { dow: string; mer: number; cpa: number; revenue: number }[];
    return <Heatmap cols={rows.map((r) => r.dow)} rows={[
      { label: "MER", values: rows.map((r) => r.mer), fmt: ratio },
      { label: "CPA", values: rows.map((r) => r.cpa), fmt: (x) => inr(x, { compact: true }), invert: true },
      { label: "Revenue", values: rows.map((r) => r.revenue), fmt: (x) => inr(x, { compact: true }) },
    ]} />;
  }
  if (ins.id === "traffic_quality") {
    const rows = d.rows as { source: string; aovCents: number; discountAssisted: number; refundRate: number; newPct: number }[];
    return <div className="tblwrap"><table className="tbl"><thead><tr><th>Source</th><th className="r">AOV</th><th className="r">Disc</th><th className="r">Refund</th><th className="r">New %</th></tr></thead>
      <tbody>{rows.map((r) => <tr key={r.source}><td><b>{r.source}</b></td><td className="r">{inr(r.aovCents)}</td><td className="r">{pct(r.discountAssisted)}</td><td className="r">{pct(r.refundRate)}</td><td className="r">{pct(r.newPct)}</td></tr>)}
      <tr className="warnrow"><td><b>Meta</b></td><td className="r" colSpan={4}>pending integration</td></tr></tbody></table></div>;
  }
  if (ins.id === "tracking_health") {
    const series = d.series as { date: string; pct: number }[];
    return <AxisLineChart labels={series.map((s) => s.date)} series={[{ name: "Unattributed %", color: COL.warn, values: series.map((s) => s.pct * 100), fmt: (x) => `${x.toFixed(1)}%` }]} />;
  }
  if (ins.id === "anomaly") {
    const flags = d.flags as { date: string; metric: string; z: number; dir: string }[];
    if (!flags.length) return <Empty>No anomalies beyond 2σ this period.</Empty>;
    return <div className="anolist">{flags.map((f, i) => <div key={i} className="anorow"><span className="anodate">{fmtDay(f.date)}</span><span className="chip sm">{f.metric}</span><span className={f.dir === "above" ? "neg-t" : "pos-t"}>{Math.abs(f.z).toFixed(1)}σ {f.dir}</span></div>)}</div>;
  }
  return null;
}

// ============================================================ Platform sections (Google · Meta · Shopify)
const AVAIL: Record<"google" | "meta" | "shopify", { status: "connected" | "pending"; now: string[]; post: { label: string; why: string }[]; needs?: string }> = {
  google: {
    status: "connected",
    now: ["Spend · impressions · clicks", "Conversions & conversion value", "CTR · CPC · CPM · CPA · ROAS", "Campaigns (name · type · budget · status)", "Network · Age · Gender breakdowns", "Google-attributed Shopify revenue (last-click)"],
    post: [{ label: "Search terms", why: "flag zero-conv terms + negatives" }, { label: "Device & Geo", why: "bid adjustments / exclusions" }, { label: "Impression share / lost-IS", why: "detect budget-capped winners" }],
  },
  meta: {
    status: "pending",
    now: [],
    post: [{ label: "Spend · impressions · clicks", why: "" }, { label: "Purchases & purchase value", why: "" }, { label: "ROAS · CTR · CPM · CPA", why: "" }, { label: "Placement (FB · IG · Audience Net) · Age · Gender", why: "" }, { label: "Reconciliation vs Shopify truth", why: "" }],
    needs: "Marketing API access approval (admin)",
  },
  shopify: {
    status: "connected",
    now: ["Revenue net (gross − discount − refund)", "Orders · AOV", "Gross / discount / refund composition", "New vs returning customers", "UTM channel attribution · unattributed %", "Line-item products"],
    post: [{ label: "COGS & margin", why: "true profit per order" }, { label: "Inventory", why: "stock-aware pacing" }, { label: "Customer LTV / cohorts", why: "retention value" }],
  },
};
const PLAT_META = { google: { name: "Google Ads", color: "#4285F4", letter: "G" }, meta: { name: "Meta Ads", color: "#1877F2", letter: "M" }, shopify: { name: "Shopify", color: "#95BF47", letter: "S" } };

function PlatformHeader({ platform, detail, pending }: { platform: "google" | "meta" | "shopify"; detail: string; pending?: boolean }) {
  const p = PLAT_META[platform];
  return (
    <div className="plathdr">
      <span className="plathdr-mark" style={{ background: p.color }}>{p.letter}</span>
      <div><div className="plathdr-name">{p.name}</div><div className="plathdr-status"><span className={`hdot ${pending ? "in_progress" : "connected"}`} />{detail}</div></div>
    </div>
  );
}
function AvailabilityPanel({ platform }: { platform: "google" | "meta" | "shopify" }) {
  const a = AVAIL[platform];
  return (
    <Card title="Data availability" subtitle={a.status === "connected" ? "live now · and what unlocks with more pulls" : "what unlocks on integration"}>
      <div className="availgrid">
        <div><div className="avail-h pos-t">{a.status === "connected" ? "✓ Available now" : "On connect, you get"}</div><ul className="availlist">{(a.now.length ? a.now : a.post.map((p) => p.label)).map((x, i) => <li key={i}>{x}</li>)}</ul></div>
        {a.status === "connected" && <div><div className="avail-h">+ Post-integration</div><ul className="availlist post">{a.post.map((p, i) => <li key={i}><b>{p.label}</b>{p.why ? ` — ${p.why}` : ""}</li>)}</ul></div>}
      </div>
      {a.needs && <p className="muted sm" style={{ marginTop: 12 }}>Needs: <b>{a.needs}</b></p>}
    </Card>
  );
}
function segGroup(seg: Slice["seg"], type: string) {
  const m = new Map<string, { spend: number; conv: number; rev: number; clicks: number; impr: number }>();
  for (const r of seg) if (r.segmentType === type) { const e = m.get(r.segmentValue) || { spend: 0, conv: 0, rev: 0, clicks: 0, impr: 0 }; e.spend += r.spendCents; e.conv += r.conversions; e.rev += r.revenueCents; e.clicks += r.clicks; e.impr += r.impressions; m.set(r.segmentValue, e); }
  return [...m.entries()].map(([label, e]) => ({ label, ...e, ctr: e.impr ? e.clicks / e.impr : null })).sort((a, b) => b.spend - a.spend);
}
function BreakdownTable({ rows }: { rows: { label: string; spend: number; conv: number; ctr: number | null }[] }) {
  if (!rows.length) return <Empty>No breakdown data.</Empty>;
  const peak = Math.max(...rows.map((r) => r.spend), 1);
  return <div className="tblwrap"><table className="tbl"><thead><tr><th>Segment</th><th className="r">Spend</th><th className="r">Conv.</th><th className="r">CTR</th><th className="share">Share</th></tr></thead>
    <tbody>{rows.map((r) => <tr key={r.label}><td><b>{r.label}</b></td><td className="r">{inr(r.spend)}</td><td className="r">{count(r.conv)}</td><td className="r">{pct(r.ctr)}</td><td className="share"><InlineBar value={r.spend} peak={peak} /></td></tr>)}</tbody></table></div>;
}

export function GoogleSection({ ds, state }: VP) {
  const slice = buildSlice(ds, state.range, state.filters, "google");
  const cmp = state.compareRange ? buildSlice(ds, state.compareRange, state.filters, "google") : null;
  const buckets = bucketize(state.range, state.granularity), labels = buckets.map((b) => b.days[0]), ax = axTicks(labels);
  const ad = adAgg(slice.ad), pad = cmp ? adAgg(cmp.ad) : null;
  const sNet = orderAgg(slice.orders).netCents, pNet = cmp ? orderAgg(cmp.orders).netCents : null;
  const platRev = ad.platformRevenueCents, roasP = ad.spendCents ? platRev / ad.spendCents : null;
  const gMer = ad.spendCents ? sNet / ad.spendCents : null, cpa = ad.platformConversions ? ad.spendCents / ad.platformConversions : null, gap = sNet ? platRev / sNet : null;
  const bSpend = bucketSum(seriesByDay(slice.ad, (r) => r.spendCents), buckets);
  const bShopNet = bucketSum(seriesByDay(slice.orders, (o) => o.revenueNetCents), buckets);
  const bConv = bucketSum(seriesByDay(slice.ad, (r) => r.platformConversions), buckets);
  const T = TIP(state.lens), camps = campaignRollup(slice);
  if (ad.spendCents === 0) return <div className="stack"><PlatformHeader platform="google" detail="connected" /><Empty big>No Google spend in this range / filters.</Empty></div>;
  return (
    <div className="stack">
      <PlatformHeader platform="google" detail={`${camps.length} campaigns · synced · live`} />
      <div className="kstrip k6">
        <KCell label="Spend" value={inr(ad.spendCents)} dir="down" d={delta(ad.spendCents, pad?.spendCents ?? null)} spark={bSpend} tip={T.spend} />
        <KCell label="Shopify rev · Google" value={inr(sNet)} dir="up" d={delta(sNet, pNet)} spark={bShopNet} accent tip={{ def: "Shopify net revenue from orders last-click-attributed to Google.", formula: "Σ net of Google-UTM orders", source: "Shopify ↔ Google UTM.", caveat: "Last-click; ignores assists." }} />
        <KCell label="Google MER" value={ratio(gMer)} dir="up" d={null} spark={buckets.map((_, i) => (bSpend[i] ? bShopNet[i] / bSpend[i] : 0))} tip={{ def: "Shopify revenue Google drove per ₹1 of Google spend.", formula: "Shopify-Google net ÷ Google spend", source: "Shopify ÷ Google.", caveat: "The honest channel ROI." }} />
        <KCell label="ROAS · platform" value={ratio(roasP)} dir="up" d={null} spark={[]} tip={T.roas} />
        <KCell label="Conversions" value={count(ad.platformConversions)} dir="up" d={delta(ad.platformConversions, pad?.platformConversions ?? null)} spark={bConv} tip={{ def: "Google-counted conversions in range.", formula: "Σ conversions", source: "Google Ads.", caveat: "Platform-counted; differs from Shopify orders." }} />
        <KCell label="CPA · platform" value={inr(cpa)} dir="down" d={null} spark={[]} tip={T.cpa} />
      </div>
      <div className="kstrip k6">
        <KCell label="Impressions" value={count(ad.impressions)} dir="up" d={delta(ad.impressions, pad?.impressions ?? null)} spark={bucketSum(seriesByDay(slice.ad, (r) => r.impressions), buckets)} tip={{ def: "Times Google served the ads.", formula: "Σ impressions", source: "Google Ads.", caveat: "Reach, not unique users." }} />
        <KCell label="Clicks" value={count(ad.clicks)} dir="up" d={delta(ad.clicks, pad?.clicks ?? null)} spark={bucketSum(seriesByDay(slice.ad, (r) => r.clicks), buckets)} tip={{ def: "Clicks on the ads.", formula: "Σ clicks", source: "Google Ads.", caveat: "Pre-landing; not sessions." }} />
        <KCell label="CTR" value={pct(ad.ctr)} dir="up" d={null} spark={[]} tip={{ def: "Click-through rate.", formula: "clicks ÷ impressions", source: "Google Ads.", caveat: "Creative + targeting quality." }} />
        <KCell label="CPC" value={inr(ad.clicks ? ad.spendCents / ad.clicks : null)} dir="down" d={null} spark={[]} tip={{ def: "Average cost per click.", formula: "spend ÷ clicks", source: "Google Ads.", caveat: "Auction-driven." }} />
        <KCell label="CPM" value={inr(ad.cpmCents)} dir="down" d={null} spark={[]} tip={{ def: "Cost per 1,000 impressions.", formula: "spend ÷ impressions × 1000", source: "Google Ads.", caveat: "Inventory pressure." }} />
        <KCell label="CVR" value={pct(ad.cvr)} dir="up" d={null} spark={[]} tip={{ def: "Conversion rate (platform-counted).", formula: "conversions ÷ clicks", source: "Google Ads.", caveat: "Platform attribution; differs from Shopify." }} />
      </div>
      <Card title="Truth check" subtitle="Google's own count vs what Shopify credits it">
        <div className="truthstrip">
          <div><span className="ts-k">Google claims</span><span className="ts-v">{inr(platRev, { compact: true })}</span></div><div className="ts-op">→</div>
          <div><span className="ts-k">Shopify credits Google</span><span className="ts-v">{inr(sNet, { compact: true })}</span></div><div className="ts-op">=</div>
          <div><span className="ts-k">Inflation</span><span className={`ts-v ${gap && gap > 1.2 ? "warn-t" : ""}`}>{gap == null ? "—" : `${gap.toFixed(2)}×`}</span></div>
        </div>
      </Card>
      <Card title="Google — spend vs Shopify revenue" subtitle={state.granularity} right={<div className="chlegend"><span><i style={{ background: "var(--chart-rev)" }} />Shopify rev</span><span><i style={{ background: "var(--chart-spend)" }} />Spend</span></div>}>
        <div className="areawrap"><AreaChart rev={bShopNet} spend={bSpend} /></div>
        <div className="chaxis">{ax.map((d, i) => <span key={i}>{fmtDay(d)}</span>)}</div>
      </Card>
      <Card title="Campaigns" subtitle="Google · by spend">
        <div className="tblwrap"><table className="tbl"><thead><tr><th>Campaign</th><th className="r">Spend</th><th className="r">ROAS</th><th className="share">Share of spend</th><th className="r">Status</th></tr></thead>
          <tbody>{camps.slice(0, 8).map((c) => { const st = campStatus({ roas: c.roas ?? 0 }); return <tr key={c.id}><td><span className="pf-dot google" style={{ display: "inline-block", marginRight: 8, verticalAlign: "middle" }} />{c.name}</td><td className="r">{inr(c.spend)}</td><td className="r" style={{ color: (c.roas ?? 0) >= 3 ? "var(--pos)" : "var(--neg)" }}>{ratio(c.roas)}</td><td className="share"><span className="bar"><i style={{ width: `${Math.round(c.share * 100)}%`, background: st.color }} /></span></td><td className="r" style={{ color: st.color, fontFamily: "var(--mono)", fontSize: 10, fontWeight: 600 }}>{st.t}</td></tr>; })}</tbody>
        </table></div>
      </Card>
      <div className="grid2">
        <Card title="By network"><BreakdownTable rows={segGroup(slice.seg, "network")} /></Card>
        <Card title="By age & gender"><BreakdownTable rows={[...segGroup(slice.seg, "age"), ...segGroup(slice.seg, "gender")]} /></Card>
      </div>
      <AvailabilityPanel platform="google" />
    </div>
  );
}

export function MetaSection(vp: VP) {
  void vp;
  return (
    <div className="stack">
      <PlatformHeader platform="meta" detail="connecting · pending Marketing API approval" pending />
      <div className="pending"><span className="pendingdot" /><b>Meta isn’t connected yet</b><span>Once Marketing API access is approved, this section fills with live campaign performance, placement/age/gender breakdowns, and reconciliation against Shopify truth — automatically.</span></div>
      <Card title="What you’ll get post-integration" subtitle="the metrics this section will show once Meta connects">
        <div className="kstrip k6">
          {["Spend", "Purchases", "Purchase value", "ROAS", "CTR / CPM", "CPA"].map((l) => <div key={l} className="kcell metaghost"><div className="klabel">{l}</div><div className="kval">—</div><div className="kdelta"><span className="dl">on connect</span></div></div>)}
        </div>
      </Card>
      <AvailabilityPanel platform="meta" />
    </div>
  );
}

export function ShopifySection(vp: VP) {
  return (
    <div className="stack">
      <PlatformHeader platform="shopify" detail="store connected · orders syncing · live" />
      <Revenue {...vp} />
      <AvailabilityPanel platform="shopify" />
    </div>
  );
}

// ============================================================ Engine Runs (platform → campaign → 5-agent run)
interface RunCamp { id: string; name: string; type: string; funnel: string; spend: number; impr: number; clicks: number; pconv: number; prev: number; roas: number | null; ctr: number | null; cpa: number | null; cpm: number | null; }
function rollupForRuns(slice: Slice, platform: string): RunCamp[] {
  const m = new Map<string, { id: string; name: string; type: string; funnel: string; spend: number; impr: number; clicks: number; pconv: number; prev: number }>();
  for (const r of slice.ad) if (r.source === platform) {
    const e = m.get(r.campaignId) || { id: r.campaignId, name: r.campaignName, type: r.campaignType, funnel: r.funnelStage, spend: 0, impr: 0, clicks: 0, pconv: 0, prev: 0 };
    e.spend += r.spendCents; e.impr += r.impressions; e.clicks += r.clicks; e.pconv += r.platformConversions; e.prev += r.platformRevenueCents;
    m.set(r.campaignId, e);
  }
  return [...m.values()].map((e) => ({ ...e, roas: e.spend ? e.prev / e.spend : null, ctr: e.impr ? e.clicks / e.impr : null, cpa: e.pconv ? e.spend / e.pconv : null, cpm: e.impr ? (e.spend / e.impr) * 1000 : null })).sort((a, b) => b.spend - a.spend);
}
// synthesize the 5-agent run for a campaign from its REAL metrics
function engineProcess(c: RunCamp, days: number) {
  const roas = c.roas ?? 0, FLOOR = 3.0;
  const verdict = roas >= 5 ? "strong" : roas > 0 && roas < FLOOR ? "weak" : "steady";
  const monthlySpend = Math.round((c.spend * 30) / Math.max(1, days));
  const decision = verdict === "strong"
    ? { kind: "scale", tag: "SCALE", color: "var(--pos)", title: `Scale ${c.name}`, desc: `Raise budget ~15%/day — est. +${inr(Math.round(monthlySpend * 0.15), { compact: true })}/mo at the current ${ratio(roas)} ROAS.` }
    : verdict === "weak"
    ? { kind: "reduce", tag: "REDUCE", color: "var(--neg)", title: `Reduce ${c.name}`, desc: `Cut ~30% — reclaims ~${inr(Math.round(monthlySpend * 0.3), { compact: true })}/mo to reallocate to winners.` }
    : { kind: "hold", tag: "HOLD", color: "var(--ink-3)", title: `Hold ${c.name}`, desc: `Within the target band — no change this cycle.` };
  const steps = [
    { agent: "Scout", role: "Audit", analyzed: `${days}d · ${inr(c.spend, { compact: true })} spend · ${count(c.clicks)} clicks · CTR ${pct(c.ctr)}`, found: verdict === "strong" ? `ROAS ${ratio(roas)} — top performer; likely budget-limited.` : verdict === "weak" ? `ROAS ${ratio(roas)} — below the ${FLOOR.toFixed(1)}× floor.` : `ROAS ${ratio(roas)} — steady, on target.` },
    { agent: "Forge", role: "Creative", analyzed: `CTR ${pct(c.ctr)} · CPM ${inr(c.cpm)}`, found: c.ctr != null && c.ctr < 0.02 ? "CTR is soft — draft 2 fresh angles to test." : "Creative is healthy — no change needed." },
    { agent: "Pilot", role: "Decision", analyzed: `CPA ${inr(c.cpa)} · ${count(c.pconv)} conversions`, found: `${decision.tag}: ${decision.desc}` },
    { agent: "Frame", role: "Guardrail", analyzed: "+25%/day change cap · daily spend cap · dry-run on", found: decision.kind === "scale" ? "Increase within the +25%/day cap — cleared, awaiting sign-off." : "Within caps — cleared." },
    { agent: "Signal", role: "Log", analyzed: "append-only audit trail", found: "Proposal logged (dry-run — no spend changed yet)." },
  ];
  return { steps, decision, verdict };
}

export function EngineRuns({ ds, state, demo }: VP) {
  const [platform, setPlatform] = useState<"google" | "meta">("google");
  const [open, setOpen] = useState<string | null>(null);
  const [deeper, setDeeper] = useState<Set<string>>(new Set());
  const [decided, setDecided] = useState<Record<string, "approved" | "skipped">>({});
  const slice = buildSlice(ds, state.range, state.filters, "all");
  const days = daysBetween(state.range.start, state.range.end) + 1;
  const camps = rollupForRuns(slice, platform);
  const buckets = bucketize(state.range, state.granularity);
  const toggleDeeper = (id: string) => setDeeper((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <div className="stack">
      <div className="rowbar"><span className="muted sm">The engine runs the 5-agent loop per campaign — Scout → Forge → Pilot → Frame → Signal — every decision dry-run &amp; logged. {demo && <span className="src demo">DEMO</span>}</span></div>
      <div className="segtabs">
        <button className={platform === "google" ? "on" : ""} onClick={() => { setPlatform("google"); setOpen(null); }}>Google</button>
        <button className={platform === "meta" ? "on" : ""} onClick={() => { setPlatform("meta"); setOpen(null); }}>Meta<i className="srcseg-dot" style={{ marginLeft: 6 }} /></button>
      </div>
      {platform === "meta" ? <Pending source="Meta">Per-campaign engine runs for Meta appear once Marketing API access is approved.</Pending> : camps.length === 0 ? <Empty big>No campaigns in this range / filters.</Empty> : (
        <div className="runlist">
          {camps.map((c) => {
            const { steps, decision } = engineProcess(c, days);
            const isOpen = open === c.id, dec = decided[c.id];
            const dd = isOpen && deeper.has(c.id) ? buckets.map((bk) => ({ d: bk.days[0], spend: slice.ad.filter((r) => r.campaignId === c.id && bk.days.includes(r.date)).reduce((s, r) => s + r.spendCents, 0), conv: slice.ad.filter((r) => r.campaignId === c.id && bk.days.includes(r.date)).reduce((s, r) => s + r.platformConversions, 0) })) : [];
            return (
              <div key={c.id} className={`runcamp ${isOpen ? "open" : ""}`}>
                <button className="runcamp-head" onClick={() => setOpen(isOpen ? null : c.id)}>
                  <span className="pf-dot google" />
                  <span className="rc-name">{c.name}<span className="rc-chips"><span className="pf-chip">{c.type}</span><span className="pf-chip">{c.funnel.toUpperCase()}</span></span></span>
                  <span className="rc-metric"><em>spend</em>{inr(c.spend, { compact: true })}</span>
                  <span className="rc-metric"><em>ROAS</em><b style={{ color: (c.roas ?? 0) >= 3 ? "var(--pos)" : "var(--neg)" }}>{ratio(c.roas)}</b></span>
                  <span className="rc-decision" style={{ color: decision.color, borderColor: decision.color }}>{decision.tag}</span>
                  <span className="rc-chev">{isOpen ? "▾" : "▸"}</span>
                </button>
                {isOpen && (
                  <div className="runcamp-body">
                    <div className="agentflow">
                      {steps.map((st, i) => (
                        <div key={i} className="agentstep">
                          <span className="agentdot" /><div className="agentline" />
                          <div className="agentmeta">
                            <div className="agent-h"><b>{st.agent}</b><span className="agent-role">{st.role}</span></div>
                            <div className="agent-analyzed">{st.analyzed}</div>
                            <div className="agent-found">{st.found}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="rundecision">
                      <div className="rd-text"><span className="rd-tag" style={{ color: decision.color, borderColor: decision.color }}>{decision.tag}</span><div><b>{decision.title}</b><p>{decision.desc}</p></div></div>
                      {dec ? <span className={`rd-done ${dec === "approved" ? "pos-t" : "muted"}`}>{dec === "approved" ? "✓ Approved — sent to gate" : "Skipped"}</span> : (
                        <div className="rd-cta"><button className="primary" onClick={() => setDecided((s) => ({ ...s, [c.id]: "approved" }))}>Approve</button><button className="ghost" onClick={() => setDecided((s) => ({ ...s, [c.id]: "skipped" }))}>Skip</button></div>
                      )}
                    </div>
                    <button className="deeperbtn" onClick={() => toggleDeeper(c.id)}>{deeper.has(c.id) ? "Hide deeper analysis" : "Run more analysis →"}</button>
                    {deeper.has(c.id) && (
                      <div className="deeperpanel">
                        <div className="dp-title">Deeper read · {c.name}</div>
                        <AxisLineChart labels={dd.map((x) => x.d)} series={[{ name: "Spend", color: COL.ink, values: dd.map((x) => x.spend), fmt: (x) => inr(x, { compact: true }) }, { name: "Conversions", color: COL.ink3, values: dd.map((x) => x.conv), dashed: true, fmt: (x) => count(x) }]} />
                        <p className="muted sm">CPM {inr(c.cpm)} · CTR {pct(c.ctr)} · CVR {pct(c.clicks ? c.pconv / c.clicks : null)} · CPA {inr(c.cpa)}. Next pass would pull this campaign's network &amp; age/gender split (Google breakdowns).</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
