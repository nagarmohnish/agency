// The platform-agnostic connector contract. Scout/Pilot/Signal talk to this,
// never to a platform SDK directly — so adding TikTok/LinkedIn later is one new
// file, and the agents don't change.
//
// Reads return plain data. Writes are NOT on this interface: every mutation
// goes through the governance gate (governance.ts), which calls a connector's
// `perform`-style methods only after clearing the change. Connectors therefore
// expose reads here and low-level mutators that the gate wraps.

import type { BreakdownRow, CampaignSummary, MetricRow, MutationRequest, Platform } from "../types";

export interface AdConnector {
  readonly platform: Platform;

  /** Cheap call that proves credentials + account access are wired correctly.
   *  Used by the /status route and ENGINE.md's "verify connection" step. */
  ping(): Promise<{ ok: boolean; detail: string }>;

  /** List campaigns on the account. */
  listCampaigns(): Promise<CampaignSummary[]>;

  /** Daily performance rows for the last `days` days across the account. */
  getMetrics(days: number): Promise<MetricRow[]>;

  /** Per-campaign performance split by traffic source (network), gender, and
   *  age over the last `days` days. Returns a flat list; the caller rolls up. */
  getBreakdowns(days: number): Promise<BreakdownRow[]>;

  /** Execute a single cleared mutation. The gate decides IF this runs and
   *  passes `forcePaused`; the connector decides HOW to call the platform.
   *  Throwing here marks the action failed in the audit log. */
  mutate(req: MutationRequest, opts: { forcePaused: boolean }): Promise<Record<string, unknown>>;
}
