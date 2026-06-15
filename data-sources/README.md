# data-sources/

The **raw-data layer** for ROI Engine: exactly what each source gives us, and where the
raw extracts are stored. This is the contract the dashboard must obey — *show only what's
in here.*

## Files
- [CATALOG.md](CATALOG.md) — **the ground truth**: every field each connector extracts,
  what's derivable, what needs a connector change, and a dashboard availability matrix.
- [raw/](raw/) — stored **raw extracts** from the live sources (one file per source/pull),
  plus `*.sample.json` showing the exact shape. See [raw/README.md](raw/README.md).

## The one decision that drives everything: **trim vs extend**

The demo dataset (`src/app/engine/v2/demo-data.ts`) currently fabricates richer data than
the connectors return (UTMs, new/returning, refunds, discounts, products, search terms,
device/geo). Two ways to make the dashboard honest:

1. **Trim to current** — show only ✅/🔶 from the catalog; hide or mark "needs X" for the
   rest. Fastest; the dashboard becomes 100% truthful about *today's* connectors.
2. **Extend the connectors** — most of the missing Shopify data (UTMs, new/returning,
   refunds, discounts, products) **is available in the Shopify Orders API**; capturing it
   is a `getRevenue` change, not a new integration. This keeps the richer dashboard and
   makes it real.

**DECISION (2026-06-11): extend first.** ✅ **Shopify connector extended** —
`getRevenue()` now pulls customer (new/returning), UTMs (`landing_site`), refunds,
discounts, and line-items, returning order-level `ShopOrder` facts. So ncMER/nCAC,
last-click attribution, channel split, unattributed %, revenue composition, refund rate,
and top products are now **real**. The dashboard is built on this richer-but-real data.
Still genuinely out of scope (each a new pull, not a field add): Google **search terms**,
Google **device/geo**, Meta **reach/frequency** → those modules stay hidden / pending.

## What's real today (the honest core)
Spend · platform-reported revenue/ROAS/conversions · CTR/CPC/CPM/CPA/CVR · Shopify
revenue/orders/AOV (daily) · **MER** · **truth gap** · Network/Age/Gender breakdowns
(Google, range-aggregate) · insights: truth-gap, CPA-decomposition, diminishing-returns,
day-of-week, anomalies. Meta fills the platform side on connect.

## How raw data flows
`connectors/*.ts` → API routes (`/api/engine/{campaigns,breakdowns,revenue,status,runs}`)
→ (when dumped) `data-sources/raw/`. The engine reads live; raw snapshots are stored here
for inspection, reconciliation, and to seed honest demo data. **No secrets** ever land in
this folder — only the returned data shapes.
