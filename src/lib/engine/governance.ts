// The governance gate. This is the product's safety moat and the reason a
// client can hand us a live account: NOTHING reaches a platform without passing
// through here, and every decision is written to the audit log first.
//
// Four escalating autonomy levels (set per account):
//   read_only      — no mutations at all. Everything is proposed + skipped.
//   paused_writes  — structure may be built, but anything that would serve is
//                    forced PAUSED. This is the "$0, build everything" mode.
//   live_approval  — spend-increasing changes need a human; spend-DEcreasing
//                    changes (pausing a loser) auto-execute.
//   live_auto      — executes within the spend cap; exceeding it needs approval.
//
// Two cross-cutting kill-switches override autonomy:
//   ENGINE_DRY_RUN=true (default) — simulate everything, touch no platform.
//   spend cap = min(account cap, global cap) — a change that would push today's
//                    committed daily spend over the cap is blocked for approval.

import { config } from "./config";
import { db } from "./db";
import { finalizeAction, logAction } from "./audit-log";
import type { EngineAccount, EngineAction, MutationRequest } from "./types";

export type GateOutcome = "executed" | "pending_approval" | "skipped" | "simulated" | "failed";

export interface GateResult {
  outcome: GateOutcome;
  action: EngineAction;
  reason: string;
}

/** Perform the real platform mutation. The gate calls this only when a change
 *  is cleared to execute. `forcePaused` tells the connector to create/leave the
 *  entity paused (paused_writes mode). Returns the platform's response. */
export type PerformFn = (
  req: MutationRequest,
  opts: { forcePaused: boolean }
) => Promise<Record<string, unknown>>;

interface GateContext {
  runId?: string | null;
  agent: EngineAction["agent"];
  rationale?: string;
}

/** Sum of daily spend already committed today by executed, live (non-dry-run)
 *  spend-increasing actions. Used to enforce the rolling daily cap. */
async function committedSpendTodayCents(accountId: string): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { data, error } = await db()
    .from("engine_actions")
    .select("estimated_spend_cents")
    .eq("account_id", accountId)
    .eq("status", "executed")
    .eq("dry_run", false)
    .gt("estimated_spend_cents", 0)
    .gte("created_at", startOfDay.toISOString());
  if (error) throw new Error(`Failed to read committed spend: ${error.message}`);
  return (data ?? []).reduce((s, r) => s + (r.estimated_spend_cents as number), 0);
}

function effectiveCapCents(account: EngineAccount): number {
  const global = config.safety.globalDailySpendCapCents;
  // A global cap of 0 means "block all live spend" — it wins.
  if (global <= 0) return 0;
  return Math.min(account.daily_spend_cap_cents, global);
}

/**
 * SERVER-SIDE truth for "how much daily spend could this mutation authorize?".
 * We do NOT trust the agent's self-reported estimatedSpendCents for the cap —
 * a buggy or prompt-injected agent could understate it while the real budget
 * sits in the payload. We derive it from the payload for known kinds and take
 * the larger of (agent estimate, derived). `unknownBudget` forces approval when
 * a change turns spend on but we can't see the amount cheaply (e.g. enabling a
 * campaign whose budget we'd have to look up).
 */
function assessSpendCents(req: MutationRequest): { cents: number; unknownBudget: boolean } {
  const n = (v: unknown) => {
    const x = Number(v);
    return Number.isFinite(x) && x > 0 ? Math.round(x) : 0;
  };
  const agent = n(req.estimatedSpendCents);
  const p = req.payload || {};
  const statusTarget = String(p.status ?? "").toUpperCase();

  switch (req.kind) {
    case "update_campaign_budget":
      // The new daily budget IS the spend it authorizes per day.
      return { cents: Math.max(agent, n(p.dailyAmountCents)), unknownBudget: false };
    case "create_campaign":
      return { cents: Math.max(agent, n(p.dailyAmountCents ?? p.dailyBudgetCents)), unknownBudget: false };
    case "pause_campaign":
      return { cents: 0, unknownBudget: false }; // spend-decreasing
    case "update_campaign_status":
      // Pausing/removing is safe; enabling turns spend on at an amount we don't
      // have here — force approval rather than auto-clear under the cap.
      if (statusTarget === "ENABLED" || statusTarget === "ACTIVE") return { cents: agent, unknownBudget: true };
      return { cents: 0, unknownBudget: false };
    default:
      // Unknown kind: trust nothing — treat the agent's number as a floor and
      // require approval if it claims any spend.
      return { cents: agent, unknownBudget: agent > 0 };
  }
}

/**
 * Run a mutation through the gate. Logs the proposed action, decides its fate,
 * executes (or simulates / defers) it, and finalizes the audit row.
 */
export async function gatedMutate(
  account: EngineAccount,
  req: MutationRequest,
  perform: PerformFn,
  ctx: GateContext
): Promise<GateResult> {
  const dryRun = config.safety.dryRun;
  // Trust the payload, not the agent: derive the real spend impact server-side.
  const assessed = assessSpendCents(req);
  const spendCents = assessed.cents;
  const spendIncreasing = spendCents > 0 || assessed.unknownBudget;

  // 1. Always record the proposal up front, stamped with the ASSESSED spend
  //    (not the agent's claim) so the cap math and audit log are trustworthy.
  const action = await logAction({
    accountId: account.id,
    runId: ctx.runId,
    agent: ctx.agent,
    kind: req.kind,
    platform: req.platform,
    summary: req.summary,
    rationale: ctx.rationale ?? null,
    payload: req.payload,
    estimatedSpendCents: spendCents,
    dryRun,
    status: "proposed",
  });

  // 2. Master kill-switch: dry run simulates everything.
  if (dryRun) {
    await finalizeAction(action.id, {
      status: "skipped",
      result: { simulated: true },
    });
    return { outcome: "simulated", action, reason: "ENGINE_DRY_RUN is on — simulated only." };
  }

  // 3. read_only blocks every mutation.
  if (account.autonomy_level === "read_only") {
    await finalizeAction(action.id, { status: "skipped" });
    return { outcome: "skipped", action, reason: "Account is read_only." };
  }

  // 4. paused_writes: build the structure, but force it paused so $0 serves.
  if (account.autonomy_level === "paused_writes") {
    return runPerform(action.id, req, perform, { forcePaused: true }, "Built paused (paused_writes mode).");
  }

  // 5. Spend-neutral/decreasing change (pause a loser) — always safe.
  if (!spendIncreasing) {
    return runPerform(action.id, req, perform, { forcePaused: false }, "Spend-neutral/decreasing — auto-executed.");
  }

  // 6. Hard per-mutation ceiling: a single change above it is REJECTED outright,
  //    not even approvable. Backstop against a fat-finger / injected budget.
  const ceiling = config.safety.maxSingleMutationSpendCents;
  if (ceiling > 0 && spendCents > ceiling) {
    await finalizeAction(action.id, {
      status: "rejected",
      error: `Exceeds per-mutation ceiling (${spendCents}¢ > ${ceiling}¢).`,
    });
    return { outcome: "skipped", action, reason: `Rejected — exceeds per-mutation ceiling (${spendCents}¢ > ${ceiling}¢).` };
  }

  // 7. Enforce the rolling daily cap (using the ASSESSED spend, not the agent's).
  const cap = effectiveCapCents(account);
  const committed = await committedSpendTodayCents(account.id);
  const wouldExceed = committed + spendCents > cap;

  if (assessed.unknownBudget || cap <= 0 || wouldExceed) {
    await markPendingApproval(action.id);
    const why = assessed.unknownBudget
      ? "Enables spend at an amount the gate can't verify here."
      : cap <= 0
        ? "No spend cap set (or global cap is 0)."
        : `Would exceed daily cap (${committed + spendCents}¢ > ${cap}¢).`;
    return { outcome: "pending_approval", action, reason: `Needs approval — ${why}` };
  }

  if (account.autonomy_level === "live_approval") {
    await markPendingApproval(action.id);
    return { outcome: "pending_approval", action, reason: "live_approval — awaiting human sign-off." };
  }

  // live_auto, within cap.
  return runPerform(action.id, req, perform, { forcePaused: false }, "Within cap — auto-executed.");
}

async function markPendingApproval(actionId: string): Promise<void> {
  const { error } = await db()
    .from("engine_actions")
    .update({ requires_approval: true })
    .eq("id", actionId);
  if (error) throw new Error(`Failed to flag approval on ${actionId}: ${error.message}`);
}

async function runPerform(
  actionId: string,
  req: MutationRequest,
  perform: PerformFn,
  opts: { forcePaused: boolean },
  reason: string
): Promise<GateResult> {
  try {
    const result = await perform(req, opts);
    await finalizeAction(actionId, { status: "executed", result });
    const { data } = await db().from("engine_actions").select("*").eq("id", actionId).single();
    return { outcome: "executed", action: data as EngineAction, reason };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await finalizeAction(actionId, { status: "failed", error: message });
    const { data } = await db().from("engine_actions").select("*").eq("id", actionId).single();
    return { outcome: "failed", action: data as EngineAction, reason: message };
  }
}

/**
 * Execute an action a human approved out-of-band (via the approvals route).
 * Re-runs the same perform path now that sign-off exists.
 */
export async function executeApproved(
  account: EngineAccount,
  action: EngineAction,
  perform: PerformFn
): Promise<GateResult> {
  // The dry-run kill switch overrides a human approval too. (Normally dry-run
  // means nothing reaches the approval queue, but if it was toggled on after an
  // action was queued, approving it must still NOT touch the platform.)
  if (config.safety.dryRun) {
    await finalizeAction(action.id, { status: "skipped", result: { simulated: true } });
    return { outcome: "simulated", action, reason: "ENGINE_DRY_RUN is on — approval simulated, not executed." };
  }
  // Re-apply the hard ceiling at execution time, in case it tightened since the
  // action was proposed.
  const ceiling = config.safety.maxSingleMutationSpendCents;
  if (ceiling > 0 && action.estimated_spend_cents > ceiling) {
    await finalizeAction(action.id, {
      status: "rejected",
      error: `Exceeds per-mutation ceiling at execution (${action.estimated_spend_cents}¢ > ${ceiling}¢).`,
    });
    return { outcome: "skipped", action, reason: "Rejected — exceeds per-mutation ceiling." };
  }
  const forcePaused = account.autonomy_level === "paused_writes";
  return runPerform(
    action.id,
    {
      platform: action.platform!,
      kind: action.kind,
      estimatedSpendCents: action.estimated_spend_cents,
      summary: action.summary,
      payload: action.payload,
    },
    perform,
    { forcePaused },
    `Executed after approval by ${action.approved_by ?? "unknown"}.`
  );
}
