# data-sources/raw/

Stored **raw extracts** from the live sources, plus `*.sample.json` files that show the
**exact shape** each connector returns (field names + units). The dashboard's honest data
model is derived from these shapes — see [../CATALOG.md](../CATALOG.md).

## Files (sample shapes — exact field names/units, illustrative values)
- `google-campaigns.sample.json` — `GoogleConnector.listCampaigns()` → `CampaignSummary[]`
- `google-metrics-daily.sample.json` — `getMetrics(days)` → `MetricRow[]` (per campaign, **daily**)
- `google-breakdowns.sample.json` — `getBreakdowns(days)` → `BreakdownRow[]` (network/age/gender, **range-aggregate**)
- `shopify-revenue.sample.json` — `getRevenue(days)` → `ShopRevenue` (daily orders + revenue + AOV)
- `meta-insights.sample.json` — ⏳ pending; the shape Meta will return on connect

## Live dumps
When we snapshot real data, drop it here named `<source>-<kind>-<YYYY-MM-DD>.json`
(e.g. `shopify-revenue-2026-06-11.json`). Units: money in **cents** (paise), dates
`YYYY-MM-DD`. **No secrets** — only returned data. If you don't want real revenue numbers
committed, add `data-sources/raw/*-20*.json` to `.gitignore` (samples stay tracked).

> A future `/api/engine/raw?source=...` dump route (or a small script) can write these
> automatically; for now they're created on demand.
