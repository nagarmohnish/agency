// Server-side Supabase client for the engine. Uses the SERVICE-ROLE key, which
// bypasses RLS — appropriate because the engine runs only on the server and the
// engine_* tables deny all anon/authenticated access. This is deliberately a
// DIFFERENT client from src/lib/supabase.ts (that one uses the public anon key
// for the browser lead forms).

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { requireSupabase } from "./config";
import type { EngineAccount } from "./types";

let client: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (client) return client;
  const { url, serviceRoleKey } = requireSupabase();
  client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

/** Load an account by id, or throw if it doesn't exist. */
export async function getAccount(accountId: string): Promise<EngineAccount> {
  const { data, error } = await db()
    .from("engine_accounts")
    .select("*")
    .eq("id", accountId)
    .single();
  if (error || !data) {
    throw new Error(`Account ${accountId} not found: ${error?.message ?? "no row"}`);
  }
  return data as EngineAccount;
}

/** Convenience for the single-brand v1: the most recently created account.
 *  Once we manage more than one brand, callers should pass an explicit id. */
export async function getDefaultAccount(): Promise<EngineAccount> {
  const { data, error } = await db()
    .from("engine_accounts")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Failed to load default account: ${error.message}`);
  if (!data) {
    throw new Error(
      "No engine account configured yet. Insert one into engine_accounts (see ENGINE.md)."
    );
  }
  return data as EngineAccount;
}
