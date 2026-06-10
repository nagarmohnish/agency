// High-level entrypoints the API routes (and scripts) call. Each wraps an
// agent run in an engine_runs row so token spend and outcome are recorded.

import { finishRun, startRun } from "./audit-log";
import { runAgent, SUBMIT_AUDIT_TOOL } from "./agents/orchestrator";
import { connectorFor, configuredPlatforms } from "./connectors";
import { getAccount } from "./db";
import type { EngineAccount } from "./types";

/** Step 1 of the loop: Scout audits the real account and produces the
 *  ranked opportunity map. Pure reads + one submit_audit — never spends. */
export async function runAudit(accountId: string): Promise<{ runId: string; summary: string }> {
  const account = await getAccount(accountId);
  const platforms = configuredPlatforms(account);
  if (platforms.length === 0) {
    throw new Error("Account has no Google or Meta identifiers configured — nothing to audit.");
  }

  const run = await startRun({ accountId, step: "audit", agent: "scout", model: undefined });
  try {
    const result = await runAgent({
      agent: "scout",
      task: `Audit the account "${account.name}". Configured platforms: ${platforms.join(", ")}. Read the campaigns and the last 30 days of metrics on each, then submit a ranked opportunity map with a health score.`,
      extraTools: [SUBMIT_AUDIT_TOOL],
      ctx: { account, agent: "scout", runId: run.id },
    });
    await finishRun(run.id, {
      status: "done",
      summary: result.finalText.slice(0, 2000),
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
    });
    return { runId: run.id, summary: result.finalText };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await finishRun(run.id, { status: "error", error: message });
    throw e;
  }
}

/** Cheap connectivity check used by /status and the ENGINE.md verify step. */
export async function verifyConnections(
  account: EngineAccount
): Promise<Record<string, { ok: boolean; detail: string }>> {
  const out: Record<string, { ok: boolean; detail: string }> = {};
  for (const platform of configuredPlatforms(account)) {
    out[platform] = await connectorFor(account, platform).ping();
  }
  return out;
}
