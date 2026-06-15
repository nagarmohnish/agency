# Overview — objective, use case, audience

## What this project is

Two things in one repo:

1. **The marketing site** — roilabs.in, a Next.js app on Vercel. Positions ROI
   Labs as an **AI-native paid-media agency**: "Paid media, measured in revenue.
   Scaled by AI." The homepage sells an **AI-native engine** running a **loop**
   (Audit → Creative → Launch → Optimize) across four disciplines — *research &
   intelligence · creative production · media buying & landing pages · measurement
   & attribution*. (Named agents — Scout/Forge/Pilot/Frame/Signal — were retired
   from customer-facing copy; they survive only as internal engine/DB roles.)

2. **The engine** (new) — the *real* backend that makes that promise true on a
   real brand's Google + Meta ad accounts. It runs that loop, governs
   every action behind a safety gate, and logs every decision. The goal is a
   **real, documented case study** proving the steps the website claims.

## The core objective

> Build a product that **verifies the solutions ROI Labs advertises** — by running
> the 5-step loop on a real ad account and producing a genuine case study from
> what actually happened (not a mockup).

## Use case

- An operator connects a brand's Google + Meta accounts.
- The research & intelligence layer audits them and produces a ranked opportunity map (Step 1).
- The engine proposes creative, launches, and optimizes — every spend-affecting
  action gated behind human approval and a spend cap.
- The `/engine` dashboard shows it all; the audit log becomes the case study.

## Audience

- **Primary (now):** ROI Labs itself — internal operators running the engine on
  the one brand we have access to. The `/engine` cockpit is for them.
- **Eventual:** growth brands (DTC, B2B SaaS, ecommerce) (the "For Brands" plan)
  and agencies wanting a white-labeled engine (the "For Agencies" plan).
- **The case study's audience:** prospects who need proof the AI-native claim is real.

## What "done" looks like for v1

A real account connected, an audit run that reads true, the full launch path
exercised (paused, $0), then a small capped real-spend pilot — and a case-study
page generated from `engine_actions` + `engine_metrics`.

## Honest scope note (positioning correction)

The site says "LLM search-based ads." Research (June 2026) found: buyable AI-search
ads are real only on **Google AI surfaces, Microsoft Copilot, and ChatGPT
(self-serve)**; **Perplexity killed its ads program**; everything else is
**AEO/GEO** (earning citations, measurable share-of-voice). The agreed direction
is to **split the claim**: paid where buyable + citation optimization elsewhere.
This module is a later phase. See [CONTEXT.md](CONTEXT.md).
