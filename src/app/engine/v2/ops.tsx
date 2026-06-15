"use client";

// Engine ops views — Runs, Activity log (Signal), Approvals. Data flow is
// UNCHANGED from v1: token-bearer fetch in live mode, demoCall() in demo mode.
// Only the presentation is the v2 system. Approve stays the one yellow button.

import { useCallback, useEffect, useState } from "react";
import { DEMO, demoCall } from "../demo";
import { inr, count } from "./format";
import { Card, Empty } from "./ui";

const money = (c: number | null | undefined) => inr(c);
const num = count;
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

export function useApi(token: string) {
  return useCallback(async (path: string, init?: RequestInit) => {
    if (DEMO) return demoCall(path, init);
    const res = await fetch(path, { ...init, headers: { ...(init?.headers || {}), Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || res.statusText);
    return json;
  }, [token]);
}
export type Call = (path: string, init?: RequestInit) => Promise<Record<string, unknown>>;

function useLoad<T>(fn: () => Promise<T>, deps: React.DependencyList) {
  const [data, setData] = useState<T | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const reload = useCallback(() => {
    setLoading(true); setErr("");
    fn().then(setData).catch((e) => setErr(e instanceof Error ? e.message : String(e))).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(reload, [reload]);
  return { data, err, loading, reload };
}

function Loading() { return <div className="state"><div className="spinner" /><p>Loading…</p></div>; }
function ErrBox({ msg, retry }: { msg: string; retry?: () => void }) { return <div className="state err"><p>{msg}</p>{retry && <button className="ghost" onClick={retry}>Retry</button>}</div>; }

interface ActionRow { id: string; agent: string; kind: string; platform: string | null; summary: string; rationale: string | null; status: string; estimated_spend_cents: number; dry_run: boolean; created_at: string }
interface Opportunity { title: string; detail: string; impact: string; effort: string; owner: string }
interface AuditRun { score: number | null; summary: string | null; opportunities: Opportunity[]; created_at: string }
interface RunRow { id: string; step: string; agent: string | null; model: string | null; status: string; summary: string | null; input_tokens: number; output_tokens: number; started_at: string; finished_at: string | null; fetches: ActionRow[]; mutations: ActionRow[]; audit: AuditRun | null }

export function Runs({ call }: { call: Call }) {
  const { data, err, loading, reload } = useLoad(() => call("/api/engine/runs?limit=10"), [call]);
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState("");
  const runAudit = async () => {
    setRunning(true); setMsg("");
    try { const r = await call("/api/engine/run", { method: "POST", body: JSON.stringify({ step: "audit" }) }); setMsg(`✓ Audit complete (run ${String(r.runId).slice(0, 8)}).`); reload(); }
    catch (e) { setMsg(`✕ ${e instanceof Error ? e.message : String(e)}`); }
    finally { setRunning(false); }
  };
  if (loading) return <Loading />;
  if (err) return <ErrBox msg={err} retry={reload} />;
  const runs = (data?.runs || []) as RunRow[];
  return (
    <div className="runs">
      <div className="rowbar"><button className="primary-ink sm" onClick={runAudit} disabled={running}>{running ? "Running audit…" : "Run audit"}</button>{msg && <span className="muted sm">{msg}</span>}</div>
      {runs.length === 0 ? <Empty big>No runs yet. Click “Run audit”.</Empty> : runs.map((r) => (
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
              {r.fetches.length === 0 ? <p className="muted">No reads logged.</p> : <ul className="fetchlist">{r.fetches.map((f) => <li key={f.id}><span className="kind">{f.kind}</span> {f.summary}</li>)}</ul>}
              {r.mutations.length > 0 && <><h5 style={{ marginTop: 12 }}>Proposed changes</h5><ul className="fetchlist">{r.mutations.map((m) => <li key={m.id}><span className={`tag ${m.status}`}>{m.status}</span> {m.summary}</li>)}</ul></>}
            </div>
            <div className="runcol">
              <h5>What we concluded</h5>
              {r.audit ? <>
                <div className="concl"><span className={`miniscore s${(r.audit.score ?? 0) >= 70 ? "hi" : (r.audit.score ?? 0) >= 40 ? "mid" : "lo"}`}>{r.audit.score ?? "—"}/100</span><span className="muted">{(r.audit.opportunities || []).length} opportunities</span></div>
                <ol className="opplist">{(r.audit.opportunities || []).map((o, i) => <li key={i}><b>{o.title}</b> <span className={`chip imp-${o.impact} sm`}>{o.impact}</span> <span className="chip sm owner">{o.owner}</span></li>)}</ol>
              </> : <p className="muted">No structured output.</p>}
            </div>
          </div>
          {r.summary && <details className="reasoning"><summary>Agent narrative</summary><pre>{r.summary}</pre></details>}
        </div>
      ))}
    </div>
  );
}

export function Activity({ call }: { call: Call }) {
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
              <div className="logtop"><b>{a.agent}</b><span className="kind">{a.kind}</span>{a.platform && <span className="plat">{a.platform}</span>}{a.dry_run && <span className="chip chip-warn sm">simulated</span>}{a.estimated_spend_cents > 0 && <span className="chip sm">~{money(a.estimated_spend_cents)}/day</span>}<span className="t">{ago(a.created_at)}</span></div>
              <p className="sum">{a.summary}</p>{a.rationale && <p className="rat">{a.rationale}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Approvals({ call, onPending }: { call: Call; onPending: (n: number) => void }) {
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
  if (pend.length === 0) return <Empty big>Nothing waiting on you.</Empty>;
  return (
    <div>
      <p className="lbl">Spend-increasing changes wait here for sign-off. Approving executes through the gate.</p>
      <div className="log">
        {pend.map((a) => (
          <div key={a.id} className="logrow approval">
            <div className="logbody">
              <div className="logtop"><b>{a.agent}</b><span className="kind">{a.kind}</span>{a.platform && <span className="plat">{a.platform}</span>}{a.estimated_spend_cents > 0 && <span className="chip chip-warn sm">~{money(a.estimated_spend_cents)}/day of cap</span>}</div>
              <p className="sum">{a.summary}</p>{a.rationale && <p className="rat">{a.rationale}</p>}
            </div>
            <div className="actions"><button className="primary" disabled={busy === a.id} onClick={() => decide(a.id, "approved")}>Approve</button><button className="ghost" disabled={busy === a.id} onClick={() => decide(a.id, "rejected")}>Reject</button></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// status fetch for the sidebar/overview (pending count + integrations passthrough)
export function useStatusPending(call: Call) {
  const [pending, setPending] = useState<number | null>(null);
  useEffect(() => {
    let live = true;
    call("/api/engine/status").then((d) => { if (live && typeof d.pendingApprovals === "number") setPending(d.pendingApprovals as number); }).catch(() => {});
    return () => { live = false; };
  }, [call]);
  return [pending, setPending] as const;
}

export { Card };
