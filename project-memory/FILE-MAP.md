# File map — the engine + dashboard

Keep this in sync when files are added/moved/removed.

## Database
- `supabase/migrations/20260610130000_create_engine.sql` — the `engine_*` tables,
  RLS-locked to the service role. Applied to the `Revenue_tech` project.

## Engine library — `src/lib/engine/`
- `config.ts` — single place all credentials + safety rails are read. `requireX()`
  guards error only when a platform is used. Holds `adminToken`, dry-run, caps.
- `types.ts` — domain types mirroring the migration + connector-facing shapes.
- `db.ts` — server-side Supabase client (service role); `getAccount`/`getDefaultAccount`.
- `audit-log.ts` — `logAction`/`finalizeAction`/`decideAction`/`listPendingApprovals`,
  run start/finish, `recentActions`. Writes the audit trail.
- `governance.ts` — the gate: `gatedMutate` (decides execute/approve/skip/simulate,
  enforces autonomy + cap + dry-run) and `executeApproved`.
- `auth.ts` — `authorize(req)` bearer guard for the ops routes (fail-closed).
- `runner.ts` — high-level `runAudit(accountId)` + `verifyConnections(account)`.
- `shopify.ts` — Shopify Admin API (revenue source of truth; NOT an ad connector):
  `shopifyPing` + `getRevenue(days)` (orders pagination, daily series, AOV).
- `connectors/`
  - `types.ts` — `AdConnector` interface (ping, listCampaigns, getMetrics, mutate).
  - `google.ts` — Google Ads REST (OAuth refresh, GAQL, mutate).
  - `meta.ts` — Meta Graph API (system-user token, insights, mutate).
  - `index.ts` — `connectorFor(account, platform)` + `configuredPlatforms`.
- `agents/`
  - `client.ts` — Anthropic client + `MODEL`/`MAX_TOKENS`.
  - `roles.ts` — system prompts for Scout/Forge/Pilot/Frame/Signal/orchestrator.
  - `tools.ts` — tool schemas (read + `propose_mutation` + `submit_audit`) + dispatcher.
  - `orchestrator.ts` — manual Claude tool-loop with caching + token accounting.

## API routes — `src/app/api/engine/`
- `run/route.ts` — POST, kicks off a loop step (v1: `audit`).
- `status/route.ts` — GET, account + connection pings + recent actions + pending count.
- `audits/route.ts` — GET, latest opportunity map.
- `campaigns/route.ts` — GET, live campaigns + revenue KPIs per platform.
- `approvals/route.ts` — GET pending; POST approve/reject (executes via gate).
- `runs/route.ts` — GET recent runs grouped with fetches + mutations + audit + token cost.
- `breakdowns/route.ts` — GET traffic-source/gender/age rollups (account + campaign), spend + CAC.
- `revenue/route.ts` — GET Shopify actual revenue + Meta-reported reconciliation (discrepancy).

## Dashboard — `src/app/engine/`
- `page.tsx` — route + metadata (noindex).
- `Dashboard.tsx` — token gate + cockpit (Overview, Audit, Campaigns, Activity, Approvals).
- `engine.css` — scoped cream/yellow styling.

## Touched marketing files
- `src/components/Navbar.tsx`, `Footer.tsx` — hide marketing chrome on `/engine`.

## Docs
- Root: `ARCHITECTURE.md`, `ENGINE.md`, `SECURITY.md` (threat model + go-live
  checklist), `.env.example` (engine block).
- `project-memory/` — this alignment layer.
