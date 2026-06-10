// The agent loop. A manual (not auto-runner) loop on purpose: the governance
// gate is human-in-the-loop, so we need to own each turn — log tool calls,
// stop on budget, and never let the SDK auto-execute a mutation we haven't
// gated. Uses adaptive thinking + prompt caching per the claude-api guidance.

import Anthropic from "@anthropic-ai/sdk";
import { anthropic, MAX_TOKENS, MODEL } from "./client";
import { systemPromptFor } from "./roles";
import {
  dispatchTool,
  DispatchCtx,
  MUTATE_TOOL,
  READ_TOOLS,
  SUBMIT_AUDIT_TOOL,
} from "./tools";
import type { AgentName } from "../types";

export interface RunAgentInput {
  agent: AgentName;
  /** The kickoff instruction for this run (the task). */
  task: string;
  /** Tools beyond the always-available read tools + propose_mutation. */
  extraTools?: Anthropic.Tool[];
  ctx: DispatchCtx;
  /** Safety bound on agentic turns. */
  maxTurns?: number;
}

export interface RunAgentResult {
  finalText: string;
  inputTokens: number;
  outputTokens: number;
  turns: number;
}

export async function runAgent(input: RunAgentInput): Promise<RunAgentResult> {
  const client = anthropic();
  const tools: Anthropic.Tool[] = [...READ_TOOLS, MUTATE_TOOL, ...(input.extraTools ?? [])];
  const maxTurns = input.maxTurns ?? 16;

  // System prompt is stable across the run → cache it (and the tool list,
  // which renders before system) so multi-turn loops only pay the prefix once.
  const system: Anthropic.TextBlockParam[] = [
    { type: "text", text: systemPromptFor(input.agent), cache_control: { type: "ephemeral" } },
  ];

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: input.task },
  ];

  let inputTokens = 0;
  let outputTokens = 0;
  let finalText = "";
  let turns = 0;

  while (turns < maxTurns) {
    turns++;
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      thinking: { type: "adaptive" },
      system,
      tools,
      messages,
    });
    inputTokens += res.usage.input_tokens + (res.usage.cache_read_input_tokens ?? 0);
    outputTokens += res.usage.output_tokens;

    finalText = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    if (res.stop_reason !== "tool_use") break;

    // Preserve the full assistant turn (text + thinking + tool_use blocks).
    messages.push({ role: "assistant", content: res.content });

    const toolUses = res.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    );
    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const tu of toolUses) {
      let out: string;
      try {
        out = await dispatchTool(tu.name, tu.input as Record<string, unknown>, input.ctx);
      } catch (e) {
        out = JSON.stringify({ error: e instanceof Error ? e.message : String(e) });
      }
      results.push({ type: "tool_result", tool_use_id: tu.id, content: out });
    }
    messages.push({ role: "user", content: results });
  }

  return { finalText, inputTokens, outputTokens, turns };
}

export { SUBMIT_AUDIT_TOOL };
