// Tool surface for the agents, plus the dispatcher that executes a tool call.
// Reads hit the connectors directly. The one mutating tool (propose_mutation)
// is funneled through the governance gate — the agents have no other way to
// touch a platform, which is what makes the whole engine safe to point at a
// real account.

import Anthropic from "@anthropic-ai/sdk";
import { connectorFor } from "../connectors";
import { gatedMutate } from "../governance";
import { logAction } from "../audit-log";
import { db } from "../db";
import type { AgentName, EngineAccount, Opportunity, Platform } from "../types";

export const READ_TOOLS: Anthropic.Tool[] = [
  {
    name: "list_campaigns",
    description: "List campaigns on the account for a platform. Returns id, name, status, objective, daily budget.",
    input_schema: {
      type: "object",
      properties: { platform: { type: "string", enum: ["google", "meta"] } },
      required: ["platform"],
      additionalProperties: false,
    },
  },
  {
    name: "get_metrics",
    description: "Daily performance per campaign for the last N days (7, 14, or 30): impressions, clicks, spend, conversions, conversion value.",
    input_schema: {
      type: "object",
      properties: {
        platform: { type: "string", enum: ["google", "meta"] },
        days: { type: "integer", enum: [7, 14, 30] },
      },
      required: ["platform", "days"],
      additionalProperties: false,
    },
  },
];

export const MUTATE_TOOL: Anthropic.Tool = {
  name: "propose_mutation",
  description:
    "Propose a change to a platform. ALWAYS routes through the governance gate (spend cap, approval, dry-run) — it will NOT necessarily execute. Use an honest estimatedSpendCents: the additional daily spend this change could authorize (0 for pauses/decreases/reads).",
  input_schema: {
    type: "object",
    properties: {
      platform: { type: "string", enum: ["google", "meta"] },
      kind: {
        type: "string",
        description: "e.g. pause_campaign, update_campaign_status, update_campaign_budget",
      },
      estimatedSpendCents: { type: "integer" },
      summary: { type: "string" },
      rationale: { type: "string" },
      payload: { type: "object", additionalProperties: true },
    },
    required: ["platform", "kind", "estimatedSpendCents", "summary", "rationale", "payload"],
    additionalProperties: false,
  },
};

export const SUBMIT_AUDIT_TOOL: Anthropic.Tool = {
  name: "submit_audit",
  description: "Submit the finished opportunity map for Step 1 (Audit). Call once when your analysis is complete.",
  input_schema: {
    type: "object",
    properties: {
      score: { type: "integer", description: "Account health 0-100." },
      summary: { type: "string" },
      opportunities: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            detail: { type: "string" },
            impact: { type: "string", enum: ["high", "medium", "low"] },
            effort: { type: "string", enum: ["high", "medium", "low"] },
            owner: { type: "string", enum: ["scout", "forge", "pilot", "frame", "signal"] },
          },
          required: ["title", "detail", "impact", "effort", "owner"],
          additionalProperties: false,
        },
      },
    },
    required: ["score", "summary", "opportunities"],
    additionalProperties: false,
  },
};

export interface DispatchCtx {
  account: EngineAccount;
  agent: AgentName;
  runId: string | null;
  /** Set when submit_audit is called, so the runner can persist it. */
  onAudit?: (audit: { score: number; summary: string; opportunities: Opportunity[] }) => Promise<void>;
}

/** Execute one tool call and return the string the model sees as the result. */
export async function dispatchTool(
  name: string,
  input: Record<string, unknown>,
  ctx: DispatchCtx
): Promise<string> {
  const { account } = ctx;
  switch (name) {
    case "list_campaigns": {
      const platform = input.platform as Platform;
      const rows = await connectorFor(account, platform).listCampaigns();
      // Log the fetch so the audit trail shows WHAT data went into the analysis.
      await logAction({
        accountId: account.id,
        runId: ctx.runId,
        agent: ctx.agent,
        kind: "read_campaigns",
        platform,
        summary: `Fetched ${rows.length} campaigns from ${platform}.`,
        payload: { count: rows.length },
        status: "executed",
      });
      return JSON.stringify(rows);
    }
    case "get_metrics": {
      const platform = input.platform as Platform;
      const days = Number(input.days) || 30;
      const rows = await connectorFor(account, platform).getMetrics(days);
      await logAction({
        accountId: account.id,
        runId: ctx.runId,
        agent: ctx.agent,
        kind: "read_metrics",
        platform,
        summary: `Fetched ${days}-day metrics from ${platform} (${rows.length} rows).`,
        payload: { days, rows: rows.length },
        status: "executed",
      });
      return JSON.stringify(rows);
    }
    case "propose_mutation": {
      const platform = input.platform as Platform;
      const result = await gatedMutate(
        account,
        {
          platform,
          kind: String(input.kind),
          estimatedSpendCents: Number(input.estimatedSpendCents) || 0,
          summary: String(input.summary),
          payload: (input.payload as Record<string, unknown>) ?? {},
        },
        (req, opts) => connectorFor(account, platform).mutate(req, opts),
        { runId: ctx.runId, agent: ctx.agent, rationale: String(input.rationale ?? "") }
      );
      return JSON.stringify({ outcome: result.outcome, reason: result.reason, actionId: result.action.id });
    }
    case "submit_audit": {
      const audit = {
        score: Number(input.score),
        summary: String(input.summary),
        opportunities: (input.opportunities as Opportunity[]) ?? [],
      };
      if (ctx.onAudit) await ctx.onAudit(audit);
      // Also persist the audit run row here so it exists regardless of caller.
      await db().from("engine_audit_runs").insert({
        account_id: account.id,
        run_id: ctx.runId,
        summary: audit.summary,
        score: audit.score,
        opportunities: audit.opportunities,
      });
      await logAction({
        accountId: account.id,
        runId: ctx.runId,
        agent: ctx.agent,
        kind: "submit_audit",
        summary: `Audit submitted — health ${audit.score}/100, ${audit.opportunities.length} opportunities.`,
        status: "executed",
      });
      return JSON.stringify({ ok: true, recorded: audit.opportunities.length });
    }
    default:
      return JSON.stringify({ error: `unknown tool ${name}` });
  }
}
