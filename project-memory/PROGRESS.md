# Progress — current state, changelog, next steps

Convert relative dates to absolute. Newest changelog entry on top.

## Current state (as of 2026-06-10)

- ✅ **Google LIVE** on the real brand **The Astro Time** (customer `9924807033`,
  direct access, no manager link). Reading 47 campaigns; first Scout audit done
  (health 52/100). `read_only` + dry-run — cannot spend.
- ✅ **`/engine` dashboard** redesigned: sidebar nav, 7/14/30-day toggle, donut +
  trend charts, KPI cards. Sections: Overview, Runs, Audit, Campaigns, Segments,
  Activity, Approvals.
- ✅ Engine on **`Revenue_tech`** Supabase project (`xcszgeypiehclulltzoh`) —
  separate from the marketing leads DB (`gaulosvlnynoxgdjelgm`).
- ✅ Security hardened (server-derived spend cap, per-mutation ceiling, dry-run on
  approvals, constant-time auth) — see `SECURITY.md`.
- ⏳ **Meta pending**: app needs the Marketing API use case added (admin, ~next
  day) → generate System User token → pick 1 of 4 ad accounts → wire it.
- 🔒 Safety: `ENGINE_DRY_RUN=true`, global cap `0` — nothing can spend yet.

## Key facts / IDs (non-secret)

- Brand: **The Astro Time** (theastrotime.com). Engine account row id `6c51173e-…`.
- Google: client customer `9924807033` (Ads Account 1); MCC `1228513668`
  (not linked — direct access, so `GOOGLE_ADS_LOGIN_CUSTOMER_ID` is empty).
  API version `v21` (v18/v19 sunset). Currency INR.
- Meta: System User "Conversions API System User" (4 Astrotime ad accounts assigned).
- Secrets live ONLY in `.env.local` (git-ignored) — never commit them.

## What exists

- DB: `engine_accounts`, `engine_campaigns`, `engine_creatives`, `engine_metrics`,
  `engine_actions` (audit log), `engine_runs`, `engine_audit_runs`. RLS-locked.
- Engine lib: config, types, db, audit-log, governance gate, connectors
  (Google REST + Meta Graph, with `getBreakdowns`), agents (5 roles + orchestrator
  + tools), runner. Scout is the only fully-built agent.
- Routes: `/api/engine/{run,status,audits,campaigns,breakdowns,runs,approvals}` (admin-bearer).
- Helpers: `scripts/google-oauth.mjs`, `scripts/google-exchange.mjs`.

## Next steps

1. **Meta** (next day): admin adds Marketing API to the app → generate EAA token →
   pick the ad account (`act_…`) → add token to `.env.local` → wire account row → verify.
   Meta's age/gender breakdowns will populate the Segments tab.
2. Phase 3+: build Signal (fix conversion-value tracking — the #1 audit finding),
   then Pilot/Forge/Frame to act on findings (all via the governance gate).
3. The AEO/GEO AI-search module + the public case-study page generator.

## Changelog

### 2026-06-10 — Repo cleanup + pushed to GitHub
- Cleaned: gitignored `*.mp4`/`*.mov` (kept the screen recording out of git),
  reset `.env.example` admin token to empty, removed transient `*.log` files.
- Verified no secrets staged (`.env.local` ignored; secret scan clean).
- Pushed all engine + dashboard work to `origin/master` (github.com/nagarmohnish/agency).

### 2026-06-10 — Dashboard redesign (sidebar + charts + date range)
- Rebuilt `/engine`: **sidebar nav** (was top tabs), sticky header with a
  **7/14/30-day range toggle** wired through Overview/Campaigns/Segments.
- **Charts** (inline SVG, no dependency): donut for traffic-source spend split,
  spend+conversions **trend line**, KPI cards. Added `daily` time-series to
  `/api/engine/campaigns` to feed the trend.
- Restyle/polish: shadows, refined palette, hoverable tables, responsive collapse.
  Type-check clean; page 200; 7d trend returns real points.

### 2026-06-10 — Segment breakdowns (traffic source / age / gender)
- New connector method `getBreakdowns(days)`: Google via `segments.ad_network_type`,
  `gender_view`, `age_range_view` (each dimension resilient/skippable); Meta via
  insights breakdowns `publisher_platform`/`age`/`gender` (ready for when Meta connects).
- New route `/api/engine/breakdowns` — account-level + campaign-level rollups with
  spend + CAC. New `/engine` **Segments** tab (traffic sources, gender, age, per-campaign).
- Live result: AstroTime is ~72% YouTube spend (₹128k/₹178k), CAC ~₹2.35; Display ₹2.87,
  Search ₹2.14. **Age/gender = ₹0** because the account is App/Video-heavy (those campaign
  types don't populate Google's demographic views) — a real measurement finding, not a bug.
  Meta breakdowns will populate age/gender once connected.

### 2026-06-10 — Runs transparency dashboard
- Fetches now logged: `read_campaigns` / `read_metrics` actions written for every
  connector read (tools.ts) → the audit trail shows WHAT data fed the analysis.
- New route `/api/engine/runs` — groups each run with its fetches, proposed
  mutations, audit output, and token cost.
- New `/engine` **Runs** tab: per-run "What we fetched → What we concluded" with
  token/duration cost and a collapsible agent narrative. (Pre-existing run shows
  0 fetches since it predates fetch-logging; future runs populate it.)

### 2026-06-10 — 🎉 First real Scout audit ran (end-to-end works)
- `ANTHROPIC_API_KEY` added; ran Step 1 (Scout) on the live AstroTime account.
  Read-only, no platform changes. Run `f9865d07…`, stored in `engine_audit_runs`.
- **Result: health 52/100, 7 ranked opportunities.** Top finding = ₹0 conversion
  value on every campaign (the "measured in revenue" gate), then AI-creative
  disclosure risk, spend concentration (~51% one campaign), an enabled-but-not-
  serving iOS campaign, near-zero-delivery days, video fatigue, 38 paused shells.
- Proves the product thesis: real account → real loop Step 1 → real findings,
  fully logged. This is the case-study seed.

### 2026-06-10 — 🎉 Google LIVE on the real account
- **Google connected and reading the real AstroTime account** (Ads Account 1,
  customer `9924807033`), `read_only` + dry-run. `engine_accounts` row inserted
  (id `6c51173e…`, currency INR) via service-role key.
- Direct access (no manager link): cleared `GOOGLE_ADS_LOGIN_CUSTOMER_ID`; made
  it **optional** in `requireGoogle()` (config.ts). Dev token already works on the
  real account (no Basic-approval wait needed).
- **Fixed API version:** v18/v19 are sunset (404). Probed v20–v23 (all 200);
  set default `GOOGLE_ADS_API_VERSION` to **v21**.
- Live data confirmed: **47 campaigns, ₹178,936 spend / 30d, 75,228 conversions,
  ₹0 conversion value** → revenue/ROAS uncomputable. First real finding: conversion
  *value* tracking is missing (a "measured in revenue" gap for Scout/Signal).
- Blocker for first audit: `ANTHROPIC_API_KEY` not yet set.

### 2026-06-10 — Credentials in progress
- **Google:** OAuth client created (user's own Cloud project), `GOOGLE_OAUTH_CLIENT_ID/SECRET`
  in `.env.local`, and `GOOGLE_ADS_REFRESH_TOKEN` minted + written (consent approved on a
  Mac; helper redirect failed cross-machine, so exchanged the code via
  `scripts/google-exchange.mjs`). Still need: developer token (apply **Basic** access),
  MCC `login-customer-id`, brand client customer id → then insert `engine_accounts` row.
- **Meta:** parked — the selected app lacks the Marketing API use case; needs an app
  admin to add it (expected next day). System User "Conversions API System User" has the
  4 Astrotime ad accounts assigned. Token not yet generated.
- New helper: `scripts/google-exchange.mjs` (exchanges an auth code when the loopback
  redirect can't reach the local helper — e.g. browser on a different machine).

### 2026-06-10 — Security hardening (before real money)
- **Fixed spend-cap bypass:** gate now derives spend from the mutation *payload*
  (`assessSpendCents`), not the agent's self-reported number; enabling a campaign
  with an unknown budget is forced to approval.
- Added **per-mutation hard ceiling** (`ENGINE_MAX_SINGLE_MUTATION_SPEND_CENTS`) —
  rejects outright, re-checked at approval time.
- `executeApproved` now **respects the dry-run kill switch** + the ceiling.
- Admin-token compare is now **constant-time** (`auth.ts`).
- Gitignored `*.log` (dev logs). Confirmed no client code imports engine lib or
  secrets. Added `SECURITY.md` (threat model + go-live checklist). New decision D9.

### 2026-06-10 — Engine DB connected (local)
- `SUPABASE_SERVICE_ROLE_KEY` (Revenue_tech `sb_secret_…`) added to `.env.local`.
- `/api/engine/status` now reaches the DB (returns "No engine account configured"
  — expected). Next: insert the `engine_accounts` row + add `META_SYSTEM_USER_TOKEN`.

### 2026-06-10 — Dashboard gate UX + local env
- Token gate now admits a valid token even when downstream isn't configured
  (only 401/503 block); sections show their own setup state. `ENGINE_ADMIN_TOKEN`
  set locally to `12345` (placeholder — replace before production). Dev server on
  port 3001 (3000 in use).

### 2026-06-10 — Project memory layer
- Added `project-memory/` (this folder) + root `CLAUDE.md` maintenance rule.

### 2026-06-10 — Frontend + data architecture
- `ARCHITECTURE.md` (data flow + screens mapped to the 5 steps).
- API routes `/api/engine/audits` and `/api/engine/campaigns` (live KPIs:
  spend, revenue, ROAS, CAC, CTR, conversions).
- `/engine` dashboard: token gate + Overview/Audit/Campaigns/Activity/Approvals.
- Hid the marketing Navbar/Footer on `/engine`.

### 2026-06-10 — Backend engine (Phase 1)
- Migration `20260610130000_create_engine.sql` (applied to `Revenue_tech`).
- Engine lib (config/types/db/audit-log/governance/connectors/agents/runner).
- Ops routes (run/status/approvals). `ENGINE.md` + `.env.example` additions.
- Added `@anthropic-ai/sdk`. Orchestrator uses `claude-opus-4-8`, adaptive
  thinking, prompt caching, manual tool-loop (human-in-the-loop gate).
