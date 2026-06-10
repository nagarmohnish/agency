// One-time helper to mint a Google Ads API refresh token via the OAuth
// loopback flow. Run it once; paste the printed refresh token into .env.local
// as GOOGLE_ADS_REFRESH_TOKEN.
//
// Prereqs:
//   1. In Google Cloud Console, enable the "Google Ads API" for your project.
//   2. Create an OAuth client of type "Desktop app" → copy its client id/secret.
//   3. Run:
//        node scripts/google-oauth.mjs <CLIENT_ID> <CLIENT_SECRET>
//      (or set GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET in the env)
//
// It starts a localhost server, prints a consent URL, you approve in the
// browser as the Google user that has access to the MCC, and it exchanges the
// returned code for a long-lived refresh token. No dependencies.

import http from "node:http";
import fs from "node:fs";

const PORT = 53682;
const REDIRECT = `http://localhost:${PORT}/oauth2callback`;
const SCOPE = "https://www.googleapis.com/auth/adwords";

// Fall back to .env.local so the secret never has to go on the command line.
function fromEnvLocal(key) {
  try {
    const m = fs.readFileSync(".env.local", "utf8").match(new RegExp(`^${key}=(.+)$`, "m"));
    return m ? m[1].trim() : undefined;
  } catch {
    return undefined;
  }
}

const clientId = process.argv[2] || process.env.GOOGLE_OAUTH_CLIENT_ID || fromEnvLocal("GOOGLE_OAUTH_CLIENT_ID");
const clientSecret = process.argv[3] || process.env.GOOGLE_OAUTH_CLIENT_SECRET || fromEnvLocal("GOOGLE_OAUTH_CLIENT_SECRET");

if (!clientId || !clientSecret) {
  console.error(
    "Usage: node scripts/google-oauth.mjs <CLIENT_ID> <CLIENT_SECRET>\n" +
      "  (or set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET)"
  );
  process.exit(1);
}

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent", // force a refresh_token even on re-consent
  });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname !== "/oauth2callback") {
    res.writeHead(404).end();
    return;
  }
  const code = url.searchParams.get("code");
  const err = url.searchParams.get("error");
  if (err || !code) {
    res.writeHead(400).end(`OAuth error: ${err || "no code"}`);
    server.close();
    process.exit(1);
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
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
    const json = await tokenRes.json();
    if (!tokenRes.ok || !json.refresh_token) {
      res.writeHead(500).end("Token exchange failed — see terminal.");
      console.error("\nToken exchange failed:", JSON.stringify(json, null, 2));
      if (!json.refresh_token) {
        console.error(
          "\nNo refresh_token returned. This usually means you've consented " +
            "before — revoke at https://myaccount.google.com/permissions and retry."
        );
      }
      server.close();
      process.exit(1);
    }
    res.writeHead(200, { "Content-Type": "text/html" }).end(
      "<h2>Done — you can close this tab.</h2><p>Refresh token is in your terminal.</p>"
    );
    console.log("\n✅ Success. Add this to .env.local:\n");
    console.log(`GOOGLE_ADS_REFRESH_TOKEN=${json.refresh_token}\n`);
    server.close();
    process.exit(0);
  } catch (e) {
    res.writeHead(500).end("Error — see terminal.");
    console.error(e);
    server.close();
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log("\n1. Make sure this redirect URI is allowed on your OAuth client:");
  console.log(`     ${REDIRECT}`);
  console.log("\n2. Open this URL in your browser and approve as the user with MCC access:\n");
  console.log(authUrl + "\n");
  console.log(`Listening on ${REDIRECT} — waiting for the redirect…`);
});
