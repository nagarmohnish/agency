"use client";

// Shared UI + chart primitives for ROI Engine v2. SVG charts use a fixed viewBox
// with CSS aspect-ratio so strokes stay crisp and annotation dots stay round.
// Yellow is reserved for: active nav, Approve, focus ring, takeaway tick, and
// chart annotation dots — nothing else.

import { useRef, useState } from "react";
import { fmtDay } from "./format";

// theme-aware: all chart colors resolve to CSS variables so charts adapt to the
// light (Atlas) / dark (Terminal) palette automatically.
export const COL = {
  ink: "var(--ink)", ink2: "var(--ink-2)", ink3: "var(--ink-3)", grid: "var(--chart-grid)", gridStrong: "var(--border-2)",
  brand: "var(--accent)", pos: "var(--pos)", neg: "var(--neg)", warn: "var(--warn)",
  google: "var(--ink)", meta: "var(--ink-3)", shopify: "var(--accent)", email: "var(--ink-3)",
};

const cx = (...a: (string | false | undefined)[]) => a.filter(Boolean).join(" ");

// --- chips ------------------------------------------------------------------

export function Chip({ children, tone, className }: { children: React.ReactNode; tone?: "pos" | "neg" | "warn" | "muted"; className?: string }) {
  return <span className={cx("chip", tone && `chip-${tone}`, className)}>{children}</span>;
}
export function SourceChips({ sources, demo }: { sources: string[]; demo?: boolean }) {
  return (
    <span className="srcrow">
      {sources.map((s) => <span key={s} className="src">{s}</span>)}
      {demo && <span className="src demo">DEMO</span>}
    </span>
  );
}

// --- info tooltip -----------------------------------------------------------

export interface Tip { def: string; formula: string; source: string; lens?: string; caveat: string }
export function Info({ label, tip }: { label: string; tip: Tip }) {
  return (
    <span className="tipwrap">
      <button type="button" className="infobtn" aria-label={`About ${label}`}>i</button>
      <dl className="tip" role="tooltip">
        <dt>Definition</dt><dd>{tip.def}</dd>
        <dt>Formula</dt><dd className="mono">{tip.formula}</dd>
        <dt>Source</dt><dd>{tip.source}</dd>
        {tip.lens && (<><dt>Active lens</dt><dd>{tip.lens}</dd></>)}
        <dt>Caveat</dt><dd>{tip.caveat}</dd>
      </dl>
    </span>
  );
}

// --- delta chip -------------------------------------------------------------

export function DeltaChip({ delta, dir = "neutral", label }: { delta: number | null; dir?: "up" | "down" | "neutral"; label?: string }) {
  if (delta == null || !isFinite(delta)) return <span className="delta flat"><span className="dl">{label || "no comparison"}</span></span>;
  const up = delta > 0.0005, down = delta < -0.0005;
  const arrow = up ? "▲" : down ? "▼" : "•";
  let tone = "flat";
  if (dir !== "neutral" && (up || down)) tone = (dir === "up" && up) || (dir === "down" && down) ? "pos" : "neg";
  return (
    <span className={cx("delta", tone)}>
      <span className="d">{arrow} {(Math.abs(delta) * 100).toFixed(1)}%</span>
      {label && <span className="dl">{label}</span>}
    </span>
  );
}

// --- sparkline --------------------------------------------------------------

export function Sparkline({ values }: { values: number[] }) {
  if (!values || values.length < 2) return null;
  const W = 220, H = 30, P = 3;
  const max = Math.max(...values), min = Math.min(...values), span = max - min || 1;
  const xAt = (i: number) => P + (i / (values.length - 1)) * (W - 2 * P);
  const yAt = (v: number) => H - P - ((v - min) / span) * (H - 2 * P);
  const d = values.map((v, i) => `${i ? "L" : "M"}${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(" ");
  return (
    <svg className="spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="none" stroke={COL.ink} strokeWidth="1.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={xAt(values.length - 1)} cy={yAt(values[values.length - 1])} r="2.2" fill={COL.brand} />
    </svg>
  );
}

// --- takeaway (first-class) -------------------------------------------------

export function Takeaway({ children }: { children: React.ReactNode }) {
  return <p className="takeaway">{children}</p>;
}

// --- KPI card ---------------------------------------------------------------

export interface KpiProps {
  label: string; sources: string[]; value: string;
  delta?: number | null; dir?: "up" | "down" | "neutral"; deltaLabel?: string;
  explainer?: string; tip?: Tip; spark?: number[] | null; big?: boolean; demo?: boolean;
}
export function KpiCard(p: KpiProps) {
  return (
    <div className={cx("kpi", p.big && "kpibig")}>
      <div className="kpihead">
        <span className="kpilabel">{p.label}</span>
        {p.tip && <Info label={p.label} tip={p.tip} />}
      </div>
      <SourceChips sources={p.sources} demo={p.demo} />
      <div className="kpival">{p.value}</div>
      <DeltaChip delta={p.delta ?? null} dir={p.dir} label={p.deltaLabel} />
      {p.explainer && <div className="kpiexpl">{p.explainer}</div>}
      {p.spark && p.spark.length > 1 && <div className="kpispark"><Sparkline values={p.spark} /></div>}
    </div>
  );
}

// --- card / states ----------------------------------------------------------

export function Card({ title, subtitle, action, right, children, className }: { title?: string; subtitle?: string; action?: { label: string; onClick: () => void }; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cx("card", className)}>
      {(title || action || right) && (
        <div className="cardhead">
          <div>{title && <h3>{title}</h3>}{subtitle && <span className="cardsub">{subtitle}</span>}</div>
          {action ? <button className="link" onClick={action.onClick}>{action.label}</button> : right}
        </div>
      )}
      {children}
    </section>
  );
}
export function Empty({ children, big }: { children: React.ReactNode; big?: boolean }) { return <div className={cx("empty", big && "big")}>{children}</div>; }
export function Pending({ source, children }: { source?: string; children: React.ReactNode }) {
  return <div className="pending"><span className="pendingdot" />{source && <b>{source} integration in progress</b>}<span>{children}</span></div>;
}
export function KpiSkeleton({ n = 4 }: { n?: number }) {
  return <div className="kpis">{Array.from({ length: n }).map((_, i) => <div key={i} className="skel kpi-s" />)}</div>;
}
export function CardSkeleton() { return <div className="skel card-s" />; }

// --- inline bar (for tables) ------------------------------------------------

export function InlineBar({ value, peak }: { value: number; peak: number }) {
  return <span className="bar"><i style={{ width: `${peak ? Math.max(0, (value / peak) * 100) : 0}%` }} /></span>;
}

// --- chart hover helper -----------------------------------------------------

function useHoverIndex(n: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState<number | null>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el || n < 2) return;
    const r = el.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    setIdx(Math.round(t * (n - 1)));
  };
  return { ref, idx, onMove, clear: () => setIdx(null) };
}

// --- axis line chart (multi-series + comparison dashed) ---------------------

export interface Series { name: string; color: string; values: number[]; dashed?: boolean; fmt?: (n: number) => string }
export function AxisLineChart({ labels, series, height = "aspect" }: { labels: string[]; series: Series[]; height?: "aspect" }) {
  const n = labels.length;
  const hov = useHoverIndex(n);
  if (n < 2) return <Empty>Not enough data points in range.</Empty>;
  const W = 720, H = 200, PX = 6, PT = 12, PB = 22;
  const all = series.flatMap((s) => s.values);
  const max = Math.max(...all, 1), min = Math.min(...all, 0);
  const span = max - min || 1;
  const xAt = (i: number) => PX + (i / (n - 1)) * (W - 2 * PX);
  const yAt = (v: number) => PT + (1 - (v - min) / span) * (H - PT - PB);
  const grid = [0, 0.25, 0.5, 0.75, 1].map((f) => PT + f * (H - PT - PB));
  return (
    <div className="chart" ref={hov.ref} onMouseMove={hov.onMove} onMouseLeave={hov.clear}>
      <svg viewBox={`0 0 ${W} ${H}`} className="chartsvg" aria-hidden="true">
        {grid.map((gy, i) => <line key={i} x1={PX} y1={gy} x2={W - PX} y2={gy} stroke={COL.grid} strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
        {series.map((s) => (
          <path key={s.name} d={s.values.map((v, i) => `${i ? "L" : "M"}${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(" ")}
            fill="none" stroke={s.color} strokeWidth="1.6" strokeDasharray={s.dashed ? "4 3" : undefined} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        ))}
        {series.filter((s) => !s.dashed).map((s) => <circle key={s.name} cx={xAt(n - 1)} cy={yAt(s.values[n - 1])} r="2.6" fill={COL.brand} />)}
        {hov.idx != null && <line x1={xAt(hov.idx)} y1={PT} x2={xAt(hov.idx)} y2={H - PB} stroke={COL.gridStrong} strokeWidth="1" vectorEffect="non-scaling-stroke" />}
      </svg>
      <div className="chartaxis"><span>{fmtDay(labels[0])}</span><span>{fmtDay(labels[Math.floor(n / 2)])}</span><span>{fmtDay(labels[n - 1])}</span></div>
      {hov.idx != null && (
        <div className="charttip" style={{ left: `${(hov.idx / (n - 1)) * 100}%` }}>
          <div className="ct-date">{fmtDay(labels[hov.idx])}</div>
          {series.map((s) => <div key={s.name} className="ct-row"><span className="ct-sw" style={{ background: s.color }} />{s.name}<b>{s.fmt ? s.fmt(s.values[hov.idx!]) : Math.round(s.values[hov.idx!])}</b></div>)}
        </div>
      )}
    </div>
  );
}

// --- stacked bars + revenue line + secondary line (Overview combo) ----------

export function StackedBarLine({ labels, bars, line, secondary }: { labels: string[]; bars: Series[]; line: Series; secondary?: Series }) {
  const n = labels.length;
  const hov = useHoverIndex(n);
  if (n < 1) return <Empty>Not enough data points in range.</Empty>;
  const W = 720, H = 220, PX = 6, PT = 12, PB = 22;
  const totals = labels.map((_, i) => bars.reduce((s, b) => s + (b.values[i] || 0), 0));
  const leftMax = Math.max(...totals, ...line.values, 1);
  const rightMax = secondary ? Math.max(...secondary.values, 1) : 1;
  const bw = (W - 2 * PX) / n * 0.62;
  const xc = (i: number) => PX + (i + 0.5) / n * (W - 2 * PX);
  const yL = (v: number) => PT + (1 - v / leftMax) * (H - PT - PB);
  const yR = (v: number) => PT + (1 - v / rightMax) * (H - PT - PB);
  return (
    <div className="chart" ref={hov.ref} onMouseMove={hov.onMove} onMouseLeave={hov.clear}>
      <svg viewBox={`0 0 ${W} ${H}`} className="chartsvg" aria-hidden="true">
        {[0, 0.5, 1].map((f, i) => { const gy = PT + f * (H - PT - PB); return <line key={i} x1={PX} y1={gy} x2={W - PX} y2={gy} stroke={COL.grid} strokeWidth="1" vectorEffect="non-scaling-stroke" />; })}
        {labels.map((_, i) => {
          let acc = 0;
          return bars.map((b) => { const v = b.values[i] || 0; const y0 = yL(acc); acc += v; const y1 = yL(acc); return <rect key={b.name + i} x={xc(i) - bw / 2} y={y1} width={bw} height={Math.max(0, y0 - y1)} fill={b.color} opacity={0.92} />; });
        })}
        <path d={line.values.map((v, i) => `${i ? "L" : "M"}${xc(i).toFixed(1)} ${yL(v).toFixed(1)}`).join(" ")} fill="none" stroke={line.color} strokeWidth="1.8" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {secondary && <path d={secondary.values.map((v, i) => `${i ? "L" : "M"}${xc(i).toFixed(1)} ${yR(v).toFixed(1)}`).join(" ")} fill="none" stroke={secondary.color} strokeWidth="1.5" strokeDasharray="3 3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />}
        <circle cx={xc(n - 1)} cy={yL(line.values[n - 1])} r="2.6" fill={COL.brand} />
      </svg>
      <div className="chartaxis"><span>{fmtDay(labels[0])}</span><span>{fmtDay(labels[n - 1])}</span></div>
      {hov.idx != null && (
        <div className="charttip" style={{ left: `${((hov.idx + 0.5) / n) * 100}%` }}>
          <div className="ct-date">{fmtDay(labels[hov.idx])}</div>
          {bars.map((b) => <div key={b.name} className="ct-row"><span className="ct-sw" style={{ background: b.color }} />{b.name}<b>{b.fmt ? b.fmt(b.values[hov.idx!]) : Math.round(b.values[hov.idx!])}</b></div>)}
          <div className="ct-row"><span className="ct-sw" style={{ background: line.color }} />{line.name}<b>{line.fmt ? line.fmt(line.values[hov.idx!]) : Math.round(line.values[hov.idx!])}</b></div>
          {secondary && <div className="ct-row"><span className="ct-sw" style={{ background: secondary.color }} />{secondary.name}<b>{secondary.fmt ? secondary.fmt(secondary.values[hov.idx!]) : Math.round(secondary.values[hov.idx!])}</b></div>}
        </div>
      )}
    </div>
  );
}

// --- waterfall (CPA decomposition) ------------------------------------------

export function Waterfall({ items, fmt }: { items: { label: string; contrib: number }[]; fmt?: (n: number) => string }) {
  const max = Math.max(...items.map((i) => Math.abs(i.contrib)), 0.0001);
  return (
    <div className="waterfall">
      {items.map((it) => (
        <div key={it.label} className="wf-row">
          <span className="wf-label">{it.label}</span>
          <span className="wf-track">
            <i className={cx("wf-bar", it.contrib >= 0 ? "pos" : "neg")} style={{ width: `${(Math.abs(it.contrib) / max) * 50}%`, [it.contrib >= 0 ? "left" : "right"]: "50%" } as React.CSSProperties} />
            <span className="wf-mid" />
          </span>
          <span className={cx("wf-val", it.contrib >= 0 ? "neg-t" : "pos-t")}>{fmt ? fmt(it.contrib) : `${(it.contrib * 100).toFixed(1)}%`}</span>
        </div>
      ))}
    </div>
  );
}

// --- heatmap (DOW) ----------------------------------------------------------

export function Heatmap({ cols, rows }: { cols: string[]; rows: { label: string; values: number[]; fmt: (n: number) => string; invert?: boolean }[] }) {
  return (
    <div className="heatmap">
      <div className="hm-row hm-head"><span className="hm-label" />{cols.map((c) => <span key={c} className="hm-col">{c}</span>)}</div>
      {rows.map((r) => {
        const max = Math.max(...r.values, 0.0001), min = Math.min(...r.values);
        const span = max - min || 1;
        return (
          <div key={r.label} className="hm-row">
            <span className="hm-label">{r.label}</span>
            {r.values.map((v, i) => {
              const t = (v - min) / span; const intensity = r.invert ? 1 - t : t;
              return <span key={i} className="hm-cell" style={{ background: `rgba(24,24,27,${0.06 + intensity * 0.5})` }}>{r.fmt(v)}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
}

// --- scatter + log curve (diminishing returns) ------------------------------

export function ScatterCurve({ points, a, b, fmtX, fmtY }: { points: { x: number; y: number }[]; a: number; b: number; fmtX: (n: number) => string; fmtY: (n: number) => string }) {
  if (points.length < 2) return <Empty>Not enough weekly points.</Empty>;
  const W = 720, H = 220, PX = 40, PT = 12, PB = 26;
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  const xmax = Math.max(...xs) * 1.08, ymax = Math.max(...ys) * 1.08;
  const X = (v: number) => PX + (v / xmax) * (W - PX - 8);
  const Y = (v: number) => PT + (1 - v / ymax) * (H - PT - PB);
  const curve: string[] = [];
  for (let i = 1; i <= 40; i++) { const x = (xmax * i) / 40; const y = a * Math.log(x) + b; if (y > 0) curve.push(`${curve.length ? "L" : "M"}${X(x).toFixed(1)} ${Y(y).toFixed(1)}`); }
  const cur = points[points.length - 1];
  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} className="chartsvg" aria-hidden="true">
        {[0, 0.5, 1].map((f, i) => { const gy = PT + f * (H - PT - PB); return <line key={i} x1={PX} y1={gy} x2={W - 8} y2={gy} stroke={COL.grid} strokeWidth="1" vectorEffect="non-scaling-stroke" />; })}
        <path d={curve.join(" ")} fill="none" stroke={COL.ink2} strokeWidth="1.5" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => <circle key={i} cx={X(p.x)} cy={Y(p.y)} r="3" fill={COL.ink3} />)}
        <circle cx={X(cur.x)} cy={Y(cur.y)} r="4.5" fill={COL.brand} stroke={COL.ink} strokeWidth="1" />
      </svg>
      <div className="chartaxis between"><span>{fmtX(0)}</span><span>spend / week →</span><span>{fmtX(xmax)}</span></div>
    </div>
  );
}

// --- donut (monochrome ramp) ------------------------------------------------

// monochrome ramp via ink opacity so it reads in both light & dark themes
const RAMP_OP = [1, 0.72, 0.56, 0.42, 0.3, 0.2];
export function Donut({ data, fmt }: { data: { label: string; value: number }[]; fmt?: (n: number) => string }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const R = 42, C = 2 * Math.PI * R;
  let off = 0;
  return (
    <div className="donutwrap">
      <svg viewBox="0 0 100 100" className="donut" aria-hidden="true">
        <circle cx="50" cy="50" r={R} fill="none" stroke={COL.grid} strokeWidth="12" />
        {data.map((d, i) => { const len = (d.value / total) * C; const seg = <circle key={i} cx="50" cy="50" r={R} fill="none" stroke={COL.ink} opacity={RAMP_OP[i % RAMP_OP.length]} strokeWidth="12" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} transform="rotate(-90 50 50)" />; off += len; return seg; })}
      </svg>
      <ul className="legend">
        {data.map((d, i) => <li key={i}><span className="sw" style={{ background: COL.ink, opacity: RAMP_OP[i % RAMP_OP.length] }} /><span className="ll">{d.label}</span><span className="lv">{fmt ? fmt(d.value) : `${Math.round((d.value / total) * 100)}%`}</span></li>)}
      </ul>
    </div>
  );
}
