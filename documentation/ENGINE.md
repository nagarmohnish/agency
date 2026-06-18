# ROI Labs Engine — the 5-agent backend

This is the backend that runs the homepage's promise on a **real brand's** Google
+ Meta ad accounts: Scout → Forge → Pilot → Frame → Signal, with a governance
gate so nothing spends without a human, and an audit log that *is* the case study.

It's built so you wire credentials **last**: the code deploys and boots with no
keys; each connector only errors when you actually call it.

```
src/lib/engine/
  config.ts            every credential + safety rail is read here (one place)
  types.ts             domain types (mirror the SQL migration)
  db.ts                server-side Supabase client (service role)
  audit-log.ts         records every decision (the case-study source of truth)
  governance.ts        the gate: dry-run, autonomy levels, spend cap, approvals
  auth.ts              bearer guard for the ops routes
  connectors/          google.ts, meta.ts (REST) behind one AdConnector interface
  agents/              roles.ts, tools.ts, client.ts, orchestrator.ts (manual loop)
  runner.ts            runAudit(), verifyConnections() — what the routes call
supabase/migrations/   20260610130000_create_engine.sql  (the engine_* tables)
src/app/api/engine/    run/ · status/ · approvals/  (admin-guarded ops routes)
```

## Safety model (read this first)

Three independent brakes, all default to "spend nothing":

1. **`ENGINE_DRY_RUN=true`** (default) — every mutation is logged and simulated,
   never sent to a platform. The master kill-switch.
2. **Spend cap** — `min(account.daily_spend_cap_cents, ENGINE_GLOBAL_DAILY_SPEND_CAP_CENTS)`.
   Global cap defaults to `0` = block all live spend. Any change that would push
   today's committed daily spend over the cap is held for approval.
3. **Autonomy level** per account:
   - `read_only` — no mutations at all (start here).
   - `paused_writes` — build structure, but everything is forced **paused** ($0 serves).
   - `live_approval` — spend-increasing changes need human sign-off; pausing losers auto-runs.
   - `live_auto` — executes within the cap automatically.

Nothing reaches Google/Meta except through `governance.gatedMutate`, and every
call writes an `engine_actions` row first.

---

## One-time setup (no ad credentials needed yet)

1. **Apply the migration** (creates the `engine_*` tables, RLS-locked to the
   service role):
   ```bash
   npx supabase db push
   ```
2. **Set the always-needed env** in `.env.local` (and Vercel):
   `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `ENGINE_ADMIN_TOKEN`.
   Leave `ENGINE_DRY_RUN=true` and the spend cap at `0`.
3. **Insert the brand's account row** (identifiers only — no secrets). In the
   Supabase SQL editor:
   ```sql
   insert into public.engine_accounts (name, autonomy_level)
   values ('Brand name', 'read_only');
   ```
   You'll add the platform IDs in the connection steps below.

At this point the engine runs in dry-run against an empty account — safe.

### Operator sign-in: Google SSO (vs. the shared admin token)

Operators can reach the cockpit two ways, both ending up as
`Authorization: Bearer <…>` to `/api/engine/*`:

- **Admin token** — paste `ENGINE_ADMIN_TOKEN` into the "Operator? admin token"
  gate. Always works; the break-glass path.
- **Google / email SSO** — sign in with Supabase (the same leads project
  `gaulosvlnynoxgdjelgm` the public teaser uses). The browser's **access token**
  is validated server-side (`auth.ts` → `getUser`) and the email is checked
  against an allowlist. An allowlisted email gets the **full cockpit**; anyone
  else gets the locked "book a demo" teaser. No shared token ever reaches the
  browser.

To enable SSO operator access on a deployment:

1. Set the allowlist env on **that** deployment (and `.env.local` for local):
   ```bash
   ENGINE_OPERATOR_EMAILS=you@roilabs.in,teammate@roilabs.in   # comma-separated
   ```
   Gate it by deployment: set it on the **agency** project (roilabs.in) so the
   team gets in there; leave it **off** `roi-engine` so `engine.roilabs.in` stays
   a pure lead-gen teaser. Empty/absent ⇒ SSO grants nobody access (admin token
   still works).
2. The Supabase **Google provider is already configured** on the leads project.
   Just add the deployment's post-login URL to Supabase → Auth → URL
   Configuration → **Redirect URLs**: `https://roilabs.in/engine` (prod) and your
   local `http://localhost:<port>/engine`. (`engine.roilabs.in/engine` is already
   listed.)
3. `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be present on
   the deployment (they already are on agency — the marketing site uses them).

Auth is **fail-closed**: with neither `ENGINE_ADMIN_TOKEN` nor
`ENGINE_OPERATOR_EMAILS` set, every `/api/engine/*` call is rejected (503).

---

## Connecting the real account (do this LAST)

> We deliberately deferred this. When you're ready, fill the env vars and patch
> the `engine_accounts` row. Start `read_only`, verify reads, then escalate.

### Connecting Google

1. In Google Ads, create/identify the **manager (MCC)** account; note its id
   (digits only). For a brand you already manage, link their account under the MCC.
2. Get a **developer token** (Test works for your own test accounts; apply for
   Basic to touch the real client account — see the research notes; allow days).
3. Create an OAuth client (Web/Desktop) → run the consent flow once to obtain a
   **refresh token** for an account with access to the MCC.
4. Set env: `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_OAUTH_CLIENT_ID`,
   `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_ADS_REFRESH_TOKEN`,
   `GOOGLE_ADS_LOGIN_CUSTOMER_ID` (the MCC).
5. Patch the account row with the **client** customer id:
   ```sql
   update public.engine_accounts
     set google_customer_id = '1234567890',          -- the brand's account
         google_login_customer_id = '0987654321'     -- your MCC (optional override)
     where name = 'Brand name';
   ```

### Connecting Meta

1. Create a Meta App + Business Manager; create a **System User** and generate a
   long-lived token with `ads_read`, `ads_management`, `business_management`.
   (Your own account works under Standard Access with no App Review; a *client's*
   account needs Advanced Access + App Review.)
2. Set env: `META_SYSTEM_USER_TOKEN`.
3. Patch the account row:
   ```sql
   update public.engine_accounts
     set meta_ad_account_id = 'act_1234567890',
         meta_business_id   = '1234567890'
     where name = 'Brand name';
   ```

### Connecting Shopify (revenue source of truth)

For ecommerce brands (e.g. AstroTime's store, whose ads run on Meta), Shopify is
the real revenue — used to reconcile against Meta's platform-reported purchase
value. Not an ad platform; read-only.

1. Shopify admin → **Settings → Apps and sales channels → Develop apps → Create
   an app** (custom app).
2. **Configure Admin API scopes** → enable **`read_orders`**. Install the app.
3. Copy the **Admin API access token** (`shpat_…`).
4. Set env: `SHOPIFY_STORE_DOMAIN` (e.g. `theastrotime.myshopify.com`) and
   `SHOPIFY_ADMIN_TOKEN`. No DB row change needed.

Then `/api/engine/status` shows a `shopify` connection and the **Revenue** tab
shows actual orders/revenue + (once Meta is connected) the reported-vs-actual gap.

### Verify the connection (read-only, $0)

```bash
curl -H "Authorization: Bearer $ENGINE_ADMIN_TOKEN" \
  https://roilabs.in/api/engine/status
```
You want `connections.google.ok` / `connections.meta.ok` to be `true`.

---

## Running the loop

**Step 1 — Audit (Scout).** Pure reads + one structured submit; never spends:
```bash
curl -X POST -H "Authorization: Bearer $ENGINE_ADMIN_TOKEN" \
  -H "Content-Type: application/json" -d '{"step":"audit"}' \
  https://roilabs.in/api/engine/run
```
Returns a `runId`; the ranked opportunity map lands in `engine_audit_runs` and
every read is logged in `engine_actions`.

**Approvals** (once you move past `read_only`):
```bash
# list what's waiting
curl -H "Authorization: Bearer $ENGINE_ADMIN_TOKEN" https://roilabs.in/api/engine/approvals
# approve one (executes it through the gate)
curl -X POST -H "Authorization: Bearer $ENGINE_ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"actionId":"<uuid>","decision":"approved","approvedBy":"you@roilabs.in"}' \
  https://roilabs.in/api/engine/approvals
```

## Going live (when you want the real case study)

1. Confirm reads look right at `read_only`.
2. `update engine_accounts set autonomy_level='paused_writes'` → build everything
   paused, still $0.
3. Set a real cap (e.g. €30/day = `3000`), set `ENGINE_GLOBAL_DAILY_SPEND_CAP_CENTS`
   accordingly, flip `ENGINE_DRY_RUN=false`, move to `live_approval`.
4. Approve the first spend-increasing change yourself. Watch `engine_actions`.

The case study writes itself from `engine_actions` + `engine_metrics` — real
decisions, real numbers, no fabrication.

## Not built yet (next phases)

Forge/Frame creative+page generation, Signal CAPI/GA4 wiring, the AEO/GEO
(AI-search visibility) module, and the case-study page generator. The roles,
gate, connectors, and audit log are all in place for them to plug into.

