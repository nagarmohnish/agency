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

- `cockpit-data.ts` — **server aggregator for the v5 cockpit** (D20). `getCockpitData()` pulls REAL
  Shopify (getRevenue) + Google (getMetrics) once over the max window, derives 7D/28D/90D aggregates
  from the daily series, and fills **estimations** for Meta + recurring **subscriptions**
  (Stripe/PayPal/Razorpay/UPI). Returns `CockpitData` (per-range `RangeData` with `live`/`estimated`
  flags). Consumed by `engine/page.tsx` (`unstable_cache`, revalidate 600 → `/engine` ISR) → `Shell`
  → `EngineV5`. Falls back to modeled data on failure (static demo / CI).

## API routes — `src/app/api/engine/`
- `run/route.ts` — POST, kicks off a loop step (v1: `audit`).
- `status/route.ts` — GET, account + connection pings + recent actions + pending count.
- `audits/route.ts` — GET, latest opportunity map.
- `campaigns/route.ts` — GET, live campaigns + revenue KPIs per platform.
- `approvals/route.ts` — GET pending; POST approve/reject (executes via gate).
- `runs/route.ts` — GET recent runs grouped with fetches + mutations + audit + token cost.
- `breakdowns/route.ts` — GET traffic-source/gender/age rollups (account + campaign), spend + CAC.
- `revenue/route.ts` — GET Shopify actual revenue + Meta-reported reconciliation (discrepancy).

## Dashboard — `src/app/engine/` (ROI Engine)
- `page.tsx` — route + metadata (title "ROI Engine", noindex) + `viewport.themeColor
  = #FFFFFF`. **Now renders `Shell`** (was `Dashboard`).
- **`Shell.tsx`** — route entry; gates on `ready` first (no cockpit flash). **Three modes (D25):**
  (1) **Supabase** when `engineAuthMode()` (`NEXT_PUBLIC_ENGINE_AUTH=supabase` OR host `engine.*`) →
  real Supabase session gate → `EngineV5 locked` (the engine.roilabs.in teaser); (2) **demo**
  (`DEMO=1`) → `roi_user` localStorage gate → full cockpit; (3) **live** → admin-token gate (posts to
  `/api/engine/status`). Renders `EngineV5` (atlas) or `EngineAurora` (`variant="aurora"`). (D15, D19, D25)
- **`Login.tsx`** — the **sign-in screen** = **centered single card** on landing-header charcoal + gold,
  animated gold-glow backdrop, 90% default zoom (D23 reskin). One card: Continue-with-Google + email/
  password with a **Sign in ⇄ Create account** toggle. Three auth paths via props: **`supabaseAuth`** →
  real Supabase signUp/signInWithPassword/signInWithOAuth(google)/signOut (D25); **`demo`** → persists
  `roi_user` to localStorage; else → admin-token gate (`onSubmitToken`). Poppins + `#4F5BD5`/gold.
- **`v3aurora.tsx`** — **roilabs.in (Aurora) themed** variant of the cockpit at route
  `/engine/aurora`. **Generated** from `v3.tsx` by `scripts/make-aurora-theme.mjs` (palette+font
  remap: gold accent, warm neutrals, Sora/Manrope). Don't hand-edit — edit `v3.tsx` then re-run
  the script. Selected via `Shell`'s `variant="aurora"` prop.
- **`v5.tsx`** (`EngineV5`) — **THE LIVE COCKPIT** (D19). Implements the **engine_design_new**
  "Dutask-style" handoff: 3-zone chrome (76px icon rail + 296px secondary panel with **real
  Google/Meta/Shopify logos** + 70px top bar), navy ink / indigo `#4F5BD5` accent / gold ROI mark,
  Poppins + DM Mono. Pages (`page` state): Overview (two-funnel hero, KPI sparklines, source cards,
  spend-vs-returns, 4 signals, dark engine bar) · Google/Meta/Shopify · Runs (THE LOOP + active run +
  history) · Activity · Approvals (Tickets board) · Profile · GA4 `Ga4Audience` block. **Full light/dark
  theme** (CSS-var tokens on `.v5root`, sun/moon toggle, persisted; D24) + 80% default zoom. **`locked`
  prop → `LockGate`** (blur + "Book a demo call" → Calendly) for the public teaser (D25). Brand is
  **env-gated via `BRAND`** (imported from `tickets.ts`): dummy "Northwind Goods" on public/supabase
  deploys, real "The Astro Time" on the internal demo. Inline styles. Rendered by `Shell` (atlas).
- **`tickets.ts`** — Tickets/Approvals data model + **granular permission helpers** (D21): `Permission`
  union, `ROLE_PERMS`, `effectivePerms`/`can`/`canApprove`, `MEMBERS`, `SEED_TICKETS`. Also exports
  **`BRAND`** (D25) — env-gated demo brand (name/slug/mono/logo) used across `v5.tsx`.
- **`v3.tsx`** — the **previous cockpit** (Claude Design "ROI Engine.dc.html" handoff, D15). One
  self-contained client component, inline styles (Atlas indigo shell). 7 pages; GA4-style date toggle;
  two-funnel framing; function-label agents (D16). **Legacy — superseded by v5 (D19); kept importable.**
- **`v4/EngineV4.tsx` + `v4/page.tsx`** — **"ROI Studio"** demo: a **Dutask-inspired** (Behance ref)
  design exploration at route **`/engine/v4`**. Modern PM-dashboard aesthetic (violet accent, rounded
  cards, kanban Campaign board, task-style Approvals, sparkline stat cards, donut). Same ad-ops demo
  data as v3, brand-new visual language; **fully self-contained**, not wired to Shell/v3/aurora
  (2026-06-16). Demo/exploration only.
- `Dashboard.tsx` — **legacy v2 shell, no longer the route** (kept for reuse; `Gate` is
  exported from here). Token gate / demo bypass; **theme state** (light/dark,
  localStorage-persisted); icon sidebar + user chip; topbar (integration chips · lens
  segmented · date pill · **live clock** · **⌘K palette** · **theme toggle**); **sync
  ticker**; Overview's main+**Scout rail** body layout; view router. Atlas/Terminal
  redesign (D12).
- `demo.ts` — **ops** demo mode (unchanged): `DEMO` flag + `demoCall(path)` for the
  status/runs/approvals/audits endpoints. Still powers Runs/Activity/Approvals.
- `engine.css` — **Atlas/Terminal two-mode theme** (D12): light tokens on `.eng`, dark
  overrides on `.eng.dark`; old token names kept as aliases so all components inherit
  both modes. Google-Fonts `@import` (Space Grotesk / Hanken Grotesk / JetBrains Mono).
  Carries v1/v2 component styles + a v3 chrome section (sidebar/topbar/ticker/KPI strip/
  anomaly feed/campaign table/Scout rail/command palette).
- `v2/views.tsx` also exports `Ticker`, `ScoutRail`, `scoutProposals` (the Overview
  chrome, data-driven from the insight modules).

### Analytics layer — `src/app/engine/v2/`
- `types.ts` — daily-grain fact schema (`AdDaily`, `AdSegmentDaily`, `Order`,
  `SearchTermDaily`, `Integration`, `Dataset`) + app-state types (Lens, Granularity,
  CompareMode, Filter, DateRange, AppState).
- `format.ts` — ₹ Indian grouping + compact (L/Cr), pct/ratio/signed, date helpers.
- `ranges.ts` — GA4 presets, comparison-period resolution, day/week/month bucketing.
- `demo-data.ts` — deterministic (seeded) 120-day generator; Google + Shopify only,
  Meta intentionally empty (pending). `generateDataset(today)`, cached.
- `metrics.ts` — canonical metrics + the attribution lens (`buildSlice`, `adAgg`,
  `orderAgg`, `lensRevenue`, `mer`/`ncMer`/`nCacCents`, `truthGap`, `delta`,
  `parseFunnel`). Single source of truth used by views + tooltips.
- `insights.ts` — all 10 insight modules (`allInsights`/`topInsights`) with real
  computed takeaways: truth gap, MER ladder, CPA decomposition, diminishing returns,
  wasted spend, creative fatigue (Meta-pending), DOW, traffic quality, tracking
  health, anomalies.
- `state.ts` — `useEngineState(today)`: URL-param serialization of range/compare/
  granularity/lens/filters (manual history sync; static-export friendly).
- `ui.tsx` — primitives + hand-built SVG charts (KpiCard, Info tooltip, DeltaChip,
  Sparkline, Takeaway, AxisLineChart, StackedBarLine, Waterfall, Heatmap,
  ScatterCurve, Donut, InlineBar, Pending, skeletons).
- `controls.tsx` — GA4 dual-month `DateRangePicker`, `LensToggle`,
  `GranularityToggle`, `Filters`, `SourceHealth`.
- `views.tsx` — Overview, Performance, Segments, Revenue, Insights.
- `ops.tsx` — Runs, Activity, Approvals ported (live/demo wiring **unchanged**) +
  `useApi`.
- Note: `public/roi-logo-light.png` still the light-bg logo asset; the sidebar now
  uses a text wordmark "ROI **Engine**".

## Data sources (raw-data layer + catalog)
- `data-sources/CATALOG.md` — **ground truth** of exactly what each connector extracts
  (Google daily metrics + range-aggregate network/age/gender; Shopify daily orders+revenue
  +AOV only; Meta pending) + a dashboard data-point availability matrix. The dashboard must
  show only what's here.
- `data-sources/README.md` — overview + the **trim-vs-extend** decision (most missing
  Shopify data — UTMs, new/returning, refunds, products — is available via a `getRevenue`
  extension, not a new integration).
- `data-sources/raw/` — stored raw extracts + `*.sample.json` (exact connector shapes:
  google-campaigns/metrics-daily/breakdowns, shopify-revenue, meta-insights pending).
- `vision/DATA-SCOPE.md` — **Data availability & product scope** (2026-06-15). Per-source
  matrix (Google/Meta/Shopify/GA4): available now vs connector-extension vs elevated-access vs
  not-available; three build tiers; full feature-volume map; recommended scope for `/engine` +
  website. Built from API docs + connector audit, adversarially fact-checked. Superset of
  `data-sources/CATALOG.md` with the external-API + product-scope layer added.

## Standalone artifact
- `design/pages/roi-engine-dashboard.html` (gitignored; moved from root 2026-06-15, D18) —
  the whole v2 cockpit in ONE self-contained file (inlined CSS + vanilla JS port of
  `src/app/engine/v2/`, no deps, no build). Opens via file://; shareable demo. Not connected
  to the live backend. Regenerate by re-porting from `v2/` if the React app changes.

## Marketing pages
- `src/app/page.tsx` → `AuroraHome.tsx` — the homepage (scoped `.aurora`). The **"How it
  works"** section (`#process`, class `.hiw`) is an **auto-playing process engine** ported from
  a Claude Design handoff: PHASES array + render/auto-cycle/toggle logic live in `AuroraHome`'s
  single `useEffect`; styles under `.aurora .hiw` in `aurora.css`; 3 dummy ad creatives in
  `public/hiw/creative-{1,2,3}.png`. The old five-agent **orbit `#system`** section was removed
  (its CSS is dead-but-harmless in `aurora.css`). See DECISIONS D14.
- `src/app/integrations/` — the `/integrations` page (Adwize-style "connect your revenue
  stack"). `page.tsx` (metadata + imports `aurora.css` + `integrations.css`),
  `Integrations.tsx` (client: hand-built brand-logo SVGs, 14-connector data, live search
  filter, inline Aurora nav/footer), `integrations.css` (scoped under `.aurora`). Nav:
  **How it works · Integrations · Free audit · Plans · FAQ** — the unified nav now shared by
  `Navbar.tsx`, `AuroraHome.tsx`, `AuditPage.tsx`, `Integrations.tsx` (2026-06-15).

## Touched marketing files
- `src/components/Navbar.tsx`, `Footer.tsx` — hide marketing chrome on `/engine` **and
  `/integrations`** (Aurora pages ship their own nav/footer).
- `src/app/engine/Dashboard.tsx` — engine tabs deep-linked via `?view=` (`ALL_VIEWS`,
  `viewFromUrl()`, URL-sync effect, popstate) → each tab is a shareable URL.

## Docs & repo layout
- `documentation/` — project specs (moved from root 2026-06-15, D18): `ARCHITECTURE.md` (data
  flow + screens), `ENGINE.md` (operator guide + credential steps), `DEVELOPMENT.md`
  (edit→verify→deploy loop), `GITHUB-PAGES.md` (live static-export URLs), **`TICKETS.md`**
  (Jira-style tickets/approvals board + granular permission model — D21).
- Root (kept): `README.md`, `CLAUDE.md` (Claude-Code entry), `SECURITY.md` (threat model +
  go-live checklist — GitHub special file), `.env.example` (engine block).
- `project-memory/` — this alignment layer.
- `design/` — non-app source artifacts, **not in the Next build** (D18): `design/pages/`
  standalone HTML exports (legacy static site + the dashboard export); `design/logos/` loose
  source logo art for the standalone generators — the live app uses the separate `public/`
  copies; `design/archive/` old bundles/media (`roi-labs-site.zip`, gitignored). The 5 legacy
  generator scripts in `scripts/` (`build-pages.js`, `build-standalone.js`,
  `build_standalone_new.py`, `gen-clean-logo.js`, `make-logo.js`) read/write these paths.
- `brand-kit/`, `data-sources/`, `vision/` — design tokens, raw-data catalog, vision narrative.
  `demo assets/` (gitignored) = local scratch; `docs/` (gitignored) = confidential material.
