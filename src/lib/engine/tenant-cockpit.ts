// Honest, account-scoped cockpit data for the client-facing tenant dashboard
// (<slug>.roilabs.in). UNLIKE the operator cockpit (cockpit-data.ts), this NEVER
// returns modeled/estimated numbers: a source that isn't genuinely connected (or
// a window the platform can't return) comes back as null, and the UI shows an
// "awaiting connection" card instead of a fabricated value. "Don't add data that
// is not present" (D29). Server-only — uses the service-role db().

import { getAccount } from "./db";
import { getCockpitData } from "./cockpit-data";
import { recentRuns, listPendingApprovals, recentActions } from "./audit-log";
import type { EngineAction, EngineRun } from "./types";

// Google Ads API returns at most ~30 days, so 90D would require extrapolation
// (a fabrication). The tenant view is restricted to fully-live windows.
export type TenantRangeKey = "7D" | "28D";

export interface TenantStore { revenueCents: number; orders: number; aovCents: number; daily: { date: string; revenueCents: number }[] }
export interface TenantGoogle { spendCents: number; installs: number; cpiCents: number; impressions: number; clicks: number; daily: { date: string; spendCents: number }[] }
export interface TenantRange {
  days: number;
  store: TenantStore | null;       // null until Shopify is connected
  google: TenantGoogle | null;     // null until Google Ads is connected
  blendedMer: number | null;       // store revenue ÷ live ad spend — only when both are live
}

export interface OpsRun { id: string; step: EngineRun["step"]; status: EngineRun["status"]; summary: string | null; startedAt: string; finishedAt: string | null }
export interface OpsAction { id: string; agent: string; kind: string; summary: string; status: string; requiresApproval: boolean; estimatedSpendCents: number; createdAt: string }

export interface TenantCockpit {
  generatedAt: string;
  accountName: string;
  currency: string;
  connections: { google: boolean; meta: boolean; shopify: boolean; subscriptions: boolean };
  ranges: Record<TenantRangeKey, TenantRange>;
  ops: { runs: OpsRun[]; approvals: OpsAction[]; activity: OpsAction[] };
}

const trimRun = (r: EngineRun): OpsRun => ({ id: r.id, step: r.step, status: r.status, summary: r.summary, startedAt: r.started_at, finishedAt: r.finished_at });
const trimAction = (a: EngineAction): OpsAction => ({ id: a.id, agent: a.agent, kind: a.kind, summary: a.summary, status: a.status, requiresApproval: a.requires_approval, estimatedSpendCents: a.estimated_spend_cents, createdAt: a.created_at });

/** Build the honest cockpit for one account. Resolves caller permission is the
 *  CALLER's job (the route does principal→resolveTenant); this just assembles. */
export async function getTenantCockpit(accountId: string): Promise<TenantCockpit> {
  const account = await getAccount(accountId);

  // Pull the operator assembler (it handles per-account credentials + windows),
  // then keep ONLY the live-flagged fields. The modeled meta/subscriptions and
  // the extrapolated 90D never leave this function.
  const cockpit = await getCockpitData(accountId).catch(() => null);

  const [runs, approvals, activity] = await Promise.all([
    recentRuns(accountId).catch(() => [] as EngineRun[]),
    listPendingApprovals(accountId).catch(() => [] as EngineAction[]),
    recentActions(accountId, 30).catch(() => [] as EngineAction[]),
  ]);

  const range = (key: TenantRangeKey): TenantRange => {
    const r = cockpit?.ranges?.[key];
    const days = key === "7D" ? 7 : 28;
    if (!r) return { days, store: null, google: null, blendedMer: null };
    const store: TenantStore | null = r.store.flag === "live"
      ? { revenueCents: r.store.revenueCents, orders: r.store.orders, aovCents: r.store.aovCents, daily: r.store.daily }
      : null;
    const google: TenantGoogle | null = r.google.flag === "live"
      ? { spendCents: r.google.spendCents, installs: r.google.installs, cpiCents: r.google.cpiCents, impressions: r.google.impressions, clicks: r.google.clicks, daily: r.google.daily }
      : null;
    const blendedMer = store && google && google.spendCents > 0 ? store.revenueCents / google.spendCents : null;
    return { days: r.days, store, google, blendedMer };
  };

  return {
    generatedAt: new Date().toISOString(),
    accountName: account.name,
    currency: cockpit?.currency ?? account.default_currency ?? "INR",
    connections: cockpit?.connections ?? { google: false, meta: false, shopify: false, subscriptions: false },
    ranges: { "7D": range("7D"), "28D": range("28D") },
    ops: { runs: runs.map(trimRun), approvals: approvals.map(trimAction), activity: activity.map(trimAction) },
  };
}
