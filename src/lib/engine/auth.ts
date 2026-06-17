// Guard for the /api/engine/* ops routes. Fail closed: if neither an admin
// token nor an operator allowlist is configured, every request is rejected.
//
// Two ways to authenticate, both via `Authorization: Bearer <…>`:
//   1. the static ENGINE_ADMIN_TOKEN (constant-time compare), or
//   2. a Supabase access token belonging to an allowlisted operator
//      (ENGINE_OPERATOR_EMAILS) — this is how Google/email SSO grants access.

import { timingSafeEqual } from "crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "./config";

/** Constant-time string compare — avoids leaking the token via response timing. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

// A throwaway Supabase client pointed at the *auth* (leads) project, used only
// to validate operator access tokens. No session persistence — one call per use.
let authClient: SupabaseClient | null = null;
function getAuthClient(): SupabaseClient | null {
  const { authUrl, authAnonKey } = config.operator;
  if (!authUrl || !authAnonKey) return null;
  if (!authClient) {
    authClient = createClient(authUrl, authAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return authClient;
}

/** True iff `token` is a valid Supabase access token for an allowlisted email. */
async function isOperatorToken(token: string): Promise<boolean> {
  const allow = config.operator.emails;
  if (!allow.length) return false;
  const sb = getAuthClient();
  if (!sb) return false;
  try {
    const { data, error } = await sb.auth.getUser(token);
    const email = data.user?.email?.toLowerCase();
    if (error || !email) return false;
    return allow.includes(email);
  } catch {
    return false;
  }
}

/** A multi-tenant principal (D27). Admin token => admin (all tenants); a valid,
 *  EMAIL-VERIFIED Supabase access token => that user's email (membership is then
 *  checked by resolveTenant — the allowlist is NOT the gate here). null = no/invalid auth. */
export type Principal = { kind: "admin" } | { kind: "user"; email: string };

export async function principal(req: Request): Promise<Principal | null> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  if (config.adminToken && safeEqual(token, config.adminToken)) return { kind: "admin" };
  const sb = getAuthClient();
  if (!sb) return null;
  try {
    const { data, error } = await sb.auth.getUser(token);
    const email = data.user?.email?.toLowerCase();
    // only honor a *verified* email so nobody claims an address they don't own
    const verified = !!(data.user?.email_confirmed_at || (data.user as { confirmed_at?: string } | null)?.confirmed_at);
    if (error || !email || !verified) return null;
    return { kind: "user", email };
  } catch {
    return null;
  }
}

export async function authorize(
  req: Request,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const adminToken = config.adminToken;
  const hasOperatorGate = config.operator.emails.length > 0;
  // Fail closed: nothing configured → no one gets in.
  if (!adminToken && !hasOperatorGate) {
    return { ok: false, status: 503, error: "Engine auth not configured (set ENGINE_ADMIN_TOKEN or ENGINE_OPERATOR_EMAILS)." };
  }

  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return { ok: false, status: 401, error: "Unauthorized." };

  // 1. Static admin token (cheap, constant-time) — try first.
  if (adminToken && safeEqual(token, adminToken)) return { ok: true };
  // 2. Operator SSO — validate the Supabase access token + allowlist.
  if (await isOperatorToken(token)) return { ok: true };

  return { ok: false, status: 401, error: "Unauthorized." };
}
