"use client";

// Honest, client-facing tenant cockpit (D29). Renders ONLY data that genuinely
// exists for the account — real Shopify revenue + real Google Ads performance,
// real engine ops (runs/approvals/activity). Sources that aren't connected show
// an "awaiting connection" card, never a modeled number. Pure presentational:
// all data arrives as props from TenantShell (which fetched the membership-gated
// /api/engine/tenant-cockpit). Reuses the v5 design language (tokens, dark mode).

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { TenantCockpit as TC, TenantRangeKey, TenantRange } from "@/lib/engine/tenant-cockpit";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

// ── tokens (themeable via CSS vars on .tcroot) — mirrors engine/v5.tsx ──────────
const APP = "var(--bg)", CARD = "var(--card)", SUBTLE = "var(--subtle)", NAVY = "var(--btn)";
const INK = "var(--ink)", INK4 = "var(--ink4)", INK3 = "var(--ink3)", LINE = "var(--line)";
const ACCENT = "#4F5BD5", ACCENT_SOFT = "var(--accent-soft)";
const GREEN = "#2BBF7A", GREEN_SOFT = "var(--green-soft)", GREEN_TX = "var(--green-tx)";
const AMBER = "var(--amber)", AMBER_SOFT = "var(--amber-soft)";
const FD = "'Poppins', system-ui, sans-serif", FM = "'DM Mono', ui-monospace, monospace";

const THEME_CSS = `
.tcroot{ --bg:#F3F5F9; --card:#FFFFFF; --subtle:#F7F8FB; --ink:#1B2440; --ink4:#8B93A7; --ink3:#AAB2C3;
  --label:#5E6678; --btn:#1B2440; --line:#EDEFF4; --card-bd:transparent; --accent-soft:#EEF0FB;
  --green-soft:#DCF3E8; --green-tx:#0D9F72; --amber:#C08A2E; --amber-soft:#FDECCF; --violet-soft:#ECE9FD;
  --shadow:0 2px 14px rgba(27,36,64,.05); }
.tcroot[data-theme="dark"]{ --bg:#0E1422; --card:#1A2132; --subtle:#141B29; --ink:#EAEDF5; --ink4:#8E96AB;
  --ink3:#7E889C; --label:#9AA3B8; --btn:#3A4A82; --line:#2A3346; --card-bd:#2A3346;
  --accent-soft:rgba(79,91,213,.22); --green-soft:rgba(43,191,122,.18); --green-tx:#34D399; --amber:#E0A94A;
  --amber-soft:rgba(192,138,46,.22); --violet-soft:rgba(108,92,231,.22); --shadow:0 2px 18px rgba(0,0,0,.45); }
.tcroot[data-theme="dark"] .tc-nav:hover{background:#222c40;color:#8a92f5}
.tcroot[data-theme="dark"] .tc-card:hover{box-shadow:0 8px 26px rgba(0,0,0,.55)}
.tcroot[data-theme="dark"] .tc-ic:hover{background:#222c40}
`;

const card: CSSProperties = { background: CARD, borderRadius: 22, boxShadow: "var(--shadow)", border: "1px solid var(--card-bd)" };
const monoLabel: CSSProperties = { fontFamily: FM, fontSize: 11, letterSpacing: "1.3px", color: "var(--label)" };

type Page = "overview" | "approvals" | "runs" | "activity";

// ── icons ──────────────────────────────────────────────────────────────────────
const ic = (path: ReactNode, w = 1.8, s = 22): ReactNode => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">{path}</svg>;
const I = {
  overview: ic(<><rect x="3" y="3" width="7" height="7" rx="1.6" /><rect x="14" y="3" width="7" height="7" rx="1.6" /><rect x="3" y="14" width="7" height="7" rx="1.6" /><rect x="14" y="14" width="7" height="7" rx="1.6" /></>),
  approvals: ic(<><path d="M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6l-8-3Z" /><path d="M9 12l2 2 4-4" /></>, 1.7),
  runs: ic(<><path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 4v5h-5" /></>),
  activity: ic(<path d="M3 12h4l3 8 4-16 3 8h4" />),
  search: ic(<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>, 2, 18),
  bell: ic(<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>, 1.8, 20),
};

// ── formatters ───────────────────────────────────────────────────────────────
const SYM: Record<string, string> = { INR: "₹", USD: "$", EUR: "€", GBP: "£", AED: "AED " };
function money(cents: number, cur: string): string {
  const s = SYM[cur] ?? cur + " ";
  const r = cents / 100;
  if (!Number.isFinite(r)) return s + "0";
  if (cur === "INR") {
    if (r >= 1e7) return s + (r / 1e7).toFixed(2) + "Cr";
    if (r >= 1e5) return s + (r / 1e5).toFixed(2) + "L";
    if (r >= 1000) return s + Math.round(r).toLocaleString("en-IN");
    return s + Math.round(r);
  }
  if (r >= 1e6) return s + (r / 1e6).toFixed(2) + "M";
  if (r >= 1e3) return s + (r / 1e3).toFixed(1) + "K";
  return s + Math.round(r);
}
const num = (n: number) => Math.round(n).toLocaleString("en-IN");
const merx = (x: number) => (Number.isFinite(x) ? x.toFixed(2) : "0.00") + "×";
function svgPath(vals: number[], w: number, h: number): { line: string; area: string } {
  if (vals.length < 2) return { line: "", area: "" };
  const max = Math.max(...vals), min = Math.min(...vals), rng = max - min || 1;
  const pts = vals.map((v, i) => [(i / (vals.length - 1)) * w, h - 8 - ((v - min) / rng) * (h - 16)]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  return { line, area: `${line} L ${w} ${h} L 0 ${h} Z` };
}
function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return ""; // guard a bad/missing timestamp (rtf.format(NaN) throws)
  const diff = (t - Date.now()) / 1000; // negative = past
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (abs < 90) return rtf.format(Math.round(diff), "second");
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  return rtf.format(Math.round(diff / 86400), "day");
}

function SrcLogo({ id, size = 36, radius = 11 }: { id: "google" | "meta" | "shopify"; size?: number; radius?: number }) {
  const src = id === "google" ? "/logos/google.jpg" : id === "meta" ? "/logos/meta.png" : "/logos/shopify.svg";
  return (
    <span style={{ width: size, height: size, borderRadius: radius, background: "var(--card)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${BP}${src}`} alt={id} style={{ width: size * 0.62, height: size * 0.62, objectFit: "contain", display: "block" }} />
    </span>
  );
}

const LIVE = <span style={{ fontFamily: FM, fontSize: 9, letterSpacing: ".5px", padding: "2px 6px", borderRadius: 5, background: GREEN_SOFT, color: GREEN_TX }}>LIVE</span>;

export default function TenantCockpit({ data, role, onSignOut }: { data: TC; role: string; onSignOut?: () => void }) {
  const [page, setPage] = useState<Page>("overview");
  const [range, setRange] = useState<TenantRangeKey>("28D");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("v5theme");
      if (saved === "dark" || saved === "light") setTheme(saved);
      else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) setTheme("dark");
    } catch { /* ignore */ }
  }, []);
  useEffect(() => { try { localStorage.setItem("v5theme", theme); } catch { /* ignore */ } }, [theme]);

  const D = data.ranges[range];
  const cur = data.currency;
  const conn = data.connections;
  const mono = (data.accountName || "?").trim().charAt(0).toUpperCase();
  const pendingCount = data.ops.approvals.length;

  const railBtn = (id: Page, icon: ReactNode, label: string, badge?: number) => {
    const active = page === id;
    return (
      <div title={label} onClick={() => setPage(id)} className={active ? undefined : "tc-nav"} style={{ position: "relative", width: 46, height: 46, borderRadius: 13, background: active ? ACCENT_SOFT : "transparent", color: active ? ACCENT : "var(--ink3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        {active && <div style={{ position: "absolute", left: -18, width: 4, height: 24, borderRadius: "0 4px 4px 0", background: ACCENT }} />}
        {icon}
        {badge ? <span style={{ position: "absolute", top: 6, right: 6, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 8, background: "#EF6B6B", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--card)" }}>{badge}</span> : null}
      </div>
    );
  };

  const connRow = (id: "google" | "meta" | "shopify", name: string, on: boolean) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: `1px solid ${LINE}`, borderRadius: 13 }}>
      <SrcLogo id={id} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
        <div style={{ fontSize: 12, color: INK4 }}>{on ? "Connected" : "Not connected"}</div>
      </div>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: on ? GREEN : "var(--ink3)" }} />
    </div>
  );

  const Rail = (
    <div style={{ width: 76, background: CARD, borderRight: `1px solid ${LINE}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "18px 0", flexShrink: 0, zIndex: 3 }}>
      <div style={{ width: 46, height: 46, borderRadius: 14, background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22, flexShrink: 0, padding: "0 7px" }}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={`${BP}/logos/roi-mark.png`} alt="ROI Labs" style={{ width: "100%", objectFit: "contain", display: "block" }} /></div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        {railBtn("overview", I.overview, "Overview")}
        {railBtn("approvals", I.approvals, "Approvals", pendingCount)}
        {railBtn("runs", I.runs, "Runs")}
        {railBtn("activity", I.activity, "Activity")}
      </div>
    </div>
  );

  const Panel = (
    <div style={{ width: 296, background: CARD, borderRight: `1px solid ${LINE}`, display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto", padding: "26px 20px", zIndex: 2 }}>
      <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: 12, display: "flex", alignItems: "center", gap: 11 }}>
        <span style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#6c5ce7,#4f5bd5)", color: "#fff", fontWeight: 700, fontSize: 15 }}>{mono}</span>
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ color: INK, fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{data.accountName}</div><div style={{ fontSize: 11, color: INK4 }}>{role}</div></div>
      </div>
      <div style={{ ...monoLabel, margin: "26px 0 12px 4px" }}>DATA SOURCES</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {connRow("shopify", "Shopify", conn.shopify)}
        {connRow("google", "Google", conn.google)}
        {connRow("meta", "Meta", conn.meta)}
      </div>
      <div style={{ ...monoLabel, margin: "26px 0 12px 4px" }}>RANGE</div>
      <div style={{ display: "flex", gap: 6 }}>
        {(["7D", "28D"] as TenantRangeKey[]).map((r) => (
          <button key={r} onClick={() => setRange(r)} style={{ flex: 1, padding: "9px 0", borderRadius: 11, border: `1px solid ${range === r ? ACCENT : LINE}`, background: range === r ? ACCENT_SOFT : CARD, color: range === r ? ACCENT : INK4, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>{r === "7D" ? "Last 7 days" : "Last 28 days"}</button>
        ))}
      </div>
      <div style={{ marginTop: 22, fontSize: 11, color: INK3, lineHeight: 1.55 }}>Figures are pulled live from your connected accounts. Sources that aren&apos;t connected yet show as &ldquo;awaiting&rdquo; — never estimated.</div>
    </div>
  );

  const Topbar = (
    <div style={{ height: 70, flexShrink: 0, background: CARD, borderBottom: `1px solid ${LINE}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", zIndex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11, background: APP, borderRadius: 12, padding: "11px 15px", width: 360, color: INK3 }}>{I.search}<span style={{ fontSize: 14 }}>Search…</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: APP, borderRadius: 20, padding: "7px 13px" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN }} /><span style={{ fontSize: 12.5, color: INK4, fontWeight: 500 }}>Live · {timeAgo(data.generatedAt)}</span></div>
        <div onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} title="Toggle theme" className="tc-ic" style={{ width: 40, height: 40, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", color: INK4, cursor: "pointer" }}>{theme === "dark"
          ? <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
          : <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>}</div>
        <div className="tc-ic" style={{ width: 40, height: 40, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", color: INK4, cursor: "pointer" }}>{I.bell}</div>
        <div style={{ width: 1, height: 28, background: LINE }} />
        {onSignOut && <button onClick={onSignOut} style={{ background: "none", border: `1px solid ${LINE}`, color: INK4, borderRadius: 11, padding: "9px 16px", fontSize: 13, cursor: "pointer", fontFamily: FD }}>Sign out</button>}
      </div>
    </div>
  );

  return (
    <div className="tcroot" data-theme={theme} style={{ zoom: 0.8, display: "flex", height: "125vh", width: "125vw", overflow: "hidden", fontFamily: FD, color: INK, background: APP, WebkitFontSmoothing: "antialiased" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        ${THEME_CSS}
        @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(43,191,122,.5)}70%{box-shadow:0 0 0 7px rgba(43,191,122,0)}100%{box-shadow:0 0 0 0 rgba(43,191,122,0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        .tcsc::-webkit-scrollbar{width:9px;height:9px}.tcsc::-webkit-scrollbar-thumb{background:#dfe2ea;border-radius:8px}
        .tcroot[data-theme="dark"] .tcsc::-webkit-scrollbar-thumb{background:#33405c}
        .tc-nav{transition:background .15s,color .15s}.tc-nav:hover{background:#f5f6fa;color:#4f5bd5}
        .tc-card{transition:box-shadow .18s}.tc-card:hover{box-shadow:0 8px 26px rgba(27,36,64,.10)}
        .tc-ic{transition:background .15s}.tc-ic:hover{background:#f3f5f9}`}</style>
      {Rail}
      {Panel}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {Topbar}
        <div className="tcsc" style={{ flex: 1, overflowY: "auto", padding: "24px 28px 40px" }}>
          {page === "overview" && <Overview data={data} D={D} range={range} setRange={setRange} cur={cur} />}
          {page === "approvals" && <Approvals rows={data.ops.approvals} cur={cur} />}
          {page === "runs" && <Runs rows={data.ops.runs} />}
          {page === "activity" && <Activity rows={data.ops.activity} cur={cur} />}
        </div>
      </div>
    </div>
  );
}

// ── empty / awaiting states ──────────────────────────────────────────────────
function Awaiting({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="tc-card" style={{ ...card, borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 10, minHeight: 150, justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>{icon}<div style={{ fontSize: 15.5, fontWeight: 600 }}>{title}</div></div>
      <div style={{ fontSize: 13, color: INK4, lineHeight: 1.55 }}>{body}</div>
      <div style={{ fontFamily: FM, fontSize: 9.5, letterSpacing: "1px", color: INK3, marginTop: 2 }}>NOT CONNECTED</div>
    </div>
  );
}
function EmptyBlock({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ ...card, borderRadius: 20, padding: "48px 28px", textAlign: "center" }}>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 7 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: INK4, maxWidth: 440, margin: "0 auto", lineHeight: 1.6 }}>{body}</div>
    </div>
  );
}

// ── OVERVIEW ─────────────────────────────────────────────────────────────────
function Overview({ data, D, range, setRange, cur }: { data: TC; D: TenantRange; range: TenantRangeKey; setRange: (r: TenantRangeKey) => void; cur: string }) {
  const rw = `Last ${D.days} days`;
  const sp = svgPath((D.store?.daily ?? []).map((d) => d.revenueCents), 760, 200);
  const gp = svgPath((D.google?.daily ?? []).map((d) => d.spendCents), 760, 200);
  const metaIcon = <SrcLogo id="meta" size={40} radius={11} />;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 25, fontWeight: 700, letterSpacing: "-.4px" }}>{data.accountName}</div>
          <div style={{ fontSize: 13, color: INK4, marginTop: 3 }}>Revenue &amp; ad performance · {rw}</div>
        </div>
        <div style={{ display: "flex", gap: 4, background: "var(--line)", borderRadius: 10, padding: 3 }}>
          {(["7D", "28D"] as TenantRangeKey[]).map((r) => <div key={r} onClick={() => setRange(r)} style={{ padding: "6px 13px", borderRadius: 7, fontSize: 12.5, fontWeight: range === r ? 600 : 500, color: range === r ? ACCENT : INK4, background: range === r ? "var(--card)" : "transparent", cursor: "pointer" }}>{r}</div>)}
        </div>
      </div>

      {/* hero: revenue + trend */}
      {D.store ? (
        <div style={{ ...card, padding: 28, marginBottom: 18, display: "flex", gap: 36, animation: "fadeUp .5s ease both" }}>
          <div style={{ flex: "0 0 38%" }}>
            <div style={{ ...monoLabel, display: "flex", alignItems: "center", gap: 8 }}>STORE · SHOPIFY {LIVE}</div>
            <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-1px", marginTop: 14 }}>{money(D.store.revenueCents, cur)}</div>
            <div style={{ fontSize: 13.5, color: INK4, marginTop: 4 }}>Store revenue · <span style={{ color: INK, fontWeight: 600 }}>{num(D.store.orders)} orders</span></div>
            <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
              <div style={{ flex: 1, background: SUBTLE, borderRadius: 15, padding: 15 }}><div style={{ ...monoLabel, fontSize: 10, letterSpacing: "1px", marginBottom: 6 }}>AOV</div><div style={{ fontSize: 22, fontWeight: 700 }}>{money(D.store.aovCents, cur)}</div></div>
              <div style={{ flex: 1, background: SUBTLE, borderRadius: 15, padding: 15 }}><div style={{ ...monoLabel, fontSize: 10, letterSpacing: "1px", marginBottom: 6 }}>BLENDED MER</div><div style={{ fontSize: 22, fontWeight: 700 }}>{D.blendedMer != null ? merx(D.blendedMer) : "—"}</div></div>
            </div>
          </div>
          <div style={{ flex: 1, borderLeft: "1px solid var(--line)", paddingLeft: 36, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", gap: 18, marginBottom: 8 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: INK4, fontWeight: 500 }}><span style={{ width: 11, height: 3, borderRadius: 2, background: ACCENT }} />Store revenue</span>
              {D.google && <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: INK4, fontWeight: 500 }}><span style={{ width: 11, height: 3, borderRadius: 2, background: "var(--ink4)" }} />Ad spend</span>}
            </div>
            <svg viewBox="0 0 760 200" preserveAspectRatio="none" style={{ width: "100%", height: 210, display: "block" }}>
              <defs><linearGradient id="tcarea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={ACCENT} stopOpacity="0.16" /><stop offset="1" stopColor={ACCENT} stopOpacity="0" /></linearGradient></defs>
              {sp.area && <path d={sp.area} fill="url(#tcarea)" />}
              {gp.line && <path d={gp.line} fill="none" stroke="var(--ink4)" strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />}
              {sp.line && <path d={sp.line} fill="none" stroke={ACCENT} strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round" />}
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontFamily: FM, fontSize: 10.5, color: INK3 }}>
              {(() => { const xs = (D.store.daily).filter((d) => d.date).map((d) => d.date); return xs.length ? [xs[0], xs[Math.floor(xs.length / 2)], xs[xs.length - 1]].map((d, i) => <span key={i}>{d}</span>) : <span>{rw}</span>; })()}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 18 }}><Awaiting icon={<SrcLogo id="shopify" size={40} radius={11} />} title="Store revenue · Shopify" body="Connect your Shopify store to see real revenue, orders and AOV here." /></div>
      )}

      {/* KPI row — only the metrics that are genuinely live */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 18 }}>
        {D.store && <Kpi t="Orders" v={num(D.store.orders)} src="SHOPIFY" rw={rw} />}
        {D.store && <Kpi t="AOV" v={money(D.store.aovCents, cur)} src="SHOPIFY" rw={rw} />}
        {D.google && <Kpi t="Ad spend" v={money(D.google.spendCents, cur)} src="GOOGLE" rw={rw} />}
        {D.google && <Kpi t="Installs" v={num(D.google.installs)} src="GOOGLE" rw={rw} />}
      </div>

      {/* Google performance */}
      {D.google ? (
        <div className="tc-card" style={{ ...card, borderRadius: 20, padding: 24, marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}><SrcLogo id="google" size={40} radius={11} /><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 15.5, fontWeight: 600 }}>Google Ads</div><div style={{ fontSize: 12, color: INK4 }}>Spend · installs · CPI</div></div>{LIVE}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 18 }}>
            {([["Spend", money(D.google.spendCents, cur)], ["Installs", num(D.google.installs)], ["CPI", money(D.google.cpiCents, cur)], ["Impressions", num(D.google.impressions)], ["Clicks", num(D.google.clicks)]] as [string, string][]).map(([t, v]) => (
              <div key={t}><div style={{ fontSize: 20, fontWeight: 700 }}>{v}</div><div style={{ fontSize: 11.5, color: INK4, marginTop: 2 }}>{t}</div></div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 18 }}><Awaiting icon={<SrcLogo id="google" size={40} radius={11} />} title="Google Ads" body="Connect Google Ads to see real spend, installs and CPI here." /></div>
      )}

      {/* awaiting connections */}
      <div style={{ ...monoLabel, margin: "4px 0 12px 2px" }}>NOT YET CONNECTED</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {!data.connections.meta && <Awaiting icon={metaIcon} title="Meta Ads" body="Connect Meta to see spend, ROAS and purchases attributed to your store." />}
        {!data.connections.subscriptions && <Awaiting icon={<span style={{ width: 40, height: 40, borderRadius: 11, background: ACCENT_SOFT, color: ACCENT, display: "flex", alignItems: "center", justifyContent: "center" }}>{I.activity}</span>} title="Subscriptions" body="Connect Stripe / Razorpay / UPI / PayPal to track recurring revenue and MRR." />}
        <Awaiting icon={<span style={{ width: 40, height: 40, borderRadius: 11, background: AMBER_SOFT, color: AMBER, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FM, fontWeight: 700, fontSize: 13 }}>GA</span>} title="Web analytics · GA4" body="Connect GA4 to see sessions, audience demographics, channels and devices." />
      </div>
    </>
  );
}
function Kpi({ t, v, src, rw }: { t: string; v: string; src: string; rw: string }) {
  const isG = src === "GOOGLE";
  return (
    <div className="tc-card" style={{ ...card, borderRadius: 18, padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><span style={{ fontSize: 14, fontWeight: 600 }}>{t}</span><span style={{ fontFamily: FM, fontSize: 9.5, letterSpacing: "1px", background: isG ? AMBER_SOFT : "var(--violet-soft)", color: isG ? AMBER : "#6c5ce7", padding: "3px 7px", borderRadius: 6 }}>{src}</span></div>
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-.5px", marginTop: 9 }}>{v}</div>
      <div style={{ fontSize: 12.5, marginTop: 4 }}>{LIVE} <span style={{ color: INK3 }}>· {rw.toLowerCase()}</span></div>
    </div>
  );
}

// ── RUNS ─────────────────────────────────────────────────────────────────────
function Runs({ rows }: { rows: TC["ops"]["runs"] }) {
  if (!rows.length) return <EmptyBlock title="No optimization runs yet" body="When the engine runs an audit or creative cycle on your account, each run shows here with what it analyzed and produced." />;
  const dot = (s: string) => s === "done" ? GREEN : s === "error" ? "#EF6B6B" : ACCENT;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {rows.map((r) => (
        <div key={r.id} className="tc-card" style={{ ...card, borderRadius: 16, padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: dot(r.status), flexShrink: 0, animation: r.status === "running" ? "pulse 2s infinite" : "none" }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, textTransform: "capitalize" }}>{r.step} run</div>
            <div style={{ fontSize: 12.5, color: INK4, marginTop: 2 }}>{r.summary || "—"}</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontFamily: FM, fontSize: 11, letterSpacing: ".5px", color: r.status === "done" ? GREEN_TX : r.status === "error" ? "#EF6B6B" : ACCENT }}>{r.status.toUpperCase()}</div>
            <div style={{ fontSize: 11.5, color: INK3, marginTop: 3 }}>{timeAgo(r.startedAt)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── APPROVALS ────────────────────────────────────────────────────────────────
function Approvals({ rows, cur }: { rows: TC["ops"]["approvals"]; cur: string }) {
  if (!rows.length) return <EmptyBlock title="No pending approvals" body="Spend-affecting changes the engine proposes will appear here for sign-off. Nothing changes your campaigns until it's approved." />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {rows.map((a) => (
        <div key={a.id} className="tc-card" style={{ ...card, borderRadius: 18, padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{a.summary}</div>
            <span style={{ fontFamily: FM, fontSize: 9.5, letterSpacing: "1px", background: "var(--blue-soft, var(--accent-soft))", color: ACCENT, padding: "4px 9px", borderRadius: 7 }}>{a.kind.replace(/_/g, " ").toUpperCase()}</span>
          </div>
          <div style={{ display: "flex", gap: 22, marginTop: 14, fontSize: 13, color: INK4 }}>
            <span>Agent · <b style={{ color: INK, textTransform: "capitalize" }}>{a.agent}</b></span>
            {a.estimatedSpendCents > 0 && <span>Daily spend impact · <b style={{ color: INK }}>{money(a.estimatedSpendCents, cur)}</b></span>}
            <span>{timeAgo(a.createdAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── ACTIVITY ─────────────────────────────────────────────────────────────────
function Activity({ rows, cur }: { rows: TC["ops"]["activity"]; cur: string }) {
  if (!rows.length) return <EmptyBlock title="No activity yet" body="Every read, recommendation and change the engine makes on your account is logged here — the full audit trail." />;
  return (
    <div style={{ ...card, borderRadius: 20, padding: "8px 0" }}>
      {rows.map((a, i) => (
        <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 24px", borderTop: i ? "1px solid var(--line)" : "none" }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: SUBTLE, color: INK4, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FM, fontSize: 10, fontWeight: 700, flexShrink: 0, textTransform: "uppercase" }}>{a.agent.slice(0, 2)}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{a.summary}</div>
            <div style={{ fontSize: 11.5, color: INK4, marginTop: 2 }}><span style={{ textTransform: "capitalize" }}>{a.agent}</span> · {a.kind.replace(/_/g, " ")}</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontFamily: FM, fontSize: 10, letterSpacing: ".5px", color: INK3, textTransform: "uppercase" }}>{a.status}</div>
            <div style={{ fontSize: 11, color: INK3, marginTop: 3 }}>{timeAgo(a.createdAt)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
