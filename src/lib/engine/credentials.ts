// Resolve a company's integration credentials (D27). Reads the encrypted per-tenant
// row from engine_account_credentials; while migrating (config.creds.envFallback)
// it falls back to the global env config when a company has no row yet — so the
// original single account keeps running off env until the cutover. Server-only.

import { db } from "./db";
import { config } from "./config";
import { decryptJson, type Encrypted } from "./crypto";

async function rowSecret(accountId: string, platform: string): Promise<Record<string, unknown> | null> {
  const { data } = await db()
    .from("engine_account_credentials")
    .select("secret")
    .eq("account_id", accountId)
    .eq("platform", platform)
    .maybeSingle();
  if (!data?.secret) return null;
  return decryptJson<Record<string, unknown>>(data.secret as Encrypted);
}

export interface GoogleCreds { developerToken: string; clientId: string; clientSecret: string; refreshToken: string; loginCustomerId: string; apiVersion: string }
export interface MetaCreds { accessToken: string; apiVersion: string }
export interface ShopifyCreds { storeDomain: string; adminToken: string; apiVersion: string }

/** Google: the OAuth APP creds (client id/secret/dev token) are GLOBAL — it's your
 *  app — so only the refresh token + login-customer-id are per-company. */
export async function googleCreds(accountId: string): Promise<GoogleCreds> {
  const g = config.google;
  const s = await rowSecret(accountId, "google");
  if (s) {
    return {
      developerToken: g.developerToken, clientId: g.clientId, clientSecret: g.clientSecret, apiVersion: g.apiVersion,
      refreshToken: String(s.refresh_token ?? ""),
      loginCustomerId: String(s.login_customer_id ?? g.loginCustomerId ?? ""),
    };
  }
  if (config.creds.envFallback) return { ...g };
  throw new Error(`Google not connected for account ${accountId}.`);
}

export async function metaCreds(accountId: string): Promise<MetaCreds> {
  const s = await rowSecret(accountId, "meta");
  if (s) return { accessToken: String(s.system_user_token ?? s.access_token ?? ""), apiVersion: config.meta.apiVersion };
  if (config.creds.envFallback) return { ...config.meta };
  throw new Error(`Meta not connected for account ${accountId}.`);
}

/** Shopify is optional (not every brand has a store) — returns null when absent. */
export async function shopifyCreds(accountId: string): Promise<ShopifyCreds | null> {
  const s = await rowSecret(accountId, "shopify");
  if (s) {
    return {
      storeDomain: String(s.store_domain ?? "").replace(/^https?:\/\//, "").replace(/\/$/, ""),
      adminToken: String(s.admin_token ?? ""),
      apiVersion: config.shopify.apiVersion,
    };
  }
  if (config.creds.envFallback && config.shopify.storeDomain && config.shopify.adminToken) return { ...config.shopify };
  return null;
}
