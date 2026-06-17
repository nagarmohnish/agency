// Central place every credential and tunable the engine needs is read here.
// Nothing else in the engine reads process.env directly — so wiring up the
// real brand's accounts at the end is a single, well-documented step:
// fill these env vars (see ENGINE.md) and the whole engine comes online.
//
// IMPORTANT: these are SERVER-ONLY secrets. None are NEXT_PUBLIC_*; they must
// never reach the browser bundle. The engine only runs in API routes / scripts.

export type Autonomy = "read_only" | "paused_writes" | "live_approval" | "live_auto";

/** A missing-but-not-yet-needed credential reads as "" so modules can boot
 *  without it and fail loudly only when the credential is actually used. */
function env(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function envInt(name: string, fallback: number): number {
  const v = process.env[name]?.trim();
  if (!v) return fallback;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

export const config = {
  // --- Supabase (service role — bypasses RLS; never expose) -----------
  supabase: {
    url: env("SUPABASE_URL") || env("NEXT_PUBLIC_SUPABASE_URL"),
    serviceRoleKey: env("SUPABASE_SERVICE_ROLE_KEY"),
  },

  // --- Anthropic (the agent brain) ------------------------------------
  anthropic: {
    apiKey: env("ANTHROPIC_API_KEY"),
    // Opus for strategy/Scout; Sonnet is plenty for high-volume tool loops.
    model: env("ENGINE_MODEL") || "claude-opus-4-8",
    fastModel: env("ENGINE_FAST_MODEL") || "claude-sonnet-4-6",
    maxTokens: envInt("ENGINE_MAX_TOKENS", 8000),
  },

  // --- Google Ads API (REST; OAuth refresh-token flow) ----------------
  // Fill these LAST. See ENGINE.md "Connecting Google".
  google: {
    developerToken: env("GOOGLE_ADS_DEVELOPER_TOKEN"),
    clientId: env("GOOGLE_OAUTH_CLIENT_ID"),
    clientSecret: env("GOOGLE_OAUTH_CLIENT_SECRET"),
    refreshToken: env("GOOGLE_ADS_REFRESH_TOKEN"),
    // The MCC (manager) account id, digits only, no dashes.
    loginCustomerId: env("GOOGLE_ADS_LOGIN_CUSTOMER_ID"),
    apiVersion: env("GOOGLE_ADS_API_VERSION") || "v21",
  },

  // --- Meta Marketing API (Graph; system-user token) ------------------
  // Fill these LAST. See ENGINE.md "Connecting Meta".
  meta: {
    accessToken: env("META_SYSTEM_USER_TOKEN"),
    apiVersion: env("META_API_VERSION") || "v21.0",
  },

  // --- Shopify Admin API (revenue source of truth) --------------------
  // For ecommerce brands (e.g. AstroTime's store): real orders/revenue, used to
  // reconcile against platform-reported purchase value. Custom-app admin token.
  shopify: {
    // e.g. "theastrotime.myshopify.com" (protocol stripped automatically)
    storeDomain: env("SHOPIFY_STORE_DOMAIN").replace(/^https?:\/\//, "").replace(/\/$/, ""),
    adminToken: env("SHOPIFY_ADMIN_TOKEN"), // shpat_...
    apiVersion: env("SHOPIFY_API_VERSION") || "2025-10",
  },

  // --- Admin auth for the /api/engine/* ops routes --------------------
  // A static bearer token. These routes can move real money, so they are
  // never public — a missing token blocks all access (fail closed).
  adminToken: env("ENGINE_ADMIN_TOKEN"),

  // --- Operator SSO (Supabase Google/email → email allowlist) ---------
  // An allowlisted operator who signs in via Supabase (Google or email) gets
  // full cockpit access — their Supabase *access token* is validated as a
  // bearer here, as an alternative to the static adminToken. Access is gated by
  // which deployment carries `ENGINE_OPERATOR_EMAILS`: set it on the agency
  // project (roilabs.in) so operators get in there; leave it off engine.* so
  // that surface stays the locked "book a demo" teaser. Empty list = SSO grants
  // no access (the adminToken path is unaffected). See ENGINE.md.
  operator: {
    // The Supabase project that ISSUES the browser session — i.e. the same one
    // getSupabase()/NEXT_PUBLIC_SUPABASE_* point at (the leads project), NOT the
    // engine DB project in `supabase` above. Used only to validate the JWT.
    authUrl: env("NEXT_PUBLIC_SUPABASE_URL"),
    authAnonKey: env("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    emails: env("ENGINE_OPERATOR_EMAILS")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  },

  // --- Per-company integration credentials (D27 multi-tenant) ---------
  // Each company's Google/Meta/Shopify secrets live encrypted in
  // engine_account_credentials, not in env. `encKey` decrypts them.
  creds: {
    // 32-byte key (base64 or hex) for AES-256-GCM of engine_account_credentials.
    encKey: env("ENGINE_CRED_ENC_KEY"),
    // Migration switch: if a company has no credential row yet, fall back to the
    // global google/meta/shopify env above — so the original single account keeps
    // running off env until its creds are moved into the DB. Off in steady state.
    envFallback: env("ENGINE_CRED_ENV_FALLBACK") === "true",
  },

  // --- Engine-wide safety rails ---------------------------------------
  // These are the GLOBAL ceiling. Per-account caps live on the account row
  // and are enforced as min(account cap, global cap).
  safety: {
    // Hard global daily spend ceiling across everything, in cents. 0 = block
    // ALL live spend regardless of account settings. Default is 0 so that a
    // fresh deploy cannot spend a cent until someone deliberately raises it.
    globalDailySpendCapCents: envInt("ENGINE_GLOBAL_DAILY_SPEND_CAP_CENTS", 0),
    // When true (default), every mutating tool call is logged and simulated
    // but NOT sent to the platform. The master kill-switch.
    dryRun: env("ENGINE_DRY_RUN") !== "false",
    // Hard ceiling on the daily spend ANY single mutation may authorize, in
    // cents. A change above this is REJECTED outright (not even approvable) —
    // a backstop against a fat-fingered or prompt-injected budget. 0 = disabled.
    maxSingleMutationSpendCents: envInt("ENGINE_MAX_SINGLE_MUTATION_SPEND_CENTS", 0),
  },
} as const;

/** Throws a clear, actionable error if a required credential group is missing.
 *  Connectors call this lazily, so the engine boots without credentials and
 *  only complains when you actually try to use a platform. */
export function requireGoogle() {
  const g = config.google;
  // login-customer-id is OPTIONAL — only needed for manager-based access. For
  // direct access (user has access to the account itself) it must be omitted.
  const missing = (
    [
      ["GOOGLE_ADS_DEVELOPER_TOKEN", g.developerToken],
      ["GOOGLE_OAUTH_CLIENT_ID", g.clientId],
      ["GOOGLE_OAUTH_CLIENT_SECRET", g.clientSecret],
      ["GOOGLE_ADS_REFRESH_TOKEN", g.refreshToken],
    ] as const
  )
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    throw new Error(
      `Google Ads not connected — set ${missing.join(", ")}. See ENGINE.md.`
    );
  }
  return g;
}

export function requireMeta() {
  if (!config.meta.accessToken) {
    throw new Error(
      "Meta not connected — set META_SYSTEM_USER_TOKEN. See ENGINE.md."
    );
  }
  return config.meta;
}

export function requireShopify() {
  const s = config.shopify;
  if (!s.storeDomain || !s.adminToken) {
    throw new Error(
      "Shopify not connected — set SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_TOKEN. See ENGINE.md."
    );
  }
  return s;
}

export function shopifyConfigured(): boolean {
  return !!(config.shopify.storeDomain && config.shopify.adminToken);
}

export function requireAnthropic() {
  if (!config.anthropic.apiKey) {
    throw new Error("Set ANTHROPIC_API_KEY to run the agents. See ENGINE.md.");
  }
  return config.anthropic;
}

export function requireSupabase() {
  const s = config.supabase;
  if (!s.url || !s.serviceRoleKey) {
    throw new Error(
      "Engine DB not configured — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. See ENGINE.md."
    );
  }
  return s;
}
