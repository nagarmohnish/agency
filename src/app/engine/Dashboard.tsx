"use client";

// ROI Engine — the operator cockpit, "Atlas / Terminal" adaptive theme.
// Light = Atlas (indigo, white panels), Dark = Terminal (amber, near-black).
// Atlas frame (sidebar + topbar + Scout rail) holding Terminal sections (sync
// ticker, divided KPI strip, chart↔anomaly split, campaign table) + a live clock
// and ⌘K command palette. Theme persists to localStorage. Analytics views compute
// from daily facts (demo); engine ops views keep their existing live/demo wiring.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEMO } from "./demo";
import { generateDataset } from "./v2/demo-data";
import { useEngineState } from "./v2/state";
import { DateRangePicker, Filters, GranularityToggle } from "./v2/controls";
import { Overview, Ticker, ScoutRail, EngineRuns, GoogleSection, MetaSection, ShopifySection } from "./v2/views";
import { useApi, Runs, Activity, Approvals } from "./v2/ops";
import type { Lens } from "./v2/types";

const TOKEN_KEY = "roi_engine_token";
const THEME_KEY = "roi_engine_theme";

type View = "overview" | "google" | "meta" | "shopify" | "runs" | "activity" | "approvals";
const ANALYTICS: View[] = ["overview", "google", "meta", "shopify"];
// All tabs, in sidebar order — also the set of valid ?view= deep-link values.
const ALL_VIEWS: View[] = ["overview", "google", "meta", "shopify", "runs", "activity", "approvals"];
// Read a shareable tab from the URL (?view=runs); null if absent/invalid.
function viewFromUrl(): View | null {
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get("view");
  return v && (ALL_VIEWS as string[]).includes(v) ? (v as View) : null;
}
const NAV: { id: View; label: string; group: "main" | "sources" | "ops" }[] = [
  { id: "overview", label: "Overview", group: "main" },
  { id: "google", label: "Google", group: "sources" },
  { id: "meta", label: "Meta", group: "sources" },
  { id: "shopify", label: "Shopify", group: "sources" },
  { id: "runs", label: "Runs", group: "ops" },
  { id: "activity", label: "Activity", group: "ops" },
  { id: "approvals", label: "Approvals", group: "ops" },
];
const TITLE: Record<View, string> = { overview: "Overview", google: "Google", meta: "Meta", shopify: "Shopify", runs: "Runs", activity: "Activity log", approvals: "Approvals" };
const LENSES: { id: Lens; label: string }[] = [{ id: "blended", label: "Blended" }, { id: "shopify", label: "Last-click" }, { id: "platform", label: "Platform" }];

export default function Dashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [today, setToday] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    try { setToken(sessionStorage.getItem(TOKEN_KEY)); } catch { /* ignore */ }
    try { const t = localStorage.getItem(THEME_KEY); if (t === "dark" || t === "light") setTheme(t); } catch { /* ignore */ }
    setToday(new Date().toISOString().slice(0, 10));
    setReady(true);
  }, []);
  const toggleTheme = useCallback(() => setTheme((t) => { const n = t === "dark" ? "light" : "dark"; try { localStorage.setItem(THEME_KEY, n); } catch { /* ignore */ } return n; }), []);
  const themeCls = theme === "dark" ? "dark" : "";

  if (!ready || !today) return <div className={`eng ${themeCls}`} />;
  if (DEMO) return <Cockpit token="demo" today={today} theme={theme} toggleTheme={toggleTheme} onSignOut={() => {}} />;
  if (!token) return <Gate themeCls={themeCls} onAuth={setToken} />;
  return <Cockpit token={token} today={today} theme={theme} toggleTheme={toggleTheme} onSignOut={() => { try { sessionStorage.removeItem(TOKEN_KEY); } catch {} setToken(null); }} />;
}

export function Gate({ themeCls, onAuth }: { themeCls: string; onAuth: (t: string) => void }) {
  const [value, setValue] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = value.trim(); if (!t) return;
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/engine/status", { headers: { Authorization: `Bearer ${t}` } });
      if (res.status === 401 || res.status === 503) { const j = await res.json().catch(() => ({})); throw new Error(j.error || "Invalid token"); }
      sessionStorage.setItem(TOKEN_KEY, t); onAuth(t);
    } catch (e) { setErr(e instanceof Error ? e.message : "Failed"); } finally { setBusy(false); }
  };
  return (
    <div className={`eng gate ${themeCls}`}>
      <form className="gatebox" onSubmit={submit}>
        <div className="logo">ROI <span>Engine</span></div>
        <p className="sub">Paste your admin token to access the cockpit.</p>
        <input type="password" placeholder="ENGINE_ADMIN_TOKEN" value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
        {err && <div className="err">{err}</div>}
        <button type="submit" disabled={busy}>{busy ? "Checking…" : "Enter"}</button>
      </form>
    </div>
  );
}

function LiveClock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const p = (n: number) => String(n).padStart(2, "0");
    const tick = () => { const d = new Date(); setT(`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`); };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="clock">{t}</span>;
}

const DEFAULT_INTEGRATIONS = [
  { source: "google", status: "connected" }, { source: "shopify", status: "connected" }, { source: "meta", status: "in_progress" },
];

function Cockpit({ token, today, theme, toggleTheme, onSignOut }: { token: string; today: string; theme: "light" | "dark"; toggleTheme: () => void; onSignOut: () => void }) {
  const es = useEngineState(today);
  const call = useApi(token);
  const ds = useMemo(() => (DEMO ? generateDataset(today) : null), [today]);
  const [view, setView] = useState<View>("overview");
  const didInitView = useRef(false);
  const [pending, setPending] = useState<number | null>(null);
  const [cmd, setCmd] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // pending approvals count for the sidebar badge + Scout rail (ops wiring)
  useEffect(() => {
    let live = true;
    call("/api/engine/status").then((d) => { if (live && typeof d.pendingApprovals === "number") setPending(d.pendingApprovals as number); }).catch(() => {});
    return () => { live = false; };
  }, [call]);

  // Deep-link the active tab to the URL (?view=runs etc.) so every tab is
  // shareable. First run reads the initial tab from the URL; later runs keep
  // the URL in sync via replaceState (no history spam, static-export safe).
  useEffect(() => {
    if (!didInitView.current) {
      didInitView.current = true;
      const fromUrl = viewFromUrl();
      if (fromUrl && fromUrl !== view) { setView(fromUrl); return; }
    }
    const params = new URLSearchParams(window.location.search);
    if (view === "overview") params.delete("view"); else params.set("view", view);
    const qs = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (qs ? "?" + qs : "") + window.location.hash);
  }, [view]);

  // Back/forward between shared tab links.
  useEffect(() => {
    const onPop = () => setView(viewFromUrl() ?? "overview");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // ⌘K palette + esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = (e.key || "").toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === "k") { e.preventDefault(); setCmd((c) => !c); }
      if (e.key === "Escape") setCmd(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const goto = (v: string) => setView(v as View);
  const dismiss = (id: string) => setDismissed((s) => new Set(s).add(id));
  const isAnalytics = ANALYTICS.includes(view);
  const isOverview = view === "overview";
  const integrations = ds?.integrations ?? DEFAULT_INTEGRATIONS;
  const vp = { ds: ds!, state: es.state, demo: DEMO, goto, pending };

  const commands = [
    { ic: "₹", label: "Switch lens → Shopify truth", run: () => { es.setLens("shopify"); setCmd(false); } },
    { ic: "G", label: "Open Google · performance", run: () => { setView("google"); setCmd(false); } },
    { ic: "S", label: "Open Shopify · revenue", run: () => { setView("shopify"); setCmd(false); } },
    { ic: "⚑", label: "Review pending approvals", run: () => { setView("approvals"); setCmd(false); } },
    { ic: "◐", label: "Toggle dark / light mode", run: () => { toggleTheme(); } },
  ];

  const awaiting = (
    <div className="empty big">Live analytics requires the daily-fact pipeline, which isn’t wired yet. The full analytics layer is exercisable in demo mode (build with <code>NEXT_PUBLIC_ENGINE_DEMO=1</code>). Engine ops views below work against the live backend.</div>
  );

  return (
    <div className={`eng shell ${theme === "dark" ? "dark" : ""}`}>
      <aside className="sidebar">
        <div className="brandwrap"><span className="wordmark"><b className="roi">ROI</b> <span className="eng-word">Engine</span></span></div>
        <nav className="snav">
          {NAV.filter((n) => n.group === "main").map((n) => <NavBtn key={n.id} n={n} view={view} setView={setView} />)}
          <div className="navdiv">Sources</div>
          {NAV.filter((n) => n.group === "sources").map((n) => <NavBtn key={n.id} n={n} view={view} setView={setView} />)}
          <div className="navdiv">Engine</div>
          {NAV.filter((n) => n.group === "ops").map((n) => <NavBtn key={n.id} n={n} view={view} setView={setView} pending={pending} />)}
          <div style={{ flex: 1 }} />
          <div className="userchip"><div><div className="username">The Astro Time</div><div className="userplan">Growth plan</div></div></div>
        </nav>
        {!DEMO && <button className="signout" onClick={onSignOut}>Sign out</button>}
      </aside>

      <div className="main">
        <header className="topbar">
          <h1>{TITLE[view]}</h1>
          <div className="intgrp">
            {integrations.map((it) => (
              <span key={it.source} className="intchip" title={`${it.source} · ${it.status === "connected" ? "synced" : "connecting"}`}>
                <BrandIcon source={it.source} />
                <span className={`intdot ${it.status === "connected" ? "ok" : "wait"}`} />
              </span>
            ))}
          </div>
          <div className="tb-spacer" />
          {isAnalytics && (
            <div className="lensseg" role="group" aria-label="Attribution lens">
              {LENSES.map((l) => <button key={l.id} className={es.state.lens === l.id ? "on" : ""} onClick={() => es.setLens(l.id)}>{l.label}</button>)}
            </div>
          )}
          {isAnalytics && <DateRangePicker today={today} es={es} />}
          <LiveClock />
          <button className="cmdbtn" onClick={() => setCmd(true)} aria-label="Open command palette">⌕<span className="cmdkbd">⌘K</span></button>
          <button className="themebtn" onClick={toggleTheme} title="Toggle theme"><span className="ti">{theme === "dark" ? "☀" : "☾"}</span>{theme === "dark" ? "Light" : "Dark"}</button>
        </header>

        {isAnalytics && ds && <Ticker ds={ds} state={es.state} />}
        {isAnalytics && ds && (
          <div className="controlbar">
            <GranularityToggle value={es.state.granularity} onChange={es.setGranularity} />
            <Filters ds={ds} state={es.state} es={es} />
          </div>
        )}

        {isOverview && ds ? (
          <div className="obody">
            <div className="omain"><Overview {...vp} /></div>
            <ScoutRail ds={ds} state={es.state} dismissed={dismissed} onDismiss={dismiss} goto={goto} pending={pending} />
          </div>
        ) : (
          <main className="content">
            {isAnalytics && !ds ? awaiting : (
              <>
                {view === "google" && <GoogleSection {...vp} />}
                {view === "meta" && <MetaSection {...vp} />}
                {view === "shopify" && <ShopifySection {...vp} />}
                {view === "runs" && (ds ? <EngineRuns {...vp} /> : <Runs call={call} />)}
                {view === "activity" && <Activity call={call} />}
                {view === "approvals" && <Approvals call={call} onPending={setPending} />}
              </>
            )}
          </main>
        )}
      </div>

      {cmd && (
        <div className="cmdoverlay" onClick={() => setCmd(false)}>
          <div className="cmdbox" onClick={(e) => e.stopPropagation()}>
            <div className="cmdhead"><span className="q">⌕</span><span className="hl">Run a command<span className="cmdcaret">_</span></span><span className="cmdesc">esc</span></div>
            <div className="cmdbody">
              <div className="cmdgroup">Suggested</div>
              {commands.map((c, i) => (
                <button key={i} className="cmditem" onClick={c.run}><span className="ic">{c.ic}</span>{c.label}{i === 0 && <span className="k">↵</span>}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// real brand marks for the integration chips (inline SVG, theme-agnostic)
function BrandIcon({ source }: { source: string }) {
  const s = source.toLowerCase();
  if (s === "google") return (
    <svg className="intlogo" viewBox="0 0 24 24" role="img" aria-label="Google">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
  if (s === "meta") return (
    <svg className="intlogo" viewBox="0 0 24 24" role="img" aria-label="Meta">
      <path fill="#0082FB" d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.157-2.602zm-10.201.553c1.073 0 1.957.498 2.972 1.61-.323.464-.645.949-.974 1.475-.822 1.31-1.566 2.668-2.318 3.978-1.522 2.652-2.066 3.245-2.928 3.245-.69 0-1.196-.397-1.495-1.36a5.692 5.692 0 0 1-.241-1.71c0-2.034.565-4.197 1.39-5.566.74-1.23 1.652-1.738 2.594-1.738z" />
    </svg>
  );
  if (s === "shopify") return (
    <svg className="intlogo" viewBox="0 0 256 292" role="img" aria-label="Shopify">
      <path fill="#95BF47" d="M223.774 57.34c-.201-1.46-1.48-2.268-2.537-2.357-1.055-.088-23.383-1.743-23.383-1.743s-15.507-15.395-17.209-17.099c-1.703-1.703-5.029-1.185-6.32-.805-.19.056-3.388 1.043-8.678 2.68-5.18-14.906-14.322-28.604-30.405-28.604-.444 0-.901.018-1.358.044C129.31 3.407 123.644.779 118.75.779c-37.465 0-55.364 46.835-60.976 70.635-14.558 4.511-24.9 7.718-26.221 8.133-8.126 2.549-8.383 2.805-9.45 10.462C21.3 95.806.038 260.235.038 260.235l165.678 31.042 89.77-19.42S223.973 58.8 223.775 57.34zM156.49 40.848l-14.019 4.339c.005-.988.01-1.96.01-3.023 0-9.264-1.286-16.723-3.349-22.636 8.287 1.04 13.806 10.469 17.358 21.32zm-27.638-19.483c2.304 5.773 3.802 14.058 3.802 25.238 0 .572-.005 1.095-.01 1.624-9.117 2.824-19.024 5.89-28.953 8.966 5.575-21.516 16.025-31.908 25.161-35.828zm-11.131-10.537c1.617 0 3.246.549 4.805 1.622-12.007 5.65-24.877 19.88-30.312 48.297l-22.886 7.088C75.694 46.16 90.81 10.828 117.72 10.828z" />
      <path fill="#5E8E3E" d="M221.237 54.983c-1.055-.088-23.383-1.743-23.383-1.743s-15.507-15.395-17.209-17.099c-.637-.634-1.496-.959-2.394-1.099l-12.527 255.246 89.762-19.418S223.972 58.8 223.774 57.34c-.201-1.46-1.48-2.268-2.537-2.357z" />
      <path fill="#FFF" d="M135.242 104.585l-11.069 32.926s-9.698-5.176-21.586-5.176c-17.428 0-18.305 10.937-18.305 13.693 0 15.038 39.2 20.8 39.2 56.024 0 27.713-17.577 45.558-41.277 45.558-28.44 0-42.984-17.7-42.984-17.7l7.615-25.16s14.95 12.835 27.565 12.835c8.243 0 11.596-6.49 11.596-11.232 0-19.616-32.16-20.491-32.16-52.724 0-27.129 19.472-53.382 58.778-53.382 15.145 0 22.627 4.338 22.627 4.338z" />
    </svg>
  );
  return <span className="intbadge">{source[0].toUpperCase()}</span>;
}

const BRAND_NAV = new Set(["google", "meta", "shopify"]);

function NavBtn({ n, view, setView, pending }: { n: { id: View; label: string }; view: View; setView: (v: View) => void; pending?: number | null }) {
  const brand = BRAND_NAV.has(n.id);
  return (
    <button className={view === n.id ? "on" : ""} onClick={() => setView(n.id)}>
      <span className="navlabel">{brand && <span className="navicon"><BrandIcon source={n.id} /></span>}{n.label}</span>
      {n.id === "approvals" && pending ? <span className="badge">{pending}</span> : null}
    </button>
  );
}
