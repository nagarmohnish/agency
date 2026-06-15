// Formatting — Indian ₹ grouping with a compact (L/Cr) option, percentages,
// ratios, counts, and date helpers. Currency values arrive in cents.

export function inr(cents: number | null | undefined, opts?: { compact?: boolean; cur?: string }): string {
  if (cents == null || !isFinite(cents)) return "—";
  const cur = opts?.cur || "INR";
  const v = cents / 100;
  if (opts?.compact) {
    const sym = cur === "INR" ? "₹" : "";
    const a = Math.abs(v);
    if (cur === "INR") {
      if (a >= 1e7) return `${v < 0 ? "-" : ""}${sym}${(a / 1e7).toFixed(a >= 1e8 ? 0 : 2)}Cr`;
      if (a >= 1e5) return `${v < 0 ? "-" : ""}${sym}${(a / 1e5).toFixed(a >= 1e6 ? 0 : 1)}L`;
      if (a >= 1e3) return `${v < 0 ? "-" : ""}${sym}${(a / 1e3).toFixed(0)}k`;
    }
  }
  return new Intl.NumberFormat(cur === "INR" ? "en-IN" : undefined, {
    style: "currency",
    currency: cur,
    maximumFractionDigits: 0,
  }).format(v);
}

export const count = (n: number | null | undefined) =>
  n == null || !isFinite(n) ? "—" : new Intl.NumberFormat("en-IN").format(Math.round(n));

export const pct = (r: number | null | undefined, dp = 1) =>
  r == null || !isFinite(r) ? "—" : `${(r * 100).toFixed(dp)}%`;

// signed percentage for deltas
export const signedPct = (r: number | null | undefined, dp = 1) =>
  r == null || !isFinite(r) ? "—" : `${r > 0 ? "+" : ""}${(r * 100).toFixed(dp)}%`;

export const ratio = (r: number | null | undefined, dp = 2) =>
  r == null || !isFinite(r) ? "—" : `${r.toFixed(dp)}×`;

// --- dates (all on YYYY-MM-DD strings, UTC-safe) ----------------------------

export const MS_DAY = 86400000;

export function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
export function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}
export function addDays(s: string, n: number): string {
  return toISO(new Date(parseDate(s).getTime() + n * MS_DAY));
}
export function daysBetween(a: string, b: string): number {
  return Math.round((parseDate(b).getTime() - parseDate(a).getTime()) / MS_DAY);
}
export function eachDay(start: string, end: string): string[] {
  const out: string[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) out.push(d);
  return out;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function fmtDay(s: string): string {
  const d = parseDate(s);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}
export function fmtDayYear(s: string): string {
  return `${fmtDay(s)}, ${parseDate(s).getUTCFullYear()}`;
}
export function fmtRange(r: { start: string; end: string }): string {
  if (r.start === r.end) return fmtDayYear(r.start);
  const a = parseDate(r.start), b = parseDate(r.end);
  if (a.getUTCFullYear() === b.getUTCFullYear()) {
    return `${MONTHS[a.getUTCMonth()]} ${a.getUTCDate()} – ${MONTHS[b.getUTCMonth()]} ${b.getUTCDate()}, ${b.getUTCFullYear()}`;
  }
  return `${fmtDayYear(r.start)} – ${fmtDayYear(r.end)}`;
}

export const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const dowOf = (s: string) => parseDate(s).getUTCDay();
