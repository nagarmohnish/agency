// Date-range presets (GA4 pattern), comparison-period resolution, and
// day/week/month bucketing. Pure functions over YYYY-MM-DD strings; `today` is
// always passed in so this stays deterministic and testable.

import type { CompareMode, DateRange, Granularity } from "./types";
import { addDays, daysBetween, eachDay, parseDate, toISO } from "./format";

export interface Preset {
  id: string;
  label: string;
  resolve: (today: string) => DateRange;
}

function startOfWeek(s: string): string {
  // week starts Monday
  const d = parseDate(s);
  const dow = d.getUTCDay(); // 0 Sun..6 Sat
  const back = (dow + 6) % 7;
  return addDays(s, -back);
}
function startOfMonth(s: string): string {
  const d = parseDate(s);
  return toISO(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)));
}
function endOfMonth(s: string): string {
  const d = parseDate(s);
  return toISO(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)));
}

export const PRESETS: Preset[] = [
  { id: "today", label: "Today", resolve: (t) => ({ start: t, end: t }) },
  { id: "yesterday", label: "Yesterday", resolve: (t) => ({ start: addDays(t, -1), end: addDays(t, -1) }) },
  { id: "this_week", label: "This week", resolve: (t) => ({ start: startOfWeek(t), end: t }) },
  { id: "last_week", label: "Last week", resolve: (t) => { const s = addDays(startOfWeek(t), -7); return { start: s, end: addDays(s, 6) }; } },
  { id: "last_7", label: "Last 7 days", resolve: (t) => ({ start: addDays(t, -6), end: t }) },
  { id: "last_14", label: "Last 14 days", resolve: (t) => ({ start: addDays(t, -13), end: t }) },
  { id: "last_28", label: "Last 28 days", resolve: (t) => ({ start: addDays(t, -27), end: t }) },
  { id: "last_30", label: "Last 30 days", resolve: (t) => ({ start: addDays(t, -29), end: t }) },
  { id: "last_90", label: "Last 90 days", resolve: (t) => ({ start: addDays(t, -89), end: t }) },
  { id: "this_month", label: "This month", resolve: (t) => ({ start: startOfMonth(t), end: t }) },
  { id: "last_month", label: "Last month", resolve: (t) => { const s = startOfMonth(addDays(startOfMonth(t), -1)); return { start: s, end: endOfMonth(s) }; } },
  { id: "this_year", label: "This year", resolve: (t) => ({ start: `${parseDate(t).getUTCFullYear()}-01-01`, end: t }) },
];

export const PRESET_BY_ID = Object.fromEntries(PRESETS.map((p) => [p.id, p]));

export function rangeLength(r: DateRange): number {
  return daysBetween(r.start, r.end) + 1;
}

// the comparison period for a given mode
export function resolveCompare(range: DateRange, mode: CompareMode, custom: DateRange | null): DateRange | null {
  const len = rangeLength(range);
  switch (mode) {
    case "off":
      return null;
    case "preceding":
      return { start: addDays(range.start, -len), end: addDays(range.start, -1) };
    case "preceding_dow": {
      // align by day-of-week: shift back in whole weeks closest to the period length
      const weeks = Math.max(1, Math.round(len / 7));
      return { start: addDays(range.start, -weeks * 7), end: addDays(range.end, -weeks * 7) };
    }
    case "yoy":
      return { start: addDays(range.start, -365), end: addDays(range.end, -365) };
    case "custom":
      return custom;
    default:
      return null;
  }
}

// suggested granularity for a range length
export function suggestGranularity(r: DateRange): Granularity {
  return rangeLength(r) > 60 ? "week" : "day";
}

export interface Bucket {
  key: string; // bucket id
  label: string; // axis label
  days: string[]; // member dates
}

export function bucketize(range: DateRange, g: Granularity): Bucket[] {
  const days = eachDay(range.start, range.end);
  if (g === "day") return days.map((d) => ({ key: d, label: d, days: [d] }));
  const map = new Map<string, string[]>();
  for (const d of days) {
    const key = g === "week" ? startOfWeek(d) : startOfMonth(d);
    (map.get(key) || map.set(key, []).get(key)!).push(d);
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, ds]) => ({ key, label: key, days: ds }));
}

// map each date -> its comparison-period counterpart date (index-aligned)
export function compareDayMap(range: DateRange, compare: DateRange): Map<string, string> {
  const a = eachDay(range.start, range.end);
  const b = eachDay(compare.start, compare.end);
  const m = new Map<string, string>();
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) m.set(a[i], b[i]);
  return m;
}
