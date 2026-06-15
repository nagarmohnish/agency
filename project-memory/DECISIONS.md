# Decisions — what we chose and why

Append new decisions at the bottom with a date. If a decision is reversed, mark
it ~~struck~~ and add the replacement.

### D1 · Reuse platform rails, build the moat (2026-06-10)
2026 research found the ad platforms now ship official MCP servers/CLIs and
hosted creative models. So we **don't** rebuild connectors or creative models —
we build the three defensible layers the platforms don't give us: cross-platform
**orchestration**, a **governance/approval engine**, and a trustworthy
**attribution layer**. (Connectors are thin REST wrappers, intentionally.)

### D2 · Governance gate is non-bypassable (2026-06-10)
Nothing reaches a platform except through `governance.gatedMutate`. Three
independent brakes default to "spend nothing": `ENGINE_DRY_RUN` (master
kill-switch, on), spend cap (`min(account, global)`, global default 0), and a
4-level autonomy ladder (`read_only`→`paused_writes`→`live_approval`→`live_auto`).
Every action is logged *before* it acts.

### D3 · The audit log IS the case study (2026-06-10)
`engine_actions` is append-only and records every read/recommendation/mutation
with rationale. The case study is generated from real rows — no fabrication.
This is also the compliance audit trail.

### D4 · REST connectors, no heavy SDKs (2026-06-10)
Google Ads via REST (`searchStream` + `:mutate`) and Meta via Graph API over
`fetch`. Avoids gRPC/native build issues on Vercel and keeps the code transparent.

### D5 · Claude orchestration: manual tool-loop, not auto-runner (2026-06-10)
The gate is human-in-the-loop, so we own each turn (log tool calls, stop on
budget, never auto-execute an ungated mutation). Model `claude-opus-4-8`,
adaptive thinking, prompt-cached system prompt.

### D6 · Separate Supabase project for the engine (2026-06-10)
Engine data lives in the **`Revenue_tech`** project; the marketing site's lead
forms stay on their own project. Server-only `engine_*` tables use the
service-role key; public lead forms keep the anon publishable key. Clean blast-radius
separation.

### D7 · Honest "LLM search ads" split (2026-06-10)
Don't claim buyable ads across all AI engines (Perplexity killed ads; most
surfaces are citation-only). Split into **paid where buyable** (Google AI,
Copilot, ChatGPT) + **AEO/GEO citation optimization** elsewhere, with measurable
share-of-voice. Build both honestly; it's a later phase.

### D9 · The agent is untrusted; the gate enforces money safety (2026-06-10)
Treat the LLM as adversarial (prompt injection via ad data). The gate never
trusts agent-reported spend — it **derives** spend from the mutation payload and
takes the larger. Controls layer: dry-run kill switch, server-derived spend,
per-mutation hard ceiling (reject outright), daily cap, autonomy ladder + human
approval, append-only log written before acting, constant-time admin auth.
Documented in [`SECURITY.md`](../SECURITY.md). Residual: enabling a campaign with
an unknown budget is forced to approval (not auto-assessed) — acceptable for now.

### D8 · Connect credentials last (2026-06-10)
Build the entire backend credential-free (each connector errors only when called),
so the code deploys first and the brand's accounts are wired in as a final
paste-and-verify step. All secrets read in one place (`config.ts`).

### D12 · Atlas / Terminal adaptive theme (Claude Design handoff) (2026-06-11)
Implemented the `ROI Engine Dashboard.dc.html` design (Claude Design bundle) as the
primary look of the React `/engine` app. One layout, two modes via a **CSS-variable
theme** flipped by an `.eng.dark` class: Light = **Atlas** (indigo `#4F46E5`, white
`#FFFFFF` panels on `#F4F5F7`), Dark = **Terminal** (amber `#FACC15`, `#0C0D0F` panels
on `#08090A`). Rationale / choices:
- **Alias, don't rewrite.** The old token names became aliases of the new ones
  (`--brand→--accent`, `--surface→--panel-2`, `--border-strong→--border-2`) so all v2
  components inherited both themes with zero per-component edits. Charts switched from
  hard-coded hex to CSS vars (`COL`), and the donut to an ink-opacity ramp, so they
  invert correctly in dark mode.
- **Theme persists** to `localStorage` (`roi_engine_theme`), default **light** (Atlas),
  toggled from the topbar or the ⌘K palette. Live clock + ⌘K palette are real (keydown
  listener, command list wired to view/lens/theme).
- **Scout rail + anomaly feed are data-driven**, not static: proposals come from the
  wasted-spend / budget-capped-scaling / tracking-health insight modules; the feed from
  real anomaly/tracking flags and the top-ROAS campaign. Approve/Later dismiss locally.
- **Overview matches the design pixel-intent** (5-up divided KPI strip, blended area
  chart, anomaly feed, campaign table with derived SCALING/CAPPED/DRIFTING status);
  every other view inherits the theme + chrome. Fonts: Space Grotesk / Hanken Grotesk /
  JetBrains Mono via Google-Fonts `@import` (works on Vercel; could move to next/font
  later to self-host). Supersedes D10's white "instrument panel" visual system; the v2
  data model + IA (D11) is unchanged.

### D11 · Dashboard v2 — daily-grain model, attribution lens, demo-first (2026-06-11)
The analytics half of `/engine` was rebuilt (not restyled) as **ROI Engine** on a
**daily-grain fact model**: facts are stored only per day; every period total,
comparison, and chart is computed at query time. This is what makes GA4-style
custom ranges + comparisons possible. The defining control is a 3-way **attribution
lens** (platform-reported / Shopify last-click via UTMs / blended MER) that
recomputes every revenue/ROAS/CPA figure — the honesty mechanism. Key tradeoffs:
- **Demo-first, live-degraded.** The live API exposes ~30% of the model (account-
  level daily only, no order-level UTMs/new-returning/refunds, no search terms, no
  device/geo daily, no IS/lost-IS). Rather than fake the rest, v2 is fully realised
  in **demo mode** (`v2/demo-data.ts`, 120 days, seeded/deterministic) and live mode
  shows an honest "awaiting the daily-fact pipeline" notice for analytics while ops
  views keep working live. A future live adapter can map real daily facts into the
  same `Dataset` shape.
- **Meta emits no demo facts** (status `in_progress`) so the pending pattern is real
  and blended/MER excludes Meta automatically (with a footnote), never zeros.
- **Hand-rolled the GA4 date picker** (dual-month calendar) instead of adding
  react-day-picker — zero new deps, full style control. The spec allowed one dep; we
  didn't need it.
- **Controls state in URL** (range/compare/granularity/lens/filters) via manual
  history sync (no Next router dep) so views are shareable and static-export safe.
  Active tab is React state, not URL (it's navigation, not a control).
- New code is isolated under `src/app/engine/v2/`; ops wiring (Runs/Activity/
  Approvals) was moved to `v2/ops.tsx` **unchanged**. Supersedes the v1 single-file
  Dashboard; D10's visual system is retained.

### D10 · Cockpit is a white "instrument panel"; KPI deltas derived in-window (2026-06-11)
The `/engine` dashboard moved from the cream/yellow Aurora skin to a white,
near-black-ink, hairline + tabular-mono "instrument panel for money". Rationale:
the dashboard's credibility *is* the product (the audit log is the case study), so
it must read as precise and verifiable, not decorative. Yellow (`#FACC15`) is held
to 5 spots (active nav, the single primary CTA, focus rings, latest-point chart
dots, the period-toggle underline) — never as text on white (WCAG) or as semantic
status (status uses pos/neg/warn/gray). Every KPI self-explains (source chip,
delta, explainer, tooltip). **Tradeoff:** the spec wants "delta vs prior
equal-length period," but the hard no-new-data-fetch constraint means the API only
returns the current window. We derive the delta from the already-fetched daily
series — trailing half vs leading half — labelled honestly as "vs prior Nd"
(N = ⌊window/2⌋). Metrics with no daily series (CTR: no daily clicks/impressions)
show "no prior-period data" gracefully. Honest and verifiable without touching data
wiring; revisit if the API later returns a prior-period block.

### D13 · Dedicated platform sections, not a source toggle (2026-06-12)
Replaced the orthogonal **Source** scope toggle (Overall/Google/Shopify/Meta in the
controlbar) with **dedicated sidebar sections** — one per platform — under a new "Sources"
nav group between Overview and Analytics. Rationale: a single toggle forced every analytics
screen to mean different things per source (e.g. Source=Google's "24 Orders" = Shopify
orders last-click-attributed to Google, not Google conversions — confusing), and Source=
Shopify left the spend/campaign views empty by design. Dedicated sections let each platform
show only the metrics that are real for it and an honest **AvailabilityPanel** ("✓ available
now" vs "+ post-integration") — Meta renders a pending state until Marketing API approval.
Overview is retained as the cumulative all-source growth view. **Tradeoff:** some helper
duplication between sections and the generic Performance/Revenue screens; accepted for
clarity. `state.source`/`SourceScope`/`buildSlice(...,source)` are kept (sections call
`buildSlice(source="google")` directly) but the UI toggle and `SOURCES` const are removed.
**Update (2026-06-12):** taken further — the generic cross-platform analytics tabs
(Performance/Segments/Revenue/Insights) were removed from the nav entirely. Analytics now
lives *only* inside each source tab (Google carries delivery + economics KPIs + campaigns +
breakdowns; Shopify carries Revenue). Nav is just Overview · Sources · Engine, with abstract
glyph icons stripped (brand logos are the only nav marks). The four analytics components stay
in `views.tsx` as dead-but-exported code for reuse.

### D14 · Homepage "How it works" = Adwize-style auto-player; orbit section dropped (2026-06-15)
Replaced the marketing homepage's static 4-step "How it works" (`#process`) **and** removed
the five-agent **orbit** `#system` section, consolidating into one **auto-playing process
visualization** (implemented from a Claude Design handoff — `how-it-works/index.html`, fetched
from the design share link). A left browser-chrome "app" panel builds cards per phase while a
right step list highlights the active phase with a filling progress bar; an **App-flow /
Timeline** toggle switches treatments. It cycles the four offerings — **Audit & opportunity →
Creative at volume → Launch across Meta & Google → Optimize until it works** — each tied to its
agent (Scout / Forge / Pilot·Frame / Signal), so the agents are now shown *through the process*
rather than in a separate orbit. **Why:** the orbit was decorative; the auto-player is the
Adwize-pattern the user asked for and tells the revenue story as motion. Ported into the scoped
`.aurora` component (CSS under `.aurora .hiw`, logic in `AuroraHome`'s single effect, 3 dummy
creatives in `public/hiw/`). Nav "The system" link dropped (dead anchor); replaced with
**Integrations**. **Tradeoff:** lost the standalone five-agent showcase + the "This isn't AI
spam" disclaimer — re-add elsewhere if the agent roster needs its own spotlight.

### D15 · Engine cockpit redesigned via Claude Design handoff; new self-contained v3 (2026-06-15)
Replaced the `/engine` cockpit UI with the **ROI Engine.dc.html** Claude Design handoff. Ported
it as one self-contained client component **`src/app/engine/v3.tsx`** (inline styles, dummy data),
not as edits to the v2 system. **Why a clean port, not a refit:** the design is a coherent,
finished visual system (Atlas indigo shell, GA4-style topbar, crisp 3–4 KPIs/source, the honest
two-funnel framing) whose data model (hardcoded "The Astro Time", ₹, install-vs-revenue split)
intentionally diverges from v2's generated `buildSlice` dataset — fastest faithful path is a
standalone component, and it keeps the prototype's exact pixels. **Routing:** `page.tsx` now
renders new **`Shell.tsx`** (token gate + demo) instead of `Dashboard`. **Legacy kept, not
deleted:** `Dashboard.tsx` (Gate re-exported from it) + the whole `v2/` analytics/ops layer stay
in the tree for reuse / future live-data wiring — superseded as the route, not removed.
**Tradeoffs / deferred:** v3 is light-only (design dropped the dark Terminal theme) and the
`?view=` deep-link isn't re-wired yet; data is dummy until the connectors feed real fields.
Supersedes D12's Atlas/Terminal cockpit as the live look; D11's v2 data model is parked, not gone.

### D16 · Retire the named-agent framing from marketing; keep it in the engine (2026-06-15)
The five proper-noun agents (**Scout / Forge / Pilot / Frame / Signal**) and the "five agents in
orbit / ROI Core / senior team at the core" device are **dropped from the marketing positioning**.
After the orbit `#system` section was removed (D14), the names still lingered across the live
site, so a 23-agent workflow audit swept every marketing surface. Decision + scope:
- **Marketing copy → function labels, not proper nouns.** Homepage How-it-works phase pills now
  read "Research & intelligence / Creative production / Media buying & landing pages /
  Measurement & attribution"; agent-naming phase descriptions, the "Agents…/agents…" actor refs,
  the integrations cards ("by Scout", "Signal's measurement layer"), the SEO meta description (5
  instances of "AI agents draft and test" → "AI drafts and tests"), and the `/demo` + `/demos`
  variants were all de-named. Actor is **"AI" / "the engine"** everywhere.
- **The engine backend is untouched.** Scout/Forge/Pilot/Frame/Signal stay as the product's
  functional agent roles — they're **persisted lowercase DB values** (`engine_actions.agent`,
  CHECK-constrained) and an `AgentName` union across the engine lib. Renaming = migration risk
  for zero marketing benefit. If the operator cockpit UI should later drop the proper nouns,
  that's a **presentation-layer display-name map** (keep the keys) — a separate ticket.
- **Kept on purpose:** "AI-native" company descriptor (not an agent name); `/demo`'s orbit-ring
  *visual* (noindex variant); the legacy `src/components/ai-native/*` dead code (unrouted, clean).
**Why:** the orbit/agent-roster was decorative; the positioning is cleaner as capabilities +
"measured in revenue." **Local only**; verified by grep (zero proper nouns in marketing) + served
HTML. Audit report lives in the run transcript.

**Amendment (2026-06-15):** the operator-cockpit exception above was taken — per user "align the
dashboard with the current approach," the **v3 cockpit (`src/app/engine/v3.tsx`) now also uses the
function labels**, not the proper nouns. The agent display map was renamed
*Research & intelligence (RI) · Creative production (CP) · Media buying (MB) · Landing pages (LP) ·
Measurement & attribution (MA)* (Pilot+Frame split into the two halves of the site's "Media buying
& landing pages" pill); all Runs/Activity/Approvals/loop strings follow. This is the
presentation-layer display-name map foreseen above. **The engine *backend* is still untouched** —
`engine_actions.agent` and the `AgentName` union keep the lowercase Scout/Forge/… DB values (live
API routes, `demo.ts`, `v2/`); only the customer/operator-facing v3 UI is de-named. Marketing was
already clean, so no landing-page copy changed. Positioning docs (VISION, OVERVIEW, DATA-SCOPE)
de-named to match.

### D17 · Two-funnel honesty: outcome-per-funnel, not "everything is Shopify revenue" (2026-06-15)
The real account (The Astro Time) runs **two funnels with different objectives**: Google =
app-install/YouTube (reports installs + CPI, **₹0 store purchase value** → ROAS undefined), and
Meta → Shopify = store revenue (real purchase value + ROAS; Shopify is the truth). So "paid media,
measured in revenue" is the *store* thesis, not the whole story. Decision: surface this everywhere.
- **Positioning/copy** keeps the strong "measured in revenue" H1 lead but qualifies it to **"the
  outcome that matters — revenue, installs, or leads"** across the site (marketing was the only place
  that over-claimed; 20 edits). Shopify/store statements stay scoped to store spend.
- **Dashboard** makes the split explicit: a **dual-outcome Overview hero** (store revenue + app
  installs side by side, app explicitly "no revenue → ROAS n/a"); **Blended MER (rev ÷ total spend)
  is labelled as blended** and a **Store MER (rev ÷ Meta spend, ≈ROAS)** sits beside it so the
  app-install spend never silently drags the store-efficiency number; a **source-contribution module**
  (spend split vs outcome split) makes "Google = 40% of spend / 0% of store revenue" visible.
- **Rich dummy data is OK without live access** (user ask): every section is fully populated with
  internally-consistent dummy numbers; only the *honesty markers* distinguish live (Google spend/
  installs/CPI, Shopify orders/sales/AOV/products) from modeled (all Meta; GA4 sessions/CVR; last-click
  attribution) via the gold `*` convention. **Why:** completeness + accuracy aren't in tension — show
  the full instrument, but never imply we can extract what we can't. Extends D16-era honesty work.
