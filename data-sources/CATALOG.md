# Data Catalog — what we can *actually* extract

> Ground truth from the **current connectors** (`src/lib/engine/connectors/google.ts`,
> `meta.ts`, `src/lib/engine/shopify.ts`). The dashboard must show **only** these data
> points; anything else is either derivable from them, needs a connector change, or is
> Meta-pending. Last audited: 2026-06-11.
>
> Legend: ✅ extracted now · 🔶 derivable from extracted fields · 🟡 needs connector
> extension (API supports it, we don't request it yet) · ⏳ Meta pending · ❌ not available.

---

## 1. Google Ads — `GoogleConnector` (LIVE)

Auth: OAuth2 refresh token. Reads via GAQL `googleAds:searchStream`.

### 1a. Campaigns — `listCampaigns()`
GAQL: `campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type, campaign_budget.amount_micros`

| Field | Notes |
|---|---|
| `externalId` (campaign.id) | ✅ |
| `name` | ✅ |
| `status` | ✅ ENABLED/PAUSED/… |
| `objective` (advertising_channel_type) | ✅ SEARCH / PERFORMANCE_MAX / SHOPPING / DISPLAY / VIDEO … → our **campaign type** |
| `dailyBudgetCents` (amount_micros ÷ 10⁴) | ✅ |

### 1b. Performance — `getMetrics(days)` — **DAILY, per campaign**
GAQL: `campaign.id, segments.date, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.conversions_value`

| Field | Notes |
|---|---|
| `date` | ✅ daily |
| `impressions`, `clicks` | ✅ |
| `spendCents` (cost_micros ÷ 10⁴) | ✅ |
| `conversions` | ✅ platform-counted |
| `conversionValueCents` (conversions_value × 100) | ✅ **platform-reported revenue** |
| CTR, CPC, CPM, CPA, **platform ROAS**, CVR | 🔶 derived from the above |
| **funnel stage** (tof/mof/bof) | 🔶 parsed from campaign name (heuristic) |

### 1c. Breakdowns — `getBreakdowns(days)` — **RANGE-AGGREGATE (not daily), per campaign**
Three independent GAQL views, each with the metrics above:

| Dimension | Source view | Status |
|---|---|---|
| **Network** (ad_network_type) | `campaign` + segments.ad_network_type | ✅ Search / PMax / YouTube / Display / … |
| **Gender** | `gender_view` | ✅ |
| **Age** | `age_range_view` | ✅ |

### 1d. NOT available from Google today
❌ search terms · ❌ device · ❌ geo · ❌ impression share / lost-IS (budget/rank) ·
❌ daily segment data (breakdowns are range-totals only) · ❌ placement beyond network.

---

## 2. Shopify — `getRevenue(days)` (LIVE, **EXTENDED 2026-06-11**)

Auth: Admin API token, scopes `read_orders` **+ `read_customers`** (for new-vs-returning).
Pulls `/orders.json` paginated; now requests the full field set and parses each order into
a **`ShopOrder` fact** (returned as `orderList`), so live + demo run through the same
metrics. `fields=id,created_at,current_total_price,total_price,total_line_items_price,
subtotal_price,total_discounts,currency,cancelled_at,landing_site,customer,discount_codes,
refunds,line_items`. Cancelled orders excluded.

| Data point | Field(s) | Status |
|---|---|---|
| Orders count, currency | — | ✅ daily + total |
| **Revenue (net)** | `current_total_price` | ✅ daily + total (truth number) |
| **Gross / discount / refund** | `total_line_items_price` · `total_discounts` · Σ `refunds[].transactions[]` | ✅ → revenue composition, refund rate, discount-assisted |
| AOV | net ÷ orders | 🔶 |
| **New vs returning** | `customer.orders_count` (≤1 = new) | ✅ → ncMER, nCAC, new/returning split |
| **UTM source/medium/campaign** | parsed from `landing_site` query | ✅ → Shopify last-click lens, channel split, unattributed % |
| **Products / line items** | `line_items[]` (title, qty, price) | ✅ → top products |
| Daily series | `{date, orders, net, gross, discount, refund}` | ✅ |

> Caveats: new-vs-returning uses *current* `orders_count` (approx at order time);
> `customerType="unknown"` when `customer` is absent (guest / no `read_customers`). UTMs
> exist only when the landing URL carried them → orders without are the real "unattributed".
> Net uses `current_total_price` (reflects refunds/edits); gross−discount−refund ≈ net up to
> tax/shipping. **Still NOT from Shopify:** product cost/margin, inventory.

---

## 3. Meta — `MetaConnector` (⏳ PENDING — not connected)

When the Marketing API access lands, the connector will extract (same shape as Google):

| Data point | Field | Status |
|---|---|---|
| Campaigns | id, name, status, objective, daily_budget | ⏳ |
| Performance (daily, per campaign) | impressions, clicks, spend, purchase conversions + value (from `actions`/`action_values`) | ⏳ |
| Breakdowns (range-aggregate) | network = **publisher_platform** (FB/IG/Audience Network), age, gender | ⏳ |
| reach / frequency / video views | not requested by the connector | ❌ even on connect → no creative-fatigue module |

---

## 4. Dashboard data-point availability matrix

What each dashboard element needs vs. what we have. **Only ✅/🔶 should render with real
data; the rest must be hidden or shown as a "needs X" pending state.**

| Dashboard element | Needs | Status now |
|---|---|---|
| Spend | Google (+Meta) cost | ✅ |
| Platform-reported revenue / ROAS / conversions | conversions_value | ✅ |
| CTR · CPC · CPM · CPA · CVR | impr/clicks/cost/conv | 🔶 |
| Shopify revenue · orders · AOV (daily) | getRevenue | ✅ |
| **MER** (Shopify ÷ spend) | both | ✅ |
| **Truth gap** (platform value ÷ Shopify) | both | ✅ |
| Daily spend-vs-revenue trend, MER trend | both daily | ✅ |
| Segments: Platform / Campaign type / Funnel | campaigns | ✅ / 🔶 |
| Segments: Network / Age / Gender | Google breakdowns (range-agg) | ✅ (no per-day delta) |
| Segments: Device / Geo / Placement | — | ❌ (Placement ⏳ via Meta) |
| **ncMER · nCAC · new-vs-returning** | Shopify `customer.orders_count` | ✅ (extended) |
| **Shopify last-click lens / channel split / unattributed %** | Shopify UTMs (`landing_site`) | ✅ (extended) |
| Revenue composition (gross/discount/refund) · refund rate · discount % | Shopify discounts/refunds | ✅ (extended) |
| Top products | Shopify `line_items[]` | ✅ (extended) |
| Insight: Truth gap · CPA decomposition · Diminishing returns · Day-of-week · Anomalies | extracted daily metrics | ✅ |
| Insight: MER ladder (MER + ncMER) | MER + Shopify new-customer | ✅ (extended) |
| Insight: Traffic quality by source · Tracking health | Shopify UTMs | ✅ (extended) |
| Insight: Wasted spend (search terms) | Google search terms | ❌ not extracted |
| Insight: Creative fatigue (reach/freq) | Meta reach/freq | ❌ not extracted |
| Segments: Device / Geo | — | ❌ not extracted |
| Campaign status SCALING/CAPPED (impression share) | lost-IS | ❌ → derive status from ROAS/spend trend instead |

### Attribution lens reality (after Shopify extension)
- **Platform-reported** ✅ · **Blended (MER)** ✅ · **Last-click (Shopify UTM)** ✅ — all
  three lenses are now real. (Lens "Shopify" renamed **"Last-click"** to avoid colliding
  with the *source* toggle's "Shopify".)

### Still genuinely NOT extractable (would each be a new pull, not just a field add)
❌ Google **search terms** (wasted-spend) · ❌ Google **device / geo** segments · ❌ Meta
**reach / frequency / video** (creative fatigue) · ❌ Google **impression share / lost-IS**
(use ROAS/spend-trend-derived campaign status instead).
