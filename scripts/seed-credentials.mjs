// Seed a company's integration credentials into engine_account_credentials,
// ENCRYPTED (AES-256-GCM), so the connectors read them per-tenant instead of from
// global env (D27 / D29 credentials cutover). Run LOCALLY — secrets are read from
// .env.local, encrypted, and stored; they never print and never leave your machine.
//
//   node scripts/seed-credentials.mjs [slug]        (slug defaults to "astrotime")
//
// Reads from .env.local: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) +
// SUPABASE_SERVICE_ROLE_KEY (the ENGINE project), ENGINE_CRED_ENC_KEY, and whichever
// of GOOGLE_ADS_REFRESH_TOKEN / GOOGLE_ADS_LOGIN_CUSTOMER_ID / SHOPIFY_STORE_DOMAIN /
// SHOPIFY_ADMIN_TOKEN / META_SYSTEM_USER_TOKEN are present. Idempotent (upsert).

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createCipheriv, randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

// ── parse .env.local (no dotenv dep) ────────────────────────────────────────
function parseEnv(text) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    let line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    if (line.startsWith("export ")) line = line.slice(7).trim();
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[k] = v;
  }
  return out;
}

// ── AES-256-GCM — MUST match src/lib/engine/crypto.ts exactly ───────────────
function loadKey(raw) {
  if (!raw) throw new Error("ENGINE_CRED_ENC_KEY not set in .env.local — generate one with `openssl rand -base64 32`.");
  const buf = /^[0-9a-fA-F]{64}$/.test(raw) ? Buffer.from(raw, "hex") : Buffer.from(raw, "base64");
  if (buf.length !== 32) throw new Error("ENGINE_CRED_ENC_KEY must decode to exactly 32 bytes (use `openssl rand -base64 32`).");
  return buf;
}
function encryptJson(value, key) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return { v: 1, iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"), ct: ct.toString("base64") };
}

async function main() {
  const slug = (process.argv[2] || "astrotime").trim().toLowerCase();
  const env = parseEnv(readFileSync(join(process.cwd(), ".env.local"), "utf8"));

  const supaUrl = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const supaKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supaUrl || !supaKey) throw new Error("Need SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (the ENGINE project) in .env.local.");
  const key = loadKey(env.ENGINE_CRED_ENC_KEY);
  const db = createClient(supaUrl, supaKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: acct, error } = await db
    .from("engine_accounts")
    .select("id, name, slug, google_customer_id, meta_ad_account_id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Lookup failed: ${error.message}`);
  if (!acct) throw new Error(`No account with slug '${slug}'. Run the backfill first (supabase/backfill_astrotime.sql).`);
  console.log(`Account: ${acct.name} (${slug}) · ${acct.id}`);

  const rows = [];
  if (env.GOOGLE_ADS_REFRESH_TOKEN) {
    rows.push({ platform: "google", secret: encryptJson({ refresh_token: env.GOOGLE_ADS_REFRESH_TOKEN, login_customer_id: env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || "" }, key), meta: {} });
  }
  if (env.SHOPIFY_STORE_DOMAIN && env.SHOPIFY_ADMIN_TOKEN) {
    const domain = env.SHOPIFY_STORE_DOMAIN.replace(/^https?:\/\//, "").replace(/\/$/, "");
    rows.push({ platform: "shopify", secret: encryptJson({ store_domain: domain, admin_token: env.SHOPIFY_ADMIN_TOKEN }, key), meta: { store_domain: domain } });
  }
  if (env.META_SYSTEM_USER_TOKEN) {
    rows.push({ platform: "meta", secret: encryptJson({ system_user_token: env.META_SYSTEM_USER_TOKEN }, key), meta: {} });
  }
  if (!rows.length) throw new Error("No connector creds found in .env.local (GOOGLE_ADS_*, SHOPIFY_*, META_*).");

  // A Google credential is useless without the CLIENT customer id ON THE ACCOUNT
  // ROW (the connector queries customers/{google_customer_id}/...). Fail BEFORE
  // writing a half-configured state, unless explicitly overridden.
  const allowMissingGcid = process.argv.includes("--allow-missing-gcid");
  if (rows.some((r) => r.platform === "google") && !acct.google_customer_id && !allowMissingGcid) {
    throw new Error(
      `Google creds present but engine_accounts.google_customer_id is NULL for '${slug}'.\n` +
      `   Google reads are gated on this field, so they would be silently skipped.\n` +
      `   Set the brand's CLIENT customer id first, e.g.:\n` +
      `     update public.engine_accounts set google_customer_id='1234567890' where slug='${slug}';\n` +
      `   (or re-run with --allow-missing-gcid to seed creds now and set the id later)`
    );
  }

  for (const r of rows) {
    const { error: upErr } = await db
      .from("engine_account_credentials")
      .upsert({ account_id: acct.id, platform: r.platform, secret: r.secret, meta: r.meta }, { onConflict: "account_id,platform" });
    if (upErr) throw new Error(`Failed to store ${r.platform}: ${upErr.message}`);
    console.log(`  ✓ ${r.platform} — encrypted + stored`);
  }

  console.log(`Done — ${rows.length} credential(s) seeded for ${slug}. The agency Vercel project needs ENGINE_CRED_ENC_KEY + the global Google OAuth app vars; redeploy to pick them up.`);
}

main().catch((e) => { console.error("seed-credentials failed:", e.message); process.exit(1); });
