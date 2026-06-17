// Tenant resolution + membership gate (D27). The slug (<slug>.roilabs.in) is UX,
// NOT a trust boundary — every resolve joins through engine_account_users, so a
// user only ever resolves a company they're a member of. Unknown slug and
// not-a-member are indistinguishable to the caller (no enumeration / IDOR).

import { db } from "./db";
import type { EngineAccount } from "./types";

export type Role = "admin" | "operator" | "viewer";
export interface ResolvedTenant { account: EngineAccount; role: Role }
export interface TenantSummary { slug: string; name: string; role: Role }

const norm = (email: string) => email.trim().toLowerCase();

/** The account for `slug` IF `email` is a member of it — else null.
 *  (Used by the tenant SSR layout gate and every /api/engine/* route.) */
export async function resolveTenant(slug: string, email: string): Promise<ResolvedTenant | null> {
  const { data, error } = await db()
    .from("engine_accounts")
    .select("*, engine_account_users!inner(role, email)")
    .eq("slug", slug)
    .eq("engine_account_users.email", norm(email))
    .maybeSingle();
  if (error || !data) return null;
  const row = data as Record<string, unknown> & { engine_account_users?: { role: Role }[] };
  const role = row.engine_account_users?.[0]?.role ?? "viewer";
  delete row.engine_account_users;
  return { account: row as unknown as EngineAccount, role };
}

/** Admin principal (static admin token): full access to any tenant by slug,
 *  no membership row required. */
export async function adminResolveTenant(slug: string): Promise<ResolvedTenant | null> {
  const { data, error } = await db()
    .from("engine_accounts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return { account: data as unknown as EngineAccount, role: "admin" };
}

/** The roster for an account (email + role) — for the cockpit team list. */
export async function listMembers(accountId: string): Promise<{ email: string; role: Role }[]> {
  const { data, error } = await db()
    .from("engine_account_users")
    .select("email, role")
    .eq("account_id", accountId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data as { email: string; role: Role }[];
}

/** Every company this email may access — for the picker / multi-company users. */
export async function tenantsForUser(email: string): Promise<TenantSummary[]> {
  const { data, error } = await db()
    .from("engine_account_users")
    .select("role, engine_accounts!inner(slug, name)")
    .eq("email", norm(email));
  if (error || !data) return [];
  return (data as unknown as { role: Role; engine_accounts: { slug: string | null; name: string } }[])
    .filter((r) => r.engine_accounts?.slug)
    .map((r) => ({ slug: r.engine_accounts.slug as string, name: r.engine_accounts.name, role: r.role }));
}
