"use client";

// ROI Engine — AURORA themed variant (roilabs.in look: cream/white, warm ink, brand
// yellow/gold, Sora + Manrope). Generated from v3.tsx via a palette remap; route /engine/aurora.
// Atlas light palette: white panels on #FAF7F0, deep-indigo #1A1710 sidebar,
// indigo #AA7C09 working accent, brand yellow reserved for the mark.
// Honest two-funnel framing: Google = app/video installs (no purchase revenue, so
// no ROAS), Meta → Shopify = the revenue+ROAS funnel, Shopify = source of truth.
// Faithful port of the design prototype — inline styles, dummy data for "The Astro Time".

import { useState, type CSSProperties, type ReactNode } from "react";

type Page = "overview" | "google" | "meta" | "shopify" | "runs" | "activity" | "approvals";
type Range = "7d" | "28d" | "90d";

// ── formatters ──
const inr = (n: number) => {
  if (n >= 1e7) return "₹" + (n / 1e7).toFixed(2).replace(/\.?0+$/, "") + "Cr";
  if (n >= 1e5) return "₹" + (n / 1e5).toFixed(1).replace(/\.0$/, "") + "L";
  return "₹" + Math.round(n).toLocaleString("en-IN");
};
const inrFull = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const num = (n: number) => Math.round(n).toLocaleString("en-IN");
const kfmt = (n: number) => {
  if (n >= 1e6) return (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
  if (n >= 1e4) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(Math.round(n));
};
const factorFor = (r: Range) => (r === "7d" ? 0.247 : r === "90d" ? 3.18 : 1);
const rangeWordFor = (r: Range) => (r === "7d" ? "Last 7 days" : r === "90d" ? "Last 90 days" : "Last 28 days");

// ── deterministic PRNG (mulberry32) — seeded so SSR === CSR, no Math.random ──
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hashStr = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

// Realistic daily revenue/spend: gentle uptrend + weekday seasonality +
// mean-reverting noise + occasional promo spike. Deterministic (fixed seed).
function buildSeries(range: Range) {
  const n = range === "7d" ? 7 : range === "90d" ? 90 : 28;
  const end = new Date(2026, 5, 14);
  const mo = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const rev: number[] = [], sp: number[] = [], labels: string[] = [];
  const rnd = rng(0x5A17 ^ n);
  let rw = 0, sw = 0;
  for (let i = 0; i < n; i++) {
    const d = new Date(end); d.setDate(d.getDate() - (n - 1 - i));
    const t = i / (n - 1 || 1);
    const dow = d.getDay();
    const weekly = dow === 0 || dow === 6 ? 0.9 : dow === 5 ? 1.08 : 1.0; // weekend dip, Fri lift
    rw = rw * 0.82 + (rnd() - 0.5) * 0.07;
    sw = sw * 0.82 + (rnd() - 0.5) * 0.05;
    const promo = i % Math.max(8, Math.floor(n / 3.5)) === 4 ? 1.16 : 1; // periodic promo bump
    rev.push(Math.max(2200, Math.round(122000 * (1 + t * 0.26) * weekly * promo * (1 + rw))));
    sp.push(Math.max(900, Math.round(47000 * (1 + t * 0.15) * weekly * (1 + sw))));
    labels.push(mo[d.getMonth()] + " " + d.getDate());
  }
  return { rev, sp, labels, n };
}

// A unique, organic sparkline trajectory per metric (seeded by its label),
// trending in the delta direction — so no two KPI sparks look the same.
function sparkSeries(seed: number, up: boolean, n = 18) {
  const rnd = rng(seed);
  const start = up ? 0.70 : 1.0, finish = up ? 1.0 : 0.76;
  const out: number[] = []; let w = 0;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    w = w * 0.68 + (rnd() - 0.5) * 0.13;
    out.push(start + (finish - start) * t + w);
  }
  return out;
}

// ── sparkline (deterministic id) ──
function Spark({ arr, color, id }: { arr: number[]; color: string; id: string }) {
  const W = 150, H = 36, p = 3;
  const max = Math.max(...arr), min = Math.min(...arr);
  const X = (i: number) => p + (i / (arr.length - 1)) * (W - 2 * p);
  const Y = (v: number) => H - p - ((v - min) / ((max - min) || 1)) * (H - 2 * p);
  const line = arr.map((v, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1)).join(" ");
  const area = line + " L" + X(arr.length - 1).toFixed(1) + " " + H + " L" + X(0).toFixed(1) + " " + H + " Z";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="none" style={{ display: "block" }}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.18} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.7} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ── overview area chart (revenue vs spend) ──
function AreaChart({ s }: { s: ReturnType<typeof buildSeries> }) {
  const W = 1000, H = 230, padT = 14, padB = 26;
  const rev = s.rev, sp = s.sp;
  const max = Math.max(...rev) * 1.16;
  const X = (i: number) => (i / (rev.length - 1)) * W;
  const Y = (v: number) => padT + (1 - v / max) * (H - padT - padB);
  const path = (arr: number[]) => arr.map((v, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1)).join(" ");
  const areaP = (arr: number[]) => path(arr) + " L" + X(arr.length - 1).toFixed(1) + " " + (H - padB) + " L0 " + (H - padB) + " Z";
  const grid = [0, .25, .5, .75, 1].map((f, idx) => { const y = padT + f * (H - padT - padB); return <line key={"g" + idx} x1={0} y1={y} x2={W} y2={y} stroke="#EFEADB" strokeWidth={1} vectorEffect="non-scaling-stroke" />; });
  const ticks = [0, Math.floor((rev.length - 1) * .25), Math.floor((rev.length - 1) * .5), Math.floor((rev.length - 1) * .75), rev.length - 1];
  const xlabels = ticks.map((i, idx) => <text key={"t" + idx} x={X(i)} y={H - 6} fill="#B3AC9A" fontSize={12} fontFamily="JetBrains Mono" textAnchor={idx === 0 ? "start" : idx === ticks.length - 1 ? "end" : "middle"}>{s.labels[i]}</text>);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="auto" preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#AA7C09" stopOpacity={.15} /><stop offset="100%" stopColor="#AA7C09" stopOpacity={0} /></linearGradient>
        <linearGradient id="spG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#B0A892" stopOpacity={.12} /><stop offset="100%" stopColor="#B0A892" stopOpacity={0} /></linearGradient>
      </defs>
      {grid}
      <path d={areaP(sp)} fill="url(#spG)" /><path d={areaP(rev)} fill="url(#revG)" />
      <path d={path(sp)} fill="none" stroke="#B0A892" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
      <path d={path(rev)} fill="none" stroke="#AA7C09" strokeWidth={2.4} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={X(rev.length - 1)} cy={Y(rev[rev.length - 1])} r={3.4} fill="#AA7C09" stroke="#fff" strokeWidth={2} />
      <circle cx={X(sp.length - 1)} cy={Y(sp[sp.length - 1])} r={3} fill="#B0A892" stroke="#fff" strokeWidth={2} />
      {xlabels}
    </svg>
  );
}

// ── source marks (original, trademark-safe) ──
// Transparent multicolor brand marks — read cleanly on the dark sidebar and on white cards.
function SourceIcon({ name, size = 22 }: { name: string; size?: number }) {
  if (name === "google") return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label="Google" style={{ display: "block", flex: "none" }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
  if (name === "meta") return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label="Meta" style={{ display: "block", flex: "none" }}>
      <path fill="#0082FB" d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.157-2.602zm-10.201.553c1.073 0 1.957.498 2.972 1.61-.323.464-.645.949-.974 1.475-.822 1.31-1.566 2.668-2.318 3.978-1.522 2.652-2.066 3.245-2.928 3.245-.69 0-1.196-.397-1.495-1.36a5.692 5.692 0 0 1-.241-1.71c0-2.034.565-4.197 1.39-5.566.74-1.23 1.652-1.738 2.594-1.738z" />
    </svg>
  );
  if (name === "shopify") return (
    <svg width={size} height={size} viewBox="0 0 256 292" role="img" aria-label="Shopify" style={{ display: "block", flex: "none" }}>
      <path fill="#95BF47" d="M223.774 57.34c-.201-1.46-1.48-2.268-2.537-2.357-1.055-.088-23.383-1.743-23.383-1.743s-15.507-15.395-17.209-17.099c-1.703-1.703-5.029-1.185-6.32-.805-.19.056-3.388 1.043-8.678 2.68-5.18-14.906-14.322-28.604-30.405-28.604-.444 0-.901.018-1.358.044C129.31 3.407 123.644.779 118.75.779c-37.465 0-55.364 46.835-60.976 70.635-14.558 4.511-24.9 7.718-26.221 8.133-8.126 2.549-8.383 2.805-9.45 10.462C21.3 95.806.038 260.235.038 260.235l165.678 31.042 89.77-19.42S223.973 58.8 223.775 57.34zM156.49 40.848l-14.019 4.339c.005-.988.01-1.96.01-3.023 0-9.264-1.286-16.723-3.349-22.636 8.287 1.04 13.806 10.469 17.358 21.32zm-27.638-19.483c2.304 5.773 3.802 14.058 3.802 25.238 0 .572-.005 1.095-.01 1.624-9.117 2.824-19.024 5.89-28.953 8.966 5.575-21.516 16.025-31.908 25.161-35.828zm-11.131-10.537c1.617 0 3.246.549 4.805 1.622-12.007 5.65-24.877 19.88-30.312 48.297l-22.886 7.088C75.694 46.16 90.81 10.828 117.72 10.828z" />
      <path fill="#5E8E3E" d="M221.237 54.983c-1.055-.088-23.383-1.743-23.383-1.743s-15.507-15.395-17.209-17.099c-.637-.634-1.496-.959-2.394-1.099l-12.527 255.246 89.762-19.418S223.972 58.8 223.774 57.34c-.201-1.46-1.48-2.268-2.537-2.357z" />
      <path fill="#FFF" d="M135.242 104.585l-11.069 32.926s-9.698-5.176-21.586-5.176c-17.428 0-18.305 10.937-18.305 13.693 0 15.038 39.2 20.8 39.2 56.024 0 27.713-17.577 45.558-41.277 45.558-28.44 0-42.984-17.7-42.984-17.7l7.615-25.16s14.95 12.835 27.565 12.835c8.243 0 11.596-6.49 11.596-11.232 0-19.616-32.16-20.491-32.16-52.724 0-27.129 19.472-53.382 58.778-53.382 15.145 0 22.627 4.338 22.627 4.338z" />
    </svg>
  );
  return null;
}
function NavIcon({ name }: { name: string }) {
  const wrap = (kids: ReactNode) => <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">{kids}</svg>;
  if (name === "overview") return wrap(<><rect x={3} y={3} width={7.5} height={7.5} rx={1.6} /><rect x={13.5} y={3} width={7.5} height={7.5} rx={1.6} /><rect x={13.5} y={13.5} width={7.5} height={7.5} rx={1.6} /><rect x={3} y={13.5} width={7.5} height={7.5} rx={1.6} /></>);
  if (name === "runs") return wrap(<><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 4v4h-4" /></>);
  if (name === "activity") return wrap(<path d="M3 12h4l2.5-7 5 14 2.5-7H21" />);
  if (name === "approvals") return wrap(<><path d="M9 12l2 2 4-4" /><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" /></>);
  return wrap(null);
}

// ── agents + status pills ──
const AGENTS: Record<string, { short: string; bg: string; fg: string }> = {
  "Research & intelligence": { short: "RI", bg: "#FBF1D2", fg: "#AA7C09" },
  "Creative production": { short: "CP", bg: "#FCF3DD", fg: "#8A6D00" },
  "Media buying": { short: "MB", bg: "#E7F6ED", fg: "#16794E" },
  "Landing pages": { short: "LP", bg: "#F0ECFB", fg: "#6D4FD6" },
  "Measurement & attribution": { short: "MA", bg: "#FBEDED", fg: "#B23A40" },
};
const agentOf = (name: string) => AGENTS[name] || { short: name.slice(0, 2), bg: "#F0EBDD", fg: "#6A6456" };
const STATUS: Record<string, { t: string; bg: string; c: string }> = {
  done: { t: "Done", bg: "#E7F6ED", c: "#16794E" },
  completed: { t: "Completed", bg: "#E7F6ED", c: "#16794E" },
  running: { t: "Running", bg: "#FBF1D2", c: "#AA7C09" },
  awaiting: { t: "Awaiting approval", bg: "#FFFBEB", c: "#8A6D00" },
  queued: { t: "Queued", bg: "#F0EBDD", c: "#6A6456" },
  auto: { t: "Auto", bg: "#F0EBDD", c: "#6A6456" },
  approved: { t: "Approved", bg: "#E7F6ED", c: "#16794E" },
};
const pill = (kind: string): { text: string; style: CSSProperties } => {
  const m = STATUS[kind];
  return { text: m.t, style: { font: "600 10.5px 'JetBrains Mono'", color: m.c, background: m.bg, padding: "4px 9px", borderRadius: "7px", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: ".03em" } };
};

// ── shared style fragments ──
const CARD: CSSProperties = { background: "#fff", border: "1px solid #ECE7DA", borderRadius: "16px", boxShadow: "0 1px 2px rgba(20,22,28,.05)" };
const KPI_CARD: CSSProperties = { ...CARD, borderRadius: "14px", padding: "16px 16px 14px", display: "flex", flexDirection: "column", gap: "8px" };
const TH: CSSProperties = { textAlign: "left", font: "600 10.5px 'JetBrains Mono'", color: "#9C968A", textTransform: "uppercase", letterSpacing: ".05em", padding: "10px 18px" };
const THR: CSSProperties = { ...TH, textAlign: "right", padding: "10px 12px" };
const SECTION: CSSProperties = { display: "flex", flexDirection: "column", gap: "20px" };
const MONO_CAP: CSSProperties = { font: "600 11px/1 'JetBrains Mono'", letterSpacing: ".1em", color: "#9C968A", textTransform: "uppercase" };

interface Kpi { label: string; value: string; delta: string; source: string; deltaStyle: CSSProperties; spark: { arr: number[]; color: string }; est?: boolean }

export default function EngineAurora({ client = "The Astro Time", shopDomain = "theastrotime.myshopify.com", defaultView = "overview", onSignOut }: { client?: string; shopDomain?: string; defaultView?: Page; onSignOut?: () => void } = {}) {
  const [page, setPage] = useState<Page>(defaultView);
  const [range, setRange] = useState<Range>("28d");
  const [approvals, setApprovals] = useState<string[]>(["a1", "a2", "a3"]);
  const [accountOpen, setAccountOpen] = useState(false);
  const signOut = () => { if (onSignOut) onSignOut(); else if (typeof window !== "undefined") window.location.assign("/engine?login=1"); };

  const F = factorFor(range);
  const rw = rangeWordFor(range);
  const s = buildSeries(range);
  const tones: Record<string, string> = { good: "#1E9E6A", bad: "#CC4A3F", neutral: "#6A6456" };

  const mk = (label: string, value: string, deltaPct: string, tone: string, source: string, up: boolean, est = false): Kpi => ({
    label, value, source, delta: (up ? "▲ " : "▼ ") + deltaPct, est,
    deltaStyle: { color: tones[tone], font: "600 12.5px 'JetBrains Mono'" },
    spark: { arr: sparkSeries(hashStr(label) ^ hashStr(value), up), color: tone === "bad" ? "#CC4A3F" : "#AA7C09" },
  });

  const kpiSets: Record<string, Kpi[]> = {
    // Revenue + spend headline live in the hero, so the KPI row carries the
    // next-most-important, non-duplicated metrics.
    overview: [
      mk("Orders", num(5640 * F), "12.8%", "good", "Shopify", true),
      mk("AOV", "₹759", "3.2%", "good", "Shopify", true),
      mk("New customers", kfmt(3960 * F), "14.1%", "good", "Shopify", true),
      mk("App installs", kfmt(18400 * F), "11.0%", "good", "Google", true),
    ],
    google: [
      mk("Spend", inr(640000 * F), "5.1%", "neutral", "Google", true),
      mk("App installs", kfmt(18400 * F), "11.0%", "good", "Google", true),
      mk("Cost / install", "₹34.8", "5.3%", "good", "Google", false),
    ],
    meta: [
      mk("Amount spent", inr(980000 * F), "8.4%", "neutral", "Meta", true, true),
      mk("Purchases", num(4200 * F), "9.7%", "good", "Meta · Pixel", true, true),
      mk("Purchase ROAS", "3.22×", "4.2%", "good", "Meta", true, true),
      mk("Cost / purchase", "₹233", "2.1%", "good", "Meta", false, true),
    ],
    shopify: [
      mk("Total sales", inr(4280000 * F), "16.4%", "good", "Shopify", true),
      mk("Orders", num(5640 * F), "12.8%", "good", "Shopify", true),
      mk("AOV", "₹759", "3.2%", "good", "Shopify", true),
      // Conversion rate needs sessions — not in the Admin API; sourced from GA4.
      mk("Conversion rate", "2.85%", "4.0%", "good", "GA4", true, true),
    ],
  };

  // nav
  const navBtn = (active: boolean, extra?: CSSProperties): CSSProperties => ({
    display: "flex", alignItems: "center", gap: "11px", padding: "9px 11px", borderRadius: "9px", cursor: "pointer", border: "none", width: "100%", font: "550 13.5px/1 'Manrope'",
    ...(active ? { background: "#FBF1D2", color: "#7A5A06" } : { background: "transparent", color: "#D8D0BC" }), ...extra,
  });
  const sourceNav: { id: Page; label: string }[] = [{ id: "google", label: "Google" }, { id: "meta", label: "Meta" }, { id: "shopify", label: "Shopify" }];
  const engineNav: { id: Page; label: string; badge?: string }[] = [{ id: "runs", label: "Runs" }, { id: "activity", label: "Activity" }, { id: "approvals", label: "Approvals", badge: approvals.length ? String(approvals.length) : "" }];

  const META: Record<Page, { title: string; tag: string; sub: string }> = {
    overview: { title: "Overview", tag: "Blended", sub: client },
    google: { title: "Google", tag: "App · Video", sub: "App installs & YouTube · " + rw },
    meta: { title: "Meta", tag: "Store funnel", sub: "Shopify store purchases · " + rw },
    shopify: { title: "Shopify", tag: "Revenue truth", sub: shopDomain + " · " + rw },
    runs: { title: "Runs", tag: "Agent loop", sub: "Audit → Creative → Launch → Optimize" },
    activity: { title: "Activity", tag: "Audit log", sub: "Every agent decision, logged" },
    approvals: { title: "Approvals", tag: "Gated", sub: "Spend-affecting actions awaiting your sign-off" },
  };
  const m = META[page];
  const showDates = (["overview", "google", "meta", "shopify"] as Page[]).includes(page);
  const ranges: { id: Range; label: string }[] = [{ id: "7d", label: "7D" }, { id: "28d", label: "28D" }, { id: "90d", label: "90D" }];
  const rngBase: CSSProperties = { border: "none", cursor: "pointer", font: "600 11.5px 'JetBrains Mono'", padding: "5px 9px", borderRadius: "7px" };

  // overview funnels
  const funnels = [
    { title: "Store · Meta → Shopify", path: "Pixel + Shopify reconciled", chipBg: "#EAF6EF", icon: "shopify", noteColor: "#16794E", note: "Real purchase revenue — this is where ROAS is measured.", stats: [{ v: inr(3160000 * F), l: "Revenue" }, { v: inr(980000 * F), l: "Meta spend" }, { v: "3.22×", l: "ROAS" }] },
    { title: "App · Google", path: "App installs & YouTube", chipBg: "#FBF1D2", icon: "google", noteColor: "#8A6D00", note: "No purchase revenue — app campaigns report installs, not ROAS.", stats: [{ v: kfmt(18400 * F), l: "Installs" }, { v: inr(640000 * F), l: "Spend" }, { v: "₹34.8", l: "CPI" }] },
  ];

  // google
  const gTotal = 640000;
  const googleTypeBars = ([["App installs", 366000], ["YouTube / Video", 176000], ["Search — Brand", 62000], ["Demand Gen", 36000]] as [string, number][])
    .map(([label, c], i) => ({ label, val: inr(c * F), barStyle: { width: (c / gTotal * 100).toFixed(1) + "%", height: "100%", background: ["#AA7C09", "#C2890B", "#D9A52A", "#E8C25C"][i], borderRadius: "6px" } as CSSProperties }));
  const googleRows = ([
    ["App Installs — Android", "App", 248000, 8600, "₹28.8"], ["YouTube — Awareness", "Video", 176000, 4200, "₹41.9"],
    ["App Installs — iOS", "App", 118000, 3100, "₹38.1"], ["Search — Brand", "Search", 62000, 1800, "₹34.4"],
    ["Demand Gen — Prospecting", "Demand Gen", 36000, 700, "₹51.4"],
  ] as [string, string, number, number, string][]).map(([name, type, spend, inst, cpi]) => ({ name, type, spend: inrFull(spend * F), inst: num(inst * F), cpi }));

  // meta
  const metaStages = [
    { label: "Impressions", value: kfmt(18200000 * F), rate: "", color: "#AA7C09" },
    { label: "Landing page views", value: kfmt(142000 * F), rate: "0.8% of impr.", color: "#C2890B" },
    { label: "Adds to cart", value: kfmt(24600 * F), rate: "17.3% of LPV", color: "#D9A52A" },
    { label: "Purchases", value: num(4200 * F), rate: "17.1% of ATC", color: "#E8C25C" },
  ];
  const metaRows = ([
    ["Advantage+ Shopping", 392000, 1980, 1638000, "4.18×", "good"], ["Prospecting — Broad", 284000, 1080, 829000, "2.92×", ""],
    ["Retargeting — 30d", 147000, 760, 794000, "5.40×", "good"], ["Lookalike 1–3%", 98000, 280, 235000, "2.40×", ""],
    ["Creative Testing", 59000, 100, 106000, "1.80×", "bad"],
  ] as [string, number, number, number, string, string][]).map(([name, spend, pur, rev, roas, t]) => ({
    name, spend: inrFull(spend * F), pur: num(pur * F), rev: inrFull(rev * F), roas,
    roasStyle: { font: "700 12px 'JetBrains Mono'", color: t === "good" ? "#1E9E6A" : t === "bad" ? "#CC4A3F" : "#6A6456", background: t === "good" ? "#E7F6ED" : t === "bad" ? "#FBEAE6" : "#F0EBDD", padding: "2px 8px", borderRadius: "6px" } as CSSProperties,
  }));

  // shopify
  const topProducts = ([
    ["1:1 Astrologer Consultation", 1120, 1344000], ["Personal Birth Chart Report", 1840, 920000], ["Gemstone — Yellow Sapphire", 640, 512000],
    ["Kundli Matching Report", 1280, 384000], ["2026 Yearly Forecast", 760, 228000],
  ] as [string, number, number][]).map(([name, u, ss], i) => ({ rank: i + 1, name, u: num(u * F), sv: inrFull(ss * F) }));
  const shopStages = ([["Sessions", 198000, 100], ["Added to cart", 26800, 13.5], ["Reached checkout", 11200, 5.7], ["Converted", 5640, 2.85]] as [string, number, number][])
    .map(([label, v, pct]) => ({ label, value: kfmt(v * F), rate: pct + "%", barStyle: { width: Math.max(pct, 1.5) + "%", height: "100%", background: "#AA7C09", borderRadius: "5px" } as CSSProperties }));

  // engine: loop
  const phaseDot = (st: string): CSSProperties => ({ width: "9px", height: "9px", borderRadius: "50%", flex: "none", background: st === "done" ? "#1E9E6A" : st === "active" ? "#AA7C09" : "#CFC8B6", boxShadow: st === "active" ? "0 0 0 3px rgba(79,70,229,.18)" : "none", animation: st === "active" ? "pulse 1.6s ease-in-out infinite" : "none" });
  const loop = ([{ phase: "Audit", agent: "Research & intelligence", st: "done" }, { phase: "Creative", agent: "Creative production", st: "done" }, { phase: "Launch", agent: "Media buying", st: "active" }, { phase: "Optimize", agent: "Measurement & attribution", st: "queued" }] as { phase: string; agent: string; st: string }[])
    .map((p) => { const ag = agentOf(p.agent); return { phase: p.phase, agent: p.agent, agentShort: ag.short, agentBg: ag.bg, agentFg: ag.fg, border: p.st === "active" ? "#E6D6A0" : "#ECE7DA", bg: p.st === "active" ? "#FFFDF4" : "#fff", bar: p.st === "done" ? "#1E9E6A" : p.st === "active" ? "#AA7C09" : "#E3DCCB", dot: phaseDot(p.st) }; });
  const activeSteps = ([
    { phase: "Audit", agent: "Research & intelligence", detail: "Re-scanned account — 4 opportunities mapped", status: "done" },
    { phase: "Creative", agent: "Creative production", detail: "Shipped 6 variants to asset-level testing", status: "done" },
    { phase: "Launch", agent: "Media buying", detail: "Proposed: scale Advantage+ budget +₹1,300/day", status: "awaiting", cta: true },
    { phase: "Optimize", agent: "Measurement & attribution", detail: "Waiting on launch to read results", status: "queued" },
  ] as { phase: string; agent: string; detail: string; status: string; cta?: boolean }[]).map((st) => { const ag = agentOf(st.agent); const sp = pill(st.status); return { ...st, agentShort: ag.short, agentBg: ag.bg, agentFg: ag.fg, status: sp.text, statusStyle: sp.style, cta: !!st.cta }; });
  const runHistory = ([
    ["#141", "Creative production", "Creative refresh — 8 hooks shipped", "6h ago", "+₹42K", "completed"], ["#140", "Measurement & attribution", "Cut 3 losers, scaled Advantage+", "1d ago", "+₹68K", "completed"],
    ["#139", "Media buying", "New PMax theme launched (capped)", "2d ago", "—", "completed"], ["#138", "Research & intelligence", "Re-audit — 4 new opportunities", "3d ago", "—", "completed"],
    ["#137", "Measurement & attribution", "Weekly revenue report generated", "4d ago", "—", "completed"],
  ] as [string, string, string, string, string, string][]).map(([id, agent, title, time, impact, status]) => { const ag = agentOf(agent); const sp = pill(status); return { id, agent, title, time, impact, impactColor: impact === "—" ? "#B3AC9A" : "#1E9E6A", agentShort: ag.short, agentBg: ag.bg, agentFg: ag.fg, status: sp.text, statusStyle: sp.style }; });

  // activity
  const activity = ([
    ["Measurement & attribution", "paused underperformer", "LAL 1–3% — Cold", "12m ago", "auto"], ["Media buying", "proposed budget scale on", "Advantage+ Shopping", "14m ago", "awaiting"],
    ["Research & intelligence", "completed account audit —", "4 opportunities", "1h ago", "auto"], ["Creative production", "shipped 8 creative variants to", "Testing", "3h ago", "auto"],
    ["Media buying", "adjusted bids +8% on", "Brand — Search", "5h ago", "auto"], ["Measurement & attribution", "generated weekly report —", "₹42.8L · MER 2.64×", "1d ago", "auto"],
    ["Landing pages", "published CRO variant B on", "Consultation LP", "1d ago", "auto"], ["Media buying", "scaled budget ₹2,800 → ₹3,200 on", "Advantage+ Shopping", "1d ago", "approved"],
  ] as [string, string, string, string, string][]).map(([agent, action, target, time, status]) => { const ag = agentOf(agent); const sp = pill(status); return { agent, action, target, time, agentShort: ag.short, agentBg: ag.bg, agentFg: ag.fg, status: sp.text, statusStyle: sp.style }; });

  // approvals
  const approvalDefs: Record<string, { agent: string; title: string; tag: string; spend: boolean; rationale: string; facts: { l: string; v: string; c: string }[]; capPct: number; capLabel: string }> = {
    a1: { agent: "Media buying", title: "Scale Advantage+ Shopping budget", tag: "spend", spend: true, rationale: "ROAS held at 4.18× (target 3.0×) for 5 straight days. More budget should compound while efficiency is high.", facts: [{ l: "Current", v: "₹3,200/day", c: "#1A1710" }, { l: "Proposed", v: "₹4,500/day", c: "#AA7C09" }, { l: "Impact", v: "+₹1,300/day", c: "#1A1710" }], capPct: 75, capLabel: "₹4,500 of ₹6,000/day cap" },
    a2: { agent: "Media buying", title: "Launch PMax — App installs (YouTube)", tag: "spend", spend: true, rationale: "CPI trending down 12% week-over-week. A capped PMax test can capture cheaper installs before CPMs climb.", facts: [{ l: "New budget", v: "₹2,000/day", c: "#AA7C09" }, { l: "Target CPI", v: "₹32", c: "#1A1710" }, { l: "Spend cap", v: "₹2,000/day", c: "#1A1710" }], capPct: 33, capLabel: "₹2,000 of ₹6,000/day cap" },
    a3: { agent: "Creative production", title: "Publish 3 UGC variants", tag: "creative", spend: false, rationale: "Current hooks fatiguing — CPM up 14% over 7 days. New AI-generated UGC angles are disclosure-labeled per platform policy.", facts: [{ l: "Variants", v: "3 assets", c: "#1A1710" }, { l: "Spend impact", v: "₹0", c: "#1E9E6A" }, { l: "Label", v: "AI-disclosed", c: "#1A1710" }], capPct: 0, capLabel: "" },
  };
  const tagStyleFor = (tag: string): CSSProperties => tag === "spend"
    ? { font: "600 10px 'JetBrains Mono'", color: "#8A6D00", background: "#FFFBEB", padding: "3px 8px", borderRadius: "6px", textTransform: "uppercase", letterSpacing: ".05em" }
    : { font: "600 10px 'JetBrains Mono'", color: "#AA7C09", background: "#FBF1D2", padding: "3px 8px", borderRadius: "6px", textTransform: "uppercase", letterSpacing: ".05em" };
  const approvalCards = approvals.map((id) => { const d = approvalDefs[id]; const ag = agentOf(d.agent); return { id, agentShort: ag.short, agentBg: ag.bg, agentFg: ag.fg, title: d.title, tag: d.tag, tagStyle: tagStyleFor(d.tag), rationale: d.rationale, facts: d.facts, showCap: d.spend, capStyle: { width: d.capPct + "%", height: "100%", background: "#AA7C09", borderRadius: "5px" } as CSSProperties, capLabel: d.capLabel }; });
  const removeApproval = (id: string) => setApprovals((a) => a.filter((x) => x !== id));

  // ── expanded-section data (dummy, two-funnel-accurate; money/counts × F, ratios constant) ──
  const gold = "#C9A23A";
  // Overview: source contribution
  const spendSegs = [{ w: 60.5, color: "#AA7C09" }, { w: 39.5, color: "#D9A52A" }];
  const revSegs = [{ w: 73.8, color: "#AA7C09" }, { w: 26.2, color: "#CFC8B6" }];
  const attention = [
    { tone: "good", head: "Meta ROAS held 4.18× for 5 days — scale headroom", detail: "Advantage+ Shopping above the 3.0× target; budget at 75% of the ₹6K/day cap.", chip: "4.18×", est: true, goto: "approvals" as Page },
    { tone: "good", head: "Google CPI down 12% w/w", detail: "Cheaper installs before CPMs climb — a capped PMax test is queued for approval.", chip: "₹34.8", est: false, goto: "approvals" as Page },
    { tone: "warn", head: "Unattributed store orders at 8%", detail: "8% of orders / ₹11.2L of revenue carry no last-click source — UTM hygiene gap on Meta links.", chip: "8%", est: true, goto: "shopify" as Page },
    { tone: "warn", head: "Blended MER 2.64× vs Store MER 3.22×", detail: "App-install spend drags the blended number — judge the store on Store MER, the app on CPI.", chip: "2.64×", est: false, goto: "overview" as Page },
  ];
  const toneBg: Record<string, { c: string; bg: string }> = { good: { c: "#1E9E6A", bg: "#E7F6ED" }, warn: { c: "#8A6D00", bg: "#FFFBEB" }, bad: { c: "#CC4A3F", bg: "#FBEAE6" }, neutral: { c: "#6A6456", bg: "#F0EBDD" } };
  // Google app-install funnel + post-install + device/geo
  const gFunnel = [
    { label: "Impressions", value: kfmt(11400000 * F), rate: "", color: "#AA7C09" },
    { label: "Clicks", value: kfmt(626000 * F), rate: "5.5% CTR", color: "#C2890B" },
    { label: "Installs", value: kfmt(18400 * F), rate: "2.94% install rate", color: "#D9A52A" },
    { label: "In-app events", value: kfmt(7360 * F), rate: "40% of installs", color: "#E8C25C" },
  ];
  const gQuality = [
    { label: "Install → registration", value: "63%", sub: "11.6K registered" },
    { label: "D7 retention", value: "28%", sub: "modeled", subColor: gold },
    { label: "In-app purchase events", value: num(1290 * F), sub: "₹0 platform value" },
  ];
  const gDevice = [
    { label: "Android", value: kfmt(13800 * F), pct: 75, color: "#AA7C09", sub: "CPI ₹31.4" },
    { label: "iOS", value: kfmt(4600 * F), pct: 25, color: "#D9A52A", sub: "CPI ₹44.9" },
  ];
  const gGeo = [
    { label: "Maharashtra", value: kfmt(4960 * F), pct: 27, color: "#AA7C09" },
    { label: "Delhi NCR", value: kfmt(3310 * F), pct: 18, color: "#C2890B" },
    { label: "Karnataka", value: kfmt(2570 * F), pct: 14, color: "#D9A52A" },
    { label: "Rest of India", value: kfmt(7560 * F), pct: 41, color: "#E8C25C" },
  ];
  const gSpendDaily = daily(0x6709 ^ s.n, s.n, 0.15);
  const gInstDaily = daily(0x7A21 ^ s.n, s.n, 0.22);
  // Meta delivery, placement, age×gender, creatives, trend
  const mSpendDaily = daily(0x4E7A ^ s.n, s.n, 0.14);
  const mRevDaily = daily(0x9C31 ^ s.n, s.n, 0.24);
  const mDelivery = [
    { label: "Reach", value: kfmt(2640000 * F), sub: "▲ 6.2% vs prev", subColor: "#1E9E6A" },
    { label: "Frequency", value: "2.9", sub: "▲ rising — fatigue watch", subColor: "#8A6D00" },
    { label: "CPM", value: "₹148", sub: "▲ 8% vs prev", subColor: "#8A6D00" },
    { label: "Link CTR", value: "1.42%", sub: "▼ 4% vs prev", subColor: "#CC4A3F" },
  ];
  const mPlacement = [
    { label: "Instagram Reels", value: inrFull(372000 * F), pct: 38, color: "#AA7C09", sub: "ROAS 3.6×" },
    { label: "Facebook Feed", value: inrFull(284000 * F), pct: 29, color: "#C2890B", sub: "ROAS 3.1×" },
    { label: "Instagram Feed", value: inrFull(196000 * F), pct: 20, color: "#D9A52A", sub: "ROAS 2.9×" },
    { label: "Stories", value: inrFull(88000 * F), pct: 9, color: "#E8C25C", sub: "ROAS 2.4×" },
    { label: "Audience Network", value: inrFull(40000 * F), pct: 4, color: "#F0D88E", sub: "ROAS 1.8×" },
  ];
  const mAgeGender = [
    { label: "25–34 · F", value: "31%", pct: 31, color: "#AA7C09" },
    { label: "35–44 · F", value: "22%", pct: 22, color: "#C2890B" },
    { label: "25–34 · M", value: "16%", pct: 16, color: "#D9A52A" },
    { label: "45–54 · F", value: "14%", pct: 14, color: "#E8C25C" },
    { label: "35–44 · M", value: "11%", pct: 11, color: "#F0D88E" },
    { label: "Other", value: "6%", pct: 6, color: "#F5E6B8" },
  ];
  const mCreatives = [
    ["UGC — “Reading changed my year”", "Reels", inrFull(142000 * F), "4.6×", "good"],
    ["Carousel — Gemstone benefits", "Feed", inrFull(118000 * F), "3.4×", ""],
    ["Static — Free birth chart", "Feed", inrFull(96000 * F), "3.1×", ""],
    ["Video — Astrologer intro", "Reels", inrFull(74000 * F), "2.7×", ""],
    ["Story — Festival offer", "Stories", inrFull(52000 * F), "1.9×", "bad"],
  ].map(([name, place, spend, roas, t]) => ({ name, place, spend, roas, roasStyle: { font: "700 12px 'JetBrains Mono'", color: t === "good" ? "#1E9E6A" : t === "bad" ? "#CC4A3F" : "#6A6456", background: t === "good" ? "#E7F6ED" : t === "bad" ? "#FBEAE6" : "#F0EBDD", padding: "2px 8px", borderRadius: "6px" } as CSSProperties }));
  // Shopify waterfall, new/returning, channels, trend
  const shGross = 4708000;
  const shWaterfall = [
    { label: "Gross sales", value: inr(shGross * F), pct: 4708000, color: "#AA7C09" },
    { label: "− Discounts", value: "−" + inr(298000 * F), pct: 298000, color: "#F0A93A", neg: true },
    { label: "− Refunds", value: "−" + inr(130000 * F), pct: 130000, color: "#CC4A3F", neg: true },
    { label: "Net revenue", value: inr(4280000 * F), pct: 4280000, color: "#1E9E6A" },
  ];
  const shNewRet = [
    { label: "New customers", value: inr(2996000 * F), pct: 70, color: "#AA7C09", sub: num(3960 * F) + " · 70%" },
    { label: "Returning customers", value: inr(1284000 * F), pct: 30, color: "#B0A892", sub: num(1680 * F) + " · 30%" },
  ];
  const shChannels = [
    { label: "Paid Social — Meta", value: inr(1638000 * F), pct: 38, color: "#AA7C09", sub: num(2030 * F) + " orders" },
    { label: "Direct", value: inr(1112000 * F), pct: 26, color: "#C2890B", sub: num(1410 * F) + " orders" },
    { label: "Organic Search", value: inr(642000 * F), pct: 15, color: "#D9A52A", sub: num(850 * F) + " orders" },
    { label: "Email", value: inr(428000 * F), pct: 10, color: "#E8C25C", sub: num(510 * F) + " orders" },
    { label: "Paid Search", value: inr(312000 * F), pct: 7, color: "#F0D88E", sub: num(395 * F) + " orders" },
    { label: "Unattributed", value: inr(148000 * F), pct: 4, color: "#CFC8B6", sub: num(445 * F) + " orders", est: true },
  ];
  const shRevDaily = daily(0x33C1 ^ s.n, s.n, 0.26);
  const shOrdDaily = daily(0x51F9 ^ s.n, s.n, 0.2);

  const kpis = kpiSets[page];
  const clientInitial = client.slice(0, 1).toUpperCase();

  // ── render ──
  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", background: "#FAF7F0", fontFamily: "'Manrope',system-ui,sans-serif", color: "#1A1710", WebkitFontSmoothing: "antialiased", overflow: "hidden" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}} .v3main::-webkit-scrollbar{width:10px;height:10px}.v3main::-webkit-scrollbar-thumb{background:#D8D1C0;border-radius:8px;border:3px solid #FAF7F0}.v3main::-webkit-scrollbar-track{background:transparent}`}</style>

      {/* SIDEBAR */}
      <aside style={{ width: "248px", flex: "none", display: "flex", flexDirection: "column", height: "100vh", background: "#1A1710" }}>
        <div style={{ padding: "20px 16px 16px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "7px" }}>
            <span style={{ font: "800 20px/1 'Sora'", letterSpacing: "-.01em", color: "#FACC15" }}>ROI</span>
            <span style={{ font: "600 20px/1 'Sora'", letterSpacing: "-.01em", color: "#FFFFFF" }}>Engine</span>
          </div>
        </div>

        <div style={{ padding: "4px 12px 0", flex: 1, overflowY: "auto" }}>
          <button style={navBtn(page === "overview")} onClick={() => setPage("overview")}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "18px", height: "18px", flex: "none" }}><NavIcon name="overview" /></span>
            <span style={{ flex: 1, textAlign: "left" }}>Overview</span>
          </button>

          <div style={{ font: "600 10px/1 'JetBrains Mono'", letterSpacing: ".12em", color: "#9A9078", textTransform: "uppercase", padding: "18px 11px 9px" }}>Sources</div>
          <nav style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {sourceNav.map((it) => (
              <button key={it.id} style={navBtn(page === it.id, { color: page === it.id ? "#7A5A06" : "#EDE6D5", fontWeight: page === it.id ? 600 : 550 })} onClick={() => setPage(it.id)}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "22px", height: "22px", flex: "none" }}><SourceIcon name={it.id} /></span>
                <span style={{ flex: 1, textAlign: "left" }}>{it.label}</span>
              </button>
            ))}
          </nav>

          <div style={{ font: "600 10px/1 'JetBrains Mono'", letterSpacing: ".12em", color: "#9A9078", textTransform: "uppercase", padding: "18px 11px 9px" }}>Engine</div>
          <nav style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {engineNav.map((it) => (
              <button key={it.id} style={navBtn(page === it.id, { color: page === it.id ? "#7A5A06" : "#EDE6D5", fontWeight: page === it.id ? 600 : 550 })} onClick={() => setPage(it.id)}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "18px", height: "18px", flex: "none" }}><NavIcon name={it.id} /></span>
                <span style={{ flex: 1, textAlign: "left" }}>{it.label}</span>
                {it.badge ? <span style={{ font: "700 11px 'JetBrains Mono'", color: "#fff", background: "#AA7C09", minWidth: "22px", height: "20px", padding: "0 6px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>{it.badge}</span> : null}
              </button>
            ))}
          </nav>
        </div>

        <div style={{ padding: "12px 14px 16px", borderTop: "1px solid rgba(255,255,255,.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", background: "rgba(255,255,255,.04)", borderRadius: "10px", marginBottom: "11px" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#34D399", boxShadow: "0 0 0 3px rgba(52,211,153,.18)", animation: "pulse 2.4s ease-in-out infinite", flex: "none" }} />
            <span style={{ flex: 1, font: "600 11.5px 'Manrope'", color: "#D8D0BC" }}>Engine active</span>
            <span style={{ font: "500 10px 'JetBrains Mono'", color: "#A89F86" }}>cap ₹6K/day</span>
          </div>
          <div style={{ position: "relative" }}>
            {accountOpen && <div onClick={() => setAccountOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />}
            {accountOpen && (
              <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: 0, right: 0, zIndex: 50, background: "#fff", border: "1px solid #ECE7DA", borderRadius: "12px", boxShadow: "0 16px 40px -10px rgba(10,8,40,.45)", overflow: "hidden", padding: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px 10px" }}>
                  <Avatar size={32} />
                  <div style={{ minWidth: 0 }}><div style={{ font: "600 12.5px 'Manrope'", color: "#1A1710" }}>Operator</div><div style={{ font: "500 10.5px 'JetBrains Mono'", color: "#9C968A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>operator@roilabs.in</div></div>
                </div>
                <div style={{ height: "1px", background: "#F1ECDF", margin: "2px 6px 4px" }} />
                <MenuItem icon="user" label="Profile" onClick={() => setAccountOpen(false)} />
                <MenuItem icon="settings" label="Settings" onClick={() => setAccountOpen(false)} />
                <MenuItem icon="help" label="Help & docs" onClick={() => setAccountOpen(false)} />
                <div style={{ height: "1px", background: "#F1ECDF", margin: "4px 6px" }} />
                <MenuItem icon="logout" label="Log out" danger onClick={() => { setAccountOpen(false); signOut(); }} />
              </div>
            )}
            <button onClick={() => setAccountOpen((o) => !o)} aria-label="Account menu" title="Account" style={{ display: "inline-flex", padding: "3px", borderRadius: "50%", border: "none", cursor: "pointer", background: accountOpen ? "rgba(255,255,255,.12)" : "transparent" }}>
              <Avatar size={34} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header style={{ display: "flex", alignItems: "center", gap: "16px 18px", flexWrap: "wrap", rowGap: "12px", padding: "15px 30px", background: "rgba(255,255,255,.78)", backdropFilter: "blur(8px)", borderBottom: "1px solid #ECE7DA", flex: "none", zIndex: 5 }}>
          <div style={{ minWidth: 0, flex: "0 1 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
              <h1 style={{ margin: 0, font: "600 19px/1.1 'Sora'", letterSpacing: "-.015em", color: "#1A1710", whiteSpace: "nowrap" }}>{m.title}</h1>
              <span style={{ font: "600 10px/1 'JetBrains Mono'", letterSpacing: ".05em", color: "#AA7C09", background: "#FBF1D2", padding: "4px 7px", borderRadius: "6px", textTransform: "uppercase" }}>{m.tag}</span>
            </div>
            <div style={{ font: "500 12.5px 'Manrope'", color: "#9C968A", marginTop: "3px" }}>{m.sub}</div>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end", gap: "10px" }}>
            <button style={{ display: "flex", alignItems: "center", gap: "9px", background: "#fff", border: "1px solid #ECE7DA", borderRadius: "10px", padding: "7px 11px", cursor: "pointer", boxShadow: "0 1px 2px rgba(20,22,28,.05)" }}>
              <span style={{ width: "22px", height: "22px", borderRadius: "6px", background: "linear-gradient(135deg,#AA7C09,#C99A1F)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", font: "700 11px 'Sora'", flex: "none" }}>{clientInitial}</span>
              <span style={{ textAlign: "left", lineHeight: 1.15 }}>
                <span style={{ display: "block", font: "600 12.5px 'Manrope'", color: "#1A1710" }}>{client}</span>
                <span style={{ display: "block", font: "500 10px 'JetBrains Mono'", color: "#9C968A" }}>{shopDomain}</span>
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9C968A" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
            </button>

            {showDates && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fff", border: "1px solid #ECE7DA", borderRadius: "10px", padding: "6px 8px 6px 11px", boxShadow: "0 1px 2px rgba(20,22,28,.05)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6A6456" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4.5" width="18" height="17" rx="2.5" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></svg>
                <span style={{ font: "600 12.5px 'JetBrains Mono'", color: "#1A1710", whiteSpace: "nowrap" }}>{s.labels[0] + " – " + s.labels[s.n - 1] + ", 2026"}</span>
                <div style={{ display: "flex", gap: "3px", marginLeft: "4px" }}>
                  {ranges.map((r) => (
                    <button key={r.id} style={{ ...rngBase, ...(range === r.id ? { background: "#AA7C09", color: "#fff" } : { background: "transparent", color: "#9C968A" }) }} onClick={() => setRange(r.id)}>{r.label}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "6px 2px 6px 12px", borderLeft: "1px solid #ECE7DA" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#1E9E6A", boxShadow: "0 0 0 3px rgba(22,163,74,.15)" }} />
              <span style={{ font: "500 11.5px 'Manrope'", color: "#9C968A", whiteSpace: "nowrap" }}>Synced 6m ago</span>
            </div>
          </div>
        </header>

        <main className="v3main" style={{ flex: 1, overflowY: "auto", padding: "24px 30px 56px" }}>
          <div style={{ maxWidth: "1320px", margin: "0 auto" }}>

            {/* OVERVIEW */}
            {page === "overview" && (
              <div style={SECTION}>
                <div style={{ ...CARD, borderRadius: "18px", padding: "24px 26px", display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "30px", alignItems: "stretch" }}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={MONO_CAP}>Two funnels · {rw}</div>
                    <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                      <div>
                        <div style={{ font: "600 10.5px 'JetBrains Mono'", color: "#9C968A", textTransform: "uppercase", letterSpacing: ".06em" }}>Store · Meta → Shopify</div>
                        <div style={{ font: "600 33px/1 'Sora'", color: "#1A1710", letterSpacing: "-.02em", marginTop: "8px", fontVariantNumeric: "tabular-nums" }}>{inr(4280000 * F)}</div>
                        <div style={{ font: "500 12px 'Manrope'", color: "#6A6456", marginTop: "5px" }}>Store revenue · <span style={{ color: "#16794E", fontWeight: 600 }}>ROAS 3.22×</span></div>
                      </div>
                      <div>
                        <div style={{ font: "600 10.5px 'JetBrains Mono'", color: "#9C968A", textTransform: "uppercase", letterSpacing: ".06em" }}>App · Google</div>
                        <div style={{ font: "600 33px/1 'Sora'", color: "#1A1710", letterSpacing: "-.02em", marginTop: "8px", fontVariantNumeric: "tabular-nums" }}>{kfmt(18400 * F)}</div>
                        <div style={{ font: "500 12px 'Manrope'", color: "#6A6456", marginTop: "5px" }}>App installs · <span style={{ color: "#AA7C09", fontWeight: 600 }}>CPI ₹34.8</span></div>
                      </div>
                    </div>
                    <div style={{ marginTop: "auto", paddingTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div style={{ background: "#FBF6E6", border: "1px solid #ECE7DA", borderRadius: "12px", padding: "12px 14px" }}>
                        <div style={{ font: "500 10px 'JetBrains Mono'", color: "#9C968A", textTransform: "uppercase", letterSpacing: ".06em" }}>Total ad spend</div>
                        <div style={{ font: "600 22px/1.1 'Sora'", color: "#1A1710", marginTop: "4px" }}>{inr(1620000 * F)}</div>
                      </div>
                      <div style={{ background: "#FBF6E6", border: "1px solid #ECE7DA", borderRadius: "12px", padding: "12px 14px" }}>
                        <div style={{ font: "500 10px 'JetBrains Mono'", color: "#9C968A", textTransform: "uppercase", letterSpacing: ".06em" }}>Blended MER</div>
                        <div style={{ font: "600 22px/1.1 'Sora'", color: "#1A1710", marginTop: "4px" }}>2.64×</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ borderLeft: "1px solid #F1ECDF", paddingLeft: "26px", display: "flex", flexDirection: "column" }}>
                    <Legend items={[{ c: "#AA7C09", t: "Store revenue" }, { c: "#B0A892", t: "Total spend" }]} />
                    <div style={{ flex: 1, display: "flex", alignItems: "flex-end", marginTop: "6px" }}><AreaChart s={s} /></div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(206px,1fr))", gap: "14px" }}>
                  {kpis.map((kp, i) => <KpiCard key={i} kp={kp} idx={i} />)}
                </div>

                <div style={{ ...CARD, padding: "20px 22px" }}>
                  <CardHead title="Where spend goes vs what it returns" note={rw} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px", marginTop: "18px" }}>
                    <div>
                      <div style={SUBCAP}>By spend · {inr(1620000 * F)} total</div>
                      <div style={{ marginTop: "12px" }}><StackBar segs={spendSegs} /></div>
                      <div style={{ marginTop: "14px" }}><BarList rows={[
                        { label: "Meta — store funnel", value: inr(980000 * F), pct: 60.5, color: "#AA7C09", sub: "60.5%", est: true },
                        { label: "Google — app funnel", value: inr(640000 * F), pct: 39.5, color: "#D9A52A", sub: "39.5%" },
                      ]} /></div>
                    </div>
                    <div style={{ borderLeft: "1px solid #F1ECDF", paddingLeft: "28px" }}>
                      <div style={SUBCAP}>By outcome</div>
                      <div style={{ marginTop: "12px", font: "600 12px 'Manrope'", color: "#1A1710" }}>Store revenue → {inr(4280000 * F)}</div>
                      <div style={{ marginTop: "8px" }}><StackBar segs={revSegs} /></div>
                      <div style={{ marginTop: "12px" }}><BarList rows={[
                        { label: "Meta-driven", value: inr(3160000 * F), pct: 73.8, color: "#AA7C09", sub: "74%" },
                        { label: "Other / unattributed", value: inr(1120000 * F), pct: 26.2, color: "#CFC8B6", sub: "26% · last-click", est: true },
                      ]} /></div>
                      <div style={{ marginTop: "14px", font: "600 12px 'Manrope'", color: "#1A1710" }}>App installs → {kfmt(18400 * F)}</div>
                      <div style={{ marginTop: "8px" }}><StackBar segs={[{ w: 100, color: "#D9A52A" }]} /></div>
                      <div style={{ marginTop: "8px", font: "500 10.5px 'Manrope'", color: "#B3AC9A" }}>App installs carry no store revenue — measured by CPI ₹34.8, not ROAS.</div>
                    </div>
                  </div>
                  <div style={{ marginTop: "16px", paddingTop: "13px", borderTop: "1px solid #F1ECDF", font: "500 11.5px 'Manrope'", color: "#6A6456" }}>Google takes 40% of spend toward installs (no store revenue); Meta drives 74% of store revenue. Blended MER mixes both — see Store MER for the store-only number.</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  {funnels.map((f, i) => (
                    <div key={i} style={{ ...CARD, padding: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <SourceIcon name={f.icon} size={30} />
                        <div><div style={{ font: "600 14px 'Sora'", color: "#1A1710" }}>{f.title}</div><div style={{ font: "500 11.5px 'Manrope'", color: "#9C968A" }}>{f.path}</div></div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginTop: "18px" }}>
                        {f.stats.map((st, j) => (
                          <div key={j}><div style={{ font: "600 21px/1.05 'Sora'", color: "#1A1710", fontVariantNumeric: "tabular-nums" }}>{st.v}</div><div style={{ font: "500 11px 'Manrope'", color: "#9C968A", marginTop: "3px" }}>{st.l}</div></div>
                        ))}
                      </div>
                      <div style={{ marginTop: "16px", paddingTop: "13px", borderTop: "1px solid #F1ECDF", font: "500 11.5px 'Manrope'", color: f.noteColor }}>{f.note}</div>
                    </div>
                  ))}
                </div>

                <div style={{ ...CARD, padding: "18px 20px" }}>
                  <CardHead title="What needs attention" note={`${attention.length} signals · ${rw}`} />
                  <div style={{ marginTop: "4px" }}>
                    {attention.map((a, i) => { const tn = toneBg[a.tone]; return (
                      <div key={i} onClick={() => setPage(a.goto)} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "13px 0", borderTop: i ? "1px solid #F1ECDF" : "none", cursor: "pointer" }}>
                        <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: tn.c, marginTop: "4px", flex: "none" }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ font: "600 13px 'Manrope'", color: "#1A1710" }}>{a.head}{a.est ? <span style={{ color: gold, font: "500 10px 'JetBrains Mono'" }}> *</span> : null}</div>
                          <div style={{ font: "500 11.5px 'Manrope'", color: "#6A6456", marginTop: "2px" }}>{a.detail}</div>
                        </div>
                        <span style={{ font: "600 12px 'JetBrains Mono'", color: tn.c, background: tn.bg, padding: "3px 8px", borderRadius: "6px", whiteSpace: "nowrap", flex: "none" }}>{a.chip}</span>
                      </div>
                    ); })}
                  </div>
                </div>

                <div style={{ background: "#262017", borderRadius: "16px", padding: "18px 22px", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34D399", boxShadow: "0 0 0 4px rgba(52,211,153,.18)", animation: "pulse 2.4s ease-in-out infinite" }} />
                    <div><div style={{ font: "600 13.5px 'Sora'", color: "#fff" }}>Engine running</div><div style={{ font: "500 11.5px 'Manrope'", color: "#C9C2B0" }}>Run #142 · Launch phase · Media buying</div></div>
                  </div>
                  <div style={{ height: "34px", width: "1px", background: "rgba(255,255,255,.1)" }} />
                  <div style={{ font: "500 12.5px 'Manrope'", color: "#D8D0BC" }}>Last optimization <span style={{ color: "#fff", fontWeight: 600 }}>12m ago</span> — Measurement & attribution cut 1 underperformer</div>
                  <button style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px", background: "#AA7C09", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 16px", cursor: "pointer", font: "600 12.5px 'Manrope'" }} onClick={() => setPage("approvals")}>
                    <span style={{ background: "#fff", color: "#AA7C09", minWidth: "20px", height: "20px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", font: "700 11px 'JetBrains Mono'" }}>{approvals.length}</span>
                    approvals pending
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </button>
                </div>
              </div>
            )}

            {/* GOOGLE */}
            {page === "google" && (
              <div style={SECTION}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", background: "#FFFBEB", border: "1px solid #F6E7B0", borderRadius: "14px", padding: "14px 18px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A6D00" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", marginTop: "1px" }}><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.01" /></svg>
                  <div style={{ font: "500 12.5px/1.5 'Manrope'", color: "#6B5A1E" }}><b style={{ color: "#5C4D14" }}>App &amp; video funnel.</b> Google runs app installs and YouTube for this account — these campaign types don&apos;t report purchase value, so <b>ROAS isn&apos;t computed here</b>. Revenue is measured on Meta → Shopify.</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: "14px" }}>
                  {kpis.map((kp, i) => <KpiCard key={i} kp={kp} idx={i} />)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "16px", alignItems: "start" }}>
                  <div style={{ ...CARD, padding: "18px" }}>
                    <div style={{ font: "600 14px 'Sora'", color: "#1A1710" }}>Spend by campaign type</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "16px" }}>
                      {googleTypeBars.map((b, i) => (
                        <div key={i}>
                          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "6px" }}><span style={{ font: "600 12.5px 'Manrope'", color: "#1A1710" }}>{b.label}</span><span style={{ font: "600 12.5px 'JetBrains Mono'", color: "#1A1710" }}>{b.val}</span></div>
                          <div style={{ height: "9px", background: "#F0EBDD", borderRadius: "6px", overflow: "hidden" }}><div style={b.barStyle} /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ ...CARD, overflow: "hidden" }}>
                    <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid #F1ECDF", font: "600 14px 'Sora'", color: "#1A1710" }}>Campaigns</div>
                    <table style={{ width: "100%", fontFamily: "'Manrope'", borderCollapse: "collapse" }}>
                      <thead><tr><th style={TH}>Campaign</th><th style={{ ...TH, padding: "10px 10px" }}>Type</th><th style={THR}>Spend</th><th style={THR}>Installs</th><th style={{ ...THR, padding: "10px 18px" }}>CPI</th></tr></thead>
                      <tbody>
                        {googleRows.map((g, i) => (
                          <tr key={i} style={{ borderTop: "1px solid #F1ECDF" }}>
                            <td style={{ padding: "12px 18px", font: "600 13px 'Manrope'", color: "#1A1710" }}>{g.name}</td>
                            <td style={{ padding: "12px 10px" }}><span style={{ font: "600 10px 'JetBrains Mono'", color: "#AA7C09", background: "#FBF1D2", padding: "3px 7px", borderRadius: "5px", whiteSpace: "nowrap" }}>{g.type}</span></td>
                            <td style={{ padding: "12px 10px", textAlign: "right", font: "500 12.5px 'JetBrains Mono'", color: "#6A6456" }}>{g.spend}</td>
                            <td style={{ padding: "12px 10px", textAlign: "right", font: "600 12.5px 'JetBrains Mono'", color: "#1A1710" }}>{g.inst}</td>
                            <td style={{ padding: "12px 18px", textAlign: "right", font: "500 12.5px 'JetBrains Mono'", color: "#6A6456" }}>{g.cpi}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={{ ...CARD, padding: "18px 20px" }}>
                  <CardHead title="App-install funnel" note="Impression → click → install → in-app event" />
                  <FunnelStrip stages={gFunnel} />
                </div>

                <div style={{ ...CARD, padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px", marginBottom: "14px" }}>
                    <span style={{ font: "600 14px 'Sora'", color: "#1A1710" }}>Post-install quality <span style={{ font: "500 9.5px 'JetBrains Mono'", color: gold }}>modeled *</span></span>
                    <span style={{ font: "500 11.5px 'Manrope'", color: "#9C968A" }}>installs report ₹0 store revenue — judged on installs + in-app events</span>
                  </div>
                  <StatTiles items={gQuality} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ ...CARD, padding: "18px 20px" }}>
                    <CardHead title="By device" note="modeled *" />
                    <div style={{ marginTop: "14px" }}><BarList rows={gDevice} /></div>
                  </div>
                  <div style={{ ...CARD, padding: "18px 20px" }}>
                    <CardHead title="By region" note="modeled *" />
                    <div style={{ marginTop: "14px" }}><BarList rows={gGeo} /></div>
                  </div>
                </div>

                <div style={{ ...CARD, padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}><span style={{ font: "600 14px 'Sora'", color: "#1A1710" }}>Spend vs installs · {rw}</span><Legend items={[{ c: "#AA7C09", t: "Installs" }, { c: "#B0A892", t: "Spend" }]} /></div>
                  <div style={{ marginTop: "8px" }}><DualTrend a={gInstDaily} b={gSpendDaily} labels={s.labels} /></div>
                </div>
              </div>
            )}

            {/* META */}
            {page === "meta" && (
              <div style={SECTION}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", background: "#FBF1D2", border: "1px solid #F0E3B8", borderRadius: "14px", padding: "14px 18px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#AA7C09" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", marginTop: "1px" }}><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.01" /></svg>
                  <div style={{ font: "500 12.5px/1.5 'Manrope'", color: "#6E5206" }}><b style={{ color: "#7A5A06" }}>Meta isn&apos;t connected yet.</b> These are <b>modeled</b> from the exact fields the Marketing API will return (spend · purchases &amp; value via the Pixel <code>purchase</code> action · ROAS · the LPV→ATC→purchase funnel). Once the System-User token is approved, this fills with live data and reconciles against Shopify truth.</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "14px" }}>
                  {kpis.map((kp, i) => <KpiCard key={i} kp={kp} idx={i} />)}
                </div>
                <div style={{ ...CARD, padding: "18px 20px" }}>
                  <div style={{ font: "600 14px 'Sora'", color: "#1A1710" }}>Purchase funnel</div>
                  <div style={{ font: "500 11.5px 'Manrope'", color: "#9C968A", marginTop: "2px" }}>Impression → landing page view → add to cart → purchase</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", alignItems: "stretch", marginTop: "18px" }}>
                    {metaStages.map((st, i) => (
                      <div key={i} style={{ padding: "0 18px", borderLeft: "1px solid #F1ECDF", display: "flex", flexDirection: "column" }}>
                        <div style={{ font: "500 11px 'JetBrains Mono'", color: "#9C968A", textTransform: "uppercase", letterSpacing: ".05em" }}>{st.label}</div>
                        <div style={{ font: "600 27px/1.05 'Sora'", color: "#1A1710", marginTop: "6px", fontVariantNumeric: "tabular-nums" }}>{st.value}</div>
                        <div style={{ font: "500 11.5px 'Manrope'", color: "#AA7C09", marginTop: "5px", minHeight: "15px" }}>{st.rate || " "}</div>
                        <div style={{ height: "6px", borderRadius: "4px", marginTop: "12px", background: st.color }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ ...CARD, overflow: "hidden" }}>
                  <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid #F1ECDF", font: "600 14px 'Sora'", color: "#1A1710" }}>Campaigns</div>
                  <table style={{ width: "100%", fontFamily: "'Manrope'", borderCollapse: "collapse" }}>
                    <thead><tr><th style={{ ...TH, padding: "11px 18px" }}>Campaign</th><th style={{ ...THR, padding: "11px 12px" }}>Spend</th><th style={{ ...THR, padding: "11px 12px" }}>Purchases</th><th style={{ ...THR, padding: "11px 12px" }}>Revenue</th><th style={{ ...THR, padding: "11px 18px" }}>ROAS</th></tr></thead>
                    <tbody>
                      {metaRows.map((mr, i) => (
                        <tr key={i} style={{ borderTop: "1px solid #F1ECDF" }}>
                          <td style={{ padding: "12px 18px", font: "600 13px 'Manrope'", color: "#1A1710" }}>{mr.name}</td>
                          <td style={{ padding: "12px 12px", textAlign: "right", font: "500 12.5px 'JetBrains Mono'", color: "#6A6456" }}>{mr.spend}</td>
                          <td style={{ padding: "12px 12px", textAlign: "right", font: "500 12.5px 'JetBrains Mono'", color: "#6A6456" }}>{mr.pur}</td>
                          <td style={{ padding: "12px 12px", textAlign: "right", font: "600 12.5px 'JetBrains Mono'", color: "#1A1710" }}>{mr.rev}</td>
                          <td style={{ padding: "12px 18px", textAlign: "right" }}><span style={mr.roasStyle}>{mr.roas}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ ...CARD, padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}><span style={{ font: "600 14px 'Sora'", color: "#1A1710" }}>Spend vs store revenue · {rw} <span style={{ font: "500 9.5px 'JetBrains Mono'", color: gold }}>modeled *</span></span><Legend items={[{ c: "#AA7C09", t: "Revenue" }, { c: "#B0A892", t: "Spend" }]} /></div>
                  <div style={{ marginTop: "8px" }}><DualTrend a={mRevDaily} b={mSpendDaily} labels={s.labels} /></div>
                </div>

                <div style={{ ...CARD, padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "14px", gap: "8px" }}><span style={{ font: "600 14px 'Sora'", color: "#1A1710" }}>Delivery &amp; creative fatigue <span style={{ font: "500 9.5px 'JetBrains Mono'", color: gold }}>modeled *</span></span><span style={{ font: "500 11.5px 'Manrope'", color: "#9C968A" }}>frequency rising — refresh creative before CPM climbs</span></div>
                  <StatTiles items={mDelivery} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ ...CARD, padding: "18px 20px" }}>
                    <CardHead title="By placement" note="spend · modeled *" />
                    <div style={{ marginTop: "14px" }}><BarList rows={mPlacement} /></div>
                  </div>
                  <div style={{ ...CARD, padding: "18px 20px" }}>
                    <CardHead title="By age & gender" note="≈ 67% F · 33% M · modeled *" />
                    <div style={{ marginTop: "14px" }}><BarList rows={mAgeGender} /></div>
                  </div>
                </div>

                <div style={{ ...CARD, overflow: "hidden" }}>
                  <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid #F1ECDF", font: "600 14px 'Sora'", color: "#1A1710" }}>Creative performance — top ads by ROAS <span style={{ font: "500 9.5px 'JetBrains Mono'", color: gold }}>modeled *</span></div>
                  <table style={{ width: "100%", fontFamily: "'Manrope'", borderCollapse: "collapse" }}>
                    <thead><tr><th style={{ ...TH, padding: "11px 18px" }}>Creative</th><th style={{ ...TH, padding: "11px 10px" }}>Placement</th><th style={{ ...THR, padding: "11px 12px" }}>Spend</th><th style={{ ...THR, padding: "11px 18px" }}>ROAS</th></tr></thead>
                    <tbody>
                      {mCreatives.map((c, i) => (
                        <tr key={i} style={{ borderTop: "1px solid #F1ECDF" }}>
                          <td style={{ padding: "12px 18px", font: "600 13px 'Manrope'", color: "#1A1710" }}>{c.name}</td>
                          <td style={{ padding: "12px 10px" }}><span style={{ font: "600 10px 'JetBrains Mono'", color: "#AA7C09", background: "#FBF1D2", padding: "3px 7px", borderRadius: "5px", whiteSpace: "nowrap" }}>{c.place}</span></td>
                          <td style={{ padding: "12px 12px", textAlign: "right", font: "500 12.5px 'JetBrains Mono'", color: "#6A6456" }}>{c.spend}</td>
                          <td style={{ padding: "12px 18px", textAlign: "right" }}><span style={c.roasStyle}>{c.roas}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SHOPIFY */}
            {page === "shopify" && (
              <div style={SECTION}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "14px" }}>
                  {kpis.map((kp, i) => <KpiCard key={i} kp={kp} idx={i} />)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "16px", alignItems: "start" }}>
                  <div style={{ ...CARD, overflow: "hidden" }}>
                    <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid #F1ECDF", font: "600 14px 'Sora'", color: "#1A1710" }}>Top products</div>
                    <table style={{ width: "100%", fontFamily: "'Manrope'", borderCollapse: "collapse" }}>
                      <thead><tr><th style={TH}>Product</th><th style={{ ...THR, padding: "10px 12px" }}>Units</th><th style={{ ...THR, padding: "10px 18px" }}>Net sales</th></tr></thead>
                      <tbody>
                        {topProducts.map((p, i) => (
                          <tr key={i} style={{ borderTop: "1px solid #F1ECDF" }}>
                            <td style={{ padding: "12px 18px" }}><span style={{ display: "flex", alignItems: "center", gap: "11px" }}><span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#FBF6E6", border: "1px solid #ECE7DA", display: "flex", alignItems: "center", justifyContent: "center", font: "600 11px 'Sora'", color: "#9C968A", flex: "none" }}>{p.rank}</span><span style={{ font: "600 13px 'Manrope'", color: "#1A1710" }}>{p.name}</span></span></td>
                            <td style={{ padding: "12px 12px", textAlign: "right", font: "500 12.5px 'JetBrains Mono'", color: "#6A6456" }}>{p.u}</td>
                            <td style={{ padding: "12px 18px", textAlign: "right", font: "600 12.5px 'JetBrains Mono'", color: "#1A1710" }}>{p.sv}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ ...CARD, padding: "18px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px" }}><div style={{ font: "600 14px 'Sora'", color: "#1A1710" }}>Store conversion</div><span style={{ font: "500 9.5px/1 'JetBrains Mono'", color: "#C9A23A", textTransform: "uppercase", letterSpacing: ".05em" }}>GA4 *</span></div>
                    <div style={{ font: "500 11.5px 'Manrope'", color: "#9C968A", marginTop: "2px" }}>Online store funnel</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "13px", marginTop: "16px" }}>
                      {shopStages.map((st, i) => (
                        <div key={i}>
                          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "6px" }}><span style={{ font: "600 12.5px 'Manrope'", color: "#1A1710" }}>{st.label}</span><span style={{ font: "600 13px 'JetBrains Mono'", color: "#1A1710" }}>{st.value} <span style={{ color: "#AA7C09", fontSize: "11.5px" }}>{st.rate}</span></span></div>
                          <div style={{ height: "8px", background: "#F0EBDD", borderRadius: "5px", overflow: "hidden" }}><div style={st.barStyle} /></div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: "14px", paddingTop: "11px", borderTop: "1px solid #F1ECDF", font: "500 11px/1.5 'Manrope'", color: "#B3AC9A" }}>Sessions &amp; funnel steps are from GA4 — the Shopify Admin API exposes orders, not sessions. <i>Converted</i> reconciles to live Shopify orders.</div>
                  </div>
                </div>

                <div style={{ ...CARD, padding: "18px 20px" }}>
                  <CardHead title="Revenue waterfall" note="gross → discounts → refunds → net" />
                  <div style={{ marginTop: "16px" }}><Waterfall rows={shWaterfall} max={shGross} /></div>
                  <div style={{ marginTop: "14px", paddingTop: "11px", borderTop: "1px solid #F1ECDF", font: "500 11px 'Manrope'", color: "#B3AC9A" }}>Discount rate 6.3% · refund rate 2.8% — all from live Shopify orders.</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "16px" }}>
                  <div style={{ ...CARD, padding: "18px 20px" }}>
                    <CardHead title="New vs returning" note="repeat rate 30%" />
                    <div style={{ marginTop: "14px" }}><BarList rows={shNewRet} /></div>
                  </div>
                  <div style={{ ...CARD, padding: "18px 20px" }}>
                    <CardHead title="Revenue by channel" note="last-click · 4% unattributed" />
                    <div style={{ marginTop: "14px" }}><BarList rows={shChannels} /></div>
                  </div>
                </div>

                <div style={{ ...CARD, padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}><span style={{ font: "600 14px 'Sora'", color: "#1A1710" }}>Revenue &amp; orders · {rw}</span><Legend items={[{ c: "#AA7C09", t: "Revenue" }, { c: "#B0A892", t: "Orders" }]} /></div>
                  <div style={{ marginTop: "8px" }}><DualTrend a={shRevDaily} b={shOrdDaily} labels={s.labels} /></div>
                </div>
              </div>
            )}

            {/* RUNS */}
            {page === "runs" && (
              <div style={SECTION}>
                <div style={{ ...CARD, padding: "20px 22px" }}>
                  <div style={MONO_CAP}>The loop</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginTop: "14px" }}>
                    {loop.map((p, i) => (
                      <div key={i} style={{ position: "relative", border: "1px solid " + p.border, background: p.bg, borderRadius: "13px", padding: "14px" }}>
                        <div style={{ height: "4px", borderRadius: "3px", background: p.bar, width: "48px", marginBottom: "11px" }} />
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><div style={{ font: "600 14px 'Sora'", color: "#1A1710" }}>{p.phase}</div><span style={p.dot} /></div>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginTop: "10px" }}>
                          <span style={{ width: "20px", height: "20px", borderRadius: "6px", background: p.agentBg, color: p.agentFg, display: "flex", alignItems: "center", justifyContent: "center", font: "700 9px 'Sora'", flex: "none" }}>{p.agentShort}</span>
                          <span style={{ font: "500 12px 'Manrope'", color: "#6A6456" }}>{p.agent}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ ...CARD, border: "1px solid #AA7C09", boxShadow: "0 8px 24px -12px rgba(79,70,229,.25)", overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1ECDF", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "7px", font: "700 12px 'JetBrains Mono'", color: "#AA7C09", background: "#FBF1D2", padding: "5px 9px", borderRadius: "7px" }}><span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#AA7C09", animation: "pulse 1.6s ease-in-out infinite" }} />ACTIVE</span>
                    <div style={{ font: "600 15px 'Sora'", color: "#1A1710" }}>Run #142</div>
                    <div style={{ font: "500 12px 'Manrope'", color: "#9C968A" }}>Daily optimization · started 12m ago · trigger: Measurement & attribution</div>
                  </div>
                  <div style={{ padding: "8px 20px 16px" }}>
                    {activeSteps.map((st, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "13px 0", borderBottom: "1px solid #F4EFE3" }}>
                        <span style={{ width: "26px", height: "26px", borderRadius: "7px", background: st.agentBg, color: st.agentFg, display: "flex", alignItems: "center", justifyContent: "center", font: "700 10px 'Sora'", flex: "none" }}>{st.agentShort}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ font: "600 13.5px 'Manrope'", color: "#1A1710" }}>{st.phase} · <span style={{ color: "#6A6456", fontWeight: 500 }}>{st.agent}</span></div>
                          <div style={{ font: "500 12px 'Manrope'", color: "#9C968A", marginTop: "2px" }}>{st.detail}</div>
                        </div>
                        {st.cta ? <button style={{ font: "600 12px 'Manrope'", color: "#8A6D00", background: "#FFFBEB", border: "1px solid #F6E7B0", borderRadius: "8px", padding: "7px 12px", cursor: "pointer", whiteSpace: "nowrap" }} onClick={() => setPage("approvals")}>Review →</button> : null}
                        <span style={st.statusStyle}>{st.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ ...CARD, overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid #F1ECDF", font: "600 14px 'Sora'", color: "#1A1710" }}>Run history</div>
                  {runHistory.map((r, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 20px", borderTop: "1px solid #F4EFE3" }}>
                      <span style={{ font: "600 12px 'JetBrains Mono'", color: "#9C968A", width: "42px", flex: "none" }}>{r.id}</span>
                      <span style={{ width: "24px", height: "24px", borderRadius: "7px", background: r.agentBg, color: r.agentFg, display: "flex", alignItems: "center", justifyContent: "center", font: "700 9px 'Sora'", flex: "none" }}>{r.agentShort}</span>
                      <div style={{ flex: 1, minWidth: 0 }}><div style={{ font: "600 13px 'Manrope'", color: "#1A1710" }}>{r.title}</div><div style={{ font: "500 11.5px 'Manrope'", color: "#9C968A" }}>{r.agent} · {r.time}</div></div>
                      <span style={{ font: "600 12.5px 'JetBrains Mono'", color: r.impactColor, whiteSpace: "nowrap" }}>{r.impact}</span>
                      <span style={r.statusStyle}>{r.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ACTIVITY */}
            {page === "activity" && (
              <div style={{ ...CARD, overflow: "hidden" }}>
                <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid #F1ECDF", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div><div style={{ font: "600 14px 'Sora'", color: "#1A1710" }}>Decision log</div><div style={{ font: "500 11.5px 'Manrope'", color: "#9C968A", marginTop: "2px" }}>Every agent action — this log becomes the case study</div></div>
                  <span style={{ font: "500 11px 'JetBrains Mono'", color: "#9C968A" }}>{rw}</span>
                </div>
                {activity.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "13px", padding: "14px 20px", borderTop: "1px solid #F4EFE3" }}>
                    <span style={{ width: "26px", height: "26px", borderRadius: "7px", background: a.agentBg, color: a.agentFg, display: "flex", alignItems: "center", justifyContent: "center", font: "700 10px 'Sora'", flex: "none", marginTop: "1px" }}>{a.agentShort}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ font: "500 13px/1.45 'Manrope'", color: "#1A1710" }}><b style={{ fontWeight: 600 }}>{a.agent}</b> {a.action} <b style={{ fontWeight: 600, color: "#AA7C09" }}>{a.target}</b></div>
                      <div style={{ font: "500 11.5px 'Manrope'", color: "#9C968A", marginTop: "2px" }}>{a.time}</div>
                    </div>
                    <span style={a.statusStyle}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}

            {/* APPROVALS */}
            {page === "approvals" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {approvals.length > 0 ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#FFFBEB", border: "1px solid #F6E7B0", borderRadius: "12px", padding: "12px 16px", font: "500 12.5px 'Manrope'", color: "#6B5A1E" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A6D00" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17v.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></svg>
                      <span><b style={{ color: "#5C4D14" }}>{approvals.length} spend-affecting actions</b> need your sign-off. Nothing spends until you approve — every action is checked against the ₹6,000/day cap.</span>
                    </div>
                    {approvalCards.map((a) => (
                      <div key={a.id} style={{ ...CARD, padding: "20px 22px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", flexWrap: "wrap" }}>
                          <span style={{ width: "30px", height: "30px", borderRadius: "8px", background: a.agentBg, color: a.agentFg, display: "flex", alignItems: "center", justifyContent: "center", font: "700 11px 'Sora'", flex: "none" }}>{a.agentShort}</span>
                          <div style={{ flex: 1, minWidth: "200px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}><span style={{ font: "600 15px 'Sora'", color: "#1A1710" }}>{a.title}</span><span style={a.tagStyle}>{a.tag}</span></div>
                            <div style={{ font: "500 12.5px/1.5 'Manrope'", color: "#6A6456", marginTop: "5px" }}>{a.rationale}</div>
                          </div>
                          <div style={{ display: "flex", gap: "9px", flex: "none" }}>
                            <button style={{ font: "600 12.5px 'Manrope'", color: "#6A6456", background: "#fff", border: "1px solid #ECE7DA", borderRadius: "9px", padding: "9px 16px", cursor: "pointer" }} onClick={() => removeApproval(a.id)}>Reject</button>
                            <button style={{ font: "600 12.5px 'Manrope'", color: "#fff", background: "#AA7C09", border: "none", borderRadius: "9px", padding: "9px 18px", cursor: "pointer" }} onClick={() => removeApproval(a.id)}>Approve</button>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }}>
                          {a.facts.map((ft, j) => (
                            <div key={j} style={{ background: "#FBF6E6", border: "1px solid #ECE7DA", borderRadius: "10px", padding: "10px 14px", minWidth: "130px" }}>
                              <div style={{ font: "500 10px 'JetBrains Mono'", color: "#9C968A", textTransform: "uppercase", letterSpacing: ".05em" }}>{ft.l}</div>
                              <div style={{ font: "600 15px 'Sora'", color: ft.c, marginTop: "3px" }}>{ft.v}</div>
                            </div>
                          ))}
                          {a.showCap && (
                            <div style={{ flex: 1, minWidth: "200px", background: "#FBF6E6", border: "1px solid #ECE7DA", borderRadius: "10px", padding: "10px 14px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ font: "500 10px 'JetBrains Mono'", color: "#9C968A", textTransform: "uppercase", letterSpacing: ".05em" }}>Daily spend vs cap</span><span style={{ font: "600 11px 'JetBrains Mono'", color: "#1E9E6A" }}>within cap</span></div>
                              <div style={{ height: "8px", background: "#EAE4D5", borderRadius: "5px", overflow: "hidden", marginTop: "9px" }}><div style={a.capStyle} /></div>
                              <div style={{ font: "500 11px 'Manrope'", color: "#9C968A", marginTop: "6px" }}>{a.capLabel}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div style={{ ...CARD, padding: "48px", textAlign: "center" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#E7F6ED", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16794E" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></div>
                    <div style={{ font: "600 16px 'Sora'", color: "#1A1710" }}>All caught up</div>
                    <div style={{ font: "500 12.5px 'Manrope'", color: "#9C968A", marginTop: "4px" }}>No actions waiting. The engine will queue the next decision here.</div>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: "20px", paddingTop: "14px", borderTop: "1px solid #ECE7DA", font: "500 11px/1.6 'Manrope'", color: "#B3AC9A" }}>
              <b style={{ color: "#C9A23A", fontWeight: 600 }}>*</b> Modeled — not yet from a live connector. Store <b>conversion rate</b> &amp; <b>sessions</b> come from GA4 (the Shopify Admin API exposes orders, not sessions); <b>Meta</b> figures are projected until the Marketing API connection is approved. Live today for <i>The Astro Time</i>: Google Ads (spend · installs · CPI · campaign types) and Shopify (orders · sales · AOV · products · customers). Other values are realistic placeholders.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// KPI card (shared across Overview / Google / Meta / Shopify)
function KpiCard({ kp, idx }: { kp: Kpi; idx: number }) {
  return (
    <div style={KPI_CARD}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
        <span style={{ font: "600 12px/1.2 'Manrope'", color: "#6A6456" }}>{kp.label}</span>
        <span style={{ font: "500 9.5px/1 'JetBrains Mono'", color: kp.est ? "#C9A23A" : "#B3AC9A", textTransform: "uppercase", letterSpacing: ".05em" }}>{kp.source}{kp.est ? " *" : ""}</span>
      </div>
      <div style={{ font: "600 26px/1.04 'Sora'", color: "#1A1710", letterSpacing: "-.01em", fontVariantNumeric: "tabular-nums" }}>{kp.value}</div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={kp.deltaStyle}>{kp.delta}</span><span style={{ font: "500 11px 'Manrope'", color: "#B3AC9A" }}>vs prev</span></div>
      <div style={{ marginTop: "2px", height: "32px" }}><Spark arr={kp.spark.arr} color={kp.spark.color} id={`spk-${kp.label.replace(/[^a-z0-9]/gi, "")}-${idx}`} /></div>
    </div>
  );
}

// Generic account avatar (user silhouette in an indigo disc)
function Avatar({ size = 30 }: { size?: number }) {
  const g = Math.round(size * 0.56);
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#C2890B,#AA7C09)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.14)" }}>
      <svg width={g} height={g} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.4" /><path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" /></svg>
    </div>
  );
}

function MenuIcon({ name, color }: { name: string; color: string }) {
  const wrap = (kids: ReactNode) => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>{kids}</svg>;
  if (name === "user") return wrap(<><circle cx="12" cy="8" r="3.4" /><path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" /></>);
  if (name === "settings") return wrap(<><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" /></>);
  if (name === "help") return wrap(<><circle cx="12" cy="12" r="9" /><path d="M9.6 9.5a2.5 2.5 0 0 1 4.5 1.4c0 1.6-2.1 2-2.1 3.1" /><path d="M12 17.5v.01" /></>);
  if (name === "logout") return wrap(<><path d="M15 17l5-5-5-5" /><path d="M20 12H9" /><path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" /></>);
  return wrap(null);
}

function MenuItem({ icon, label, onClick, danger }: { icon: string; label: string; onClick: () => void; danger?: boolean }) {
  const [hover, setHover] = useState(false);
  const color = danger ? "#CC4A3F" : "#1A1710";
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "8px 10px", borderRadius: "8px", border: "none", cursor: "pointer", background: hover ? (danger ? "#FBEAE6" : "#FBF1D2") : "transparent", font: "600 12.5px 'Manrope'", color }}>
      <MenuIcon name={icon} color={color} />
      <span>{label}</span>
    </button>
  );
}

// ── reusable building blocks for the expanded sections ──
const SUBCAP: CSSProperties = { font: "600 11px/1 'JetBrains Mono'", letterSpacing: ".08em", color: "#9C968A", textTransform: "uppercase" };

// noisy daily series (deterministic) — for trend charts; shape only (normalized when drawn)
function daily(seed: number, n: number, trend = 0.2) {
  const rnd = rng(seed); const out: number[] = []; let w = 0;
  for (let i = 0; i < n; i++) { const t = i / (n - 1 || 1); w = w * 0.8 + (rnd() - 0.5) * 0.12; out.push(Math.max(0.08, (1 + t * trend) * (1 + w) * (i % 7 === 5 ? 1.08 : i % 7 === 6 ? 0.9 : 1))); }
  return out;
}

// labeled horizontal bar list (device / geo / placement / age×gender / channels)
function BarList({ rows }: { rows: { label: string; value: string; pct: number; color: string; sub?: string; est?: boolean }[] }) {
  const max = Math.max(...rows.map((r) => r.pct), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
      {rows.map((r, i) => (
        <div key={i}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "6px", gap: "8px" }}>
            <span style={{ font: "600 12.5px 'Manrope'", color: "#1A1710" }}>{r.label}{r.sub ? <span style={{ font: "500 11px 'Manrope'", color: "#9C968A" }}> · {r.sub}</span> : null}{r.est ? <span style={{ font: "500 9px 'JetBrains Mono'", color: "#C9A23A" }}> *</span> : null}</span>
            <span style={{ font: "600 12.5px 'JetBrains Mono'", color: "#1A1710" }}>{r.value}</span>
          </div>
          <div style={{ height: "8px", background: "#F0EBDD", borderRadius: "5px", overflow: "hidden" }}><div style={{ width: `${Math.max((r.pct / max) * 100, 2)}%`, height: "100%", background: r.color, borderRadius: "5px" }} /></div>
        </div>
      ))}
    </div>
  );
}

// single horizontal stacked bar (multiple segments)
function StackBar({ segs, height = 14 }: { segs: { w: number; color: string }[]; height?: number }) {
  return (
    <div style={{ display: "flex", height: `${height}px`, borderRadius: `${height / 2}px`, overflow: "hidden", background: "#F0EBDD" }}>
      {segs.map((s, i) => <div key={i} style={{ width: `${s.w}%`, background: s.color }} />)}
    </div>
  );
}

// 4-up funnel stages (label / value / rate / colored bottom bar) — Meta + Google
function FunnelStrip({ stages }: { stages: { label: string; value: string; rate?: string; color: string }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${stages.length},1fr)`, alignItems: "stretch", marginTop: "18px" }}>
      {stages.map((st, i) => (
        <div key={i} style={{ padding: "0 18px", borderLeft: "1px solid #F1ECDF", display: "flex", flexDirection: "column" }}>
          <div style={{ font: "500 11px 'JetBrains Mono'", color: "#9C968A", textTransform: "uppercase", letterSpacing: ".05em" }}>{st.label}</div>
          <div style={{ font: "600 27px/1.05 'Sora'", color: "#1A1710", marginTop: "6px", fontVariantNumeric: "tabular-nums" }}>{st.value}</div>
          <div style={{ font: "500 11.5px 'Manrope'", color: "#AA7C09", marginTop: "5px", minHeight: "15px" }}>{st.rate || " "}</div>
          <div style={{ height: "6px", borderRadius: "4px", marginTop: "12px", background: st.color }} />
        </div>
      ))}
    </div>
  );
}

// dual trend — two daily series each normalized to its own max (area + line) + x ticks
function DualTrend({ a, b, labels, ca = "#AA7C09", cb = "#B0A892" }: { a: number[]; b: number[]; labels: string[]; ca?: string; cb?: string }) {
  const W = 1000, H = 200, padT = 12, padB = 26;
  const norm = (arr: number[]) => { const mx = Math.max(...arr) * 1.12 || 1; return arr.map((v) => v / mx); };
  const na = norm(a), nb = norm(b);
  const X = (i: number) => (i / (a.length - 1)) * W;
  const Y = (v: number) => padT + (1 - v) * (H - padT - padB);
  const path = (arr: number[]) => arr.map((v, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1)).join(" ");
  const id = "dt" + ca.replace("#", "") + cb.replace("#", "");
  const ticks = [0, Math.floor((a.length - 1) / 2), a.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="auto" preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={ca} stopOpacity={0.15} /><stop offset="100%" stopColor={ca} stopOpacity={0} /></linearGradient></defs>
      {[0, .25, .5, .75, 1].map((f, i) => { const y = padT + f * (H - padT - padB); return <line key={i} x1={0} y1={y} x2={W} y2={y} stroke="#EFEADB" strokeWidth={1} vectorEffect="non-scaling-stroke" />; })}
      <path d={path(na) + ` L${W} ${H - padB} L0 ${H - padB} Z`} fill={`url(#${id})`} />
      <path d={path(nb)} fill="none" stroke={cb} strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
      <path d={path(na)} fill="none" stroke={ca} strokeWidth={2.4} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
      {ticks.map((i, k) => <text key={k} x={X(i)} y={H - 6} fill="#B3AC9A" fontSize={12} fontFamily="JetBrains Mono" textAnchor={k === 0 ? "start" : k === ticks.length - 1 ? "end" : "middle"}>{labels[i]}</text>)}
    </svg>
  );
}

// chart legend row
function Legend({ items }: { items: { c: string; t: string }[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", justifyContent: "flex-end" }}>
      {items.map((it, i) => <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px", font: "500 11.5px 'Manrope'", color: "#6A6456" }}><span style={{ width: "14px", height: "3px", borderRadius: "2px", background: it.c }} />{it.t}</span>)}
    </div>
  );
}

// revenue waterfall row set (bars proportional to a max)
function Waterfall({ rows, max }: { rows: { label: string; value: string; pct: number; color: string; neg?: boolean }[]; max: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 1fr 96px", alignItems: "center", gap: "12px" }}>
          <span style={{ font: "600 12.5px 'Manrope'", color: "#1A1710" }}>{r.label}</span>
          <div style={{ height: "22px", background: "#F4EFE3", borderRadius: "6px", overflow: "hidden" }}><div style={{ width: `${Math.max((r.pct / max) * 100, 2)}%`, height: "100%", background: r.color, borderRadius: "6px" }} /></div>
          <span style={{ font: "600 12.5px 'JetBrains Mono'", color: r.neg ? "#CC4A3F" : "#1A1710", textAlign: "right" }}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}

// row of stat tiles (delivery: reach / frequency / cpm …)
function StatTiles({ items }: { items: { label: string; value: string; sub?: string; subColor?: string }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${items.length},1fr)`, gap: "12px" }}>
      {items.map((it, i) => (
        <div key={i} style={{ background: "#FBF6E6", border: "1px solid #ECE7DA", borderRadius: "12px", padding: "13px 14px" }}>
          <div style={{ font: "500 10.5px 'JetBrains Mono'", color: "#9C968A", textTransform: "uppercase", letterSpacing: ".06em" }}>{it.label}</div>
          <div style={{ font: "600 22px/1.1 'Sora'", color: "#1A1710", marginTop: "4px", fontVariantNumeric: "tabular-nums" }}>{it.value}</div>
          {it.sub ? <div style={{ font: "500 11px 'Manrope'", color: it.subColor || "#9C968A", marginTop: "3px" }}>{it.sub}</div> : null}
        </div>
      ))}
    </div>
  );
}

// simple section-card header (title + optional right note)
function CardHead({ title, note }: { title: string; note?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px" }}>
      <span style={{ font: "600 14px 'Sora'", color: "#1A1710" }}>{title}</span>
      {note ? <span style={{ font: "500 11.5px 'Manrope'", color: "#9C968A" }}>{note}</span> : null}
    </div>
  );
}
