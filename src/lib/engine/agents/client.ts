// Anthropic client for the agent brain. Single shared instance; model + key
// come from config.ts so the rest of the engine never touches process.env.

import Anthropic from "@anthropic-ai/sdk";
import { config, requireAnthropic } from "../config";

let client: Anthropic | null = null;

export function anthropic(): Anthropic {
  if (client) return client;
  const { apiKey } = requireAnthropic();
  client = new Anthropic({ apiKey });
  return client;
}

export const MODEL = config.anthropic.model; // claude-opus-4-8
export const MAX_TOKENS = config.anthropic.maxTokens;
