"use client";

// ROI Engine — "Studio" demo (Dutask-inspired project-management aesthetic).
// A separate design exploration: the same ad-ops data as the v3 cockpit, laid out
// in a modern PM-dashboard language — soft rounded cards, a violet accent, a kanban
// campaign board, task-style approvals, sparkline stat cards. Self-contained, demo
// data for "The Astro Time". Route: /engine/v4.
import { useState, type CSSProperties, type ReactNode } from "react";

// ── palette ────────────────────────────────────────────────────────────────
const BG = "#F5F6FA";
const CARD = "#FFFFFF";
const INK = "#1E2138";
const MUTED = "#8A8FA3";
const FAINT = "#B7BBCB";
const LINE = "#EEF0F4";
const VIOLET = "#6C5CE7";
const BLUE = "#4D7CFE";
const MINT = "#13C296";
const AMBER = "#FBAD3F";
const CORAL = "#FF6B6B";
const FD = "'Plus Jakarta Sans', system-ui, sans-serif";

const card: CSSProperties = { background: CARD, borderRadius: 22, boxShadow: "0 4px 24px rgba(28,30,56,.05)", border: "1px solid #F1F2F6" };
const chipIcon = (bg: string, fg: string): CSSProperties => ({ width: 42, height: 42, borderRadius: 13, background: bg, color: fg, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" });

// ── tiny svg helpers ─────────────────────────────────────────────────────────
function Spark({ data, color, w = 130, h = 40, fill }: { data: number[]; color: string; w?: number; h?: number; fill?: boolean }) {
  const max = Math.max(...data), min = Math.min(...data), rng = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - 4 - ((v - min) / rng) * (h - 8)]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const gid = "sg" + color.replace("#", "");
  return (
    <svg width={w} height={h} style={{ display: "block", overflow: "visible" }}>
      {fill && (
        <>
          <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.18" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
          <path d={`${line} L ${w} ${h} L 0 ${h} Z`} fill={`url(#${gid})`} />
        </>
      )}
      <path d={line} fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AreaChart({ rev, spend, w = 560, h = 200 }: { rev: number[]; spend: number[]; w?: number; h?: number }) {
  const all = [...rev, ...spend], max = Math.max(...all), min = Math.min(...all) * 0.7, rng = max - min || 1;
  const path = (d: number[]) => d.map((v, i) => `${i ? "L" : "M"}${((i / (d.length - 1)) * w).toFixed(1)} ${(h - ((v - min) / rng) * h).toFixed(1)}`).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs><linearGradient id="areaRev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={VIOLET} stopOpacity="0.22" /><stop offset="100%" stopColor={VIOLET} stopOpacity="0" /></linearGradient></defs>
      <path d={`${path(rev)} L ${w} ${h} L 0 ${h} Z`} fill="url(#areaRev)" />
      <path d={path(rev)} fill="none" stroke={VIOLET} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <path d={path(spend)} fill="none" stroke={FAINT} strokeWidth={2.4} strokeDasharray="2 5" strokeLinecap="round" />
    </svg>
  );
}

function Donut({ segs, size = 150 }: { segs: { v: number; color: string }[]; size?: number }) {
  const total = segs.reduce((a, s) => a + s.v, 0) || 1;
  const r = size / 2 - 13, c = 2 * Math.PI * r;
  let off = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F0F1F6" strokeWidth={14} />
      {segs.map((s, i) => {
        const len = (s.v / total) * c;
        const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={14} strokeLinecap="round" strokeDasharray={`${Math.max(len - 5, 0)} ${c}`} strokeDashoffset={-off} transform={`rotate(-90 ${size / 2} ${size / 2})`} />;
        off += len;
        return el;
      })}
    </svg>
  );
}

// ── icons (stroke, 1.9) ──────────────────────────────────────────────────────
const I = (p: ReactNode, s = 19): ReactNode => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">{p}</svg>;
const icons = {
  grid: I(<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>),
  board: I(<><rect x="3" y="3" width="18" height="18" rx="2.5" /><path d="M9 3v18M15 3v18" /></>),
  layers: I(<><path d="M12 2 2 7l10 5 10-5-10-5Z" /><path d="m2 17 10 5 10-5M2 12l10 5 10-5" /></>),
  check: I(<><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>),
  pulse: I(<path d="M3 12h4l3 8 4-16 3 8h4" />),
  chart: I(<><path d="M3 3v18h18" /><path d="M7 14l3-3 3 3 5-6" /></>),
  gear: I(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6h.09A1.65 1.65 0 0 0 11 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></>),
  bell: I(<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>),
  search: I(<><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>),
  bolt: I(<path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />),
};

// ── demo data ─────────────────────────────────────────────────────────────────
const stats = [
  { label: "Store revenue", value: "₹42.8L", delta: "+16.4%", up: true, color: VIOLET, soft: "#EEECFD", icon: icons.bolt, spark: [22, 26, 24, 30, 28, 34, 33, 38, 42] },
  { label: "Blended ROAS", value: "3.22×", delta: "+4.2%", up: true, color: MINT, soft: "#E2F7F1", icon: icons.chart, spark: [18, 20, 19, 24, 23, 26, 28, 30, 32] },
  { label: "Ad spend", value: "₹16.2L", delta: "+5.1%", up: false, color: AMBER, soft: "#FFF3E2", icon: icons.pulse, spark: [30, 28, 31, 29, 33, 32, 35, 34, 36] },
  { label: "App installs", value: "18.4K", delta: "+11.0%", up: true, color: BLUE, soft: "#E8EFFF", icon: icons.layers, spark: [12, 14, 13, 16, 18, 17, 20, 22, 24] },
];
const revSeries = [30, 33, 31, 37, 35, 40, 38, 44, 41, 47, 45, 50, 48, 54];
const spendSeries = [20, 21, 20, 23, 22, 24, 23, 25, 24, 26, 25, 27, 26, 28];

const columns = [
  { key: "review", title: "In review", color: AMBER, items: [
    { t: "Launch PMax — App installs", plat: "Google", pc: BLUE, ps: "#E8EFFF", metric: "₹2,000/day", prog: 33, who: "PL", whoC: BLUE, pri: "High", priC: CORAL },
    { t: "Publish 3 UGC variants", plat: "Meta", pc: VIOLET, ps: "#EEECFD", metric: "₹0 spend", prog: 10, who: "FR", whoC: VIOLET, pri: "Med", priC: AMBER },
  ] },
  { key: "live", title: "Live", color: MINT, items: [
    { t: "Advantage+ Shopping", plat: "Meta", pc: VIOLET, ps: "#EEECFD", metric: "ROAS 4.18×", prog: 75, who: "PL", whoC: BLUE, pri: "High", priC: MINT },
    { t: "Search — Brand", plat: "Google", pc: BLUE, ps: "#E8EFFF", metric: "CPI ₹34.4", prog: 60, who: "SC", whoC: AMBER, pri: "Low", priC: FAINT },
    { t: "Retargeting — 30d", plat: "Meta", pc: VIOLET, ps: "#EEECFD", metric: "ROAS 5.40×", prog: 82, who: "SG", whoC: MINT, pri: "Med", priC: AMBER },
  ] },
  { key: "opt", title: "Optimizing", color: VIOLET, items: [
    { t: "YouTube — Awareness", plat: "Google", pc: BLUE, ps: "#E8EFFF", metric: "CPI ₹41.9", prog: 45, who: "SG", whoC: MINT, pri: "Med", priC: AMBER },
    { t: "Creative refresh — fatigue", plat: "Meta", pc: VIOLET, ps: "#EEECFD", metric: "CPM ▲14%", prog: 28, who: "FR", whoC: VIOLET, pri: "High", priC: CORAL },
  ] },
];

const approvals = [
  { id: "a1", t: "Scale Advantage+ budget to ₹4,500/day", who: "Pilot", pri: "High", priC: CORAL },
  { id: "a2", t: "Launch capped PMax app-install test", who: "Pilot", pri: "Med", priC: AMBER },
  { id: "a3", t: "Publish 3 AI-disclosed UGC variants", who: "Forge", pri: "Low", priC: MINT },
];

const activity = [
  { who: "Scout", c: AMBER, t: "Flagged 8% unattributed store orders", time: "6m" },
  { who: "Pilot", c: BLUE, t: "Held Advantage+ ROAS at 4.18× — proposed scale", time: "22m" },
  { who: "Signal", c: MINT, t: "Reconciled Shopify revenue vs Meta pixel", time: "1h" },
  { who: "Frame", c: VIOLET, t: "Queued 3 UGC variants for review", time: "2h" },
];

const agents = [{ s: "SC", n: "Scout", c: AMBER }, { s: "FR", n: "Frame", c: VIOLET }, { s: "PL", n: "Pilot", c: BLUE }, { s: "MA", n: "Forge", c: MINT }, { s: "SG", n: "Signal", c: CORAL }];

// ── component ──────────────────────────────────────────────────────────────────
export default function EngineV4() {
  const [nav, setNav] = useState("dashboard");
  const [range, setRange] = useState("28D");
  const [done, setDone] = useState<Set<string>>(new Set());
  const toggle = (id: string) => setDone((d) => { const n = new Set(d); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: icons.grid },
    { id: "board", label: "Campaign board", icon: icons.board },
    { id: "sources", label: "Sources", icon: icons.layers },
    { id: "approvals", label: "Approvals", icon: icons.check, badge: approvals.length - done.size },
    { id: "activity", label: "Activity", icon: icons.pulse },
    { id: "reports", label: "Reports", icon: icons.chart },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%", background: BG, fontFamily: FD, color: INK, WebkitFontSmoothing: "antialiased" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .v4 *{box-sizing:border-box} .v4scroll::-webkit-scrollbar{width:9px;height:9px}.v4scroll::-webkit-scrollbar-thumb{background:#E2E4ED;border-radius:8px}
        .v4card{transition:box-shadow .2s, transform .2s} .v4kc{transition:box-shadow .18s, transform .18s} .v4kc:hover{box-shadow:0 10px 26px rgba(28,30,56,.10);transform:translateY(-2px)}`}</style>

      {/* ── SIDEBAR ── */}
      <aside className="v4" style={{ width: 248, flex: "none", background: CARD, borderRight: "1px solid #EEF0F4", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "22px 22px 18px" }}>
          <span style={{ width: 36, height: 36, borderRadius: 11, background: `linear-gradient(135deg, ${VIOLET}, #8E7BFF)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{icons.bolt}</span>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-.02em" }}>ROI Studio</span>
        </div>

        <nav style={{ padding: "6px 14px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          <div style={{ font: "700 10.5px " + FD, letterSpacing: ".13em", color: FAINT, textTransform: "uppercase", padding: "10px 12px 6px" }}>Menu</div>
          {navItems.map((it) => {
            const on = nav === it.id;
            return (
              <button key={it.id} onClick={() => setNav(it.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", borderRadius: 13, border: "none", cursor: "pointer", width: "100%", textAlign: "left", font: "600 14px " + FD, background: on ? VIOLET : "transparent", color: on ? "#fff" : MUTED, boxShadow: on ? "0 8px 18px -6px rgba(108,92,231,.6)" : "none" }}>
                <span style={{ display: "flex", color: on ? "#fff" : FAINT }}>{it.icon}</span>
                <span style={{ flex: 1 }}>{it.label}</span>
                {it.badge ? <span style={{ font: "700 11px " + FD, background: on ? "rgba(255,255,255,.25)" : "#FFE9E9", color: on ? "#fff" : CORAL, borderRadius: 8, padding: "2px 7px" }}>{it.badge}</span> : null}
              </button>
            );
          })}
          <div style={{ flex: 1 }} />
          <button onClick={() => setNav("settings")} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", borderRadius: 13, border: "none", cursor: "pointer", width: "100%", textAlign: "left", font: "600 14px " + FD, background: "transparent", color: MUTED }}>
            <span style={{ display: "flex", color: FAINT }}>{icons.gear}</span>Settings
          </button>
        </nav>

        <div style={{ margin: "8px 14px 16px", padding: 16, borderRadius: 18, background: "linear-gradient(150deg, #6C5CE7, #4D7CFE)", color: "#fff" }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Engine active</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 3, lineHeight: 1.4 }}>Spend cap ₹6K/day · dry-run safe. Upgrade to lift caps.</div>
          <button style={{ marginTop: 11, width: "100%", padding: "9px 0", borderRadius: 11, border: "none", background: "#fff", color: VIOLET, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Manage caps</button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="v4 v4scroll" style={{ flex: 1, minWidth: 0, height: "100vh", overflowY: "auto" }}>
        {/* topbar */}
        <header style={{ display: "flex", alignItems: "center", gap: 16, padding: "22px 32px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 auto", minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: "-.02em" }}>Good morning, Operator 👋</div>
            <div style={{ color: MUTED, fontSize: 13.5, marginTop: 3 }}>Here's what's happening with <b style={{ color: INK, fontWeight: 600 }}>The Astro Time</b> today.</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, background: CARD, border: "1px solid #ECEEF3", borderRadius: 13, padding: "10px 14px", color: FAINT, width: 210 }}>
              {icons.search}<input placeholder="Search campaigns…" style={{ border: "none", outline: "none", background: "transparent", font: "500 13.5px " + FD, color: INK, width: "100%" }} />
            </div>
            <button style={{ ...chipIcon(CARD, MUTED), width: 44, height: 44, border: "1px solid #ECEEF3", borderRadius: 13, position: "relative", cursor: "pointer" }}>{icons.bell}<span style={{ position: "absolute", top: 11, right: 12, width: 7, height: 7, borderRadius: "50%", background: CORAL, border: "2px solid #fff" }} /></button>
            <div style={{ display: "flex", alignItems: "center", gap: 9, background: CARD, border: "1px solid #ECEEF3", borderRadius: 13, padding: "6px 12px 6px 6px", cursor: "pointer" }}>
              <span style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg, ${VIOLET}, #8E7BFF)`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>O</span>
              <span style={{ lineHeight: 1.2 }}><span style={{ display: "block", fontWeight: 700, fontSize: 13 }}>Operator</span><span style={{ display: "block", color: FAINT, fontSize: 11 }}>roilabs.in</span></span>
            </div>
          </div>
        </header>

        <div style={{ padding: "4px 32px 40px", maxWidth: 1320, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 18 }}>
            {stats.map((st, i) => (
              <div key={i} className="v4card" style={{ ...card, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={chipIcon(st.soft, st.color)}>{st.icon}</span>
                  <span style={{ font: "700 12px " + FD, color: st.up ? MINT : AMBER, background: st.up ? "#E4F8F1" : "#FFF3E2", padding: "4px 9px", borderRadius: 9 }}>{st.delta}</span>
                </div>
                <div style={{ marginTop: 16, fontWeight: 800, fontSize: 27, letterSpacing: "-.02em" }}>{st.value}</div>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 2 }}>
                  <span style={{ color: MUTED, fontSize: 13, fontWeight: 500 }}>{st.label}</span>
                  <Spark data={st.spark} color={st.color} w={84} h={32} fill />
                </div>
              </div>
            ))}
          </div>

          {/* performance + donut */}
          <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 18 }}>
            <div className="v4card" style={{ ...card, padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>Performance</div>
                  <div style={{ color: MUTED, fontSize: 12.5, marginTop: 2 }}>Store revenue vs ad spend · last 28 days</div>
                </div>
                <div style={{ display: "flex", gap: 4, background: "#F4F5F9", borderRadius: 11, padding: 4 }}>
                  {["7D", "28D", "90D"].map((r) => (
                    <button key={r} onClick={() => setRange(r)} style={{ border: "none", cursor: "pointer", font: "700 12px " + FD, padding: "6px 12px", borderRadius: 8, background: range === r ? "#fff" : "transparent", color: range === r ? VIOLET : MUTED, boxShadow: range === r ? "0 2px 6px rgba(28,30,56,.08)" : "none" }}>{r}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 18, margin: "4px 0 14px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: MUTED, fontWeight: 600 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: VIOLET }} />Revenue</span>
                <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: MUTED, fontWeight: 600 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: FAINT }} />Spend</span>
              </div>
              <AreaChart rev={revSeries} spend={spendSeries} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, color: FAINT, font: "600 11px " + FD }}><span>May 18</span><span>May 25</span><span>Jun 1</span><span>Jun 8</span><span>Jun 14</span></div>
            </div>

            <div className="v4card" style={{ ...card, padding: 22, display: "flex", flexDirection: "column" }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Spend by source</div>
              <div style={{ color: MUTED, fontSize: 12.5, marginTop: 2 }}>₹16.2L total · 2 funnels</div>
              <div style={{ position: "relative", display: "flex", justifyContent: "center", margin: "14px 0 6px" }}>
                <Donut segs={[{ v: 60.5, color: VIOLET }, { v: 39.5, color: BLUE }]} size={156} />
                <div style={{ position: "absolute", top: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontWeight: 800, fontSize: 22 }}>2.64×</span>
                  <span style={{ color: MUTED, fontSize: 11.5, fontWeight: 600 }}>Blended MER</span>
                </div>
              </div>
              {[{ n: "Meta — store funnel", v: "₹9.8L", c: VIOLET }, { n: "Google — app funnel", v: "₹6.4L", c: BLUE }].map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 0", borderTop: i ? "1px solid " + LINE : "none" }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: r.c }} /><span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#5C6173" }}>{r.n}</span><span style={{ fontWeight: 700, fontSize: 13.5 }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* kanban campaign board */}
          <div className="v4card" style={{ ...card, padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div><div style={{ fontWeight: 700, fontSize: 16 }}>Campaign board</div><div style={{ color: MUTED, fontSize: 12.5, marginTop: 2 }}>What the engine is running, by stage</div></div>
              <button style={{ display: "flex", alignItems: "center", gap: 7, border: "none", background: "#F4F5F9", color: VIOLET, fontWeight: 700, fontSize: 13, padding: "9px 14px", borderRadius: 11, cursor: "pointer" }}>+ New campaign</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {columns.map((col) => (
                <div key={col.key} style={{ background: "#F8F9FC", borderRadius: 16, padding: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px 12px" }}>
                    <span style={{ width: 9, height: 9, borderRadius: "50%", background: col.color }} />
                    <span style={{ fontWeight: 700, fontSize: 13.5 }}>{col.title}</span>
                    <span style={{ font: "700 11px " + FD, color: MUTED, background: "#EDEFF4", borderRadius: 7, padding: "1px 7px" }}>{col.items.length}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                    {col.items.map((it, i) => (
                      <div key={i} className="v4kc" style={{ background: "#fff", borderRadius: 13, padding: 13, border: "1px solid #EFF1F5", cursor: "pointer" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ font: "700 10.5px " + FD, color: it.pc, background: it.ps, padding: "3px 8px", borderRadius: 7 }}>{it.plat}</span>
                          <span style={{ font: "700 10.5px " + FD, color: it.priC === FAINT ? MUTED : it.priC, background: (it.priC === FAINT ? "#F0F1F5" : it.priC + "1A"), padding: "3px 8px", borderRadius: 7 }}>{it.pri}</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 13.5, lineHeight: 1.3 }}>{it.t}</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "11px 0 9px" }}>
                          <span style={{ color: MUTED, fontSize: 12, fontWeight: 600 }}>{it.metric}</span>
                          <span style={{ width: 26, height: 26, borderRadius: 8, background: it.whoC, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", font: "700 10px " + FD }}>{it.who}</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 4, background: "#EEF0F5", overflow: "hidden" }}><div style={{ width: it.prog + "%", height: "100%", borderRadius: 4, background: col.color }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* approvals + activity + team */}
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18 }}>
            <div className="v4card" style={{ ...card, padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div><div style={{ fontWeight: 700, fontSize: 16 }}>Approvals</div><div style={{ color: MUTED, fontSize: 12.5, marginTop: 2 }}>Spend-affecting actions awaiting sign-off</div></div>
                <span style={{ font: "700 12px " + FD, color: CORAL, background: "#FFE9E9", padding: "5px 11px", borderRadius: 9 }}>{approvals.length - done.size} pending</span>
              </div>
              {approvals.map((a, i) => {
                const ok = done.has(a.id);
                return (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 0", borderTop: i ? "1px solid " + LINE : "none" }}>
                    <button onClick={() => toggle(a.id)} aria-label="toggle" style={{ width: 22, height: 22, borderRadius: 7, border: ok ? "none" : "2px solid #D7DAE3", background: ok ? MINT : "#fff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flex: "none" }}>{ok ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 6" /></svg> : null}</button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: ok ? FAINT : INK, textDecoration: ok ? "line-through" : "none" }}>{a.t}</div>
                      <div style={{ color: MUTED, fontSize: 12, marginTop: 2 }}>{a.who} · agent proposal</div>
                    </div>
                    <span style={{ font: "700 11px " + FD, color: a.priC === MINT ? MINT : a.priC, background: a.priC + "1A", padding: "3px 9px", borderRadius: 8, flex: "none" }}>{a.pri}</span>
                    <button style={{ border: "none", background: ok ? "#EEF0F4" : VIOLET, color: ok ? MUTED : "#fff", font: "700 12.5px " + FD, padding: "8px 14px", borderRadius: 10, cursor: "pointer", flex: "none" }}>{ok ? "Done" : "Approve"}</button>
                  </div>
                );
              })}
            </div>

            <div className="v4card" style={{ ...card, padding: 22, display: "flex", flexDirection: "column" }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Activity</div>
              <div style={{ marginTop: 12, flex: 1 }}>
                {activity.map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderTop: i ? "1px solid " + LINE : "none" }}>
                    <span style={{ width: 30, height: 30, borderRadius: 9, background: a.c, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", font: "700 11px " + FD, flex: "none" }}>{a.who.slice(0, 2)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, lineHeight: 1.4 }}><b style={{ fontWeight: 700 }}>{a.who}</b> {a.t}</div><div style={{ color: FAINT, fontSize: 11.5, marginTop: 2 }}>{a.time} ago</div></div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, paddingTop: 14, borderTop: "1px solid " + LINE }}>
                <div style={{ color: MUTED, fontSize: 12.5, fontWeight: 600, marginBottom: 10 }}>Agents on the account</div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {agents.map((ag, i) => (
                    <span key={i} title={ag.n} style={{ width: 34, height: 34, borderRadius: "50%", background: ag.c, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", font: "700 11px " + FD, border: "2.5px solid #fff", marginLeft: i ? -10 : 0 }}>{ag.s}</span>
                  ))}
                  <span style={{ marginLeft: 10, color: MUTED, fontSize: 12.5, fontWeight: 600 }}>5 agents · live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
