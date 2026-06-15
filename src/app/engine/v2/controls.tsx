"use client";

// Global controls: GA4-style date range picker (dual-month, presets, compare),
// granularity, attribution lens, filters, and source-health chips. All write
// through the URL-backed state in state.ts.

import { useEffect, useMemo, useRef, useState } from "react";
import type { AppState, CompareMode, DateRange, Dataset, Filter, FilterDim, Lens } from "./types";
import type { EngineState } from "./state";
import { resolveCompare } from "./ranges";
import { fmtRange, parseDate } from "./format";
import { campaignDim } from "./metrics";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DOW = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const cx = (...a: (string | false | undefined)[]) => a.filter(Boolean).join(" ");

// --- source health ----------------------------------------------------------

export function SourceHealth({ integrations }: { integrations: Dataset["integrations"] }) {
  const ago = (iso: string | null) => {
    if (!iso) return null;
    const h = Math.round((Date.now() - new Date(iso).getTime()) / 3600000);
    return h <= 0 ? "just now" : h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
  };
  return (
    <div className="srchealth">
      {integrations.map((it) => (
        <span key={it.source} className={cx("hchip", it.status)}>
          <span className={cx("hdot", it.status)} />
          <b>{it.source}</b>
          {it.status === "connected" ? <span>synced {ago(it.lastSyncAt)}</span> : it.status === "in_progress" ? <span>connecting</span> : <span>error</span>}
        </span>
      ))}
    </div>
  );
}

// --- lens toggle ------------------------------------------------------------

const LENS_LABEL: Record<Lens, string> = { platform: "Platform-reported", shopify: "Shopify last-click", blended: "Blended (MER)" };
export function LensToggle({ lens, onChange }: { lens: Lens; onChange: (l: Lens) => void }) {
  return (
    <div className="seg lens" role="group" aria-label="Attribution lens">
      {(["platform", "shopify", "blended"] as Lens[]).map((l) => (
        <button key={l} className={cx(lens === l && "on")} onClick={() => onChange(l)} title={LENS_LABEL[l]}>
          {l === "platform" ? "Platform" : l === "shopify" ? "Shopify" : "Blended"}
        </button>
      ))}
    </div>
  );
}

export function GranularityToggle({ value, onChange }: { value: "day" | "week" | "month"; onChange: (g: "day" | "week" | "month") => void }) {
  return (
    <div className="seg" role="group" aria-label="Granularity">
      {(["day", "week", "month"] as const).map((g) => <button key={g} className={cx(value === g && "on")} onClick={() => onChange(g)}>{g[0].toUpperCase() + g.slice(1)}</button>)}
    </div>
  );
}

// --- date range picker ------------------------------------------------------

function daysInMonth(ym: string) { const [y, m] = ym.split("-").map(Number); return new Date(Date.UTC(y, m, 0)).getUTCDate(); }
function addMonth(ym: string, d: number) { const [y, m] = ym.split("-").map(Number); return new Date(Date.UTC(y, m - 1 + d, 1)).toISOString().slice(0, 7); }
function monthLabel(ym: string) { const [y, m] = ym.split("-").map(Number); return `${MONTHS[m - 1]} ${y}`; }
const pad = (n: number) => String(n).padStart(2, "0");

function MonthGrid({ ym, range, half, today, onPick }: { ym: string; range: DateRange; half: boolean; today: string; onPick: (iso: string) => void }) {
  const first = `${ym}-01`;
  const lead = (parseDate(first).getUTCDay() + 6) % 7; // Monday-based
  const dim = daysInMonth(ym);
  const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length: dim }, (_, i) => `${ym}-${pad(i + 1)}`)];
  return (
    <div className="cal">
      <div className="cal-dow">{DOW.map((d) => <span key={d}>{d}</span>)}</div>
      <div className="cal-grid">
        {cells.map((iso, i) => {
          if (!iso) return <span key={i} className="cal-blank" />;
          const future = iso > today;
          const isStart = iso === range.start, isEnd = iso === range.end && !half;
          const inRange = !half && iso > range.start && iso < range.end;
          return (
            <button key={i} disabled={future} className={cx("cal-day", isStart && "start", isEnd && "end", inRange && "in", future && "future")} onClick={() => onPick(iso)}>
              {Number(iso.slice(8))}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const COMPARE_OPTS: { id: CompareMode; label: string }[] = [
  { id: "off", label: "No comparison" },
  { id: "preceding", label: "Preceding period" },
  { id: "preceding_dow", label: "Preceding period (match day of week)" },
  { id: "yoy", label: "Same period last year" },
  { id: "custom", label: "Custom range" },
];

export function DateRangePicker({ today, es }: { today: string; es: EngineState }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState<DateRange>(es.state.range);
  const [presetId, setPresetId] = useState(es.raw.presetId);
  const [half, setHalf] = useState(false);
  const [cmp, setCmp] = useState<CompareMode>(es.state.compareMode);
  const [customCmp, setCustomCmp] = useState<DateRange | null>(es.raw.customCompare);
  const [view, setView] = useState(addMonth(es.state.range.end.slice(0, 7), -1));

  useEffect(() => {
    if (!open) return;
    setRange(es.state.range); setPresetId(es.raw.presetId); setHalf(false);
    setCmp(es.state.compareMode); setCustomCmp(es.raw.customCompare);
    setView(addMonth(es.state.range.end.slice(0, 7), -1));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc); document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const pick = (iso: string) => {
    setPresetId("custom");
    if (half) { // completing the range
      if (iso < range.start) { setRange({ start: iso, end: range.start }); } else setRange({ ...range, end: iso });
      setHalf(false);
    } else { setRange({ start: iso, end: iso }); setHalf(true); }
  };

  const apply = () => {
    if (presetId !== "custom") es.setPreset(presetId);
    else es.setCustomRange(range);
    es.setCompare(cmp, cmp === "custom" ? customCmp : null);
    setOpen(false);
  };

  const previewCompare = resolveCompare(range, cmp, customCmp);
  const triggerCmp = es.state.compareMode !== "off" && es.state.compareRange;

  return (
    <div className="drp" ref={ref}>
      <button className="drp-trigger" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="drp-main">{es.presets.find((p) => p.id === es.raw.presetId)?.label || "Custom"} · {fmtRange(es.state.range)}</span>
        {triggerCmp && <span className="drp-cmp">vs {fmtRange(es.state.compareRange!)}</span>}
      </button>
      {open && (
        <div className="drp-panel" role="dialog" aria-label="Select date range">
          <div className="drp-presets">
            {es.presets.map((p) => (
              <button key={p.id} className={cx(presetId === p.id && "on")} onClick={() => { setPresetId(p.id); setRange(p.resolve(today)); setHalf(false); setView(addMonth(p.resolve(today).end.slice(0, 7), -1)); }}>{p.label}</button>
            ))}
            <button className={cx(presetId === "custom" && "on")} onClick={() => setPresetId("custom")}>Custom</button>
          </div>
          <div className="drp-cal-wrap">
            <div className="drp-cal-head">
              <button className="drp-nav" onClick={() => setView(addMonth(view, -1))} aria-label="Previous month">‹</button>
              <span>{monthLabel(view)}</span><span>{monthLabel(addMonth(view, 1))}</span>
              <button className="drp-nav" onClick={() => setView(addMonth(view, 1))} aria-label="Next month" disabled={addMonth(view, 1) > today.slice(0, 7)}>›</button>
            </div>
            <div className="drp-cals">
              <MonthGrid ym={view} range={range} half={half} today={today} onPick={pick} />
              <MonthGrid ym={addMonth(view, 1)} range={range} half={half} today={today} onPick={pick} />
            </div>
            <div className="drp-inputs">
              <span className="drp-field">{fmtRange(range)}</span>
              <div className="drp-compare">
                <label>Compare</label>
                <select value={cmp} onChange={(e) => setCmp(e.target.value as CompareMode)}>
                  {COMPARE_OPTS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
                {previewCompare && cmp !== "off" && <span className="drp-cmp-preview">vs {fmtRange(previewCompare)}</span>}
              </div>
            </div>
          </div>
          <div className="drp-actions">
            <button className="ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button className="primary-ink" onClick={apply}>Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- filters ----------------------------------------------------------------

const FILTER_DIMS: { dim: FilterDim; label: string }[] = [
  { dim: "platform", label: "Platform" },
  { dim: "campaign", label: "Campaign" },
  { dim: "campaignType", label: "Campaign type" },
  { dim: "funnelStage", label: "Funnel stage" },
  { dim: "device", label: "Device" },
  { dim: "geo", label: "Geo" },
  { dim: "customerType", label: "Customer type" },
];

function optionsFor(dim: FilterDim, ds: Dataset): { value: string; label: string }[] {
  if (dim === "platform") return [{ value: "google", label: "Google" }, { value: "meta", label: "Meta" }];
  if (dim === "customerType") return [{ value: "new", label: "New" }, { value: "returning", label: "Returning" }];
  if (dim === "campaignType") return [...new Set(ds.adDaily.map((r) => r.campaignType))].map((v) => ({ value: v, label: v }));
  if (dim === "funnelStage") return [...new Set(ds.adDaily.map((r) => r.funnelStage))].map((v) => ({ value: v, label: v.toUpperCase() }));
  if (dim === "campaign") return [...campaignDim(ds).values()].map((c) => ({ value: c.campaignId, label: c.campaignName }));
  if (dim === "device") return [...new Set(ds.segmentDaily.filter((s) => s.segmentType === "device").map((s) => s.segmentValue))].map((v) => ({ value: v, label: v }));
  if (dim === "geo") return [...new Set(ds.segmentDaily.filter((s) => s.segmentType === "geo").map((s) => s.segmentValue))].map((v) => ({ value: v, label: v }));
  return [];
}

const DIM_LABEL = Object.fromEntries(FILTER_DIMS.map((d) => [d.dim, d.label]));

export function Filters({ ds, state, es }: { ds: Dataset; state: AppState; es: EngineState }) {
  const [adding, setAdding] = useState(false);
  const [dim, setDim] = useState<FilterDim | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const used = new Set(state.filters.map((f) => f.dim));
  const opts = useMemo(() => (dim ? optionsFor(dim, ds) : []), [dim, ds]);

  useEffect(() => {
    if (!adding) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setAdding(false); setDim(null); } };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [adding]);

  const toggle = (d: FilterDim, v: string) => {
    const cur = state.filters.find((f) => f.dim === d)?.values || [];
    const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
    if (next.length) es.addFilter({ dim: d, values: next } as Filter); else es.removeFilter(d);
  };

  return (
    <div className="filters">
      {state.filters.map((f) => (
        <span key={f.dim} className="fchip">
          <b>{DIM_LABEL[f.dim]}</b>
          <span>{f.values.map((v) => optionsFor(f.dim, ds).find((o) => o.value === v)?.label || v).join(", ")}</span>
          <button onClick={() => es.removeFilter(f.dim)} aria-label={`Remove ${DIM_LABEL[f.dim]} filter`}>×</button>
        </span>
      ))}
      <div className="fadd" ref={ref}>
        <button className="fadd-btn" onClick={() => { setAdding((a) => !a); setDim(null); }}>+ Add filter</button>
        {adding && (
          <div className="fmenu">
            {!dim ? (
              FILTER_DIMS.filter((d) => !used.has(d.dim)).map((d) => <button key={d.dim} className="fmenu-dim" onClick={() => setDim(d.dim)}>{d.label}</button>)
            ) : (
              <>
                <div className="fmenu-head"><button className="fmenu-back" onClick={() => setDim(null)}>‹</button>{DIM_LABEL[dim]}</div>
                <div className="fmenu-opts">
                  {opts.map((o) => {
                    const on = state.filters.find((f) => f.dim === dim)?.values.includes(o.value);
                    return <label key={o.value} className="fmenu-opt"><input type="checkbox" checked={!!on} onChange={() => toggle(dim, o.value)} />{o.label}</label>;
                  })}
                </div>
                <button className="fmenu-done" onClick={() => { setAdding(false); setDim(null); }}>Done</button>
              </>
            )}
          </div>
        )}
      </div>
      {state.filters.length > 0 && <button className="fclear" onClick={es.clearFilters}>Clear all</button>}
    </div>
  );
}
