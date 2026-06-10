// Exchange a Shopify OAuth authorization code for an Admin API access token and
// write it into .env.local as SHOPIFY_ADMIN_TOKEN. The Dev Dashboard's
// "App automation token" does NOT work against the store Admin API; this mints a
// real shpat_ token via OAuth.
//
// Usage: node scripts/shopify-exchange.mjs '<the code, or the full callback URL>'
// Reads SHOPIFY_STORE_DOMAIN / SHOPIFY_API_KEY / SHOPIFY_API_SECRET from .env.local.

import fs from "node:fs";

const ENV = ".env.local";
const get = (k) => {
  const m = fs.readFileSync(ENV, "utf8").match(new RegExp(`^${k}=(.+)$`, "m"));
  return m ? m[1].trim() : "";
};

const arg = process.argv[2] || "";
// Accept either a bare code or the full callback URL (?code=...).
let code = arg;
try {
  if (arg.includes("code=")) code = new URL(arg).searchParams.get("code") || arg;
} catch {
  const m = arg.match(/[?&]code=([^&]+)/);
  if (m) code = decodeURIComponent(m[1]);
}

const shop = get("SHOPIFY_STORE_DOMAIN").replace(/^https?:\/\//, "").replace(/\/$/, "");
const clientId = get("SHOPIFY_API_KEY");
const clientSecret = get("SHOPIFY_API_SECRET");

if (!code) { console.error("Pass the auth code or the full callback URL as the first arg."); process.exit(1); }
if (!shop || !clientId || !clientSecret) { console.error("Missing SHOPIFY_STORE_DOMAIN / SHOPIFY_API_KEY / SHOPIFY_API_SECRET in .env.local"); process.exit(1); }

const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
});
const json = await res.json().catch(() => ({}));
if (!res.ok || !json.access_token) {
  console.error("Exchange failed:", res.status, JSON.stringify(json));
  process.exit(1);
}

const token = json.access_token;
let env = fs.readFileSync(ENV, "utf8");
env = /^SHOPIFY_ADMIN_TOKEN=.*$/m.test(env)
  ? env.replace(/^SHOPIFY_ADMIN_TOKEN=.*$/m, `SHOPIFY_ADMIN_TOKEN=${token}`)
  : env + `\nSHOPIFY_ADMIN_TOKEN=${token}\n`;
fs.writeFileSync(ENV, env);
console.log(`✅ Admin token written to .env.local (length ${token.length}, scope: ${json.scope || "?"}).`);
