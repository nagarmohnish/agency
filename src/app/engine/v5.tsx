"use client";

// ROI Engine — v5 cockpit. Implements the "Dutask-style" design handoff in
// engine_design_new/design_handoff_roi_engine (Overview · Approvals · Runs +
// shared chrome). Friendly, rounded, card-based; navy ink, indigo accent, gold
// ROI mark. Real Google/Meta/Shopify logos from /public/logos. Self-contained,
// demo data for "Northwind Goods". This is the /engine cockpit.
import { useState, useEffect, type CSSProperties, type ReactNode } from "react";
import type { CockpitData, RangeData, RangeKey } from "@/lib/engine/cockpit-data";
import { SEED_TICKETS, MEMBERS, COLUMNS, TYPE_META, PRIORITY_C, BRAND, can, canApprove, memberById, effectivePerms, APPROVE_FOR, type Ticket, type Member, type Status, type Role } from "./tickets";

// Per-tenant brand + the signed-in user (multi-tenant). When EngineV5 is rendered
// for a tenant (TenantShell) these are passed; the operator /engine demo omits
// them and falls back to the global BRAND + a seeded demo viewer.
export type CockpitBrand = { name: string; mono: string; logoSrc: string | null; shopifySlug: string };
export type CockpitUser = { name: string; email: string; role: Role };

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

// ── tokens (themeable via CSS vars on .v5root — see THEME_CSS + the <style> block) ──
const APP = "var(--bg)";
const CARD = "var(--card)";
const SUBTLE = "var(--subtle)";
const NAVY = "var(--btn)";          // navy buttons / chips / tooltip (lifts in dark; white text on it)
const INK = "var(--ink)";           // primary text (flips light↔dark)
const INK6 = "var(--ink6)";
const INK4 = "var(--ink4)";
const INK3 = "var(--ink3)";
const LINE = "var(--line)";
const LINE2 = "var(--line)";
const ACCENT = "#4F5BD5";           // accents stay across themes
const ACCENT_SOFT = "var(--accent-soft)";
const ACCENT_TINT = "var(--accent-tint)";
const GOLD = "#FACC15"; // ROI Labs brand yellow
const GREEN = "#2BBF7A";
const GREEN_SOFT = "var(--green-soft)";
const GREEN_TX = "var(--green-tx)";
const AMBER = "var(--amber)";
const AMBER_SOFT = "var(--amber-soft)";
const RED = "#EF6B6B";
const FD = "'Poppins', system-ui, sans-serif";
const FM = "'DM Mono', ui-monospace, monospace";

// Light + dark token sets. monoLabel (--label) is darker in light per the
// "headers too light" fix; pastel chip bgs become translucent in dark.
const THEME_CSS = `
.v5root{
  --bg:#F3F5F9; --card:#FFFFFF; --subtle:#F7F8FB;
  --ink:#1B2440; --ink6:#6B7384; --ink4:#8B93A7; --ink3:#AAB2C3; --label:#5E6678; --btn:#1B2440;
  --line:#EDEFF4; --card-bd:transparent;
  --accent-soft:#EEF0FB; --accent-tint:#C6CCF5;
  --green-soft:#DCF3E8; --green-tx:#0D9F72; --amber:#C08A2E; --amber-soft:#FDECCF;
  --violet-soft:#ECE9FD; --blue-soft:#E6ECFD; --coral:#D4604D; --coral-soft:#FDE3DF; --red-soft:#FDECEC;
  --shadow:0 2px 14px rgba(27,36,64,.05);
}
.v5root[data-theme="dark"]{
  --bg:#0E1422; --card:#1A2132; --subtle:#141B29;
  --ink:#EAEDF5; --ink6:#AEB6C9; --ink4:#8E96AB; --ink3:#7E889C; --label:#9AA3B8; --btn:#3A4A82;
  --line:#2A3346; --card-bd:#2A3346;
  --accent-soft:rgba(79,91,213,.22); --accent-tint:rgba(79,91,213,.36);
  --green-soft:rgba(43,191,122,.18); --green-tx:#34D399; --amber:#E0A94A; --amber-soft:rgba(192,138,46,.22);
  --violet-soft:rgba(108,92,231,.22); --blue-soft:rgba(59,91,219,.22); --coral:#E97A66; --coral-soft:rgba(212,96,77,.22); --red-soft:rgba(239,107,107,.20);
  --shadow:0 2px 18px rgba(0,0,0,.45);
}
.v5root[data-theme="dark"] .v5-nav:hover{background:#222c40;color:#8a92f5}
.v5root[data-theme="dark"] .v5-src:hover{border-color:#33405c;background:#1e2738}
.v5root[data-theme="dark"] .v5-card:hover{box-shadow:0 8px 26px rgba(0,0,0,.55)}
.v5root[data-theme="dark"] .v5-ic:hover{background:#222c40}
.v5root[data-theme="dark"] .v5-row:hover{background:#1e2738}
.v5root[data-theme="dark"] .v5sc::-webkit-scrollbar-thumb{background:#33405c}
.v5root[data-theme="dark"] .v5-navy:hover{background:#46568f}
`;

const card: CSSProperties = { background: CARD, borderRadius: 22, boxShadow: "var(--shadow)", border: "1px solid var(--card-bd)" };
const monoLabel: CSSProperties = { fontFamily: FM, fontSize: 11, letterSpacing: "1.3px", color: "var(--label)" };

type Page = "overview" | "google" | "meta" | "shopify" | "runs" | "activity" | "approvals" | "profile";

// ── icons ────────────────────────────────────────────────────────────────────
const ic = (path: ReactNode, w = 1.8, s = 22): ReactNode => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">{path}</svg>;
const RAIL = {
  overview: ic(<><rect x="3" y="3" width="7" height="7" rx="1.6" /><rect x="14" y="3" width="7" height="7" rx="1.6" /><rect x="3" y="14" width="7" height="7" rx="1.6" /><rect x="14" y="14" width="7" height="7" rx="1.6" /></>),
  sources: ic(<><path d="M12 3 21 8l-9 5-9-5 9-5Z" /><path d="M3 13l9 5 9-5" /></>),
  engine: ic(<><rect x="6" y="6" width="12" height="12" rx="2.2" /><rect x="9.5" y="9.5" width="5" height="5" rx="1" /><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" /></>, 1.7),
  runs: ic(<><path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 4v5h-5" /></>),
  activity: ic(<path d="M3 12h4l3 8 4-16 3 8h4" />),
  approvals: ic(<><path d="M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6l-8-3Z" /><path d="M9 12l2 2 4-4" /></>, 1.7),
  settings: ic(<><path d="M4 8h9M17 8h3M4 16h3M11 16h9" /><circle cx="15" cy="8" r="2.1" /><circle cx="9" cy="16" r="2.1" /></>),
  help: ic(<><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 1.6-2 2-2 3.4" /><circle cx="12" cy="17" r="0.7" fill="currentColor" stroke="none" /></>),
  search: ic(<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>, 2, 18),
  bell: ic(<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>, 1.8, 20),
  cal: ic(<><rect x="3" y="4" width="18" height="17" rx="2.5" /><path d="M3 9h18M8 2v4M16 2v4" /></>, 1.8, 16),
  arrow: ic(<path d="M5 12h14M13 6l6 6-6 6" />, 2, 17),
  chevR: ic(<path d="m9 6 6 6-6 6" />, 2, 16),
  chevD: ic(<path d="m6 9 6 6 6-6" />, 2, 16),
  plus: ic(<path d="M12 5v14M5 12h14" />, 2, 15),
};

// real platform logo in a white rounded chip (README: swap lettermarks for real logos)
function SrcLogo({ id, size = 36, radius = 11 }: { id: "google" | "meta" | "shopify"; size?: number; radius?: number }) {
  const src = id === "google" ? "/logos/google1.webp" : id === "meta" ? "/logos/meta.png" : "/logos/shopify.svg";
  return (
    <span style={{ width: size, height: size, borderRadius: radius, background: "var(--card)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${BP}${src}`} alt={id} style={{ width: size * 0.62, height: size * 0.62, objectFit: "contain", display: "block" }} />
    </span>
  );
}
// Per-tenant brand mark: the company's logo, falling back to its initial on error.
function BrandMark({ logoSrc, mono, size = 36 }: { logoSrc: string | null; mono: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (logoSrc && !err) {
    return (
      <span style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, display: "flex" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${BP}${logoSrc}`} alt="" onError={() => setErr(true)} style={{ width: size, height: size, objectFit: "cover", display: "block" }} />
      </span>
    );
  }
  return <span style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#6c5ce7,#4f5bd5)", color: "#fff", fontWeight: 700, fontSize: Math.round(size * 0.42), fontFamily: FD }}>{mono}</span>;
}

const agentAv = (s: string, bg: string, fg: string, size = 42, radius = 12, fs = 13): ReactNode => (
  <span style={{ width: size, height: size, borderRadius: radius, background: bg, color: fg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: fs, flexShrink: 0 }}>{s}</span>
);

// ── data ─────────────────────────────────────────────────────────────────────
const KPIS = [
  { t: "Orders", v: "5,640", d: "▲ 12.8%", src: "SHOPIFY", srcC: "#6c5ce7", srcB: "var(--violet-soft)", sp: "M0 30 L15 27 L30 28 L45 22 L60 24 L75 16 L90 18 L105 11 L120 8" },
  { t: "AOV", v: "₹759", d: "▲ 3.2%", src: "SHOPIFY", srcC: "#6c5ce7", srcB: "var(--violet-soft)", sp: "M0 26 L15 28 L30 24 L45 25 L60 20 L75 22 L90 17 L105 18 L120 12" },
  { t: "New customers", v: "4.0K", d: "▲ 14.1%", src: "SHOPIFY", srcC: "#6c5ce7", srcB: "var(--violet-soft)", sp: "M0 29 L15 26 L30 27 L45 21 L60 23 L75 16 L90 17 L105 12 L120 9" },
  { t: "App installs", v: "18.4K", d: "▲ 11.0%", src: "GOOGLE", srcC: AMBER, srcB: AMBER_SOFT, sp: "M0 28 L15 25 L30 26 L45 22 L60 19 L75 21 L90 15 L105 14 L120 10" },
];
const SIGNALS = [
  { tag: "SCALE HEADROOM", tagC: GREEN_TX, tagB: GREEN_SOFT, h: "Meta ROAS held 4.18× for 5 days — scale headroom", d: "Advantage+ Shopping above the 3.0× target; budget at 75% of the ₹6K/day cap.", m: "4.18×", mGood: true, src: ["meta"], note: "held 5d" },
  { tag: "EFFICIENCY", tagC: GREEN_TX, tagB: GREEN_SOFT, h: "Google CPI down 12% w/w", d: "Cheaper installs before CPMs climb — a capped PMax test is queued for approval.", m: "₹34.8", mGood: true, src: ["google"], note: "queued" },
  { tag: "ATTRIBUTION", tagC: AMBER, tagB: AMBER_SOFT, h: "Unattributed store orders at 8%", d: "8% of orders / ₹11.2L of revenue carry no last-click source — UTM hygiene gap on Meta links.", m: "8%", mGood: false, src: ["meta"], note: "needs fix" },
  { tag: "MEASUREMENT", tagC: AMBER, tagB: AMBER_SOFT, h: "Blended MER 2.64× vs Store MER 3.22×", d: "App-install spend drags the blended number — judge the store on Store MER, the app on CPI.", m: "2.64×", mGood: false, src: ["meta", "google"], note: "" },
];
const APPROVAL_CARDS = [
  { id: "a1", ag: "MB", agBg: GREEN_SOFT, agFg: GREEN_TX, title: "Scale Advantage+ Shopping budget", tag: "SPEND", tagC: "#3b5bdb", tagB: "var(--blue-soft)", desc: "ROAS held at 4.18× (target 3.0×) for 5 straight days. More budget should compound while efficiency is high.", stats: [["CURRENT", "₹3,200/day", ""], ["PROPOSED", "₹4,500/day", ACCENT]], cap: 75, capNote: "₹4,500 of ₹6,000/day cap · +₹1,300/day impact" },
  { id: "a2", ag: "MB", agBg: GREEN_SOFT, agFg: GREEN_TX, title: "Launch PMax — App installs (YouTube)", tag: "SPEND", tagC: "#3b5bdb", tagB: "var(--blue-soft)", desc: "CPI trending down 12% week-over-week. A capped PMax test can capture cheaper installs before CPMs climb.", stats: [["NEW BUDGET", "₹2,000/day", ACCENT], ["TARGET CPI", "₹32", ""]], cap: 33, capNote: "₹2,000 of ₹6,000/day cap · spend cap ₹2,000/day" },
  { id: "a3", ag: "CP", agBg: "var(--coral-soft)", agFg: "var(--coral)", title: "Publish 3 UGC variants", tag: "CREATIVE", tagC: "var(--coral)", tagB: "var(--coral-soft)", desc: "Current hooks fatiguing — CPM up 14% over 7 days. New AI-generated UGC angles are disclosure-labeled per platform policy.", stats3: [["VARIANTS", "3 assets", ""], ["SPEND IMPACT", "₹0", GREEN_TX], ["LABEL", "AI-disclosed", ""]] },
];
const LOOP = [
  { name: "Audit", role: "Research & intelligence", av: "RI", avBg: "var(--blue-soft)", avFg: "#3b5bdb", state: "done" },
  { name: "Creative", role: "Creative production", av: "CP", avBg: AMBER_SOFT, avFg: AMBER, state: "active" },
];
const RUN_HISTORY = [
  { id: "#141", av: "CP", avBg: AMBER_SOFT, avFg: AMBER, t: "Creative refresh — 8 hooks shipped", s: "Creative production · 6h ago", v: "+₹42K" },
  { id: "#140", av: "RI", avBg: "var(--blue-soft)", avFg: "#3b5bdb", t: "Audit — surfaced 3 scale opportunities", s: "Research & intelligence · 14h ago", v: "+₹28K" },
  { id: "#139", av: "CP", avBg: AMBER_SOFT, avFg: AMBER, t: "Creative — 3 UGC variants generated", s: "Creative production · 1d ago", v: "+₹9K" },
];

const DISCLAIMER = `* Modeled — not yet from a live connector. Store conversion rate & sessions come from GA4 (the Shopify Admin API exposes orders, not sessions); Meta figures are projected until the Marketing API connection is approved. Live today: Google Ads (spend · installs · CPI · campaign types) and Shopify (orders · sales · AOV · products · customers). Other values are realistic placeholders.`;

// mini reusable chart pieces
function MiniSpark({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 120 36" preserveAspectRatio="none" style={{ width: "100%", height: 40, marginTop: 12, display: "block" }}>
      <path d={`${d} L120 36 L0 36 Z`} fill={ACCENT_SOFT} /><path d={d} fill="none" stroke={ACCENT} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ── formatters ───────────────────────────────────────────────────────────────
function inr(cents: number): string {
  const r = cents / 100;
  if (r >= 1e7) return "₹" + (r / 1e7).toFixed(2) + "Cr";
  if (r >= 1e5) return "₹" + (r / 1e5).toFixed(2) + "L";
  if (r >= 1000) return "₹" + Math.round(r).toLocaleString("en-IN");
  return "₹" + Math.round(r);
}
const kfmt = (n: number) => (n >= 1e5 ? (n / 1e5).toFixed(1) + "L" : n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(Math.round(n)));
const merx = (x: number) => x.toFixed(2) + "×";
const num = (n: number) => Math.round(n).toLocaleString("en-IN");
function svgPath(vals: number[], w: number, h: number): { line: string; area: string; pts: number[][] } {
  if (vals.length < 2) return { line: "", area: "", pts: [] };
  const max = Math.max(...vals), min = Math.min(...vals), rng = max - min || 1;
  const pts = vals.map((v, i) => [(i / (vals.length - 1)) * w, h - 8 - ((v - min) / rng) * (h - 16)]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  return { line, area: `${line} L ${w} ${h} L 0 ${h} Z`, pts };
}
// processors behind recurring app-purchase subscriptions
const PAY = [
  { id: "razorpay", name: "Razorpay", share: 0.36, file: "razorpay.png" },
  { id: "upi", name: "UPI", share: 0.28, file: "upi.webp" },
  { id: "stripe", name: "Stripe", share: 0.22, file: "stripe.png" },
  { id: "paypal", name: "PayPal", share: 0.14, file: "paypal.svg" },
];

// modeled fallback when the engine isn't connected (static demo / CI)
function modeledRange(days: number): RangeData {
  const sDaily: { date: string; revenueCents: number }[] = [];
  const gDaily: { date: string; spendCents: number }[] = [];
  let rev = 0, spend = 0;
  for (let i = days - 1; i >= 0; i--) {
    const wave = 1 + Math.sin(i / 3) * 0.18 + Math.cos(i / 5.3) * 0.1;
    const rc = Math.round(15_000_000 * wave), sc = Math.round(5_600_000 * wave);
    sDaily.push({ date: "", revenueCents: rc }); gDaily.push({ date: "", spendCents: sc });
    rev += rc; spend += sc;
  }
  const orders = Math.max(1, Math.round(rev / 76_950));
  const recurring = Math.round(rev * 0.38);
  const metaRevenue = Math.round(rev * 0.74), metaSpend = Math.round(metaRevenue / 3.22);
  const totalRev = rev + recurring, totalSpend = spend + metaSpend;
  return {
    days,
    store: { revenueCents: rev, orders, aovCents: Math.round(rev / orders), newCustomers: Math.round(orders * 0.71), daily: sDaily, flag: "estimated" },
    subscriptions: { recurringCents: recurring, activeSubs: Math.round(orders * 0.55), mrrCents: days >= 28 ? Math.round(recurring * (28 / days)) : recurring, byProvider: PAY.map((p) => ({ id: p.id, name: p.name, cents: Math.round(recurring * p.share) })), flag: "estimated" },
    google: { spendCents: spend, installs: Math.round(orders * 2.4), cpiCents: Math.round(spend / Math.max(1, orders * 2.4)), impressions: Math.round(spend / 24), clicks: Math.round(spend / 550), daily: gDaily, flag: "estimated" },
    meta: { spendCents: metaSpend, purchases: Math.round(orders * 0.62), revenueCents: metaRevenue, roas: 3.22, flag: "estimated" },
    totals: { storeRevenueCents: totalRev, totalSpendCents: totalSpend, blendedMer: totalRev / totalSpend, storeMer: totalRev / metaSpend },
  };
}
const FALLBACK: Record<RangeKey, RangeData> = { "7D": modeledRange(7), "28D": modeledRange(28), "90D": modeledRange(90) };

// payment-processor chip (real Stripe/PayPal logos; styled mark for Razorpay/UPI)
function PayChip({ id, size = 30 }: { id: string; size?: number }) {
  const p = PAY.find((x) => x.id === id)!;
  return (
    <span style={{ width: size, height: size, borderRadius: 9, background: "var(--card)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${BP}/logos/${p.file}`} alt={p.name} style={{ width: size * 0.74, height: size * 0.74, objectFit: "contain" }} />
    </span>
  );
}

export default function EngineV5({ onSignOut, cockpit = null, locked = false, brand: brandProp, user }: { onSignOut?: () => void; cockpit?: CockpitData | null; locked?: boolean; brand?: CockpitBrand; user?: CockpitUser } = {}) {
  // Brand: per-tenant when provided, else the global demo brand.
  const brand: CockpitBrand = brandProp ?? { name: BRAND.name, mono: BRAND.mono, logoSrc: BRAND.logo ? "/logos/astrotime.png" : null, shopifySlug: BRAND.slug };
  // The signed-in member (their real name/role) — used as the viewer when present.
  const meMember: Member | null = user
    ? { id: "me", name: user.name, initials: (user.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?"), color: "#4F5BD5", org: brand.name, title: user.role[0].toUpperCase() + user.role.slice(1), role: user.role }
    : null;
  const [page, setPage] = useState<Page>("overview");
  const [range, setRange] = useState<RangeKey>("28D");
  const [panelOpen, setPanelOpen] = useState(true);
  const D = cockpit?.ranges?.[range] ?? FALLBACK[range];
  const live = D.store.flag === "live";
  const [tickets, setTickets] = useState<Ticket[]>(SEED_TICKETS);
  const [viewer, setViewer] = useState<Member>(meMember ?? MEMBERS[1]); // real signed-in member, or demo default
  const [tfilter, setTfilter] = useState<string>("all"); // tickets board filter (all | mine | <type>)
  const pending = tickets.filter((t) => t.status === "awaiting").length;
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    // Default to LIGHT. Only honor an explicit prior choice — no system-preference
    // auto-dark. Fresh key (v5theme2) so a previously auto-persisted "dark" is ignored.
    try { if (localStorage.getItem("v5theme2") === "dark") setTheme("dark"); } catch { /* ignore */ }
  }, []);
  useEffect(() => { try { localStorage.setItem("v5theme2", theme); } catch { /* ignore */ } }, [theme]);

  // ── chrome pieces ──────────────────────────────────────────────────────────
  const railBtn = (id: Page, icon: ReactNode, label: string, active: boolean, badge?: number) => (
    <div title={label} onClick={() => { if (active) setPanelOpen((o) => !o); else setPage(id); }} className={active ? undefined : "v5-nav"} style={{ position: "relative", width: 46, height: 46, borderRadius: 13, background: active ? ACCENT_SOFT : "transparent", color: active ? ACCENT : "var(--ink3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
      {active && <div style={{ position: "absolute", left: -18, width: 4, height: 24, borderRadius: "0 4px 4px 0", background: ACCENT }} />}
      {icon}
      {badge ? <span style={{ position: "absolute", top: 7, right: 7, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 8, background: RED, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--card)" }}>{badge}</span> : null}
    </div>
  );

  const Rail = (
    <div style={{ width: 76, background: CARD, borderRight: `1px solid ${LINE}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "18px 0", flexShrink: 0, zIndex: 3 }}>
      <div style={{ width: 46, height: 46, borderRadius: 14, background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22, flexShrink: 0, padding: "0 7px" }}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={`${BP}/logos/roi-mark.png`} alt="ROI Labs" style={{ width: "100%", objectFit: "contain", display: "block" }} /></div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        {railBtn("overview", RAIL.overview, "Overview", page === "overview")}
        {railBtn("approvals", RAIL.approvals, "Approvals", page === "approvals", pending)}
        {railBtn("runs", RAIL.runs, "Runs", page === "runs")}
        {railBtn("activity", RAIL.activity, "Activity", page === "activity")}
      </div>
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: "var(--ink3)" }}>
        <div title="Settings" className="v5-nav" style={{ width: 46, height: 46, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>{RAIL.settings}</div>
        <div title="Help" className="v5-nav" style={{ width: 46, height: 46, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>{RAIL.help}</div>
      </div>
    </div>
  );

  const sourceRow = (id: "google" | "meta" | "shopify", name: string) => (
    <div onClick={() => setPage(id)} className="v5-src" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: `1px solid ${LINE}`, borderRadius: 13, cursor: "pointer" }}>
      <SrcLogo id={id} />
      <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div><div style={{ fontSize: 12, color: INK4 }}>Synced 6m ago</div></div>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN }} />
      <span style={{ color: "var(--ink4)" }}>{RAIL.chevR}</span>
    </div>
  );

  const tCounts: Record<string, number> = { all: tickets.length, mine: tickets.filter((t) => t.approverId === viewer.id).length, budget: tickets.filter((t) => t.type === "budget").length, creative: tickets.filter((t) => t.type === "creative").length, campaign: tickets.filter((t) => t.type === "campaign").length, tracking: tickets.filter((t) => t.type === "tracking").length };
  const pItem = (label: string, key: string) => (
    <button key={key} onClick={() => setTfilter(key)} className="v5-row" style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", border: "none", background: tfilter === key ? ACCENT_SOFT : "transparent", color: tfilter === key ? ACCENT : "#3a3f4d", borderRadius: 10, padding: "9px 11px", cursor: "pointer", textAlign: "left", fontSize: 13.5, fontWeight: tfilter === key ? 600 : 500 }}>
      <span style={{ flex: 1 }}>{label}</span>
      <span style={{ fontFamily: FM, fontSize: 11, color: tfilter === key ? ACCENT : INK4, background: tfilter === key ? "#fff" : "var(--line)", borderRadius: 7, padding: "1px 7px" }}>{tCounts[key]}</span>
    </button>
  );
  const sourcesBody = (
    <>
      <div style={{ ...monoLabel, margin: "26px 0 12px 4px" }}>CONNECTED SOURCES</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>{sourceRow("google", "Google")}{sourceRow("meta", "Meta")}{sourceRow("shopify", "Shopify")}</div>
      <div style={{ ...monoLabel, margin: "26px 0 12px 4px" }}>ENGINE</div>
      <div style={{ background: SUBTLE, border: `1px solid ${LINE}`, borderRadius: 16, padding: 16 }}>
        <div style={{ ...monoLabel, fontSize: 10.5, letterSpacing: "1.2px", marginBottom: 7 }}>DAILY SPEND</div>
        <div style={{ fontWeight: 700, fontSize: 22, color: INK, marginBottom: 12 }}>₹4.5K <span style={{ fontSize: 14, fontWeight: 500, color: INK4 }}>/ ₹6K cap</span></div>
        <div style={{ height: 8, borderRadius: 6, background: "var(--line)", overflow: "hidden" }}><div style={{ width: "75%", height: "100%", borderRadius: 6, background: ACCENT }} /></div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 13 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN, animation: "pulse 2s infinite" }} /><span style={{ fontSize: 13, fontWeight: 600, color: GREEN }}>Engine active</span></div>
          <span style={{ fontSize: 12, color: INK4 }}>Run #142</span>
        </div>
      </div>
    </>
  );
  const ticketsBody = (
    <>
      <div style={{ ...monoLabel, margin: "24px 0 6px 4px" }}>VIEWS</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>{pItem("All tickets", "all")}{pItem("My approvals", "mine")}</div>
      <div style={{ ...monoLabel, margin: "20px 0 6px 4px" }}>BY TYPE</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>{pItem("Budget", "budget")}{pItem("Creative", "creative")}{pItem("Campaign", "campaign")}{pItem("Tracking", "tracking")}</div>
      <div style={{ ...monoLabel, margin: "20px 0 10px 4px" }}>TEAM</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>{MEMBERS.map((m) => <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>{mav(m, 30)}<div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12.5, fontWeight: 600 }}>{m.name}</div><div style={{ fontSize: 10.5, color: INK4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.title}</div></div></div>)}</div>
    </>
  );
  const runsBody = (
    <>
      <div style={{ ...monoLabel, margin: "24px 0 10px 4px" }}>THE LOOP</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>{([["Audit", "done"], ["Creative", "active"]] as [string, string][]).map(([n, st]) => <div key={n} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", border: `1px solid ${LINE}`, borderRadius: 11 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: st === "done" ? GREEN : st === "active" ? ACCENT : "var(--ink3)", animation: st === "active" ? "pulse 2s infinite" : "none" }} /><span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{n}</span><span style={{ fontFamily: FM, fontSize: 9, letterSpacing: ".5px", color: st === "done" ? GREEN_TX : st === "active" ? ACCENT : INK4 }}>{st.toUpperCase()}</span></div>)}</div>
      <div style={{ ...monoLabel, margin: "22px 0 10px 4px" }}>RECENT RUNS</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>{([["#141", "+₹42K"], ["#140", "+₹28K"], ["#139", "+₹9K"]] as [string, string][]).map(([id, v]) => <div key={id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 11px", border: `1px solid ${LINE}`, borderRadius: 11 }}><span style={{ fontFamily: FM, fontSize: 12, color: INK4 }}>{id}</span><span style={{ fontSize: 12.5, fontWeight: 700, color: GREEN_TX }}>{v}</span></div>)}</div>
    </>
  );
  const activityBody = (
    <>
      <div style={{ ...monoLabel, margin: "24px 0 10px 4px" }}>AGENTS</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>{([["RI", "Research & intel", "#3b5bdb", "var(--blue-soft)"], ["CP", "Creative", "var(--amber)", "var(--amber-soft)"], ["MB", "Media buying", "var(--green-tx)", "var(--green-soft)"], ["MA", "Measurement", "var(--coral)", "var(--coral-soft)"]] as [string, string, string, string][]).map(([s, n, fg, bg]) => <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 11px", border: `1px solid ${LINE}`, borderRadius: 11 }}><span style={{ width: 26, height: 26, borderRadius: 8, background: bg, color: fg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 10 }}>{s}</span><span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{n}</span></div>)}</div>
    </>
  );
  const Panel = (
    <div style={{ width: 296, background: CARD, borderRight: `1px solid ${LINE}`, display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto", padding: "26px 20px", zIndex: 2 }}>
      <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: 12, display: "flex", alignItems: "center", gap: 11, cursor: "pointer", boxShadow: "0 1px 2px rgba(27,36,64,.04)" }}>
        <BrandMark logoSrc={brand.logoSrc} mono={brand.mono} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ color: INK, fontWeight: 600, fontSize: 14 }}>{brand.name}</div></div>
        <span style={{ color: INK3, fontSize: 18, lineHeight: 1 }}>⋮</span>
      </div>
      {page === "approvals" ? ticketsBody : page === "runs" ? runsBody : page === "activity" ? activityBody : sourcesBody}
    </div>
  );

  const TITLES: Record<Page, { t: string; tag: string; tagC: string; tagB: string; sub: string }> = {
    overview: { t: brand.name, tag: "BLENDED", tagC: "#3b5bdb", tagB: "var(--blue-soft)", sub: "" },
    profile: { t: "Profile", tag: "ACCOUNT", tagC: ACCENT, tagB: ACCENT_SOFT, sub: "" },
    google: { t: "Google", tag: "APP · VIDEO", tagC: AMBER, tagB: AMBER_SOFT, sub: "App installs & YouTube · last 28 days" },
    meta: { t: "Meta", tag: "STORE FUNNEL", tagC: "#3b5bdb", tagB: "var(--blue-soft)", sub: "Shopify store purchases · last 28 days" },
    shopify: { t: "Shopify", tag: "REVENUE TRUTH", tagC: GREEN_TX, tagB: GREEN_SOFT, sub: `${brand.shopifySlug}.myshopify.com · last 28 days` },
    runs: { t: "Runs", tag: "AGENT LOOP", tagC: "#6c5ce7", tagB: "var(--violet-soft)", sub: "Audit → Creative" },
    activity: { t: "Activity", tag: "AUDIT LOG", tagC: INK6, tagB: "var(--line)", sub: "Every agent decision, logged" },
    approvals: { t: "Tickets", tag: "BOARD", tagC: "#6c5ce7", tagB: "var(--violet-soft)", sub: "Propose → approve → execute · role-gated change control" },
  };

  const Topbar = (
    <div style={{ height: 70, flexShrink: 0, background: CARD, borderBottom: `1px solid ${LINE}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", zIndex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11, background: APP, borderRadius: 12, padding: "11px 15px", width: 380, color: INK3 }}>{RAIL.search}<span style={{ fontSize: 14 }}>Search metrics, sources, runs…</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: APP, borderRadius: 20, padding: "7px 13px" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN }} /><span style={{ fontSize: 13, color: INK6, fontWeight: 500 }}>Synced 6m ago</span></div>
        <div onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} className="v5-ic" style={{ width: 40, height: 40, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", color: INK4, cursor: "pointer" }}>{theme === "dark"
          ? <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
          : <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>}</div>
        <div className="v5-ic" style={{ position: "relative", width: 40, height: 40, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", color: INK4, cursor: "pointer" }}>{RAIL.bell}<span style={{ position: "absolute", top: 9, right: 10, width: 8, height: 8, borderRadius: "50%", background: RED, border: "2px solid var(--card)" }} /></div>
        <div style={{ width: 1, height: 28, background: LINE }} />
        <div onClick={() => setPage("profile")} className="v5-ic" style={{ display: "flex", alignItems: "center", gap: 11, cursor: "pointer", borderRadius: 11, padding: "4px 8px 4px 4px" }}>
          {mav(viewer, 38)}
          <div><div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>{viewer.name}</div><div style={{ fontSize: 11.5, color: INK4 }}>{viewer.title}</div></div>
          <span style={{ color: INK3 }}>{RAIL.chevD}</span>
        </div>
      </div>
    </div>
  );

  // ── page header (store/project header for Overview; simpler for others) ──────
  const PageHead = (
    page === "overview" || page === "profile" ? null : (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {page === "google" || page === "meta" || page === "shopify"
            ? <SrcLogo id={page} size={54} radius={15} />
            : <span style={{ width: 54, height: 54, borderRadius: 15, background: page === "approvals" ? AMBER_SOFT : page === "runs" ? "var(--violet-soft)" : "var(--line)", color: page === "approvals" ? AMBER : page === "runs" ? "#6c5ce7" : INK6, display: "flex", alignItems: "center", justifyContent: "center" }}>{page === "approvals" ? RAIL.approvals : page === "runs" ? RAIL.runs : RAIL.activity}</span>}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ fontSize: 25, fontWeight: 700, letterSpacing: "-.4px" }}>{TITLES[page].t}</div>
              <span style={{ fontFamily: FM, fontSize: 10, letterSpacing: "1.2px", background: TITLES[page].tagB, color: TITLES[page].tagC, padding: "4px 9px", borderRadius: 20 }}>{TITLES[page].tag}</span>
            </div>
            <div style={{ fontSize: 13, color: INK4 }}>{TITLES[page].sub}</div>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="v5root" data-theme={theme} style={{ zoom: 0.8, display: "flex", height: "125vh", width: "125vw", overflow: "hidden", fontFamily: FD, color: INK, background: APP, WebkitFontSmoothing: "antialiased" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        ${THEME_CSS}
        @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(43,191,122,.5)}70%{box-shadow:0 0 0 7px rgba(43,191,122,0)}100%{box-shadow:0 0 0 0 rgba(43,191,122,0)}}
        @keyframes drawline{from{stroke-dashoffset:1700}to{stroke-dashoffset:0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        .v5sc::-webkit-scrollbar{width:9px;height:9px}.v5sc::-webkit-scrollbar-thumb{background:#dfe2ea;border-radius:8px}
        .v5-nav{transition:background .15s,color .15s}.v5-nav:hover{background:#f5f6fa;color:#4f5bd5}
        .v5-src{transition:border-color .15s,background .15s}.v5-src:hover{border-color:#dfe3ee;background:#fafbfc}
        .v5-card{transition:box-shadow .18s,transform .18s}.v5-card:hover{box-shadow:0 8px 26px rgba(27,36,64,.10)}
        .v5-tab{transition:color .15s}.v5-tab:hover{color:#1b2440}
        .v5-navy{transition:background .15s}.v5-navy:hover{background:#28345a}
        .v5-ghost{transition:border-color .15s,color .15s}.v5-ghost:hover{border-color:#ef6b6b!important;color:#ef6b6b!important}
        .v5-accent{transition:filter .15s}.v5-accent:hover{filter:brightness(1.08)}
        .v5-ic{transition:background .15s}.v5-ic:hover{background:#f3f5f9}
        .v5-row{transition:background .12s}.v5-row:hover{background:#fafbfc}`}</style>
      {Rail}
      {panelOpen && Panel}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {Topbar}
        <div className="v5sc" style={{ flex: 1, overflowY: locked ? "hidden" : "auto", padding: "24px 28px 40px", position: "relative" }}>
          <div style={locked ? { filter: "blur(7px)", pointerEvents: "none", userSelect: "none" } : undefined} aria-hidden={locked || undefined}>
            {PageHead}
            {page === "overview" && <Overview D={D} range={range} setRange={setRange} live={live} pending={pending} setPage={setPage} />}
            {page === "approvals" && <TicketsBoard tickets={tickets} setTickets={setTickets} viewer={viewer} setViewer={setViewer} tfilter={tfilter} />}
            {page === "runs" && <Runs setPage={setPage} setTickets={setTickets} viewer={viewer} />}
            {(page === "google" || page === "meta" || page === "shopify") && <SourcePage page={page} />}
            {page === "activity" && <Activity />}
            {page === "profile" && <Profile viewer={viewer} setViewer={setViewer} onSignOut={onSignOut} brand={brand} realEmail={user?.email} />}
          </div>
          {locked && <LockGate onSignOut={onSignOut} />}
        </div>
      </div>
    </div>
  );
}

// ── LOCKED TEASER (post-login on engine.roilabs.in) ────────────────────────────
function LockGate({ onSignOut }: { onSignOut?: () => void }) {
  const book = process.env.NEXT_PUBLIC_BOOK_CALL_URL || "https://calendly.com/mohnish-nagar-roilabs/30min";
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 20 }}>
      <div style={{ ...card, maxWidth: 480, width: "100%", padding: 38, textAlign: "center" }}>
        <div style={{ width: 58, height: 58, borderRadius: 16, background: ACCENT_SOFT, color: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
        </div>
        <div style={{ fontSize: 23, fontWeight: 700, letterSpacing: "-.4px", marginBottom: 11 }}>Your revenue cockpit is ready</div>
        <div style={{ fontSize: 14.5, color: INK4, lineHeight: 1.6, marginBottom: 26, maxWidth: 380, marginLeft: "auto", marginRight: "auto" }}>Book a 20-minute demo call — we&apos;ll connect your Google, Meta &amp; Shopify and unlock live metrics, approvals and the AI ad-ops engine for your store.</div>
        <a href={book} target="_blank" rel="noopener noreferrer" className="v5-accent" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: ACCENT, color: "#fff", fontWeight: 600, fontSize: 15, padding: "14px 28px", borderRadius: 13, textDecoration: "none" }}>Book a demo call →</a>
        {onSignOut && <div style={{ marginTop: 20 }}><button onClick={onSignOut} style={{ background: "none", border: "none", color: INK4, fontSize: 13, cursor: "pointer" }}>Sign out</button></div>}
      </div>
    </div>
  );
}

// ── OVERVIEW ──────────────────────────────────────────────────────────────────
const fbadge = (f: Flag): ReactNode => <span style={{ fontFamily: FM, fontSize: 9, letterSpacing: ".5px", padding: "2px 6px", borderRadius: 5, background: f === "live" ? GREEN_SOFT : "#FFF6E4", color: f === "live" ? GREEN_TX : AMBER }}>{f === "live" ? "LIVE" : "EST"}</span>;
type Flag = "live" | "estimated";

function Overview({ D, range, setRange, pending, setPage }: { D: RangeData; range: RangeKey; setRange: (r: RangeKey) => void; live: boolean; pending: number; setPage: (p: Page) => void }) {
  const rw = `Last ${D.days} days`;
  const sp = svgPath(D.store.daily.map((d) => d.revenueCents), 760, 200);
  const gp = svgPath(D.google.daily.map((d) => d.spendCents), 760, 200);
  const spts = sp.pts, gpts = gp.pts;
  const [hi, setHi] = useState<number | null>(null);
  const gIdx = hi != null && spts.length > 1 ? Math.round((hi / (spts.length - 1)) * (gpts.length - 1)) : null;
  const xs = D.store.daily.filter((d) => d.date).map((d) => d.date);
  const gPct = D.totals.totalSpendCents ? Math.round((D.google.spendCents / D.totals.totalSpendCents) * 100) : 50;
  const mPct = 100 - gPct;
  const kpis: { t: string; v: string; src: string; sc: string; sb: string; sp: string; flag: Flag }[] = [
    { t: "Orders", v: num(D.store.orders), src: "SHOPIFY", sc: "#6c5ce7", sb: "var(--violet-soft)", sp: "M0 30 L20 26 L40 27 L60 21 L80 22 L100 14 L120 9", flag: D.store.flag },
    { t: "AOV", v: inr(D.store.aovCents), src: "SHOPIFY", sc: "#6c5ce7", sb: "var(--violet-soft)", sp: "M0 26 L20 27 L40 23 L60 24 L80 19 L100 18 L120 12", flag: D.store.flag },
    { t: "New customers", v: kfmt(D.store.newCustomers), src: "SHOPIFY", sc: "#6c5ce7", sb: "var(--violet-soft)", sp: "M0 29 L20 26 L40 24 L60 22 L80 20 L100 15 L120 9", flag: D.store.flag },
    { t: "Subscription MRR", v: inr(D.subscriptions.mrrCents), src: "RECURRING", sc: ACCENT, sb: ACCENT_SOFT, sp: "M0 28 L20 25 L40 23 L60 20 L80 18 L100 13 L120 8", flag: "estimated" },
  ];
  return (
    <>
      {/* hero: revenue streams */}
      <div style={{ ...card, padding: 28, marginBottom: 18, display: "flex", gap: 36, animation: "fadeUp .5s ease both" }}>
        <div style={{ flex: "0 0 42%" }}>
          <div style={{ ...monoLabel, display: "flex", alignItems: "center", gap: 8 }}>REVENUE STREAMS <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--ink3)" }} /> {rw.toUpperCase()}</div>
          <div style={{ display: "flex", gap: 28, marginTop: 18 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FM, fontSize: 10.5, letterSpacing: ".6px", color: INK4, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>STORE · SHOPIFY {fbadge(D.store.flag)}</div>
              <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-1px" }}>{inr(D.store.revenueCents)}</div>
              <div style={{ fontSize: 13, color: INK4, marginTop: 3 }}>Purchases · <span style={{ color: INK, fontWeight: 600 }}>{num(D.store.orders)} orders</span></div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FM, fontSize: 10.5, letterSpacing: ".6px", color: INK4, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>SUBSCRIPTIONS {fbadge("estimated")}</div>
              <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-1px" }}>{inr(D.subscriptions.recurringCents)}</div>
              <div style={{ fontSize: 13, color: INK4, marginTop: 3 }}>Recurring · <span style={{ color: ACCENT, fontWeight: 600 }}>{num(D.subscriptions.activeSubs)} active</span></div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
            <div style={{ flex: 1, background: SUBTLE, borderRadius: 15, padding: 15 }}><div style={{ ...monoLabel, fontSize: 10, letterSpacing: "1px", marginBottom: 6 }}>TOTAL REVENUE</div><div style={{ fontSize: 23, fontWeight: 700 }}>{inr(D.totals.storeRevenueCents)}</div></div>
            <div style={{ flex: 1, background: SUBTLE, borderRadius: 15, padding: 15 }}><div style={{ ...monoLabel, fontSize: 10, letterSpacing: "1px", marginBottom: 6 }}>BLENDED MER</div><div style={{ fontSize: 23, fontWeight: 700 }}>{merx(D.totals.blendedMer)}</div></div>
          </div>
        </div>
        <div style={{ flex: 1, borderLeft: "1px solid var(--line)", paddingLeft: 36, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 18 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: INK6, fontWeight: 500 }}><span style={{ width: 11, height: 3, borderRadius: 2, background: ACCENT }} />Store revenue</span>
              <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: INK6, fontWeight: 500 }}><span style={{ width: 11, height: 3, borderRadius: 2, background: "var(--ink4)" }} />Ad spend</span>
            </div>
            <div style={{ display: "flex", gap: 4, background: "var(--line)", borderRadius: 10, padding: 3 }}>{(["7D", "28D", "90D"] as RangeKey[]).map((r) => <div key={r} onClick={() => setRange(r)} style={{ padding: "5px 11px", borderRadius: 7, fontSize: 12, fontWeight: range === r ? 600 : 500, color: range === r ? ACCENT : INK4, background: range === r ? "#fff" : "transparent", boxShadow: range === r ? "0 1px 3px rgba(27,36,64,.08)" : "none", cursor: "pointer" }}>{r}</div>)}</div>
          </div>
          <div style={{ position: "relative" }} onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); const f = (e.clientX - r.left) / r.width; if (spts.length > 1) setHi(Math.max(0, Math.min(spts.length - 1, Math.round(f * (spts.length - 1))))); }} onMouseLeave={() => setHi(null)}>
            <svg viewBox="0 0 760 200" preserveAspectRatio="none" style={{ width: "100%", height: 206, display: "block" }}>
              <defs><linearGradient id="v5area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={ACCENT} stopOpacity="0.16" /><stop offset="1" stopColor={ACCENT} stopOpacity="0" /></linearGradient></defs>
              {sp.area && <path d={sp.area} fill="url(#v5area)" />}
              {gp.line && <path d={gp.line} fill="none" stroke="var(--ink4)" strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />}
              {sp.line && <path d={sp.line} fill="none" stroke={ACCENT} strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round" />}
              {hi != null && spts[hi] && (<>
                <line x1={spts[hi][0]} y1={0} x2={spts[hi][0]} y2={200} stroke="#d2d6e6" strokeWidth={1.4} strokeDasharray="3 4" />
                {gIdx != null && gpts[gIdx] && <circle cx={gpts[gIdx][0]} cy={gpts[gIdx][1]} r={4} fill="#fff" stroke="var(--ink3)" strokeWidth={2.5} />}
                <circle cx={spts[hi][0]} cy={spts[hi][1]} r={4.5} fill="#fff" stroke={ACCENT} strokeWidth={2.5} />
              </>)}
            </svg>
            {hi != null && spts[hi] && (
              <div style={{ position: "absolute", top: 2, left: `${(spts[hi][0] / 760) * 100}%`, transform: spts[hi][0] > 500 ? "translateX(calc(-100% - 12px))" : "translateX(12px)", pointerEvents: "none", background: NAVY, color: "#fff", borderRadius: 11, padding: "10px 13px", boxShadow: "0 12px 28px rgba(27,36,64,.28)", zIndex: 6, whiteSpace: "nowrap" }}>
                <div style={{ fontFamily: FM, fontSize: 10, color: "rgba(255,255,255,.55)", marginBottom: 8 }}>{D.store.daily[hi]?.date || rw}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, marginBottom: 5 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: ACCENT }} />Store revenue<b style={{ marginLeft: 18, fontWeight: 700 }}>{inr(D.store.daily[hi].revenueCents)}</b></div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: "var(--ink3)" }} />Ad spend<b style={{ marginLeft: 18, fontWeight: 700 }}>{gIdx != null && D.google.daily[gIdx] ? inr(D.google.daily[gIdx].spendCents) : "—"}</b></div>
              </div>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontFamily: FM, fontSize: 10.5, color: "#b3bac8" }}>
            {xs.length ? [xs[0], xs[Math.floor(xs.length / 2)], xs[xs.length - 1]].map((d, i) => <span key={i}>{d}</span>) : <span>{rw}</span>}
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 18 }}>
        {kpis.map((k) => (
          <div key={k.t} className="v5-card" style={{ ...card, borderRadius: 18, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><span style={{ fontSize: 14, fontWeight: 600 }}>{k.t}</span><span style={{ fontFamily: FM, fontSize: 9.5, letterSpacing: "1px", background: k.sb, color: k.sc, padding: "3px 7px", borderRadius: 6 }}>{k.src}</span></div>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-.5px", marginTop: 9 }}>{k.v}</div>
            <div style={{ fontSize: 12.5, marginTop: 3 }}>{fbadge(k.flag)} <span style={{ color: INK3 }}>· {rw.toLowerCase()}</span></div>
            <MiniSpark d={k.sp} />
          </div>
        ))}
      </div>

      {/* three revenue/source cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 18 }}>
        <div className="v5-card" style={{ ...card, borderRadius: 20, padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}><SrcLogo id="shopify" size={40} radius={11} /><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 15.5, fontWeight: 600 }}>Store · Shopify</div><div style={{ fontSize: 12, color: INK4 }}>One-time purchases</div></div><span style={{ fontFamily: FM, fontSize: 9, letterSpacing: "1px", background: GREEN_SOFT, color: GREEN_TX, padding: "4px 8px", borderRadius: 7 }}>TRUTH</span></div>
          <div style={{ display: "flex", gap: 18, marginTop: 18 }}>{[[inr(D.store.revenueCents), "Revenue"], [num(D.store.orders), "Orders"], [inr(D.store.aovCents), "AOV"]].map((s, i) => <div key={i}><div style={{ fontSize: 20, fontWeight: 700 }}>{s[0]}</div><div style={{ fontSize: 11.5, color: INK4, marginTop: 2 }}>{s[1]}</div></div>)}</div>
          <div style={{ marginTop: 16, paddingTop: 13, borderTop: "1px solid var(--line)", fontSize: 12, color: GREEN_TX, display: "flex", alignItems: "center", gap: 6 }}>{fbadge(D.store.flag)} Shopify Admin API — revenue truth.</div>
        </div>
        <div className="v5-card" style={{ ...card, borderRadius: 20, padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ width: 40, height: 40, borderRadius: 11, background: ACCENT_SOFT, color: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{RAIL.activity}</span><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 15.5, fontWeight: 600 }}>Subscriptions</div><div style={{ fontSize: 12, color: INK4 }}>Recurring app purchases</div></div><span style={{ fontFamily: FM, fontSize: 9, letterSpacing: "1px", background: ACCENT_SOFT, color: ACCENT, padding: "4px 8px", borderRadius: 7 }}>RECURRING</span></div>
          <div style={{ display: "flex", gap: 18, marginTop: 18 }}>{[[inr(D.subscriptions.recurringCents), "Recurring"], [inr(D.subscriptions.mrrCents), "MRR"], [num(D.subscriptions.activeSubs), "Active"]].map((s, i) => <div key={i}><div style={{ fontSize: 20, fontWeight: 700, color: i === 1 ? ACCENT : INK }}>{s[0]}</div><div style={{ fontSize: 11.5, color: INK4, marginTop: 2 }}>{s[1]}</div></div>)}</div>
          <div style={{ marginTop: 16, paddingTop: 13, borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 8 }}>{PAY.map((p) => <span key={p.id} title={p.name}><PayChip id={p.id} size={26} /></span>)}<span style={{ fontSize: 11, color: INK4, marginLeft: "auto" }}>{fbadge("estimated")}</span></div>
        </div>
        <div className="v5-card" style={{ ...card, borderRadius: 20, padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ display: "flex" }}><SrcLogo id="google" size={40} radius={11} /></span><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 15.5, fontWeight: 600 }}>Ad spend</div><div style={{ fontSize: 12, color: INK4 }}>Google + Meta</div></div><span style={{ fontFamily: FM, fontSize: 9, letterSpacing: "1px", background: AMBER_SOFT, color: AMBER, padding: "4px 8px", borderRadius: 7 }}>DRIVER</span></div>
          <div style={{ display: "flex", gap: 18, marginTop: 18 }}>{[[inr(D.totals.totalSpendCents), "Total"], [inr(D.google.spendCents), "Google"], [inr(D.meta.spendCents), "Meta"]].map((s, i) => <div key={i}><div style={{ fontSize: 20, fontWeight: 700 }}>{s[0]}</div><div style={{ fontSize: 11.5, color: INK4, marginTop: 2 }}>{s[1]}</div></div>)}</div>
          <div style={{ marginTop: 16, paddingTop: 13, borderTop: "1px solid var(--line)", fontSize: 12, color: AMBER, display: "flex", alignItems: "center", gap: 6 }}>{fbadge(D.google.flag)} Google live · {fbadge("estimated")} Meta modeled.</div>
        </div>
      </div>

      {/* where spend goes */}
      <div style={{ ...card, padding: 28, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}><div style={{ fontSize: 18, fontWeight: 600 }}>Where spend goes vs what it returns</div><span style={{ fontSize: 13, color: INK3 }}>{rw}</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 44 }}>
          <div>
            <div style={{ ...monoLabel, fontSize: 11, letterSpacing: "1.2px", marginBottom: 14 }}>BY SPEND · {inr(D.totals.totalSpendCents)} TOTAL</div>
            <div style={{ display: "flex", height: 11, borderRadius: 7, overflow: "hidden", marginBottom: 22 }}><div style={{ width: `${mPct}%`, background: ACCENT }} /><div style={{ width: `${gPct}%`, background: ACCENT_TINT }} /></div>
            <BarRow label="Meta — store funnel" pct={`${mPct}%`} val={inr(D.meta.spendCents)} w={mPct} c={ACCENT} />
            <div style={{ height: 18 }} />
            <BarRow label="Google — ads" pct={`${gPct}%`} val={inr(D.google.spendCents)} w={gPct} c={ACCENT_TINT} />
          </div>
          <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 44 }}>
            <div style={{ ...monoLabel, fontSize: 11, letterSpacing: "1.2px", marginBottom: 14 }}>BY OUTCOME · {inr(D.totals.storeRevenueCents)}</div>
            <BarRow2 label="Store purchases · Shopify" pct={`${Math.round((D.store.revenueCents / D.totals.storeRevenueCents) * 100)}%`} val={inr(D.store.revenueCents)} w={70} c={ACCENT} />
            <div style={{ height: 14 }} />
            <BarRow2 label="Subscriptions · recurring" pct={`${Math.round((D.subscriptions.recurringCents / D.totals.storeRevenueCents) * 100)}%`} val={inr(D.subscriptions.recurringCents)} w={30} c="#a9a6f4" />
            <div style={{ height: 18 }} />
            <div style={{ fontSize: 12, color: INK3, fontStyle: "italic", lineHeight: 1.5 }}>Total revenue blends one-time Shopify purchases with recurring subscriptions (Stripe · PayPal · Razorpay · UPI). Meta &amp; subscription splits are modeled until those connectors are live.</div>
          </div>
        </div>
      </div>

      {/* what needs attention */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}><div style={{ fontSize: 18, fontWeight: 600 }}>What needs attention</div><span style={{ fontSize: 13, color: INK3 }}>4 signals · Last 28 days</span></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
        {SIGNALS.map((s) => (
          <div key={s.h} className="v5-card" style={{ ...card, borderRadius: 18, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><span style={{ fontFamily: FM, fontSize: 9.5, letterSpacing: "1px", background: s.tagB, color: s.tagC, padding: "4px 10px", borderRadius: 20 }}>{s.tag}</span></div>
            <div style={{ fontSize: 15.5, fontWeight: 600, marginTop: 12, lineHeight: 1.35 }}>{s.h}</div>
            <div style={{ fontSize: 13, color: INK4, marginTop: 7, lineHeight: 1.5 }}>{s.d}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: s.mGood ? GREEN_TX : AMBER, background: s.mGood ? GREEN_SOFT : AMBER_SOFT, border: `1px solid ${s.mGood ? "#bce6d4" : "#f0dcb0"}`, padding: "5px 11px", borderRadius: 9 }}>{s.m}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ display: "flex" }}>{s.src.map((id, i) => <span key={id} style={{ marginLeft: i ? -9 : 0, borderRadius: "50%", border: "2px solid var(--card)" }}><SrcLogo id={id as "google" | "meta" | "shopify"} size={26} radius={999} /></span>)}</div>{s.note && <span style={{ fontSize: 11.5, color: INK3 }}>{s.note}</span>}</div>
            </div>
          </div>
        ))}
      </div>

      {/* GA4 audience & acquisition */}
      <Ga4Audience range={range} />

      {/* engine bar */}
      <div style={{ background: "linear-gradient(120deg,#1b2440,#27315a)", borderRadius: 20, padding: "22px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#fff", marginBottom: 18, gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: GREEN, animation: "pulse 2s infinite", flexShrink: 0 }} /><div><div style={{ fontWeight: 600, fontSize: 15 }}>Engine running</div><div style={{ fontFamily: FM, fontSize: 12, color: "rgba(255,255,255,.5)", marginTop: 2 }}>Run #142 · Creative phase · Creative production</div></div></div>
          <div style={{ width: 1, height: 34, background: "rgba(255,255,255,.14)" }} />
          <div style={{ fontSize: 13.5, color: "rgba(255,255,255,.82)" }}>Last audit <strong style={{ color: "#fff", fontWeight: 600 }}>12m ago</strong> — Research &amp; intelligence surfaced 3 opportunities</div>
        </div>
        <div onClick={() => setPage("approvals")} className="v5-accent" style={{ display: "flex", alignItems: "center", gap: 10, background: ACCENT, borderRadius: 12, padding: "11px 18px", cursor: "pointer", flexShrink: 0 }}><span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--card)", color: INK, fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>{pending}</span><span style={{ fontWeight: 600, fontSize: 14 }}>approvals pending</span>{RAIL.arrow}</div>
      </div>
      <Disclaimer />
    </>
  );
}
function BarRow({ label, pct, val, w, c }: { label: string; pct: string; val: string; w: number; c: string }) {
  return (<div><div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 7 }}><span style={{ fontWeight: 500 }}>{label} <span style={{ color: INK4 }}>· {pct}</span></span><span style={{ fontWeight: 700 }}>{val}</span></div><div style={{ height: 7, borderRadius: 5, background: "var(--line)", overflow: "hidden" }}><div style={{ width: pct, height: "100%", background: c, borderRadius: 5 }} /></div></div>);
}
function BarRow2({ label, pct, val, w, c }: { label: string; pct: string; val: string; w: number; c: string }) {
  return (<div><div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}><span style={{ color: INK6 }}>{label} <span style={{ color: INK3 }}>· {pct}</span></span><span style={{ fontWeight: 700 }}>{val}</span></div><div style={{ height: 7, borderRadius: 5, background: "var(--line)", overflow: "hidden" }}><div style={{ width: pct, height: "100%", background: c, borderRadius: 5 }} /></div></div>);
}
function Disclaimer() { return <div style={{ fontSize: 12, color: INK3, fontStyle: "italic", lineHeight: 1.6, padding: "0 2px" }}>{DISCLAIMER}</div>; }

// ── GA4 AUDIENCE & ACQUISITION (Overview) ─ modeled GA4 web data: KPIs, demographics,
// channels & devices. Reacts to the Overview date range + its own segment/device filters. ──
const GA4_RANGE: Record<string, { mult: number; label: string }> = {
  "7D": { mult: 0.25, label: "Last 7 days" }, "28D": { mult: 1, label: "Last 28 days" }, "90D": { mult: 3.15, label: "Last 90 days" },
};
const GA4_AGE: [string, number][] = [["18–24", 14], ["25–34", 33], ["35–44", 26], ["45–54", 15], ["55–64", 8], ["65+", 4]];
const GA4_GENDER: [string, number, string][] = [["Female", 58, "#E07B9A"], ["Male", 39, ACCENT], ["Unknown", 3, "#C2C8D6"]];
const GA4_CHANNELS: [string, number, string][] = [["Organic Search", 31, GREEN_TX], ["Paid Search", 22, ACCENT], ["Paid Social", 18, "#8A92F5"], ["Direct", 14, INK], ["Referral", 9, AMBER], ["Email", 6, "#0D9F72"]];
const GA4_DEVICE: [("mobile" | "desktop" | "tablet"), string, number][] = [["mobile", "Mobile", 71], ["desktop", "Desktop", 23], ["tablet", "Tablet", 6]];
const GA4_SEGMENT: Record<"all" | "new" | "returning", { mult: number; eng: number; conv: number; ageShift: number[]; label: string }> = {
  all: { mult: 1, eng: 62, conv: 2.4, ageShift: [0, 0, 0, 0, 0, 0], label: "All users" },
  new: { mult: 0.64, eng: 48, conv: 1.6, ageShift: [4, 3, -1, -2, -2, -2], label: "New users" },
  returning: { mult: 0.36, eng: 79, conv: 4.1, ageShift: [-4, -2, 2, 2, 1, 1], label: "Returning" },
};
function Ga4Audience({ range }: { range: string }) {
  const [seg, setSeg] = useState<"all" | "new" | "returning">("all");
  const [dev, setDev] = useState<"all" | "mobile" | "desktop" | "tablet">("all");
  const r = GA4_RANGE[range] ?? GA4_RANGE["28D"];
  const s = GA4_SEGMENT[seg];
  const devShare = dev === "all" ? 1 : (GA4_DEVICE.find((d) => d[0] === dev)?.[2] ?? 100) / 100;
  const factor = r.mult * s.mult * devShare;
  const sessions = Math.round(86400 * factor);
  const users = Math.round(sessions * 0.78);
  const conversions = Math.round(sessions * (s.conv / 100));
  const ages: [string, number][] = GA4_AGE.map(([b, v], i) => [b, Math.max(1, v + s.ageShift[i])]);
  const ageTot = ages.reduce((a, [, v]) => a + v, 0);
  const fmtNum = (n: number) => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "K" : String(n));
  const chip = (active: boolean): CSSProperties => ({ padding: "6px 13px", borderRadius: 9, border: `1px solid ${active ? ACCENT : LINE}`, background: active ? ACCENT : CARD, color: active ? "#fff" : INK4, fontSize: 12.5, fontWeight: 600, cursor: "pointer" });
  const kpis: [string, string][] = [["Sessions", fmtNum(sessions)], ["Active users", fmtNum(users)], ["Engagement rate", s.eng + "%"], ["Conversions", fmtNum(conversions)]];

  return (
    <div style={{ ...card, padding: 28, marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Audience &amp; acquisition</div>
          <span style={{ fontFamily: FM, fontSize: 9.5, letterSpacing: "1px", background: AMBER_SOFT, color: AMBER, padding: "4px 9px", borderRadius: 7 }}>GA4</span>
          <span style={{ fontSize: 12.5, color: INK3 }}>· {r.label}</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(["all", "new", "returning"] as const).map((k) => <button key={k} onClick={() => setSeg(k)} style={chip(seg === k)}>{GA4_SEGMENT[k].label}</button>)}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {kpis.map(([t, v]) => (
          <div key={t} style={{ border: `1px solid ${LINE}`, borderRadius: 14, padding: "15px 16px", background: SUBTLE }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 12.5, color: INK4 }}>{t}</span><span style={{ fontFamily: FM, fontSize: 8.5, letterSpacing: "1px", color: AMBER }}>GA4</span></div>
            <div style={{ fontSize: 25, fontWeight: 700, marginTop: 6, letterSpacing: "-.5px" }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 36 }}>
        <div>
          <div style={{ ...monoLabel, fontSize: 11, letterSpacing: "1.2px", marginBottom: 14 }}>AGE · % OF USERS</div>
          {ages.map(([b, v]) => { const pct = Math.round((v / ageTot) * 100); return (
            <div key={b} style={{ marginBottom: 11 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }}><span style={{ color: INK6 }}>{b}</span><span style={{ fontWeight: 700 }}>{pct}%</span></div>
              <div style={{ height: 7, borderRadius: 5, background: "var(--line)", overflow: "hidden" }}><div style={{ width: `${Math.min(100, pct * 2)}%`, height: "100%", background: ACCENT, borderRadius: 5 }} /></div>
            </div>
          ); })}
          <div style={{ ...monoLabel, fontSize: 11, letterSpacing: "1.2px", margin: "20px 0 12px" }}>GENDER</div>
          <div style={{ display: "flex", height: 12, borderRadius: 7, overflow: "hidden", marginBottom: 12 }}>{GA4_GENDER.map(([g, v, c]) => <div key={g} style={{ width: `${v}%`, background: c }} />)}</div>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>{GA4_GENDER.map(([g, v, c]) => <span key={g} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: c }} />{g} <strong>{v}%</strong></span>)}</div>
        </div>
        <div style={{ borderLeft: `1px solid ${LINE}`, paddingLeft: 36 }}>
          <div style={{ ...monoLabel, fontSize: 11, letterSpacing: "1.2px", marginBottom: 14 }}>ACQUISITION · DEFAULT CHANNEL</div>
          {GA4_CHANNELS.map(([n, v, c]) => (
            <div key={n} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }}><span style={{ color: INK6 }}>{n}</span><span style={{ fontWeight: 700 }}>{v}%</span></div>
              <div style={{ height: 7, borderRadius: 5, background: "var(--line)", overflow: "hidden" }}><div style={{ width: `${Math.min(100, v * 2.6)}%`, height: "100%", background: c, borderRadius: 5 }} /></div>
            </div>
          ))}
          <div style={{ ...monoLabel, fontSize: 11, letterSpacing: "1.2px", margin: "20px 0 12px" }}>DEVICE · TAP TO FILTER</div>
          <div style={{ display: "flex", gap: 9 }}>
            {GA4_DEVICE.map(([id, label, v]) => { const active = dev === id; return (
              <button key={id} onClick={() => setDev(active ? "all" : id)} style={{ flex: 1, border: `1px solid ${active ? ACCENT : LINE}`, background: active ? ACCENT_SOFT : CARD, borderRadius: 12, padding: "12px 12px", cursor: "pointer", textAlign: "left" }}>
                <div style={{ fontSize: 12, color: INK4 }}>{label}</div>
                <div style={{ fontSize: 19, fontWeight: 700, color: active ? ACCENT : INK }}>{v}%</div>
              </button>
            ); })}
          </div>
          <div style={{ fontSize: 11.5, color: INK3, fontStyle: "italic", marginTop: 14, lineHeight: 1.5 }}>Modeled GA4 web data — KPIs, demographics, channels &amp; devices update with the segment and date filters. Live GA4 connector lands with the measurement agent.</div>
        </div>
      </div>
    </div>
  );
}

// ── APPROVALS ─────────────────────────────────────────────────────────────────
function Approvals({ decided, setDecided }: { decided: Record<string, "ok" | "no">; setDecided: (f: (d: Record<string, "ok" | "no">) => Record<string, "ok" | "no">) => void }) {
  const pending = APPROVAL_CARDS.filter((a) => !decided[a.id]).length;
  const decide = (id: string, v: "ok" | "no") => setDecided((d) => ({ ...d, [id]: v }));
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#FDF7E3", border: "1px solid #f1e4bf", borderRadius: 14, padding: "15px 20px", marginBottom: 18 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.8 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></svg>
        <div style={{ fontSize: 13.5, color: "#7a6320" }}><strong style={{ color: "#5e4d18" }}>{pending} spend-affecting actions</strong> need your sign-off. Nothing spends until you approve — every action is checked against the ₹6,000/day cap.</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 18 }}>
        {APPROVAL_CARDS.map((a) => {
          const st = decided[a.id];
          return (
            <div key={a.id} className="v5-card" style={{ ...card, borderRadius: 20, padding: 24, opacity: st ? 0.62 : 1 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                {agentAv(a.ag, a.agBg, a.agFg)}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ fontSize: 17, fontWeight: 600 }}>{a.title}</div><span style={{ fontFamily: FM, fontSize: 9.5, letterSpacing: "1px", background: a.tagB, color: a.tagC, padding: "4px 9px", borderRadius: 7 }}>{a.tag}</span></div>
                  <div style={{ fontSize: 13.5, color: INK4, marginTop: 6, lineHeight: 1.5 }}>{a.desc}</div>
                </div>
                <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                  {st ? <div style={{ padding: "10px 18px", borderRadius: 11, fontSize: 14, fontWeight: 600, color: st === "ok" ? GREEN_TX : RED, background: st === "ok" ? GREEN_SOFT : "var(--red-soft)" }}>{st === "ok" ? "Approved ✓" : "Rejected"}</div> : <>
                    <div onClick={() => decide(a.id, "no")} className="v5-ghost" style={{ padding: "10px 18px", border: "1.5px solid var(--line)", borderRadius: 11, fontSize: 14, fontWeight: 600, color: INK6, cursor: "pointer" }}>Reject</div>
                    <div onClick={() => decide(a.id, "ok")} className="v5-navy" style={{ padding: "10px 22px", background: NAVY, color: "#fff", borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Approve</div>
                  </>}
                </div>
              </div>
              {a.stats3 ? (
                <div style={{ display: "grid", gridTemplateColumns: "auto auto auto", gap: 14, marginTop: 18, justifyContent: "start" }}>{a.stats3.map((s, i) => <div key={i} style={{ background: SUBTLE, borderRadius: 13, padding: "14px 22px", minWidth: 140 }}><div style={{ ...monoLabel, fontSize: 9.5, letterSpacing: "1px", marginBottom: 6 }}>{s[0]}</div><div style={{ fontSize: 18, fontWeight: 700, color: s[2] || INK }}>{s[1]}</div></div>)}</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "auto auto 1fr", gap: 14, marginTop: 18, alignItems: "stretch" }}>
                  {a.stats!.map((s, i) => <div key={i} style={{ background: SUBTLE, borderRadius: 13, padding: "14px 18px" }}><div style={{ ...monoLabel, fontSize: 9.5, letterSpacing: "1px", marginBottom: 6 }}>{s[0]}</div><div style={{ fontSize: 18, fontWeight: 700, color: s[2] || INK }}>{s[1]}</div></div>)}
                  <div style={{ background: SUBTLE, borderRadius: 13, padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}><div style={{ ...monoLabel, fontSize: 9.5, letterSpacing: "1px" }}>DAILY SPEND VS CAP</div><span style={{ fontSize: 12, fontWeight: 600, color: GREEN_TX }}>within cap</span></div>
                    <div style={{ height: 9, borderRadius: 6, background: "var(--line)", overflow: "hidden", marginBottom: 8 }}><div style={{ width: `${a.cap}%`, height: "100%", borderRadius: 6, background: ACCENT }} /></div>
                    <div style={{ fontSize: 12, color: INK4 }}>{a.capNote}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Disclaimer />
    </>
  );
}

// ── RUNS ──────────────────────────────────────────────────────────────────────
const AUDIT_FINDINGS: { title: string; detail: string; impact: "High" | "Med"; type: Ticket["type"]; channel: Ticket["channel"]; data: { label: string; value: string }[] }[] = [
  { title: "Split brand & non-brand budgets", detail: "Brand keywords soak up Search budget that should chase new demand. Carve brand into its own capped campaign.", impact: "High", type: "budget", channel: "google", data: [{ label: "EST. SAVING", value: "~₹38K/mo" }, { label: "EFFORT", value: "Low" }] },
  { title: "PMax overlapping brand Search", detail: "Performance Max serves on branded queries already covered by Search at a lower CAC. Add brand to the PMax negative list.", impact: "High", type: "campaign", channel: "google", data: [{ label: "OVERLAP", value: "~18%" }, { label: "EFFORT", value: "Medium" }] },
  { title: "Consultation bookings carry no value", detail: "Bookings fire a conversion with no value, so ROAS is understated and Smart Bidding optimises blind.", impact: "High", type: "tracking", channel: "google", data: [{ label: "AFFECTS", value: "Smart Bidding" }, { label: "EFFORT", value: "Medium" }] },
  { title: "18-24 band spends at 2× CAC", detail: "The 18-24 group is 12% of spend at ~2× blended CAC. Apply a bid adjustment on prospecting.", impact: "Med", type: "budget", channel: "meta", data: [{ label: "CAC", value: "2× blended" }, { label: "EFFORT", value: "Low" }] },
];
const CREATIVE_VARIANTS: { name: string; hook: string; grad: string }[] = [
  { name: "UGC — “Read my chart”", hook: "Founder testimonial · 9:16", grad: "linear-gradient(135deg,#6c5ce7,#8e7bff)" },
  { name: "Static — Gemstone hero", hook: "Product · 1:1", grad: "linear-gradient(135deg,#f0a36b,#e07b6b)" },
  { name: "Reel — Daily horoscope", hook: "Hook-led · 9:16", grad: "linear-gradient(135deg,#13c296,var(--green-tx))" },
];

function Runs({ setPage, setTickets, viewer }: { setPage: (p: Page) => void; setTickets: (f: (t: Ticket[]) => Ticket[]) => void; viewer: Member }) {
  const [running, setRunning] = useState<null | "audit" | "creative">(null);
  const [audit, setAudit] = useState(false);
  const [creatives, setCreatives] = useState(false);
  const [used, setUsed] = useState<Set<string>>(new Set());
  const run = (step: "audit" | "creative") => { setRunning(step); window.setTimeout(() => { setRunning(null); if (step === "audit") setAudit(true); else setCreatives(true); }, step === "audit" ? 2100 : 2400); };
  const mkTicket = (type: Ticket["type"], title: string, description: string, channel: Ticket["channel"], data: { label: string; value: string }[], status: Status, mark?: string) => {
    setTickets((ts) => { const nums = ts.map((t) => parseInt(t.key.split("-")[1]) || 0); const key = "AT-" + (Math.max(143, ...nums) + 1); const approverId = type === "creative" ? "brand" : type === "budget" ? "fin" : "admin"; return [{ key, type, title, description, status, priority: "med", channel, reporterId: viewer.id, approverId, agent: type === "creative" ? "Creative production" : "Research & intelligence", data, comments: [], activity: [{ at: "just now", who: viewer.name, action: status === "awaiting" ? "submitted for approval" : "created from a run" }], createdAt: "just now" } as Ticket, ...ts]; });
    if (mark) setUsed((u) => new Set(u).add(mark));
  };

  const STEPS = [
    { id: "audit" as const, name: "Audit", role: "Research & intelligence", av: "RI", avBg: "var(--blue-soft)", avFg: "#3b5bdb", mode: "run", desc: "Analyze the current Google + Shopify data → opportunities", done: audit },
    { id: "creative" as const, name: "Creative", role: "Creative production", av: "CP", avBg: AMBER_SOFT, avFg: AMBER, mode: "run", desc: "Generate AI creative variants (images / video)", done: creatives },
  ];

  return (
    <>
      {/* THE LOOP — run a step */}
      <div style={{ ...card, padding: 24, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}><div style={{ ...monoLabel }}>THE LOOP · RUN A STEP</div><span style={{ fontSize: 12.5, color: INK4 }}>Pick a step to run</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 380px))", gap: 14 }}>
          {STEPS.map((s) => {
            const isRun = running === s.id;
            return (
              <div key={s.id} style={{ border: isRun ? `1.5px solid ${ACCENT}` : s.done ? "1.5px solid var(--green-soft)" : "1px solid var(--line)", borderRadius: 16, padding: 18, background: isRun ? "var(--subtle)" : "#fff", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>{agentAv(s.av, s.avBg, s.avFg, 30, 9, 11)}<div><div style={{ fontSize: 15.5, fontWeight: 600 }}>{s.name}</div><div style={{ fontSize: 10.5, color: INK4 }}>{s.role}</div></div></div>
                <div style={{ fontSize: 12.5, color: INK4, lineHeight: 1.45, marginBottom: 14, flex: 1 }}>{s.desc}</div>
                {s.mode === "run" ? (
                  isRun ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px", borderRadius: 11, background: ACCENT_SOFT, color: ACCENT, fontWeight: 600, fontSize: 13.5 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: ACCENT, animation: "pulse 1.2s infinite" }} />Running…</div>
                  : <button onClick={() => run(s.id as "audit" | "creative")} className={s.done ? undefined : "v5-navy"} style={{ width: "100%", padding: "10px", borderRadius: 11, border: s.done ? "1.5px solid var(--line)" : "none", background: s.done ? "#fff" : NAVY, color: s.done ? INK6 : "#fff", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>{s.done ? "↻ Re-run" : `Run ${s.name.toLowerCase()}`}</button>
                ) : s.mode === "gated" ? (
                  <button onClick={() => setPage("approvals")} className="v5-ghost" style={{ width: "100%", padding: "10px", borderRadius: 11, border: "1.5px solid #f0dcb0", background: "#fdf7e3", color: AMBER, fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>Post-approval →</button>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px", borderRadius: 11, background: "#f4f5f9", color: INK4, fontWeight: 600, fontSize: 12.5 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN }} />Automated</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AUDIT RESULT */}
      {running === "audit" && <div style={{ ...card, padding: 22, marginBottom: 18, display: "flex", alignItems: "center", gap: 12 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: ACCENT, animation: "pulse 1.2s infinite" }} /><span style={{ fontWeight: 600 }}>Auditing</span><span style={{ color: INK4, fontSize: 13.5 }}>— analyzing 30 days of Google + Shopify data…</span></div>}
      {audit && (
        <div style={{ ...card, padding: 24, marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}><div><div style={{ fontSize: 16, fontWeight: 600 }}>Audit complete · 4 opportunities</div><div style={{ fontSize: 12.5, color: INK4, marginTop: 2 }}>Generated from current data — create tickets to action them</div></div><span style={{ fontFamily: FM, fontSize: 9.5, letterSpacing: ".8px", background: GREEN_SOFT, color: GREEN_TX, padding: "4px 9px", borderRadius: 7 }}>HEALTH 52/100</span></div>
          {AUDIT_FINDINGS.map((f, i) => { const created = used.has(f.title); return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: "1px solid var(--line)" }}>
              <span style={{ fontFamily: FM, fontSize: 9.5, letterSpacing: ".8px", color: TYPE_META[f.type].c, background: TYPE_META[f.type].bg, padding: "4px 8px", borderRadius: 7, flexShrink: 0 }}>{TYPE_META[f.type].label}</span>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14.5, fontWeight: 600 }}>{f.title}</div><div style={{ fontSize: 12.5, color: INK4, marginTop: 2 }}>{f.detail}</div></div>
              <span style={{ fontFamily: FM, fontSize: 11, fontWeight: 600, color: f.impact === "High" ? "var(--green-tx)" : AMBER, background: f.impact === "High" ? GREEN_SOFT : AMBER_SOFT, padding: "4px 9px", borderRadius: 8, flexShrink: 0 }}>{f.impact}</span>
              <button onClick={() => mkTicket(f.type, f.title, f.detail, f.channel, f.data, "open", f.title)} disabled={created} className={created ? undefined : "v5-navy"} style={{ flexShrink: 0, padding: "8px 14px", border: "none", borderRadius: 10, background: created ? "var(--line)" : NAVY, color: created ? INK4 : "#fff", fontWeight: 600, fontSize: 12.5, cursor: created ? "default" : "pointer", whiteSpace: "nowrap" }}>{created ? "✓ Ticket created" : "Create ticket"}</button>
            </div>
          ); })}
        </div>
      )}

      {/* CREATIVE RESULT */}
      {running === "creative" && <div style={{ ...card, padding: 22, marginBottom: 18, display: "flex", alignItems: "center", gap: 12 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: AMBER, animation: "pulse 1.2s infinite" }} /><span style={{ fontWeight: 600 }}>Generating creatives</span><span style={{ color: INK4, fontSize: 13.5 }}>— drafting AI-disclosed variants…</span></div>}
      {creatives && (
        <div style={{ ...card, padding: 24, marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}><div><div style={{ fontSize: 16, fontWeight: 600 }}>3 creative variants generated</div><div style={{ fontSize: 12.5, color: INK4, marginTop: 2 }}>AI-disclosed per platform policy — submit for creative approval</div></div>
            <button onClick={() => mkTicket("creative", "Publish 3 UGC variants", "AI-generated creative variants ready for review — disclosure-labeled per platform policy.", "meta", [{ label: "VARIANTS", value: "3 assets" }, { label: "SPEND IMPACT", value: "₹0" }], "awaiting", "creative-batch")} disabled={used.has("creative-batch")} className={used.has("creative-batch") ? undefined : "v5-navy"} style={{ padding: "9px 15px", border: "none", borderRadius: 10, background: used.has("creative-batch") ? "var(--line)" : NAVY, color: used.has("creative-batch") ? INK4 : "#fff", fontWeight: 600, fontSize: 13, cursor: used.has("creative-batch") ? "default" : "pointer" }}>{used.has("creative-batch") ? "✓ Submitted for approval" : "Submit 3 for approval"}</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {CREATIVE_VARIANTS.map((v, i) => (
              <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ height: 130, background: v.grad, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}><span style={{ fontFamily: FM, fontSize: 9, letterSpacing: ".8px", color: "rgba(255,255,255,.9)", background: "rgba(0,0,0,.25)", padding: "3px 8px", borderRadius: 6, position: "absolute", top: 10, left: 10 }}>AI · {String.fromCharCode(65 + i)}</span><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth={1.6}><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.8" /><path d="m21 15-5-5L5 21" /></svg></div>
                <div style={{ padding: "11px 13px" }}><div style={{ fontSize: 13, fontWeight: 600 }}>{v.name}</div><div style={{ fontSize: 11.5, color: INK4, marginTop: 2 }}>{v.hook}</div></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HISTORY */}
      <div style={{ ...card, padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Run history</div>
        {RUN_HISTORY.map((r) => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderTop: "1px solid var(--line)" }}>
            <span style={{ fontFamily: FM, fontSize: 13, color: INK3, width: 42 }}>{r.id}</span>
            {agentAv(r.av, r.avBg, r.avFg, 34, 9, 10)}
            <div style={{ flex: 1 }}><div style={{ fontSize: 14.5, fontWeight: 600 }}>{r.t}</div><div style={{ fontSize: 12.5, color: INK4, marginTop: 2 }}>{r.s}</div></div>
            <span style={{ fontSize: 14, fontWeight: 700, color: GREEN_TX }}>{r.v}</span>
            <span style={{ fontFamily: FM, fontSize: 10, letterSpacing: "1px", background: GREEN_SOFT, color: GREEN_TX, padding: "5px 11px", borderRadius: 7 }}>COMPLETED</span>
          </div>
        ))}
      </div>
      <Disclaimer />
    </>
  );
}

// ── SOURCE PAGES (Google / Meta / Shopify) ────────────────────────────────────
function SourcePage({ page }: { page: "google" | "meta" | "shopify" }) {
  const sets: Record<string, { kpis: [string, string, string][]; note: string; noteC: string; rows: [string, string, string][]; rowsHead: string }> = {
    google: { kpis: [["Spend", "₹6.4L", "▲ 5.1%"], ["App installs", "18.4K", "▲ 11.0%"], ["Cost / install", "₹34.8", "▼ 5.3%"]], note: "App & video funnel — these campaign types report installs, not purchase value, so ROAS isn't computed here. Revenue is measured on Meta → Shopify.", noteC: AMBER, rowsHead: "Spend by campaign type", rows: [["App Installs — Android", "8,600 installs", "₹2.48L"], ["YouTube — Awareness", "4,200 views→inst", "₹1.76L"], ["App Installs — iOS", "3,100 installs", "₹1.18L"], ["Search — Brand", "1,800 installs", "₹62K"], ["Demand Gen — Prospecting", "700 installs", "₹36K"]] },
    meta: { kpis: [["Amount spent", "₹9.8L", "▲ 8.4%"], ["Purchases", "4,200", "▲ 9.7%"], ["Purchase ROAS", "3.22×", "▲ 4.2%"], ["Cost / purchase", "₹233", "▼ 2.1%"]] as [string, string, string][], note: "Meta isn't connected yet — modeled from the exact fields the Marketing API will return (spend · purchases & value via the Pixel · ROAS · the LPV→ATC→purchase funnel). Fills with live data once the System-User token is approved.", noteC: ACCENT, rowsHead: "Campaigns", rows: [["Advantage+ Shopping", "1,980 purchases · 4.18×", "₹16.38L"], ["Prospecting — Broad", "1,080 purchases · 2.92×", "₹8.29L"], ["Retargeting — 30d", "760 purchases · 5.40×", "₹7.94L"], ["Lookalike 1–3%", "280 purchases · 2.40×", "₹2.35L"], ["Creative Testing", "100 purchases · 1.80×", "₹1.06L"]] },
    shopify: { kpis: [["Total sales", "₹42.8L", "▲ 16.4%"], ["Orders", "5,640", "▲ 12.8%"], ["AOV", "₹759", "▲ 3.2%"], ["Conversion rate", "2.85%", "▲ 4.0%"]] as [string, string, string][], note: "Revenue truth — orders · sales · AOV · products · customers are live from the Shopify Admin API. Sessions & conversion rate come from GA4 (the Admin API exposes orders, not sessions).", noteC: GREEN_TX, rowsHead: "Top products", rows: [["1:1 Astrologer Consultation", "1,120 units", "₹13.44L"], ["Personal Birth Chart Report", "1,840 units", "₹9.20L"], ["Gemstone — Yellow Sapphire", "640 units", "₹5.12L"], ["Kundli Matching Report", "1,280 units", "₹3.84L"], ["2026 Yearly Forecast", "760 units", "₹2.28L"]] },
  };
  const cfg = sets[page];
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: page === "meta" ? "#eef0fb" : "#f7f8fb", border: `1px solid ${page === "meta" ? "#dfe3fa" : LINE}`, borderRadius: 14, padding: "14px 18px", marginBottom: 18 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={cfg.noteC} strokeWidth={1.9}><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v4h1" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <div style={{ fontSize: 13, color: INK6, lineHeight: 1.5 }}>{cfg.note}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cfg.kpis.length},1fr)`, gap: 16, marginBottom: 18 }}>
        {cfg.kpis.map((k) => (
          <div key={k[0]} style={{ ...card, borderRadius: 18, padding: 20 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: INK6 }}>{k[0]}</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-.5px", marginTop: 8 }}>{k[1]}</div>
            <div style={{ fontSize: 12.5, marginTop: 3 }}><span style={{ color: k[2].startsWith("▲") ? GREEN : AMBER, fontWeight: 600 }}>{k[2]}</span> <span style={{ color: INK3 }}>vs prev</span></div>
          </div>
        ))}
      </div>
      <div style={{ ...card, padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{cfg.rowsHead}</div>
        {cfg.rows.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
            <SrcLogo id={page} size={34} radius={9} />
            <div style={{ flex: 1 }}><div style={{ fontSize: 14.5, fontWeight: 600 }}>{r[0]}</div><div style={{ fontSize: 12.5, color: INK4, marginTop: 2 }}>{r[1]}</div></div>
            <span style={{ fontSize: 15, fontWeight: 700 }}>{r[2]}</span>
          </div>
        ))}
      </div>
      <div style={{ height: 18 }} />
      <Disclaimer />
    </>
  );
}

// ── ACTIVITY ──────────────────────────────────────────────────────────────────
function Activity() {
  const feed: [string, string, string, string, string][] = [
    ["RI", "var(--blue-soft)", "#3b5bdb", "Re-scanned the account — mapped 4 optimization opportunities", "6m ago"],
    ["MB", DCFG(0), DCFG(1), "Proposed scaling Advantage+ Shopping budget +₹1,300/day (awaiting approval)", "12m ago"],
    ["MA", "var(--coral-soft)", "var(--coral)", "Reconciled Shopify revenue vs Meta pixel — 8% unattributed flagged", "1h ago"],
    ["CP", AMBER_SOFT, AMBER, "Queued 3 AI-disclosed UGC variants for creative review", "2h ago"],
    ["MB", DCFG(0), DCFG(1), "Reallocated ₹1.2K/day to Advantage+ — Run #140 completed (+₹28K)", "14h ago"],
    ["MA", "var(--coral-soft)", "var(--coral)", "Paused 2 underperforming ad sets — Run #139 completed (+₹9K)", "1d ago"],
  ];
  return (
    <>
      <div style={{ ...card, padding: 24, marginBottom: 18 }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Agent activity log</div>
        {feed.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "15px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
            {agentAv(f[0], f[1], f[2], 36, 10, 11)}
            <div style={{ flex: 1 }}><div style={{ fontSize: 14, lineHeight: 1.5 }}>{f[3]}</div><div style={{ fontSize: 12, color: INK3, marginTop: 3 }}>{f[4]}</div></div>
          </div>
        ))}
      </div>
      <Disclaimer />
    </>
  );
}
function DCFG(i: number) { return i === 0 ? "var(--green-soft)" : "var(--green-tx)"; }

// ── PROFILE ─────────────────────────────────────────────────────────────────────
function Profile({ viewer, setViewer, onSignOut, brand, realEmail }: { viewer: Member; setViewer: (m: Member) => void; onSignOut?: () => void; brand: CockpitBrand; realEmail?: string }) {
  const [prefs, setPrefs] = useState({ email: true, approvals: true, digest: false });
  const email = viewer.id === "me" && realEmail ? realEmail : `${viewer.name.toLowerCase().replace(/ /g, ".")}@${viewer.org === "ROI Labs" ? "roilabs.in" : brand.shopifySlug + ".com"}`;
  const perms = [...effectivePerms(viewer)];
  const groups: [string, string[]][] = [
    ["Analytics & views", perms.filter((p) => p === "analytics.view" || p === "tickets.view")],
    ["Tickets", perms.filter((p) => p.startsWith("tickets.") && p !== "tickets.view")],
    ["Approvals", perms.filter((p) => p.startsWith("approve."))],
    ["Execution & admin", perms.filter((p) => p === "actions.execute" || p === "members.manage" || p === "settings.manage")],
  ];
  const roleBadge = (m: Member) => <span style={{ fontFamily: FM, fontSize: 9.5, letterSpacing: ".6px", color: m.org === "ROI Labs" ? ACCENT : "#3b5bdb", background: m.org === "ROI Labs" ? ACCENT_SOFT : "var(--blue-soft)", padding: "3px 9px", borderRadius: 20 }}>{m.role.toUpperCase()}</span>;
  const field = (label: string, value: string) => <div><div style={{ fontFamily: FM, fontSize: 9.5, letterSpacing: ".8px", color: INK3, marginBottom: 6 }}>{label}</div><div style={{ background: SUBTLE, border: `1px solid ${LINE}`, borderRadius: 11, padding: "11px 13px", fontSize: 14, fontWeight: 500 }}>{value}</div></div>;
  const toggle = (key: "email" | "approvals" | "digest", label: string, sub: string, first?: boolean) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderTop: first ? "none" : "1px solid var(--line)" }}>
      <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div><div style={{ fontSize: 12.5, color: INK4, marginTop: 2 }}>{sub}</div></div>
      <button onClick={() => setPrefs((p) => ({ ...p, [key]: !p[key] }))} style={{ width: 42, height: 24, borderRadius: 20, border: "none", cursor: "pointer", background: prefs[key] ? ACCENT : "#d7dae3", position: "relative", transition: "background .15s", flexShrink: 0 }}><span style={{ position: "absolute", top: 3, left: prefs[key] ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "var(--card)", transition: "left .15s", boxShadow: "0 1px 2px rgba(0,0,0,.2)" }} /></button>
    </div>
  );
  return (
    <div style={{ maxWidth: 920 }}>
      <div style={{ ...card, padding: 26, marginBottom: 18, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        {mav(viewer, 72)}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}><div style={{ fontSize: 24, fontWeight: 700 }}>{viewer.name}</div>{roleBadge(viewer)}</div>
          <div style={{ color: INK4, fontSize: 13.5, marginTop: 5 }}>{viewer.title} · {viewer.org}</div>
          <div style={{ color: INK4, fontSize: 13, marginTop: 2 }}>{email}</div>
        </div>
        <button onClick={() => { if (onSignOut) onSignOut(); else window.location.assign(`${BP}/engine?login=1`); }} className="v5-ghost" style={{ padding: "10px 16px", border: "1.5px solid var(--line)", borderRadius: 11, background: "var(--card)", color: INK6, fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>Sign out</button>
      </div>

      <div style={{ ...card, padding: 24, marginBottom: 18 }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Account</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{field("FULL NAME", viewer.name)}{field("WORK EMAIL", email)}{field("ROLE", viewer.role[0].toUpperCase() + viewer.role.slice(1))}{field("WORKSPACE", brand.name)}</div>
      </div>

      <div style={{ ...card, padding: 24, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 600 }}>Your access</div><span style={{ fontFamily: FM, fontSize: 11, color: INK4 }}>{perms.length} permissions</span></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{groups.filter(([, v]) => v.length).map(([g, v]) => (
          <div key={g}><div style={{ fontFamily: FM, fontSize: 9.5, letterSpacing: ".8px", color: INK3, marginBottom: 8 }}>{g.toUpperCase()}</div><div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{v.map((p) => <span key={p} style={{ fontFamily: FM, fontSize: 11.5, color: ACCENT, background: ACCENT_SOFT, padding: "4px 10px", borderRadius: 8 }}>{p}</span>)}</div></div>
        ))}</div>
      </div>

      <div style={{ ...card, padding: 24, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}><div style={{ fontSize: 16, fontWeight: 600 }}>Workspace · {brand.name}</div><span style={{ fontSize: 12.5, color: INK4 }}>{MEMBERS.length} members</span></div>
        {MEMBERS.map((m, i) => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
            {mav(m, 36)}
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 600 }}>{m.name}{m.id === viewer.id && <span style={{ fontSize: 11, color: ACCENT, fontWeight: 600 }}> · you</span>}</div><div style={{ fontSize: 12, color: INK4 }}>{m.title}</div></div>
            {roleBadge(m)}
            {m.id !== viewer.id && <button onClick={() => setViewer(m)} className="v5-ghost" style={{ padding: "7px 13px", border: "1.5px solid var(--line)", borderRadius: 9, background: "var(--card)", color: INK6, fontWeight: 600, fontSize: 12.5, cursor: "pointer", whiteSpace: "nowrap" }}>Sign in as</button>}
          </div>
        ))}
      </div>

      <div style={{ ...card, padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Notifications</div>
        {toggle("email", "Email notifications", "Get emailed when something needs you", true)}
        {toggle("approvals", "Approval alerts", "Notify me when a ticket needs my approval")}
        {toggle("digest", "Weekly digest", "A Monday summary of performance + pending tickets")}
      </div>
    </div>
  );
}

// ── TICKETS BOARD (Jira-style, replaces Approvals) ──────────────────────────────
function mav(m: Member, size = 24): ReactNode {
  return <span style={{ width: size, height: size, borderRadius: "50%", background: m.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.36, flexShrink: 0 }}>{m.initials}</span>;
}
function chLogo(ch: Ticket["channel"], size = 20): ReactNode {
  if (ch === "subscriptions") return <span style={{ width: size, height: size, borderRadius: size * 0.28, background: ACCENT_SOFT, color: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.5, fontWeight: 700, flexShrink: 0 }}>↻</span>;
  return <SrcLogo id={ch as "google" | "meta" | "shopify"} size={size} radius={Math.round(size * 0.28)} />;
}
const COL_DOT: Record<string, string> = { open: "#aab2c3", awaiting: "var(--amber)", approved: "#2bbf7a", done: "#4f5bd5" };
const STATUS_BADGE: Record<string, [string, string, string]> = { open: ["Open", "#6b7384", "var(--line)"], awaiting: ["Awaiting approval", "var(--amber)", "var(--amber-soft)"], approved: ["Approved", "var(--green-tx)", "var(--green-soft)"], done: ["Done", "#4f5bd5", "var(--violet-soft)"], rejected: ["Rejected", "#ef6b6b", "var(--red-soft)"], changes: ["Changes requested", "var(--amber)", "var(--amber-soft)"] };

function TicketCard({ t, onClick }: { t: Ticket; onClick: () => void }) {
  const tm = TYPE_META[t.type];
  return (
    <div onClick={onClick} className="v5-card" style={{ background: "var(--card)", borderRadius: 13, padding: 13, border: "1px solid #eff1f5", cursor: "pointer" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
        <span style={{ fontFamily: FM, fontSize: 9.5, letterSpacing: ".8px", color: tm.c, background: tm.bg, padding: "3px 8px", borderRadius: 7 }}>{tm.label}</span>
        <span style={{ fontFamily: FM, fontSize: 11, color: INK3 }}>{t.key}</span>
      </div>
      <div style={{ fontWeight: 600, fontSize: 13.5, lineHeight: 1.3 }}>{t.title}</div>
      {t.cap && <div style={{ marginTop: 10, height: 5, borderRadius: 4, background: "#eef0f5", overflow: "hidden" }}><div style={{ width: t.cap.pct + "%", height: "100%", background: ACCENT, borderRadius: 4 }} /></div>}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 11 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: PRIORITY_C[t.priority] }} />{chLogo(t.channel, 20)}</div>
        <div style={{ display: "flex", alignItems: "center" }}>{mav(memberById(t.reporterId), 22)}<span style={{ marginLeft: -7 }}>{mav(memberById(t.approverId), 22)}</span></div>
      </div>
    </div>
  );
}

function TicketDrawer({ t, viewer, onClose, setStatus }: { t: Ticket; viewer: Member; onClose: () => void; setStatus: (key: string, s: Status, action: string) => void }) {
  const tm = TYPE_META[t.type], reporter = memberById(t.reporterId), approver = memberById(t.approverId);
  const sb = STATUS_BADGE[t.status];
  const mayApprove = canApprove(viewer, t);
  const maySubmit = (t.status === "open" || t.status === "changes") && can(viewer, "tickets.transition");
  const mayExecute = t.status === "approved" && can(viewer, "actions.execute");
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(27,36,64,.28)", zIndex: 60 }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(480px,94vw)", background: "var(--card)", zIndex: 61, boxShadow: "-20px 0 50px -20px rgba(27,36,64,.3)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${LINE}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: FM, fontSize: 9.5, letterSpacing: ".8px", color: tm.c, background: tm.bg, padding: "3px 8px", borderRadius: 7 }}>{tm.label}</span>
              <span style={{ fontFamily: FM, fontSize: 12, color: INK3 }}>{t.key}</span>
              <span style={{ fontFamily: FM, fontSize: 9.5, letterSpacing: ".8px", color: sb[1], background: sb[2], padding: "3px 8px", borderRadius: 7 }}>{sb[0]}</span>
            </div>
            <button onClick={onClose} className="v5-ic" style={{ width: 32, height: 32, borderRadius: 9, border: "none", background: "transparent", color: INK4, cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3 }}>{t.title}</div>
        </div>
        <div className="v5sc" style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          <div style={{ fontSize: 13.5, color: INK6, lineHeight: 1.6, marginBottom: 18 }}>{t.description}</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>{t.data.map((s, i) => <div key={i} style={{ background: SUBTLE, borderRadius: 12, padding: "12px 16px", minWidth: 92 }}><div style={{ fontFamily: FM, fontSize: 9, letterSpacing: ".8px", color: INK3, marginBottom: 5 }}>{s.label}</div><div style={{ fontSize: 16, fontWeight: 700, color: s.accent ? ACCENT : s.good ? GREEN_TX : INK }}>{s.value}</div></div>)}</div>
          {t.cap && <div style={{ marginBottom: 18 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: INK4, marginBottom: 6 }}><span style={{ fontFamily: FM, letterSpacing: ".5px" }}>DAILY SPEND VS CAP</span><span style={{ fontWeight: 600, color: GREEN_TX }}>within cap</span></div><div style={{ height: 8, borderRadius: 6, background: "var(--line)", overflow: "hidden" }}><div style={{ width: t.cap.pct + "%", height: "100%", background: ACCENT, borderRadius: 6 }} /></div><div style={{ fontSize: 11.5, color: INK4, marginTop: 6 }}>{t.cap.note}</div></div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
            <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, padding: "11px 13px" }}><div style={{ fontFamily: FM, fontSize: 9, letterSpacing: ".8px", color: INK3, marginBottom: 8 }}>REPORTER</div><div style={{ display: "flex", alignItems: "center", gap: 9 }}>{mav(reporter, 28)}<div style={{ minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 12.5 }}>{reporter.name}</div><div style={{ fontSize: 10.5, color: INK4 }}>{reporter.org}</div></div></div></div>
            <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, padding: "11px 13px" }}><div style={{ fontFamily: FM, fontSize: 9, letterSpacing: ".8px", color: INK3, marginBottom: 8 }}>APPROVER</div><div style={{ display: "flex", alignItems: "center", gap: 9 }}>{mav(approver, 28)}<div style={{ minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 12.5 }}>{approver.name}</div><div style={{ fontSize: 10.5, color: INK4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{approver.title}</div></div></div></div>
          </div>
          <div style={{ fontFamily: FM, fontSize: 10, letterSpacing: "1px", color: INK3, marginBottom: 12 }}>ACTIVITY</div>
          {t.activity.map((a, i) => <div key={i} style={{ display: "flex", gap: 10, paddingBottom: 12 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--ink3)", marginTop: 5, flexShrink: 0 }} /><div style={{ fontSize: 12.5, lineHeight: 1.4 }}><b style={{ fontWeight: 600 }}>{a.who}</b> {a.action} <span style={{ color: INK3 }}>· {a.at}</span></div></div>)}
          {t.comments.map((c, i) => <div key={i} style={{ display: "flex", gap: 10, marginTop: 6 }}><span style={{ width: 26, height: 26, borderRadius: "50%", background: c.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 10, flexShrink: 0 }}>{c.initials}</span><div style={{ background: SUBTLE, borderRadius: 10, padding: "8px 11px", fontSize: 12.5 }}><b style={{ fontWeight: 600 }}>{c.who}</b> <span style={{ color: INK3, fontSize: 11 }}>{c.at}</span><div style={{ marginTop: 3, color: INK6 }}>{c.body}</div></div></div>)}
        </div>
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${LINE}` }}>
          {mayApprove ? (
            <div style={{ display: "flex", gap: 9 }}>
              <button onClick={() => { setStatus(t.key, "changes", "requested changes"); onClose(); }} className="v5-ghost" style={{ padding: "11px 13px", border: "1.5px solid var(--line)", borderRadius: 11, fontWeight: 600, fontSize: 13, color: INK6, background: "var(--card)", cursor: "pointer", whiteSpace: "nowrap" }}>Changes</button>
              <button onClick={() => { setStatus(t.key, "rejected", "rejected"); onClose(); }} className="v5-ghost" style={{ padding: "11px 13px", border: "1.5px solid var(--line)", borderRadius: 11, fontWeight: 600, fontSize: 13, color: INK6, background: "var(--card)", cursor: "pointer" }}>Reject</button>
              <button onClick={() => { setStatus(t.key, "approved", "approved"); onClose(); }} className="v5-navy" style={{ flex: 1, padding: "11px 14px", border: "none", borderRadius: 11, fontWeight: 600, fontSize: 13.5, color: "#fff", background: NAVY, cursor: "pointer" }}>Approve</button>
            </div>
          ) : maySubmit ? (
            <button onClick={() => { setStatus(t.key, "awaiting", "submitted for approval"); onClose(); }} className="v5-accent" style={{ width: "100%", padding: 12, border: "none", borderRadius: 11, fontWeight: 600, fontSize: 13.5, color: "#fff", background: ACCENT, cursor: "pointer" }}>Submit for approval</button>
          ) : mayExecute ? (
            <button onClick={() => { setStatus(t.key, "done", "executed → done"); onClose(); }} className="v5-navy" style={{ width: "100%", padding: 12, border: "none", borderRadius: 11, fontWeight: 600, fontSize: 13.5, color: "#fff", background: NAVY, cursor: "pointer" }}>Mark executed → Done</button>
          ) : (
            <div style={{ fontSize: 12.5, color: INK4, textAlign: "center", padding: "4px 0", lineHeight: 1.5 }}>{t.status === "awaiting" ? <>Needs <b>{t.type}</b> approval — assigned to <b>{approver.name}</b>. Your role can&apos;t approve this.</> : "No action for your role at this stage."}</div>
          )}
        </div>
      </div>
    </>
  );
}

function TicketsBoard({ tickets, setTickets, viewer, setViewer, tfilter }: { tickets: Ticket[]; setTickets: (f: (t: Ticket[]) => Ticket[]) => void; viewer: Member; setViewer: (m: Member) => void; tfilter: string }) {
  const matchFilter = (t: Ticket) => tfilter === "all" || (tfilter === "mine" ? t.approverId === viewer.id : t.type === tfilter);
  const [sel, setSel] = useState<string | null>(null);
  const [vaOpen, setVaOpen] = useState(false);
  const selT = tickets.find((t) => t.key === sel) || null;
  const setStatus = (key: string, status: Status, action: string) => setTickets((ts) => ts.map((t) => t.key === key ? { ...t, status, activity: [{ at: "just now", who: viewer.name, action }, ...t.activity] } : t));
  const canCreate = can(viewer, "tickets.create");
  const addTicket = () => setTickets((ts) => {
    const nums = ts.map((t) => parseInt(t.key.split("-")[1]) || 0);
    const key = "AT-" + (Math.max(143, ...nums) + 1);
    const nt: Ticket = { key, type: "budget", title: "New budget request", description: "Draft — edit the details and submit for approval.", status: "open", priority: "med", channel: "meta", reporterId: viewer.id, approverId: "fin", agent: "Media buying", data: [{ label: "PROPOSED", value: "₹—/day", accent: true }], comments: [], activity: [{ at: "just now", who: viewer.name, action: "created" }], createdAt: "just now" };
    return [nt, ...ts];
  });

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <span style={{ fontSize: 12.5, color: INK4, fontWeight: 500 }}>Viewing as</span>
          <div style={{ position: "relative" }}>
            <button onClick={() => setVaOpen((o) => !o)} style={{ display: "flex", alignItems: "center", gap: 9, background: "var(--card)", border: `1px solid ${LINE}`, borderRadius: 11, padding: "7px 11px 7px 8px", cursor: "pointer" }}>
              {mav(viewer, 26)}
              <span style={{ textAlign: "left" }}><span style={{ display: "block", fontWeight: 600, fontSize: 13 }}>{viewer.name}</span><span style={{ display: "block", fontSize: 10.5, color: INK4 }}>{viewer.title}</span></span>
              <span style={{ color: INK3 }}>{RAIL.chevD}</span>
            </button>
            {vaOpen && (<>
              <div onClick={() => setVaOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
              <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 50, background: "var(--card)", border: `1px solid ${LINE}`, borderRadius: 12, boxShadow: "0 16px 40px -10px rgba(27,36,64,.25)", padding: 6, width: 290 }}>
                {MEMBERS.map((m) => (
                  <button key={m.id} onClick={() => { setViewer(m); setVaOpen(false); }} className="v5-row" style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", border: "none", background: m.id === viewer.id ? "#f5f6fa" : "transparent", borderRadius: 9, padding: "8px 9px", cursor: "pointer", textAlign: "left" }}>
                    {mav(m, 30)}
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</div><div style={{ fontSize: 11, color: INK4 }}>{m.title}</div></div>
                    <span style={{ fontFamily: FM, fontSize: 9, letterSpacing: ".5px", color: m.org === "ROI Labs" ? ACCENT : INK4, background: m.org === "ROI Labs" ? ACCENT_SOFT : "var(--line)", padding: "2px 6px", borderRadius: 5 }}>{m.role.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </>)}
          </div>
          <span style={{ fontSize: 11.5, color: INK3 }}>· {effectivePerms(viewer).size} permissions</span>
        </div>
        <button onClick={addTicket} disabled={!canCreate} title={canCreate ? "Create a ticket" : "Your role can't create tickets"} className={canCreate ? "v5-navy" : undefined} style={{ display: "flex", alignItems: "center", gap: 7, border: "none", background: canCreate ? NAVY : "var(--line)", color: canCreate ? "#fff" : INK3, fontWeight: 600, fontSize: 13.5, padding: "10px 16px", borderRadius: 11, cursor: canCreate ? "pointer" : "not-allowed" }}>+ New ticket</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, alignItems: "start" }}>
        {COLUMNS.map((col) => {
          const list = tickets.filter((t) => (t.status === col.id || (col.id === "done" && t.status === "rejected")) && matchFilter(t));
          return (
            <div key={col.id} style={{ background: "var(--subtle)", borderRadius: 16, padding: 12, minHeight: 130 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px 12px" }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: COL_DOT[col.id] }} />
                <span style={{ fontWeight: 700, fontSize: 13 }}>{col.label}</span>
                <span style={{ fontFamily: FM, fontSize: 11, color: INK4, background: "#edeff4", borderRadius: 7, padding: "1px 7px" }}>{list.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {list.map((t) => <TicketCard key={t.key} t={t} onClick={() => setSel(t.key)} />)}
                {list.length === 0 && <div style={{ fontSize: 12, color: "var(--ink3)", textAlign: "center", padding: "16px 0" }}>—</div>}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ height: 18 }} />
      <Disclaimer />
      {selT && <TicketDrawer t={selT} viewer={viewer} onClose={() => setSel(null)} setStatus={setStatus} />}
    </>
  );
}
