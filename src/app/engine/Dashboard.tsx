"use client";

// The ops cockpit at /engine. Token-gated (paste ENGINE_ADMIN_TOKEN once, held
// in sessionStorage, sent as a Bearer header). Sidebar layout, a 7/14/30-day
// range toggle, donut + trend charts, and KPI cards. Read-heavy; the only writes
// are approvals + Run, both re-entering the governance gate server-side.

import { useCallback, useEffect, useState } from "react";

const TOKEN_KEY = "roi_engine_token";
type Tab = "overview" | "runs" | "audit" | "campaigns" | "segments" | "revenue" | "activity" | "approvals";

// chart palette (on-brand: yellow lead, ink, golds, neutrals)
const PALETTE = ["#FACC15", "#1b1a16", "#a87f00", "#d97706", "#9a8f6a", "#c9bfa3"];

// ---- helpers ---------------------------------------------------------------

function money(cents: number | null | undefined, cur = "INR") {
  if (cents == null) return "—";
  return new Intl.NumberFormat(undefined, { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(cents / 100);
}
const num = (n: number | null | undefined) => (n == null ? "—" : new Intl.NumberFormat().format(Math.round(n)));
const pct = (r: number | null | undefined) => (r == null ? "—" : `${(r * 100).toFixed(2)}%`);
const x = (r: number | null | undefined) => (r == null ? "—" : `${r.toFixed(2)}×`);
const ago = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return `${Math.floor(s)}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
};
function duration(start: string, end: string | null): string {
  if (!end) return "—";
  const s = Math.max(0, (new Date(end).getTime() - new Date(start).getTime()) / 1000);
  return s < 60 ? `${s.toFixed(0)}s` : `${(s / 60).toFixed(1)}m`;
}

function useApi(token: string) {
  return useCallback(
    async (path: string, init?: RequestInit) => {
      const res = await fetch(path, {
        ...init,
        headers: { ...(init?.headers || {}), Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || res.statusText);
      return json;
    },
    [token]
  );
}
type Call = (path: string, init?: RequestInit) => Promise<Record<string, unknown>>;

function useLoad<T>(fn: () => Promise<T>, deps: React.DependencyList) {
  const [data, setData] = useState<T | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const reload = useCallback(() => {
    setLoading(true);
    setErr("");
    fn().then(setData).catch((e) => setErr(e instanceof Error ? e.message : String(e))).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(reload, [reload]);
  return { data, err, loading, reload };
}

// ---- charts ----------------------------------------------------------------

function Donut({ data }: { data: { label: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const R = 42, C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="donutwrap">
      <svg viewBox="0 0 100 100" className="donut">
        <circle cx="50" cy="50" r={R} fill="none" stroke="var(--line)" strokeWidth="13" />
        {data.map((d, i) => {
          const len = (d.value / total) * C;
          const seg = (
            <circle key={i} cx="50" cy="50" r={R} fill="none" stroke={PALETTE[i % PALETTE.length]} strokeWidth="13"
              strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} transform="rotate(-90 50 50)" />
          );
          offset += len;
          return seg;
        })}
      </svg>
      <ul className="legend">
        {data.map((d, i) => (
          <li key={i}>
            <span className="sw" style={{ background: PALETTE[i % PALETTE.length] }} />
            <span className="ll">{d.label}</span>
            <span className="lv">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface Daily { date: string; spendCents: number; conversions: number; revenueCents: number }
function TrendLine({ daily }: { daily: Daily[] }) {
  if (daily.length < 2) return <div className="empty">Not enough daily data for a trend.</div>;
  const W = 680, H = 150, P = 10;
  const sMax = Math.max(...daily.map((d) => d.spendCents), 1);
  const cMax = Math.max(...daily.map((d) => d.conversions), 1);
  const xAt = (i: number) => P + (i / (daily.length - 1)) * (W - 2 * P);
  const yS = (v: number) => H - P - (v / sMax) * (H - 2 * P);
  const yC = (v: number) => H - P - (v / cMax) * (H - 2 * P);
  const path = (key: "spendCents" | "conversions", y: (v: number) => number) =>
    daily.map((d, i) => `${i ? "L" : "M"}${xAt(i).toFixed(1)} ${y(d[key]).toFixed(1)}`).join(" ");
  return (
    <div>
      <div className="trendlegend">
        <span><i className="sw" style={{ background: "#FACC15" }} /> Spend</span>
        <span><i className="sw" style={{ background: "#1b1a16" }} /> Conversions</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="trend">
        <path d={path("spendCents", yS)} fill="none" stroke="#FACC15" strokeWidth="2.5" strokeLinejoin="round" />
        <path d={path("conversions", yC)} fill="none" stroke="#1b1a16" strokeWidth="2" strokeLinejoin="round" strokeDasharray="4 3" />
      </svg>
      <div className="trendaxis"><span>{daily[0].date.slice(5)}</span><span>{daily[daily.length - 1].date.slice(5)}</span></div>
    </div>
  );
}

// ---- root: gate or cockpit -------------------------------------------------

export default function Dashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { setToken(sessionStorage.getItem(TOKEN_KEY)); } catch { /* ignore */ }
    setReady(true);
  }, []);
  if (!ready) return <div className="eng" />;
  if (!token) return <Gate onAuth={(t) => setToken(t)} />;
  return <Cockpit token={token} onSignOut={() => { try { sessionStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ } setToken(null); }} />;
}

function Gate({ onAuth }: { onAuth: (t: string) => void }) {
  const [value, setValue] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = value.trim();
    if (!t) return;
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/engine/status", { headers: { Authorization: `Bearer ${t}` } });
      if (res.status === 401 || res.status === 503) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Invalid token");
      }
      sessionStorage.setItem(TOKEN_KEY, t);
      onAuth(t);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(false); }
  };
  return (
    <div className="eng gate">
      <form className="gatebox" onSubmit={submit}>
        <div className="logo">ROI Labs <span>Engine</span></div>
        <p className="sub">Paste your admin token to access the cockpit.</p>
        <input type="password" placeholder="ENGINE_ADMIN_TOKEN" value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
        {err && <div className="err">{err}</div>}
        <button type="submit" disabled={busy}>{busy ? "Checking…" : "Enter"}</button>
      </form>
    </div>
  );
}

// ---- cockpit ---------------------------------------------------------------

const NAV: { id: Tab; label: string; sub?: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "runs", label: "Runs", sub: "fetched + analyzed" },
  { id: "audit", label: "Audit", sub: "Scout" },
  { id: "campaigns", label: "Campaigns", sub: "Pilot" },
  { id: "segments", label: "Segments", sub: "source · age · gender" },
  { id: "revenue", label: "Revenue", sub: "Shopify truth" },
  { id: "activity", label: "Activity log", sub: "Signal" },
  { id: "approvals", label: "Approvals" },
];
const RANGED: Tab[] = ["overview", "campaigns", "segments", "revenue"];

function Cockpit({ token, onSignOut }: { token: string; onSignOut: () => void }) {
  const call = useApi(token);
  const [tab, setTab] = useState<Tab>("overview");
  const [pending, setPending] = useState<number | null>(null);
  const [days, setDays] = useState<7 | 14 | 30>(30);
  const current = NAV.find((n) => n.id === tab);

  return (
    <div className="eng shell">
      <aside className="sidebar">
        <div className="brandwrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/roi-logo-dark.png" alt="ROI Labs" className="brandlogo" />
          <span className="brandtag">Engine</span>
        </div>
        <nav className="snav">
          {NAV.map((n) => (
            <button key={n.id} className={tab === n.id ? "on" : ""} onClick={() => setTab(n.id)}>
              <span>{n.label}</span>
              {n.id === "approvals" && pending ? <span className="badge">{pending}</span> : n.sub ? <em>{n.sub}</em> : null}
            </button>
          ))}
        </nav>
        <button className="signout" onClick={onSignOut}>Sign out</button>
      </aside>

      <div className="main">
        <header className="topbar">
          <h1>{current?.label}</h1>
          {RANGED.includes(tab) && (
            <div className="rangetoggle" role="group" aria-label="Date range">
              {([7, 14, 30] as const).map((d) => (
                <button key={d} className={days === d ? "on" : ""} onClick={() => setDays(d)}>{d}d</button>
              ))}
            </div>
          )}
        </header>
        <main className="content">
          {tab === "overview" && <Overview call={call} days={days} onPending={setPending} goto={setTab} />}
          {tab === "runs" && <Runs call={call} />}
          {tab === "audit" && <Audit call={call} />}
          {tab === "campaigns" && <Campaigns call={call} days={days} />}
          {tab === "segments" && <Segments call={call} days={days} />}
          {tab === "revenue" && <Revenue call={call} days={days} />}
          {tab === "activity" && <Activity call={call} />}
          {tab === "approvals" && <Approvals call={call} onPending={setPending} />}
        </main>
      </div>
    </div>
  );
}

// ---- Overview --------------------------------------------------------------

interface Kpis { impressions: number; clicks: number; spendCents: number; conversions: number; revenueCents: number; roas: number | null; cacCents: number | null; ctr: number | null }

function Overview({ call, days, onPending, goto }: { call: Call; days: number; onPending: (n: number) => void; goto: (t: Tab) => void }) {
  const status = useLoad(() => call("/api/engine/status"), [call]);
  const camp = useLoad(() => call(`/api/engine/campaigns?days=${days}`), [call, days]);
  const [running, setRunning] = useState(false);
  const [runMsg, setRunMsg] = useState("");

  useEffect(() => {
    const d = status.data as Record<string, unknown> | null;
    if (d && typeof d.pendingApprovals === "number") onPending(d.pendingApprovals as number);
  }, [status.data, onPending]);

  const runAudit = async () => {
    setRunning(true); setRunMsg("");
    try {
      const r = await call("/api/engine/run", { method: "POST", body: JSON.stringify({ step: "audit" }) });
      setRunMsg(`✓ Audit complete (run ${String(r.runId).slice(0, 8)}). Open the Audit tab.`);
      status.reload();
    } catch (e) {
      setRunMsg(`✕ ${e instanceof Error ? e.message : String(e)}`);
    } finally { setRunning(false); }
  };

  if (status.loading) return <Loading />;
  if (status.err) return <ErrBox msg={status.err} retry={status.reload} />;
  const d = status.data as Record<string, unknown>;
  const account = d.account as { name: string; autonomy: string; dailySpendCapCents: number };
  const safety = d.safety as { dryRun: boolean; globalDailyCapCents: number };
  const connections = (d.connections || {}) as Record<string, { ok: boolean; detail: string }>;
  const actions = (d.recentActions || []) as ActionRow[];
  const cd = camp.data as { currency?: string; combined?: Kpis; daily?: Daily[] } | null;
  const cur = cd?.currency || "INR";
  const k = cd?.combined;

  return (
    <div className="stack">
      <div className="badges">
        <span className={`chip ${safety.dryRun ? "warn" : "ok"}`}>{safety.dryRun ? "DRY RUN" : "LIVE"}</span>
        <span className="chip">{account.autonomy}</span>
        <span className="chip">cap {money(Math.min(account.dailySpendCapCents, safety.globalDailyCapCents || account.dailySpendCapCents), cur)}/day</span>
        <button className="primary sm" onClick={runAudit} disabled={running}>{running ? "Running audit…" : "Run audit"}</button>
        {runMsg && <span className="runmsg">{runMsg}</span>}
      </div>

      {camp.loading ? <Loading note="Pulling performance…" /> : k ? (
        <>
          <div className="kpis">
            <Kpi label={`Revenue · ${days}d`} value={money(k.revenueCents, cur)} big />
            <Kpi label="Spend" value={money(k.spendCents, cur)} />
            <Kpi label="ROAS" value={x(k.roas)} />
            <Kpi label="CAC" value={money(k.cacCents, cur)} />
            <Kpi label="Conversions" value={num(k.conversions)} />
            <Kpi label="CTR" value={pct(k.ctr)} />
          </div>
          <Card title="Spend & conversions trend">
            <TrendLine daily={cd?.daily || []} />
          </Card>
        </>
      ) : camp.err ? <ErrBox msg={camp.err} /> : null}

      <div className="grid2">
        <Card title="Connections">
          {Object.keys(connections).length === 0 && <Empty>No platforms configured yet.</Empty>}
          {Object.entries(connections).map(([p, c]) => (
            <div key={p} className="connrow"><span className={`dot ${c.ok ? "ok" : "bad"}`} /><b>{p}</b><span className="detail">{c.detail}</span></div>
          ))}
        </Card>
        <Card title="Recent activity" action={{ label: "View all", onClick: () => goto("activity") }}>
          {actions.length === 0 && <Empty>Nothing yet. Run an audit.</Empty>}
          <ul className="mini">
            {actions.slice(0, 6).map((a) => (
              <li key={a.id}><span className={`tag ${a.status}`}>{a.status}</span><span className="agent">{a.agent}</span><span className="sum">{a.summary}</span><span className="t">{ago(a.created_at)}</span></li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

// ---- Audit -----------------------------------------------------------------

interface Opportunity { title: string; detail: string; impact: string; effort: string; owner: string }
interface AuditRun { score: number | null; summary: string | null; opportunities: Opportunity[]; created_at: string }

function Audit({ call }: { call: Call }) {
  const { data, err, loading } = useLoad(() => call("/api/engine/audits"), [call]);
  if (loading) return <Loading />;
  if (err) return <ErrBox msg={err} />;
  const audit = (data?.audit as AuditRun | null) ?? null;
  if (!audit) return <Empty big>No audit yet. Overview → “Run audit”.</Empty>;
  const score = audit.score ?? 0;
  return (
    <div className="stack">
      <div className="audithead">
        <div className={`score s${score >= 70 ? "hi" : score >= 40 ? "mid" : "lo"}`}><b>{score}</b><span>/100 health</span></div>
        <div className="auditsum"><p className="lbl">Scout — opportunity map · {ago(audit.created_at)}</p><p>{audit.summary}</p></div>
      </div>
      <div className="opps">
        {(audit.opportunities || []).map((o, i) => (
          <div key={i} className="opp">
            <div className="opptop"><span className="oppn">{i + 1}</span><h4>{o.title}</h4><span className={`chip imp-${o.impact}`}>impact {o.impact}</span><span className="chip">effort {o.effort}</span><span className="chip owner">{o.owner}</span></div>
            <p>{o.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Runs ------------------------------------------------------------------

interface RunRow { id: string; step: string; agent: string | null; model: string | null; status: string; summary: string | null; input_tokens: number; output_tokens: number; started_at: string; finished_at: string | null; fetches: ActionRow[]; mutations: ActionRow[]; audit: AuditRun | null }

function Runs({ call }: { call: Call }) {
  const { data, err, loading, reload } = useLoad(() => call("/api/engine/runs?limit=10"), [call]);
  if (loading) return <Loading />;
  if (err) return <ErrBox msg={err} retry={reload} />;
  const runs = (data?.runs || []) as RunRow[];
  if (runs.length === 0) return <Empty big>No runs yet. Overview → “Run audit”.</Empty>;
  return (
    <div className="runs">
      {runs.map((r) => (
        <div key={r.id} className="run">
          <div className="runhead">
            <span className="runstep">{r.step}</span>
            {r.agent && <span className="chip owner">{r.agent}</span>}
            <span className={`tag ${r.status === "done" ? "executed" : r.status === "error" ? "failed" : "proposed"}`}>{r.status}</span>
            <span className="runmeta">{ago(r.started_at)} · {duration(r.started_at, r.finished_at)} · {num(r.input_tokens + r.output_tokens)} tokens{r.model ? ` · ${r.model}` : ""}</span>
          </div>
          <div className="runcols">
            <div className="runcol">
              <h5>What we fetched</h5>
              {r.fetches.length === 0 ? <p className="muted">No reads logged.</p> : (
                <ul className="fetchlist">{r.fetches.map((f) => <li key={f.id}><span className="kind">{f.kind}</span> {f.summary}</li>)}</ul>
              )}
              {r.mutations.length > 0 && (<><h5 style={{ marginTop: 12 }}>Proposed changes</h5><ul className="fetchlist">{r.mutations.map((m) => <li key={m.id}><span className={`tag ${m.status}`}>{m.status}</span> {m.summary}</li>)}</ul></>)}
            </div>
            <div className="runcol">
              <h5>What we concluded</h5>
              {r.audit ? (
                <>
                  <div className="concl"><span className={`miniscore s${(r.audit.score ?? 0) >= 70 ? "hi" : (r.audit.score ?? 0) >= 40 ? "mid" : "lo"}`}>{r.audit.score ?? "—"}/100</span><span className="muted">{(r.audit.opportunities || []).length} opportunities</span></div>
                  <ol className="opplist">{(r.audit.opportunities || []).map((o, i) => <li key={i}><b>{o.title}</b> <span className={`chip imp-${o.impact} sm`}>{o.impact}</span> <span className="chip sm owner">{o.owner}</span></li>)}</ol>
                </>
              ) : <p className="muted">No structured output.</p>}
            </div>
          </div>
          {r.summary && <details className="reasoning"><summary>Agent narrative</summary><pre>{r.summary}</pre></details>}
        </div>
      ))}
    </div>
  );
}

// ---- Campaigns -------------------------------------------------------------

interface Campaign { externalId: string; name: string; status: string; objective?: string; dailyBudgetCents?: number }

function Campaigns({ call, days }: { call: Call; days: number }) {
  const { data, err, loading } = useLoad(() => call(`/api/engine/campaigns?days=${days}`), [call, days]);
  if (loading) return <Loading note="Pulling live campaign data…" />;
  if (err) return <ErrBox msg={err} />;
  if (!data) return null;
  const cur = (data.currency as string) || "INR";
  const combined = data.combined as Kpis;
  const platforms = (data.platforms || {}) as Record<string, { campaigns: Campaign[]; kpis: Kpis; error?: string }>;
  return (
    <div className="stack">
      <div className="kpis">
        <Kpi label="Revenue" value={money(combined.revenueCents, cur)} big />
        <Kpi label="Spend" value={money(combined.spendCents, cur)} />
        <Kpi label="ROAS" value={x(combined.roas)} />
        <Kpi label="CAC" value={money(combined.cacCents, cur)} />
        <Kpi label="Conversions" value={num(combined.conversions)} />
        <Kpi label="CTR" value={pct(combined.ctr)} />
      </div>
      {Object.entries(platforms).map(([p, pl]) => (
        <div key={p} className="platsec">
          <div className="plathead"><h3>{p}</h3><div className="platkpis"><span>rev {money(pl.kpis.revenueCents, cur)}</span><span>spend {money(pl.kpis.spendCents, cur)}</span><span>ROAS {x(pl.kpis.roas)}</span><span>CAC {money(pl.kpis.cacCents, cur)}</span></div></div>
          {pl.error && <div className="err">{pl.error}</div>}
          {!pl.error && pl.campaigns.length === 0 && <Empty>No campaigns.</Empty>}
          {pl.campaigns.length > 0 && (
            <table className="tbl"><thead><tr><th>Campaign</th><th>Status</th><th>Objective</th><th className="r">Daily budget</th></tr></thead>
              <tbody>{pl.campaigns.map((c) => <tr key={c.externalId}><td>{c.name}</td><td><span className={`tag ${c.status.toLowerCase()}`}>{c.status}</span></td><td>{c.objective || "—"}</td><td className="r">{c.dailyBudgetCents ? money(c.dailyBudgetCents, cur) : "—"}</td></tr>)}</tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}

// ---- Segments --------------------------------------------------------------

interface Seg { label: string; impressions: number; clicks: number; spendCents: number; conversions: number; cacCents: number | null; ctr: number | null }
interface SegCampaign { id: string; name: string; spendCents: number; gender: Seg[]; age: Seg[] }
interface PlatformSeg { error?: string; network: Seg[]; gender: Seg[]; age: Seg[]; campaigns: SegCampaign[] }

function maxSpend(rows: Seg[]) { return rows.reduce((m, r) => Math.max(m, r.spendCents), 0) || 1; }

function SegTable({ rows, cur, kind }: { rows: Seg[]; cur: string; kind: "traffic" | "demo" }) {
  if (rows.length === 0) return <Empty>No data for this dimension.</Empty>;
  const peak = maxSpend(rows);
  return (
    <table className="tbl segtbl">
      <thead><tr><th>{kind === "traffic" ? "Source" : "Segment"}</th>{kind === "traffic" && <th className="r">Impr.</th>}<th className="r">Clicks</th><th className="r">Spend</th><th className="r">Conv.</th><th className="r">CAC</th><th className="share">Spend</th></tr></thead>
      <tbody>{rows.map((s) => <tr key={s.label}><td><b>{s.label}</b></td>{kind === "traffic" && <td className="r">{num(s.impressions)}</td>}<td className="r">{num(s.clicks)}</td><td className="r">{money(s.spendCents, cur)}</td><td className="r">{num(s.conversions)}</td><td className="r">{money(s.cacCents, cur)}</td><td className="share"><span className="bar"><i style={{ width: `${(s.spendCents / peak) * 100}%` }} /></span></td></tr>)}</tbody>
    </table>
  );
}

function Segments({ call, days }: { call: Call; days: number }) {
  const { data, err, loading, reload } = useLoad(() => call(`/api/engine/breakdowns?days=${days}`), [call, days]);
  if (loading) return <Loading note="Pulling traffic-source, age & gender…" />;
  if (err) return <ErrBox msg={err} retry={reload} />;
  if (!data) return null;
  const cur = (data.currency as string) || "INR";
  const platforms = (data.platforms || {}) as Record<string, PlatformSeg>;
  return (
    <div className="stack">
      {Object.entries(platforms).map(([p, pl]) => (
        <div key={p} className="segplat">
          <h3 className="segplathead">{p}</h3>
          {pl.error && <div className="err">{pl.error}</div>}

          <Card title="Traffic sources" subtitle="where the traffic comes from">
            <div className="srcgrid">
              {pl.network.some((n) => n.spendCents > 0) && <Donut data={pl.network.filter((n) => n.spendCents > 0).map((n) => ({ label: n.label, value: n.spendCents }))} />}
              <SegTable rows={pl.network} cur={cur} kind="traffic" />
            </div>
          </Card>

          <div className="grid2">
            <Card title="By gender" subtitle="spend & CAC"><SegTable rows={pl.gender} cur={cur} kind="demo" /></Card>
            <Card title="By age" subtitle="spend & CAC"><SegTable rows={pl.age} cur={cur} kind="demo" /></Card>
          </div>

          <Card title="Campaign-level age & gender" subtitle={`top ${pl.campaigns.length} by spend with demographic data`}>
            {pl.campaigns.length === 0 ? (
              <Empty>No campaign-level demographic data (common for App / Performance Max campaigns).</Empty>
            ) : (
              <div className="segcamps">
                {pl.campaigns.map((c) => (
                  <div key={c.id} className="segcamp">
                    <div className="segcamptop"><b>{c.name}</b><span className="muted">{money(c.spendCents, cur)}</span></div>
                    <div className="grid2"><div><div className="minihdr">Gender</div><SegTable rows={c.gender} cur={cur} kind="demo" /></div><div><div className="minihdr">Age</div><SegTable rows={c.age} cur={cur} kind="demo" /></div></div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      ))}
    </div>
  );
}

// ---- Revenue (Shopify source of truth + reconciliation) --------------------

interface ShopRev { currency: string; days: number; orders: number; revenueCents: number; aovCents: number | null; daily: { date: string; orders: number; revenueCents: number }[] }

function RevTrend({ daily }: { daily: { date: string; revenueCents: number }[] }) {
  if (daily.length < 2) return <div className="empty">Not enough daily data for a trend.</div>;
  const W = 680, H = 150, P = 10;
  const max = Math.max(...daily.map((d) => d.revenueCents), 1);
  const xAt = (i: number) => P + (i / (daily.length - 1)) * (W - 2 * P);
  const y = (v: number) => H - P - (v / max) * (H - 2 * P);
  const path = daily.map((d, i) => `${i ? "L" : "M"}${xAt(i).toFixed(1)} ${y(d.revenueCents).toFixed(1)}`).join(" ");
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="trend"><path d={path} fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinejoin="round" /></svg>
      <div className="trendaxis"><span>{daily[0].date.slice(5)}</span><span>{daily[daily.length - 1].date.slice(5)}</span></div>
    </div>
  );
}

function Revenue({ call, days }: { call: Call; days: number }) {
  const { data, err, loading, reload } = useLoad(() => call(`/api/engine/revenue?days=${days}`), [call, days]);
  if (loading) return <Loading note="Pulling Shopify orders…" />;
  if (err) return <ErrBox msg={err} retry={reload} />;
  if (!data) return null;
  if (data.configured === false) return <Empty big>Shopify not connected. Add SHOPIFY_STORE_DOMAIN + SHOPIFY_ADMIN_TOKEN to .env.local (see ENGINE.md).</Empty>;
  const s = data.shopify as ShopRev;
  const cur = s.currency || "INR";
  const meta = data.metaReported as { revenueCents: number; conversions: number } | null;
  const disc = data.discrepancyPct as number | null;
  return (
    <div className="stack">
      <div className="kpis">
        <Kpi label={`Shopify revenue · ${days}d`} value={money(s.revenueCents, cur)} big />
        <Kpi label="Orders" value={num(s.orders)} />
        <Kpi label="Avg order value" value={money(s.aovCents, cur)} />
      </div>
      {meta ? (
        <Card title="Revenue reconciliation" subtitle="Meta-reported purchase value vs actual store revenue">
          <div className="recon">
            <div><div className="kpil">Meta-reported</div><div className="kpiv">{money(meta.revenueCents, cur)}</div></div>
            <div><div className="kpil">Shopify actual</div><div className="kpiv">{money(s.revenueCents, cur)}</div></div>
            <div><div className="kpil">Discrepancy</div><div className={`kpiv ${disc != null && Math.abs(disc) > 0.15 ? "warn-t" : ""}`}>{disc == null ? "—" : `${disc > 0 ? "+" : ""}${(disc * 100).toFixed(0)}%`}</div></div>
          </div>
          <p className="muted recnote">Meta counts purchases on click/view windows and can over- or under-count vs the store&apos;s real orders. Shopify is the source of truth for &ldquo;measured in revenue.&rdquo;</p>
        </Card>
      ) : (
        <Card title="Revenue reconciliation" subtitle="connect Meta to compare"><p className="muted">Once Meta is connected, this compares its reported purchase value against actual Shopify revenue.</p></Card>
      )}
      <Card title="Revenue trend" subtitle={`daily, last ${days} days`}><RevTrend daily={s.daily} /></Card>

      <Card title="Daily orders & revenue" subtitle={`${s.daily.length} days with orders`}>
        {s.daily.length === 0 ? <Empty>No orders in this window.</Empty> : (
          <table className="tbl">
            <thead><tr><th>Date</th><th className="r">Orders</th><th className="r">Revenue</th><th className="r">AOV</th></tr></thead>
            <tbody>
              {[...s.daily].reverse().map((d) => (
                <tr key={d.date}>
                  <td>{d.date}</td>
                  <td className="r">{num(d.orders)}</td>
                  <td className="r">{money(d.revenueCents, cur)}</td>
                  <td className="r">{d.orders > 0 ? money(Math.round(d.revenueCents / d.orders), cur) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

// ---- Activity log ----------------------------------------------------------

interface ActionRow { id: string; agent: string; kind: string; platform: string | null; summary: string; rationale: string | null; status: string; estimated_spend_cents: number; dry_run: boolean; created_at: string }

function Activity({ call }: { call: Call }) {
  const { data, err, loading, reload } = useLoad(() => call("/api/engine/status"), [call]);
  if (loading) return <Loading />;
  if (err) return <ErrBox msg={err} retry={reload} />;
  const actions = (data?.recentActions || []) as ActionRow[];
  if (actions.length === 0) return <Empty big>No actions logged yet.</Empty>;
  return (
    <div>
      <p className="lbl">Append-only audit trail — every decision, before it acts. This is the case study.</p>
      <div className="log">
        {actions.map((a) => (
          <div key={a.id} className="logrow">
            <span className={`tag ${a.status}`}>{a.status}</span>
            <div className="logbody">
              <div className="logtop"><b>{a.agent}</b><span className="kind">{a.kind}</span>{a.platform && <span className="plat">{a.platform}</span>}{a.dry_run && <span className="chip warn sm">simulated</span>}{a.estimated_spend_cents > 0 && <span className="chip sm">~{money(a.estimated_spend_cents)}/day</span>}<span className="t">{ago(a.created_at)}</span></div>
              <p className="sum">{a.summary}</p>
              {a.rationale && <p className="rat">{a.rationale}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Approvals -------------------------------------------------------------

function Approvals({ call, onPending }: { call: Call; onPending: (n: number) => void }) {
  const { data, err, loading, reload } = useLoad(() => call("/api/engine/approvals"), [call]);
  const [busy, setBusy] = useState<string | null>(null);
  const pend = (data?.pending || []) as ActionRow[];
  useEffect(() => { if (data) onPending(pend.length); }, [data, pend.length, onPending]);
  const decide = async (id: string, decision: "approved" | "rejected") => {
    setBusy(id);
    try { await call("/api/engine/approvals", { method: "POST", body: JSON.stringify({ actionId: id, decision, approvedBy: "operator" }) }); reload(); }
    catch (e) { alert(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(null); }
  };
  if (loading) return <Loading />;
  if (err) return <ErrBox msg={err} retry={reload} />;
  if (pend.length === 0) return <Empty big>Nothing awaiting approval. 👍</Empty>;
  return (
    <div>
      <p className="lbl">Spend-increasing changes wait here for sign-off. Approving executes through the gate.</p>
      <div className="log">
        {pend.map((a) => (
          <div key={a.id} className="logrow approval">
            <div className="logbody">
              <div className="logtop"><b>{a.agent}</b><span className="kind">{a.kind}</span>{a.platform && <span className="plat">{a.platform}</span>}{a.estimated_spend_cents > 0 && <span className="chip warn sm">~{money(a.estimated_spend_cents)}/day</span>}</div>
              <p className="sum">{a.summary}</p>{a.rationale && <p className="rat">{a.rationale}</p>}
            </div>
            <div className="actions"><button className="primary" disabled={busy === a.id} onClick={() => decide(a.id, "approved")}>Approve</button><button className="ghost" disabled={busy === a.id} onClick={() => decide(a.id, "rejected")}>Reject</button></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- shared bits -----------------------------------------------------------

function Card({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: { label: string; onClick: () => void }; children: React.ReactNode }) {
  return (
    <section className="card">
      <div className="cardhead"><div><h3>{title}</h3>{subtitle && <span className="cardsub">{subtitle}</span>}</div>{action && <button className="link" onClick={action.onClick}>{action.label}</button>}</div>
      {children}
    </section>
  );
}
function Kpi({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return <div className={`kpi ${big ? "kpibig" : ""}`}><div className="kpiv">{value}</div><div className="kpil">{label}</div></div>;
}
function Loading({ note }: { note?: string }) { return <div className="state"><div className="spinner" /><p>{note || "Loading…"}</p></div>; }
function ErrBox({ msg, retry }: { msg: string; retry?: () => void }) { return <div className="state err"><p>{msg}</p>{retry && <button className="ghost" onClick={retry}>Retry</button>}</div>; }
function Empty({ children, big }: { children: React.ReactNode; big?: boolean }) { return <div className={`empty ${big ? "big" : ""}`}>{children}</div>; }
