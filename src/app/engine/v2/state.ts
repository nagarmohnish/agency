"use client";

// App state (date range, comparison, granularity, attribution lens, filters)
// with full serialization to URL params so every view is shareable and state
// survives navigation. No Next router dependency — manual history sync keeps it
// static-export friendly.

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AppState, CompareMode, DateRange, Filter, Granularity, Lens, SourceScope } from "./types";
import { PRESET_BY_ID, PRESETS, resolveCompare } from "./ranges";

interface Raw {
  presetId: string;
  range: DateRange;
  compareMode: CompareMode;
  customCompare: DateRange | null;
  granularity: Granularity;
  lens: Lens;
  source: SourceScope;
  filters: Filter[];
}

const LENSES: Lens[] = ["platform", "shopify", "blended"];
const SOURCES: SourceScope[] = ["all", "google", "meta", "shopify"];
const GRANS: Granularity[] = ["day", "week", "month"];
const CMPS: CompareMode[] = ["off", "preceding", "preceding_dow", "yoy", "custom"];

function defaults(today: string): Raw {
  return {
    presetId: "last_28",
    range: PRESET_BY_ID["last_28"].resolve(today),
    compareMode: "off",
    customCompare: null,
    granularity: "day",
    lens: "shopify",
    source: "all",
    filters: [],
  };
}

function serialize(r: Raw): string {
  const p = new URLSearchParams();
  if (r.presetId && r.presetId !== "custom") p.set("preset", r.presetId);
  else p.set("range", `${r.range.start}_${r.range.end}`);
  if (r.compareMode !== "off") p.set("cmp", r.compareMode);
  if (r.compareMode === "custom" && r.customCompare) p.set("cmpr", `${r.customCompare.start}_${r.customCompare.end}`);
  if (r.granularity !== "day") p.set("g", r.granularity);
  if (r.lens !== "shopify") p.set("lens", r.lens);
  if (r.source !== "all") p.set("src", r.source);
  if (r.filters.length) p.set("f", r.filters.map((x) => `${x.dim}~${x.values.join("~")}`).join("|"));
  return p.toString();
}

function parseRange(s: string | null): DateRange | null {
  if (!s) return null;
  const [start, end] = s.split("_");
  return start && end ? { start, end } : null;
}

function deserialize(search: string, today: string): Raw {
  const d = defaults(today);
  const p = new URLSearchParams(search);
  const preset = p.get("preset");
  const range = parseRange(p.get("range"));
  if (preset && PRESET_BY_ID[preset]) { d.presetId = preset; d.range = PRESET_BY_ID[preset].resolve(today); }
  else if (range) { d.presetId = "custom"; d.range = range; }
  const cmp = p.get("cmp") as CompareMode | null;
  if (cmp && CMPS.includes(cmp)) d.compareMode = cmp;
  const cmpr = parseRange(p.get("cmpr"));
  if (cmpr) d.customCompare = cmpr;
  const g = p.get("g") as Granularity | null;
  if (g && GRANS.includes(g)) d.granularity = g;
  const lens = p.get("lens") as Lens | null;
  if (lens && LENSES.includes(lens)) d.lens = lens;
  const src = p.get("src") as SourceScope | null;
  if (src && SOURCES.includes(src)) d.source = src;
  const f = p.get("f");
  if (f) d.filters = f.split("|").map((chunk) => { const [dim, ...vals] = chunk.split("~"); return { dim: dim as Filter["dim"], values: vals }; }).filter((x) => x.values.length);
  return d;
}

export interface EngineState {
  state: AppState;
  raw: Raw;
  presets: typeof PRESETS;
  setPreset: (id: string) => void;
  setCustomRange: (r: DateRange) => void;
  setCompare: (mode: CompareMode, custom?: DateRange | null) => void;
  setGranularity: (g: Granularity) => void;
  setLens: (l: Lens) => void;
  setSource: (s: SourceScope) => void;
  addFilter: (f: Filter) => void;
  removeFilter: (dim: Filter["dim"]) => void;
  clearFilters: () => void;
}

export function useEngineState(today: string): EngineState {
  const [raw, setRaw] = useState<Raw>(() =>
    typeof window !== "undefined" ? deserialize(window.location.search, today) : defaults(today)
  );

  // reflect to URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const qs = serialize(raw);
    const url = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", url);
  }, [raw]);

  const state: AppState = useMemo(() => ({
    range: raw.range,
    presetId: raw.presetId,
    compareMode: raw.compareMode,
    compareRange: resolveCompare(raw.range, raw.compareMode, raw.customCompare),
    granularity: raw.granularity,
    lens: raw.lens,
    source: raw.source,
    filters: raw.filters,
  }), [raw]);

  const setPreset = useCallback((id: string) => setRaw((r) => ({ ...r, presetId: id, range: PRESET_BY_ID[id]?.resolve(today) ?? r.range })), [today]);
  const setCustomRange = useCallback((range: DateRange) => setRaw((r) => ({ ...r, presetId: "custom", range })), []);
  const setCompare = useCallback((mode: CompareMode, custom?: DateRange | null) => setRaw((r) => ({ ...r, compareMode: mode, customCompare: custom !== undefined ? custom : r.customCompare })), []);
  const setGranularity = useCallback((g: Granularity) => setRaw((r) => ({ ...r, granularity: g })), []);
  const setLens = useCallback((l: Lens) => setRaw((r) => ({ ...r, lens: l })), []);
  const setSource = useCallback((s: SourceScope) => setRaw((r) => ({ ...r, source: s })), []);
  const addFilter = useCallback((f: Filter) => setRaw((r) => ({ ...r, filters: [...r.filters.filter((x) => x.dim !== f.dim), f] })), []);
  const removeFilter = useCallback((dim: Filter["dim"]) => setRaw((r) => ({ ...r, filters: r.filters.filter((x) => x.dim !== dim) })), []);
  const clearFilters = useCallback(() => setRaw((r) => ({ ...r, filters: [] })), []);

  return { state, raw, presets: PRESETS, setPreset, setCustomRange, setCompare, setGranularity, setLens, setSource, addFilter, removeFilter, clearFilters };
}
