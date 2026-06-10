// Exchange a Google OAuth authorization code for a refresh token and write it
// into .env.local. Used when the consent redirect can't reach the local helper
// (e.g. you approved in a browser on a different machine). Reads client
// id/secret + redirect from .env.local; pass the code as the first arg:
//   node scripts/google-exchange.mjs '4/0Adk...'
// The refresh token is written to .env.local directly — never printed.

import fs from "node:fs";

const REDIRECT = "http://localhost:53682/oauth2callback";
const ENV = ".env.local";

function get(key) {
  const m = fs.readFileSync(ENV, "utf8").match(new RegExp(`^${key}=(.+)$`, "m"));
  return m ? m[1].trim() : "";
}

const code = process.argv[2];
const clientId = get("GOOGLE_OAUTH_CLIENT_ID");
const clientSecret = get("GOOGLE_OAUTH_CLIENT_SECRET");

if (!code) { console.error("Pass the auth code as the first argument."); process.exit(1); }
if (!clientId || !clientSecret) { console.error("GOOGLE_OAUTH_CLIENT_ID/SECRET missing in .env.local"); process.exit(1); }

const res = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: REDIRECT,
    grant_type: "authorization_code",
  }),
});
const json = await res.json();

if (!res.ok || !json.refresh_token) {
  console.error("Exchange failed:", JSON.stringify(json, null, 2));
  if (!json.refresh_token && res.ok) {
    console.error("No refresh_token returned — revoke prior consent at https://myaccount.google.com/permissions and retry with prompt=consent.");
  }
  process.exit(1);
}

const token = json.refresh_token;
let env = fs.readFileSync(ENV, "utf8");
if (/^GOOGLE_ADS_REFRESH_TOKEN=.*$/m.test(env)) {
  env = env.replace(/^GOOGLE_ADS_REFRESH_TOKEN=.*$/m, `GOOGLE_ADS_REFRESH_TOKEN=${token}`);
} else {
  env += `\nGOOGLE_ADS_REFRESH_TOKEN=${token}\n`;
}
fs.writeFileSync(ENV, env);
console.log(`✅ Refresh token written to .env.local (length ${token.length}, preview ${token.slice(0, 8)}…).`);
