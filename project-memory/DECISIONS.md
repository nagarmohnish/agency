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

### D18 · Organize the repo root into `documentation/` + `design/` (2026-06-15)
The root had accumulated ~12 loose files (HTML mockups, logo PNGs, a zip, a stray JPG) plus 5
scattered spec docs — no structure. Reorganized **without deleting anything**, all via `git mv`
(history preserved):
- **`documentation/`** ← `ARCHITECTURE.md`, `ENGINE.md`, `DEVELOPMENT.md`, `GITHUB-PAGES.md`.
- **`design/pages/`** ← the standalone HTML exports; **`design/logos/`** ← loose source logo art;
  **`design/archive/`** ← `roi-labs-site.zip` + `images (3).jpg` (both gitignored).
- **Kept at root:** `README.md`, `CLAUDE.md` (Claude-Code loads it from root), `SECURITY.md`
  (GitHub special file), and all build config.
**Why not move everything:** `src/`, `public/`, `scripts/`, `supabase/` are the app/infra and must
stay; `brand-kit/`, `data-sources/`, `vision/` are already well-named; `docs/` is confidential
(gitignored, untouched) and `demo assets/` is gitignored scratch. **Constraint honored:** every
reference updated so nothing breaks — `CLAUDE.md`/`INDEX.md` spec links, the moved docs' own relative
links (`../` prefix), the 5 legacy generator scripts that read/write these files (none in the
`npm run` pipeline), and `.gitignore`/`.vercelignore` patterns. The live Next build (`src/`, `public/`)
references none of the moved files, so `npm run verify` is unaffected. The root logos are *source* art
for the standalone generators; the app uses the separate `public/roi-logo-*.png` copies.

### D19 · Adopt the engine_design_new handoff as the cockpit (v5) (2026-06-16)
The `/engine` cockpit's design is now the **`engine_design_new/design_handoff_roi_engine`** Claude
Design handoff — a "Dutask-style" friendly, rounded, card-based look (navy ink `#1B2440`, indigo
accent `#4F5BD5`, gold ROI mark, Poppins + DM Mono, a 3-zone chrome: 76px icon rail + 296px secondary
panel + 70px top bar). Implemented as a **new self-contained component `src/app/engine/v5.tsx`**;
`Shell.tsx` renders it for the default (atlas) cockpit. **Product content, metrics, and IA are
unchanged** — only the look. **Why a new component, not editing v3:** the chrome is structurally
different (3 zones vs v3's single sidebar), so a clean rewrite is safer and keeps **v3/v3aurora as
legacy** (still importable; `/engine/aurora` stays on v3aurora for now). The earlier `/engine/v4`
"ROI Studio" (D-less exploration) was my own guess at this direction; v5 is the official handoff and
supersedes it. **Real Google/Meta/Shopify logos** (`public/logos/`) replace the handoff's lettermark
placeholders, per the handoff README. Extends the two-funnel honesty (D17) and named-agent-in-engine
framing (D16) — copy is verbatim from the handoff.

### D20 · Cockpit shows real data via a server aggregator; subscriptions are a primary stream (2026-06-16)
The v5 cockpit reads **real** source data (Shopify revenue-truth + Google Ads spend) through a single
server aggregator **`getCockpitData()`** (`src/lib/engine/cockpit-data.ts`), fetched in `page.tsx` with
`unstable_cache(revalidate:600)` and passed down `Shell → EngineV5`. **Why server-side, not client:**
the existing `/api/engine/*` routes are admin-token gated; rendering server-side lets us call the
connectors directly (env credentials, no token in the browser) and keeps `/engine` ISR (10-min fresh).
On any failure (no creds / static export / CI) it falls back to **modeled estimates**, so the Pages
demo still works. **Estimations are explicit:** Meta (pending Marketing API) and **subscriptions** are
modeled and badged **EST**; live sources are badged **LIVE** — honoring the "fill estimations" ask
without implying we measure what we can't. **Revenue model widened:** total revenue = Shopify one-time
purchases **+ recurring app-purchase subscriptions** (Stripe/PayPal/Razorpay/UPI), reflecting the real
business (the user's ask). The date-range toggle drives all metrics from the daily series (one fetch,
three windows). NB the real Google account is store search/PMax with micro-conversions (no app
installs), so the Overview was reframed from the handoff's "app vs store funnels" to "revenue streams +
ad-spend driver" to stay honest to live data. Extends D19 (the v5 design) and D17 (two-funnel honesty).

### D21 · Tickets/approvals = Jira-style board with granular permissions (2026-06-16)
The cockpit gets a **Jira-style Tickets board** (replacing the static Approvals screen) for the
propose→approve→execute flow, governed by a **granular permission model**. Full spec:
**`documentation/TICKETS.md`**. Key choices:
- **Two user types, one system:** Operators (ROI Labs in managed mode, or the client's ad-ops human
  in standalone) **create** tickets from engine insights; Approvers (client decision-makers / admin)
  **sign off**; Viewers consume analytics. Same board for both modes — only who holds which role
  changes. The client's core experience is analytics+reporting; tickets are the change-control layer.
- **Granular access (chosen over simple roles):** atomic **permissions** (`tickets.create`,
  `approve.budget|creative|campaign|tracking`, `actions.execute`, `members.manage`, …), optionally
  **channel-scoped** (meta/google/shopify/subscriptions). **Roles = preset bundles** (Admin /
  Operator / Viewer) **+ per-member grants** (e.g. a finance lead = Viewer + `approve.budget`).
  **Why granular:** lets different client stakeholders approve only their domain (budget vs creative)
  without giving broad access — "not much change in access between stakeholders, but clearly
  manageable." A ticket's **type** dictates the required `approve.*` permission. Operators can't
  approve their own spend (separation of duties).
- **Flow:** insight → ticket (Open) → submit (Awaiting approval) → Approve/Reject/Request-changes
  (cap-checked) → execute → Done; every step audit-logged on the ticket. Mirrors the engine's
  existing gated-mutation model. Board columns: Open · Awaiting approval · Approved · Done.
- **Demo-first build:** seeded members + tickets + a **"View as role"** switcher (no real auth yet);
  live wiring (member-from-auth, server-side `can()` re-checks, tickets↔`engine_actions`) is a later
  phase. Extends D2 (governance gate) and D3 (audit log as the case study).

### D22 · Section-aware panel + Runs as a step-runner + GA4/demographics on Overview (2026-06-16)
Three product directions for the v5 cockpit (first partly built, others spec'd):
- **Section-aware secondary panel (BUILT):** the 296px panel is contextual to the active rail section —
  Approvals shows ticket views / type-filters / team (wired to a board `tfilter`), Runs shows the loop +
  recent runs, Activity shows the agents, Overview/Sources show connected sources + engine spend (store
  card pinned on top). Flat nav, but each section gets its own relevant menu.
- **Runs = an operator step-runner (SPEC'd, not built):** the loop's four steps run differently.
  **Audit** → on demand, the model analyzes the **current DB data + inputs** → analytics/opportunity
  report. **Creative** → generates **AI creatives (images/variants)**. **Launch** → NOT one-click; an
  **operator action that only happens post-approval** (a Launch ticket must clear the granular gate,
  D21). **Optimize** → automated / after results land. So Audit+Creative are generative (engine agents +
  Anthropic / image-gen), Launch is gated execution, Optimize is automated — maps the loop onto the
  approval gate (D2/D21). Backend-touching → demo-UI first (run buttons + progress + result preview).
- **GA4-type data + demographics on Overview (SPEC'd):** surface GA4 metrics (sessions, conversion rate,
  funnel) + **age/gender/network demographics** + filters — already exposed via `/api/engine/breakdowns`
  and GA4. Extend `cockpit-data.ts` to aggregate (real where the connector provides it, est otherwise,
  per D20's LIVE/EST convention).

### D23 · Runs scoped to Audit + Creative; login = centered single-card (2026-06-16)
Refines D22's loop and revisits the auth screen, both at the user's request:
- **Runs = Audit + Creative only.** Removed **Launch** and **Optimize** as runnable steps. Rationale: a
  "run" is an *autonomous, operator-triggered* generative action — only Audit (analyze current data →
  opportunities) and Creative (generate AI variants) qualify. **Launch** is a human action that only
  happens *post-approval* (a gated ticket, D21); **Optimize** is automated/continuous — neither is a "run"
  you trigger, so both leave the Runs surface. The four agents still exist for ticket authorship + the
  audit log; only the *runnable loop* narrowed. Applied across the engine (step cards, panel loop,
  subtitle, run history, the Overview engine-bar copy).
  - **Landing page deliberately left at 4 stages:** the marketing "How it works" funnel still shows
    Research → Creative → Launch → Optimize — that is the *agency service* story (the team does launch +
    optimize), distinct from the engine's autonomous loop. Mirror it down to 2 steps only on request.
- **Login = centered single-card** (replaced the split-screen + animated cockpit preview from D19). One
  dark card: logo+wordmark, Continue-with-Google, email/password (field icons + show/hide), and a
  **Sign in ⇄ Create account** toggle (signup adds Full Name + a Terms checkbox). Real-auth path unchanged
  — demo enters the cockpit; operators reach the **admin-token gate** via the "Operator?" link.
- **GA4/demographics on Overview = BUILT** (was SPEC'd in D22): a self-contained `Ga4Audience` block —
  GA4 KPIs, age/gender demographics, acquisition channels, device tap-to-filter, All/New/Returning segment
  chips — frontend-first with modeled data that reacts to the date range + filters; live GA4 connector
  later (still per D20's LIVE/EST convention).

### D24 · Cockpit dark mode via CSS-variable tokens; 80%/90% default zoom (2026-06-17)
The v5 cockpit got a full **light/dark theme** + a top-bar **sun/moon toggle** (persisted to `localStorage`
`v5theme`, honours `prefers-color-scheme`). Implemented by converting the ~18 colour-token consts to **CSS
variables** (`THEME_CSS` defines a light set on `.v5root` + a dark set on `.v5root[data-theme="dark"]`);
~30 scattered hex literals were mapped to those vars after a workflow classified all 183 colour usages.
The overloaded `NAVY` was **split** into `--btn` (navy buttons/chips/tooltip; lifts in dark, keeps white
text) vs a new `INK`=`--ink` (primary text; flips). Cards get a `--card-bd` border in dark for separation.
**Header-contrast fix** (user: "headers too light"): `monoLabel` now uses `--label` (#5E6678 light, far
darker than the old #AAB2C3). Also set a default **80% zoom** on the cockpit root (`height/width ÷.8`) and
**90%** on the login (`.lg-stage` wrapper) per the user's "make it N% of a Chrome desktop view".

### D25 · engine.roilabs.in = real Supabase accounts + blurred "book a demo call" teaser, on a separate Vercel project (2026-06-17)
A public, lead-gen front door for the engine — **isolated from the roilabs.in marketing site**.
- **Auth model:** real **Supabase email + Google accounts** (not the demo localStorage gate, not the
  admin-token gate). Activated when `NEXT_PUBLIC_ENGINE_AUTH==="supabase"` **or** the host starts with
  `engine.` (`Shell.engineAuthMode()`). Accounts live in the **leads** Supabase project
  `gaulosvlnynoxgdjelgm` (that's what `NEXT_PUBLIC_SUPABASE_*` + `getSupabase()` point at).
- **Post-login = locked teaser:** the cockpit renders **`locked`** → `LockGate` blurs the metrics/sections
  and overlays a **"Your revenue cockpit is ready → Book a demo call"** card linking to the user's
  **Calendly** (`NEXT_PUBLIC_BOOK_CALL_URL`, default `calendly.com/mohnish-nagar-roilabs/30min`). This
  turns sign-ups into demo-call leads rather than giving full access.
- **Brand isolation (`BRAND` in `tickets.ts`):** public (supabase) deploys show a **dummy company**
  ("Northwind Goods", monogram, slug `northwind`) so **no real client name leaks to anyone who logs in**;
  the **internal demo** (`DEMO=1`, no auth flag) keeps the real **"The Astro Time"** + its logo. Every
  brand spot in `v5.tsx` (store card, Overview title, Shopify domain, disclaimer, Profile) reads `BRAND.*`.
- **Why a separate Vercel project (`roi-engine`) not the agency project:** one Vercel project serves one
  production build/env to all its domains, and the agency project's production domain **is roilabs.in**.
  A separate `roi-engine` project (env `NEXT_PUBLIC_ENGINE_AUTH=supabase`, `…_DEMO=1`, Supabase keys,
  Calendly) with `engine.roilabs.in` attached keeps roilabs.in 100% untouched. DNS is auto (roilabs.in on
  Vercel nameservers). **Go-live still needs the user to disable Deployment Protection on `roi-engine`.**

### D26 · Operator SSO — allowlisted Google/email accounts unlock the cockpit, alongside the admin token (2026-06-17)
Builds real single-sign-on for operators and **supersedes D25's "roilabs.in stays token-only / 100%
untouched"** — roilabs.in/engine now also offers Supabase login.
- **Auth model (server, `auth.ts`):** `authorize()` is now **async** and accepts EITHER the static
  `ENGINE_ADMIN_TOKEN` (unchanged constant-time compare) **OR** a valid Supabase **access token** whose
  email is in `ENGINE_OPERATOR_EMAILS`. The JWT is validated with `getUser` against the **leads** project
  (`NEXT_PUBLIC_SUPABASE_URL/ANON`, the one the browser signs into) — NOT the engine DB project. All 8
  `/api/engine/*` routes `await authorize`. Still **fail-closed**: neither configured ⇒ 503.
- **No new endpoint / no token in the browser:** the client uses the operator's own Supabase access token
  as the bearer; the cockpit gate reuses **`/api/engine/status`** as the probe (200 ⇒ operator, else
  teaser). The shared admin token is never shipped to a browser.
- **Access gated by deployment env, not by host branching:** set `ENGINE_OPERATOR_EMAILS` on the **agency**
  project (roilabs.in) ⇒ the team gets full access there; leave it **off** `roi-engine` ⇒ engine.roilabs.in
  stays the pure lead-gen teaser (D25 intent preserved). Empty allowlist ⇒ SSO grants no one.
- **Shell collapsed from 3 modes to 2:** `demoOnly()` (internal static showcase, `DEMO=1` without the
  `engine.*`/supabase host) keeps the no-login demo; **everything else is "real-auth"** (Supabase login +
  admin-token fallback). Enabled on roilabs.in via `!DEMO` — **no env change needed** there.
- **Data-leak guard:** the locked teaser is now fed `cockpit=null` (its safe modeled estimates). Previously
  the real `cockpit` payload was sent to every `locked` render — fine on engine.roilabs.in (dummy data) but
  it would have leaked real "The Astro Time" numbers to any signed-in non-operator once login opened up on
  roilabs.in. Real source data now reaches **operators only**.
- **Operator setup (user):** add `ENGINE_OPERATOR_EMAILS` (agency Vercel + `.env.local`); add
  `https://roilabs.in/engine` + the local `localhost:<port>/engine` to Supabase → Auth → Redirect URLs (the
  Google provider itself was already configured for engine.roilabs.in). See ENGINE.md "Operator sign-in".
- **Why not enterprise SAML/OIDC:** considered; deferred. Needs Supabase Pro + per-customer IdP metadata —
  premature for an internal operator tool. Google OAuth via the existing Supabase client covers it today.

### D27 · Multi-tenant per-company dashboards (subdomain, email-membership, per-tenant creds) (2026-06-17)
Each company gets its own dashboard + access + integrations. Full spec: **`documentation/MULTI-TENANT.md`**.
Locked choices: **subdomain per company** (`<slug>.roilabs.in`); **both clients + ROI Labs team log in**,
role-gated (clients=viewer, team=operator/admin); **only ROI Labs invites** (v1). Membership keyed by
**email** (works before sign-up); identity in the LEADS Supabase project, tenant data + encrypted creds in
the ENGINE project. Builds on D26's operator-SSO `authorize()` (which it extends from a yes/no gate to a
principal + per-tenant membership check, retiring `ENGINE_OPERATOR_EMAILS`). Grounded in code: the 7
`engine_*` tables are already `account_id`-partitioned, so it's 3 new tables (`slug`,
`engine_account_users`, `engine_account_credentials`) + a `resolveTenant(slug,email)` gate + moving creds
off env (AES-GCM) + a `*.roilabs.in` wildcard + `middleware.ts`. **Option 1** (public funnel at
roilabs.in/engine; Astro Time → `astrotime.roilabs.in`) is **Step 1** of a 9-step migration. Two latent
cross-tenant bugs flagged to fix (google token-cache singleton; `unstable_cache` key must include
`accountId`). Design + plan stage — not yet built.

### D28 · Tenant backfill is SELECT-first + target-by-UUID + lowercase email (2026-06-17)
The canonical per-tenant bring-up SQL lives in **`supabase/backfill_astrotime.sql`** (not a blind snippet in
the migration comment). A 5-agent verification workflow caught three blockers in the obvious form:
(1) `update engine_accounts set slug='astrotime' where slug is null` is a blind multi-row write against a
**UNIQUE** column — if >1 account has a null slug it aborts on `unique_violation`; so we **SELECT first, then
UPDATE the one row by its full UUID** (`and slug is null` only as a no-clobber guard). (2) The membership
INSERT must be **idempotent** (`on conflict (account_id, email) do update set role=excluded.role`) — the PK is
`(account_id, email)`. (3) The stored email **must be lowercased** (`lower(trim(...))`): `resolveTenant`
looks it up with `trim().toLowerCase()` but the column has no `lower()` constraint, so a mixed-case row
silently fails the gate ("No access" with nothing to debug). Same verification confirmed Phase-1 needs **no**
`ENGINE_CRED_ENC_KEY`/connector creds (modeled data, `cockpit=null`), that `ENGINE_OPERATOR_EMAILS` is
**off-path** for the tenant gate (it uses `principal()` membership, not the operator allowlist), and that
agency Vercel must set `SUPABASE_URL` **explicitly** to the ENGINE project (the `NEXT_PUBLIC_SUPABASE_URL`
fallback points at LEADS and would deny everyone). Google sign-in on a subdomain needs
`https://<slug>.roilabs.in/` in the LEADS project's Auth → Redirect URLs.

### D29 · Tenant cockpit is a dedicated honest component, not the demo v5 with a flag (2026-06-17)
The client-facing tenant dashboard (`<slug>.roilabs.in`) renders **only data that genuinely exists** — no
modeled/placeholder numbers (user: "don't add data that is not present"). A 4-agent map found the existing
`/engine` cockpit (`src/app/engine/v5.tsx`, 1124 lines) is a **self-contained sales demo**: ~20 fabrication
sites (static KPIS/SIGNALS/APPROVAL_CARDS/RUN_HISTORY arrays, a sin/cos `modeledRange` FALLBACK, an entirely
modeled GA4 audience, and even the "real" assembler `cockpit-data.ts` invents Meta at 74%/3.22× ROAS,
subscriptions at 38%, and extrapolates Google 90D). Retrofitting an `honest` prop would touch all ~20 sites,
risk leaking fabricated data to a client, and could break the demo. **Decision:** build a separate, lean
`src/app/t/[slug]/TenantCockpit.tsx` that reuses v5's design tokens/chrome but is **honest by construction**
(it has no fabrication code, so it physically cannot show what isn't there). The demo v5 cockpit stays for
the internal `/engine` surface. Product choices (locked with the user): unconnected sources (Meta,
subscriptions, GA4) render **"awaiting-connection" cards**, not hidden; **ops sections included** (Runs,
Approvals, Activity) wired to **real** `engine_runs`/`engine_actions` with honest empty states. Data flows
via a new membership-gated `/api/engine/tenant-cockpit` route (principal → resolveTenant → `getTenantCockpit
(account.id)`) — IDOR-safe (slug is the trust boundary), so a member only ever sees their own account.
Tenant range toggle is **7D/28D only** (Google Ads API caps at 30d; 90D would require extrapolation = a
fabrication). [[D27]] [[D28]]

### D30 · Credentials cutover — connectors read per-tenant ENCRYPTED creds, not global env (2026-06-17)
So onboarding a client is a **DB row, not a Vercel change** (the user's scalability ask). The connectors
(`GoogleConnector`, `MetaConnector`, `shopify.ts`) now resolve creds via `googleCreds/metaCreds/shopifyCreds
(account.id)` from `engine_account_credentials` (AES-256-GCM), memoized per connector instance, instead of
`requireGoogle/requireMeta/requireShopify` (global env). The split: **global in Vercel (once, shared):**
Google OAuth *app* creds (client id/secret/dev token — it's your app), `ENGINE_CRED_ENC_KEY`, Supabase,
Anthropic. **Per client (encrypted DB row, no Vercel):** Google refresh_token + login_customer_id, Shopify
store_domain + admin_token, Meta system_user_token. `google_customer_id` stays a **non-secret field on the
`engine_accounts` row** (it's the account you query; a global fallback would be a cross-tenant hazard).
Seeded by **`scripts/seed-credentials.mjs <slug>`** (local: parses `.env.local`, encrypts, upserts — secrets
never print/leave the machine; AES round-trip proven byte-compatible with `crypto.ts`). `getRevenue`/
`shopifyPing` took an `accountId` param; callers (cockpit-data, revenue/status routes) updated. A missing row
degrades **honestly** to "awaiting" (googleCreds/metaCreds throw→caught; shopifyCreds→null), not a crash.
Env fallback (`ENGINE_CRED_ENV_FALLBACK=true`) is the migration backstop; off in steady state.
Verified by a 9-agent security review: secret-leak/isolation/shape/caller all clean. **Known gap (NOT a
cutover regression, deferred):** the 7 legacy `/api/engine/*` routes still gate via `authorize()`+`?accountId`
(operator-only today, so not client-reachable) — close the IDOR with an `isAccountMember`/`authorizeAccount`
guard **before company #2 or before opening those routes to members**. [[D27]] [[D29]]
