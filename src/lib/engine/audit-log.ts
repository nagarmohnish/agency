// The audit log is the heart of the product's credibility: every read,
// recommendation, and mutation the engine performs is recorded here BEFORE it
// touches a platform. The case study is generated directly from these rows, so
// there is no fabricated story — only what actually happened.

import { db } from "./db";
import type { ActionStatus, AgentName, EngineAction, EngineRun, Platform } from "./types";

export interface LogActionInput {
  accountId: string;
  runId?: string | null;
  agent: AgentName;
  kind: string;
  platform?: Platform | null;
  targetExternalId?: string | null;
  summary: string;
  rationale?: string | null;
  payload?: Record<string, unknown>;
  estimatedSpendCents?: number;
  dryRun?: boolean;
  requiresApproval?: boolean;
  status?: ActionStatus;
}

/** Insert one action row and return it. */
export async function logAction(input: LogActionInput): Promise<EngineAction> {
  const { data, error } = await db()
    .from("engine_actions")
    .insert({
      account_id: input.accountId,
      run_id: input.runId ?? null,
      agent: input.agent,
      kind: input.kind,
      platform: input.platform ?? null,
      target_external_id: input.targetExternalId ?? null,
      summary: input.summary,
      rationale: input.rationale ?? null,
      payload: input.payload ?? {},
      estimated_spend_cents: input.estimatedSpendCents ?? 0,
      dry_run: input.dryRun ?? false,
      requires_approval: input.requiresApproval ?? false,
      status: input.status ?? "proposed",
    })
    .select("*")
    .single();
  if (error) throw new Error(`Failed to log action: ${error.message}`);
  return data as EngineAction;
}

/** Update an action's outcome after it executes (or fails). */
export async function finalizeAction(
  id: string,
  patch: { status: ActionStatus; result?: Record<string, unknown> | null; error?: string | null }
): Promise<void> {
  const { error } = await db()
    .from("engine_actions")
    .update({
      status: patch.status,
      result: patch.result ?? null,
      error: patch.error ?? null,
    })
    .eq("id", id);
  if (error) throw new Error(`Failed to finalize action ${id}: ${error.message}`);
}

/** Mark a proposed action approved (or rejected) by a human. */
export async function decideAction(
  id: string,
  decision: "approved" | "rejected",
  approvedBy: string
): Promise<EngineAction> {
  const { data, error } = await db()
    .from("engine_actions")
    .update({
      status: decision,
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "proposed") // only undecided actions can be decided
    .select("*")
    .single();
  if (error) throw new Error(`Failed to ${decision} action ${id}: ${error.message}`);
  return data as EngineAction;
}

export async function listPendingApprovals(accountId: string): Promise<EngineAction[]> {
  const { data, error } = await db()
    .from("engine_actions")
    .select("*")
    .eq("account_id", accountId)
    .eq("status", "proposed")
    .eq("requires_approval", true)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Failed to list approvals: ${error.message}`);
  return (data ?? []) as EngineAction[];
}

// --- runs -------------------------------------------------------------

export async function startRun(input: {
  accountId: string;
  step: EngineRun["step"];
  agent?: AgentName;
  model?: string;
}): Promise<EngineRun> {
  const { data, error } = await db()
    .from("engine_runs")
    .insert({
      account_id: input.accountId,
      step: input.step,
      agent: input.agent ?? null,
      model: input.model ?? null,
      status: "running",
    })
    .select("*")
    .single();
  if (error) throw new Error(`Failed to start run: ${error.message}`);
  return data as EngineRun;
}

export async function finishRun(
  id: string,
  patch: {
    status: "done" | "error";
    summary?: string;
    inputTokens?: number;
    outputTokens?: number;
    error?: string;
  }
): Promise<void> {
  const { error } = await db()
    .from("engine_runs")
    .update({
      status: patch.status,
      summary: patch.summary ?? null,
      input_tokens: patch.inputTokens ?? 0,
      output_tokens: patch.outputTokens ?? 0,
      error: patch.error ?? null,
      finished_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(`Failed to finish run ${id}: ${error.message}`);
}

/** Recent runs for an account, newest first. */
export async function recentRuns(accountId: string, limit = 10): Promise<EngineRun[]> {
  const { data, error } = await db()
    .from("engine_runs")
    .select("*")
    .eq("account_id", accountId)
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Failed to load runs: ${error.message}`);
  return (data ?? []) as EngineRun[];
}

/** Recent actions for an account — the raw material for a case study. */
export async function recentActions(accountId: string, limit = 200): Promise<EngineAction[]> {
  const { data, error } = await db()
    .from("engine_actions")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Failed to load actions: ${error.message}`);
  return (data ?? []) as EngineAction[];
}
