# ROI Engine — Product Vision

> The strategic "why" behind the cockpit. Pair this with [`CHRONOLOGY.md`](CHRONOLOGY.md)
> (how we got here) and [`ROADMAP.md`](ROADMAP.md) (where we're going next). The
> technical alignment layer lives in [`../project-memory/`](../project-memory/INDEX.md).
> Last updated: 2026-06-11.

---

## 1. What we are building

**ROI Engine** is the operator cockpit for **ROI Labs' AI-native paid-media engine** —
the real backend that runs an AI loop — *research & intelligence → creative production →
media buying & landing pages → measurement & attribution* — on a brand's **Google Ads + Meta + Shopify**
and turns raw spend/revenue data into **revenue-tied decisions**, every one of them
governed and logged.

It is two things at once:

1. **A product** — a dashboard (`/engine`) an operator uses to see what's happening,
   judge ad performance against **Shopify revenue truth**, and approve the engine's
   proposed moves.
2. **A proof** — the audit log *is* the case study. Every read, recommendation, and
   (gated) mutation is recorded, so the dashboard itself is the evidence that the
   AI-native claim on roilabs.in is real, not a mockup.

The brand we run it on today is **The Astro Time** (astrology e-commerce): Google Ads
+ Shopify live, Meta connecting.

## 2. The core thesis — "measured in revenue, not ROAS"

Ad platforms grade their own homework: each one self-attributes the same order, so
summed platform ROAS is inflated. **Shopify is the only number that isn't.** The whole
product is built around making that contrast undeniable and *actionable*:

- **Truth vs Reported** everywhere — platform-claimed revenue beside Shopify
  `revenue_net`, with the **truth gap** called out.
- **Blended economics** as the north-star metrics: **MER** (Shopify net ÷ spend),
  **ncMER** (new-customer net ÷ spend), **nCAC** (spend ÷ new customers).
- **Three attribution lenses** the operator can switch: *platform-reported*,
  *Shopify last-click (UTM)*, *blended (MER)* — every revenue/ROAS/CPA figure
  recomputes and is labelled with the active lens.
- **Every number explains itself** — source chip, exact formula, attribution window,
  one caveat. Credibility *is* the product.

## 3. Who it's for

- **Primary (now):** ROI Labs operators running the engine on the one brand we have
  access to. Dense, fast, keyboard-driven — a trading terminal for ad spend.
- **Eventual:** growth brands (DTC / ecommerce / B2B SaaS) self-serving the engine,
  and agencies white-labelling it.
- **The case study's audience:** prospects who need proof the "AI-native, measured in
  revenue" promise is real.

## 4. Design philosophy — "an instrument panel for money"

White paper, near-black ink, hairline rules, tabular-mono numerals. Calm and dense — a
trading terminal redesigned by a Swiss studio. Two coordinated modes:

- **Atlas (light)** — premium fintech, indigo accent, white panels. The default frame:
  sidebar + topbar + a persistent insights/research rail.
- **Terminal (dark)** — Bloomberg×Linear command center, amber accent, near-black
  surfaces, mono-forward.

The **Atlas frame holds Terminal sections**: a sync ticker, a divided KPI strip, a
chart↔anomaly split, a campaign table — plus a live clock and a ⌘K command palette. One
CSS-variable theme system serves both; `.eng.dark` flips the palette. Fonts: Space
Grotesk (display) · Hanken Grotesk (UI) · JetBrains Mono (data).

## 5. What makes it credible / non-generic

- **Daily-grain data model.** Facts are stored only per day; every total, comparison,
  and chart is computed at query time → real custom date ranges + GA4-style compares.
- **10 analytical insight modules** (truth gap, MER ladder, CPA decomposition,
  diminishing returns, wasted spend, creative fatigue, day-of-week, traffic quality,
  tracking health, anomalies) — each with a real computed takeaway, not lorem.
- **Governed engine.** Nothing reaches a platform except through a non-bypassable gate
  (dry-run kill-switch, server-derived spend cap, autonomy ladder, human approval,
  append-only log written *before* acting).
- **Honest degradation.** Live API exposes ~30% of the model, so the analytics layer is
  fully realised in **demo mode** and degrades to "awaiting data" in live — never fakes
  numbers.

## 6. North star

> An operator opens ROI Engine and within ten seconds knows: *is the account winning on
> real revenue, what's the single highest-value move right now, and what does it cost to
> approve it* — then approves it in one click, with a logged, reversible trail.

Everything we build is judged against that sentence. The current roadmap
([`ROADMAP.md`](ROADMAP.md)) pushes hard on the **"highest-value move right now"** half:
per-platform/per-campaign engine runs, revenue-tied quick wins, and attention
highlights that pull the eye straight to what needs action.
