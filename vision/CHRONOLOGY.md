# ROI Engine — Chronology

> What we've built, in order, and *why* at each step. Dates are absolute. This is the
> narrative spine; per-change technical detail lives in
> [`../project-memory/PROGRESS.md`](../project-memory/PROGRESS.md) and decisions in
> [`../project-memory/DECISIONS.md`](../project-memory/DECISIONS.md).
> Last updated: 2026-06-11.

---

## Phase 0 — The marketing site (before this thread)
- **roilabs.in** — a Next.js marketing site on Vercel positioning ROI Labs as an
  **AI-native paid-media agency**: *"Paid media, measured in revenue. Scaled by AI."*
  Homepage sells a system of **5 agents** (Scout, Forge, Pilot, Frame, Signal) running
  a loop (Audit → Creative → Launch → Optimize). "Aurora Light" homepage, lead popup,
  /audit page.
- This created a promise that needed proof → the engine.

## Phase 1 — The engine backend (2026-06-10)
- Built the **real 5-agent ad-ops engine**: connectors (Google Ads REST, Meta Graph,
  Shopify Admin), a governance gate, an append-only audit log, agent orchestration
  (Scout fully built), and the `engine_*` tables on a **separate Supabase project**
  (`Revenue_tech`).
- **Safety-first:** `ENGINE_DRY_RUN=true`, global daily cap `0`, accounts start
  `read_only`. Nothing can spend.
- **Live connections:** Google Ads on the real brand **The Astro Time** (47 campaigns,
  first Scout audit 52/100); **Shopify** as the revenue source of truth; **Meta**
  pending Marketing API access.
- **Why:** make the website's promise true on a real account and generate a documented
  case study from `engine_actions` + `engine_metrics`.

## Phase 2 — Dashboard v1: the white "instrument panel" (2026-06-11)
- Visual-only reskin of `/engine` from a dark cream/yellow theme to a white, near-black
  "instrument panel for money": hairline borders, tabular **mono** numerals, the
  **metric anatomy** (source chip · value · delta · explainer · ⓘ tooltip · sparkline),
  ink-line charts with a single brand-yellow accent.
- **Why:** the dashboard's credibility *is* the product; it had to read as precise and
  verifiable, not decorative.

## Phase 3 — Dashboard v2: IA rebuild on a daily-grain model (2026-06-11)
- A real rebuild (not a restyle), product renamed **ROI Engine**. New self-contained
  layer under `src/app/engine/v2/`:
  - **Daily-grain fact model** (`fact_ad_daily`, `fact_ad_segment_daily`, order-level
    `fact_orders`, `fact_search_terms_daily`) — all period totals/compares computed at
    query time.
  - **GA4-style date picker** (presets + custom dual-month + 4 compare modes),
    day/week/month granularity, URL-persisted **filters**, and the defining **3-way
    attribution lens** (platform / Shopify last-click / blended MER).
  - **All 10 insight modules** with real computed takeaways.
  - Views: Overview · Performance · Segments (11 cuts) · Revenue · Insights — divider —
    Runs · Activity · Approvals (ops wiring unchanged).
- **Demo-first, live-degraded:** the live API exposes ~30% of the model, so the analytics
  are fully realised in **demo mode** (`NEXT_PUBLIC_ENGINE_DEMO=1`, 120 days of seeded
  facts for The Astro Time) and degrade honestly in live.

## Phase 4 — Standalone single-file export (2026-06-11)
- Ported the entire v2 cockpit to **one self-contained `roi-engine-dashboard.html`**
  (inlined CSS + vanilla JS, zero deps) — a shareable artifact, syntax- and
  runtime-smoke-tested.
- **Why:** a portable reference / showcase that opens in a browser with no build.

## Phase 5 — Atlas / Terminal adaptive redesign (2026-06-11)
- Implemented a **Claude Design handoff** (`ROI Engine Dashboard.dc.html`) onto the real
  React `/engine` app: **one layout, two modes** — Light = **Atlas** (indigo, white
  panels), Dark = **Terminal** (amber, near-black) — flipped by a CSS-variable theme
  (`.eng.dark`). Old tokens aliased to the new ones so every view inherited both modes.
- Added functional chrome: **theme toggle** (persists), **⌘K command palette**, **live
  clock**, **integration status chips**, **sync ticker**, and a **Scout rail** whose
  proposed actions come from the real insight modules. **Overview rebuilt** to the design
  (divided 5-up KPI strip, blended-performance area chart, anomaly feed, campaign table).
- Polish: **density auto-scale** (`zoom` steps ≥1500px) so wide monitors aren't cramped
  at 100% browser zoom; **ROI Engine** wordmark logo.

## Phase 6 — Brand marks (2026-06-11)
- Replaced letter badges with **real Google / Meta / Shopify logos** (inline SVG) in the
  integration chips.
- Sidebar logo: the **ROI** mark (image) + "Engine" wordmark, **theme-swapped** —
  `roi-logo-blue.png` (light) / `roi-logo.png` (yellow, dark).

## Phase 7 — Deployment (2026-06-11)
- Same repo → **two Vercel projects on two accounts**:
  - `agency` (team `nishmos-projects`) → **roilabs.in** — `/engine` stays **token-gated**.
  - `roi-engine` (team `mohnishnagar-6934s-projects`, the "roi account"; token in
    `.env.local`) → **https://roi-engine-six.vercel.app/engine** with
    `NEXT_PUBLIC_ENGINE_DEMO=1` → the public demo dashboard.
- Detail + redeploy steps in the [[roi-engine-deploy]] auto-memory.

## Phase 8 — In progress (see [`ROADMAP.md`](ROADMAP.md))
The current targeting round: a clearer **source/platform division** (Overall / Google /
Shopify / Meta) wired through the primary graph, an upgraded **Revenue** section, a
**platform→campaign Runs** hierarchy with per-campaign engine runs + immediate CTAs,
**revenue-tied quick wins**, **attention highlights**, and fixes (light-mode logo + a
**yellow** light-mode primary). **Working mode: local-first — deploy only when asked.**
