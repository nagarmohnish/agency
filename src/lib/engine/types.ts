// Shared domain types for the engine. These mirror the columns in the
// 20260610130000_create_engine.sql migration. Kept hand-written (not generated)
// so the engine has no codegen step; if you add a column, add it here.

export type Platform = "google" | "meta";
export type AgentName = "scout" | "forge" | "pilot" | "frame" | "signal" | "orchestrator";
export type Autonomy = "read_only" | "paused_writes" | "live_approval" | "live_auto";

export type ActionStatus =
  | "proposed"
  | "approved"
  | "rejected"
  | "executed"
  | "failed"
  | "skipped";

export interface EngineAccount {
  id: string;
  name: string;
  google_customer_id: string | null;
  google_login_customer_id: string | null;
  meta_ad_account_id: string | null;
  meta_business_id: string | null;
  default_currency: string;
  daily_spend_cap_cents: number;
  autonomy_level: Autonomy;
  status: "active" | "paused" | "archived";
  created_at: string;
  updated_at: string;
}

export interface EngineAction {
  id: string;
  account_id: string;
  run_id: string | null;
  agent: AgentName;
  kind: string;
  platform: Platform | null;
  target_external_id: string | null;
  summary: string;
  rationale: string | null;
  payload: Record<string, unknown>;
  result: Record<string, unknown> | null;
  estimated_spend_cents: number;
  dry_run: boolean;
  requires_approval: boolean;
  status: ActionStatus;
  approved_by: string | null;
  approved_at: string | null;
  error: string | null;
  created_at: string;
}

export interface EngineRun {
  id: string;
  account_id: string;
  step: "audit" | "creative" | "launch" | "optimize" | "custom";
  agent: AgentName | null;
  model: string | null;
  status: "running" | "done" | "error";
  summary: string | null;
  input_tokens: number;
  output_tokens: number;
  error: string | null;
  started_at: string;
  finished_at: string | null;
}

export interface Opportunity {
  title: string;
  detail: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  /** Which loop step / agent owns the fix. */
  owner: AgentName;
}

export interface AuditRun {
  id: string;
  account_id: string;
  run_id: string | null;
  summary: string | null;
  score: number | null;
  opportunities: Opportunity[];
  raw: Record<string, unknown>;
  created_at: string;
}

// --- Connector-facing shapes (platform-agnostic) ----------------------

export interface CampaignSummary {
  externalId: string;
  name: string;
  status: string;
  objective?: string;
  dailyBudgetCents?: number;
}

export interface MetricRow {
  entityType: "account" | "campaign" | "adset" | "ad";
  externalId: string;
  date: string; // YYYY-MM-DD
  impressions: number;
  clicks: number;
  spendCents: number;
  conversions: number;
  conversionValueCents: number;
}

// --- Segment breakdowns (traffic source / gender / age) ---------------------

export type BreakdownDimension = "network" | "gender" | "age";

/** One campaign × segment row of performance. `label` is the human-readable
 *  segment (e.g. "Google Search", "Female", "25–34"). */
export interface BreakdownRow {
  dimension: BreakdownDimension;
  label: string;
  campaignId: string;
  campaignName: string;
  impressions: number;
  clicks: number;
  spendCents: number;
  conversions: number;
  conversionValueCents: number;
}

/** A platform mutation the engine wants to perform. The governance gate
 *  decides whether it executes, needs approval, or is simulated. */
export interface MutationRequest {
  platform: Platform;
  kind: string; // create_campaign | update_budget | pause_ad | ...
  /** Daily spend this change could newly authorize, in cents. Reads = 0. */
  estimatedSpendCents: number;
  summary: string;
  payload: Record<string, unknown>;
}
