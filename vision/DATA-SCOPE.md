# ROI Labs — Data Availability & Product Scope

> Compiled 2026-06-15 from the Google Ads / Meta Marketing / Shopify Admin / GA4 API
> docs + an audit of our live connectors (`src/lib/engine/`), cross-checked against
> [`data-sources/CATALOG.md`](../data-sources/CATALOG.md) and
> [`project-memory/CONTEXT.md`](../project-memory/CONTEXT.md). The "Available to us now?"
> column was adversarially fact-checked against the connector source — green checks reflect
> what we actually extract today, not what the APIs *could* return.

ROI Labs is built on one hard idea: **Shopify is the only revenue number nobody self-reports**, so it is the denominator everything else is measured against. Today we extract that truth live (Shopify Admin API) and pair it with a live Google Ads read — but for The Astro Time, Google is the app/video funnel that carries **₹0 purchase value**, so it grades efficiency, not revenue. Meta — the funnel that actually carries Shopify purchase value and ROAS — is **code-complete but not connected** (no `META_SYSTEM_USER_TOKEN`). The result is a product that today can tell the **revenue-truth story on the Shopify side and the spend/efficiency story on the Google side, but cannot yet show platform-vs-truth reconciliation** (that lights up the moment Meta connects). Sessions, store conversion-rate, search-terms, device/geo, and reach/frequency are all genuinely **not extractable** with our current connectors — and the current dashboard shows some of them in demo mode only. This document maps exactly what each source gives us, what we can honestly build at three data tiers, and the recommended scope for both `/engine` and roilabs.in.

## Positioning recap

**"Paid media, measured in revenue. Scaled by AI."** An AI loop — **Audit → Creative → Launch → Optimize** across four disciplines (*research & intelligence · creative production · media buying & landing pages · measurement & attribution*) — runs on a brand's real Google + Meta + Shopify accounts and turns raw spend/revenue into governed, revenue-tied decisions.

- **The moat is "measured in revenue, not ROAS."** Ad platforms grade their own homework — each self-attributes the same order, so summed platform ROAS is structurally inflated. Shopify `revenue_net` is the one defensible, non-self-reported denominator. Reconciling platform-reported purchase value against actual Shopify orders is the most defensible version of the claim, and it's exactly what platforms (shipping free MCP/CLI execution rails, moving up-stack — Meta acquired Manus AI) *can't* do for themselves: cross-platform reconciliation, attribution truth, and governance.
- **North-star metrics are blended, not per-platform:** **MER** (Shopify net ÷ spend), **ncMER** (new-customer net ÷ spend), **nCAC** (spend ÷ new customers).
- **Three switchable attribution lenses:** *platform-reported*, *Shopify last-click (UTM)* — being renamed **"Last-click"** to avoid colliding with the source toggle — and *blended (MER)*. Every figure recomputes and is labelled with the active lens.
- **Every number explains itself** (source chip, formula, attribution window, one caveat). Credibility is the product.
- **Governance is non-bypassable:** dry-run kill-switch (`ENGINE_DRY_RUN=true`), server-derived global daily cap `0`, autonomy ladder, human approval, and an **append-only log written before acting**. Accounts start `read_only`; default posture is "spend nothing."
- **The audit log is the case study.** Every read, recommendation, and gated mutation lands in `engine_actions` + `engine_metrics`; the case-study page is generated *from* that log. The engine never fabricates — live exposes ~30% of the model, so the 10 insight modules degrade to "awaiting data" rather than inventing numbers.
- **Audience:** internal operators now (The Astro Time, astrology DTC) → growth brands ("For Brands") → agencies white-labelling ("For Agencies").
- **Honest correction:** "LLM search-based ads" splits into **paid** (only Google AI surfaces, Microsoft Copilot, ChatGPT self-serve) and **citation optimization / AEO-GEO** everywhere else (Perplexity killed ads; Claude/Gemini-app carry none). This is a later phase, not a current capability.

## Data availability by source

Legend for **Available to us now?**: ✅ now (our connector requests it today) · 🟡 connector-extension (API supports it, our select list doesn't request it — a code change) · 🔼 elevated-access (needs a higher API tier/scope) · ⏳ Meta-pending (populates only once the Meta token is connected) · ❌ not-available (would need a wholly new pull, or a non-Admin-API source like GA4/ShopifyQL).

### Google Ads — `GoogleConnector` (LIVE, GAQL `v21`)

For The Astro Time, Google is the **app/video install funnel**: it reports conversions but **₹0 conversion value**, and app/video campaign types return **empty age/gender** views.

| Data point | API / field | Access needed | Available to us now? | Notes |
|---|---|---|---|---|
| Campaign id / name / status | `campaign.id/name/status` | Basic | ✅ now | `REMOVED` filtered out |
| Campaign type | `campaign.advertising_channel_type` | Basic | ✅ now | SEARCH / PMAX / VIDEO / MULTI_CHANNEL (app)… |
| Daily budget | `campaign_budget.amount_micros` (÷10⁴→cents) | Basic | ✅ now | |
| Impressions, clicks | `metrics.impressions/clicks` | Basic | ✅ now | daily, per campaign |
| Spend | `metrics.cost_micros` (÷10⁴→cents) | Basic | ✅ now | stored integer cents |
| Conversions | `metrics.conversions` | Basic | ✅ now | platform-counted; ₹0-value app installs here |
| Conversion value | `metrics.conversions_value` (×100) | Basic | ✅ now | **₹0 on AstroTime Google** (app funnel) |
| CTR · CPC · CPM · CPA · ROAS · CVR | derived | — | ✅ now | computed from extracted fields |
| Funnel stage (tof/mof/bof) | parsed from campaign name | — | ✅ now | heuristic, not a Google field |
| Network segment | `segments.ad_network_type` | Basic | ✅ now | range-aggregate only (no daily) |
| Age / gender segment | `age_range_view` / `gender_view` | Basic | 🟡 empty for this account | views are requested, but Google's app/video campaign types return **no** age/gender rows for The Astro Time — we have the call, not the data |
| `all_conversions` / `all_conversions_value` | `metrics.all_conversions*` | Basic | 🟡 connector-extension | catches purchase value mislabelled as non-bidding |
| Per-day breakdown deltas | re-request breakdowns w/ `segments.date` | Basic | 🟡 connector-extension | breakdowns currently pull range total only |
| Device segment | `segments.device` | Basic | 🟡 connector-extension | not in any select list today |
| Geo segment | `geographic_view` | Basic | 🟡 connector-extension | new resource pull |
| Search terms (wasted spend) | `search_term_view.search_term` | Basic | 🟡 connector-extension | new pull; **empty for App/PMax regardless** |
| Impression share / lost-IS (budget, rank) | `metrics.search_*_impression_share` | Basic | 🟡 connector-extension | campaign-level only; derive SCALING/CAPPED from ROAS trend until then |
| Conversion-action category (isolate PURCHASE) | `segments.conversion_action_category` | Basic | 🟡 connector-extension | ≤92-day window when selected |
| Change history | `change_event` (last 30d, LIMIT ≤10k) | Basic | 🟡 connector-extension | platform-side audit to cross-ref engine log |
| Recommendations + optimization score | `recommendation`, `customer.optimization_score` | Basic | 🟡 connector-extension | read-only; never auto-subscribe (governance) |
| Unlimited ops / external multi-tenant | — | 🔼 Standard access | 🔼 elevated-access | Standard gates scale + shipping to external users, **not data categories** |
| Auction Insights / competitor domains | — | — | ❌ not-available | UI-only, never in API |
| Sub-daily / realtime metrics | — | — | ❌ not-available | finest is per-day; recent days restate (backfill) |

> Reading a real account requires a **Basic** developer token (Test serves no real ads). Standard only unlocks scale/distribution, not new data.

### Meta (Facebook/Instagram) — `MetaConnector` (CODE-COMPLETE, NOT CONNECTED)

Connector mirrors the Google read surface; nothing renders until `META_SYSTEM_USER_TOKEN` is set. For The Astro Time, Meta **is** the Shopify-store funnel, so once connected it carries **real purchase value/ROAS** and populates age/gender — the opposite of Google here.

| Data point | API / field | Access needed | Available to us now? | Notes |
|---|---|---|---|---|
| Campaigns (id, name, status, objective, daily_budget) | `listCampaigns` fields | `ads_read` + Standard | ⏳ Meta-pending | |
| Daily impressions, clicks, spend | `/insights` `spend`×100→cents, `time_increment=1` | `ads_read` + Standard | ⏳ Meta-pending | |
| Purchase conversions + value | `actions`/`action_values` (`offsite_conversion.fb_pixel_purchase` / `purchase`) | `ads_read` + Standard | ⏳ Meta-pending | **carries real ₹ revenue** (vs Google ₹0) |
| `purchase_roas` / `website_purchase_roas` | `/insights` ROAS arrays | `ads_read` + Standard | ⏳ Meta-pending → 🟡 | not in our field list even after connect — add to insights fields |
| Network breakdown | `breakdowns=publisher_platform` | `ads_read` + Standard | ⏳ Meta-pending | FB / IG / Audience Network / Messenger |
| Age / gender breakdown | `breakdowns=age` / `gender` | `ads_read` + Standard | ⏳ Meta-pending | will actually populate (Shopify funnel) |
| `inline_link_clicks`, `cpc`/`cpm`/`ctr` | `/insights` core fields | `ads_read` + Standard | ⏳ Meta-pending → 🟡 | some not in our requested fields |
| Geo / placement-position / device | `breakdowns=country/region/platform_position/impression_device` | `ads_read` + Standard | 🟡 connector-extension | breakdown not requested |
| Reach / frequency / video views | `reach`, `frequency`, `video_*_watched_actions` | `ads_read` + Standard | 🟡 connector-extension | **no creative-fatigue module even after connect** — field add required |
| Adset / ad-level metrics | `level=adset` / `level=ad` | `ads_read` + Standard | 🟡 connector-extension | we request `level=campaign` only |
| Change history (`/activities`) | `GET /act_{id}/activities` | `ads_read` + Standard | 🟡 connector-extension | platform-side audit cross-ref |
| CAPI server-side purchase recovery | `POST /{pixel_id}/events` | `ads_management` | 🟡 connector-extension | usually supplied by Shopify's native Meta integration; dedup on `event_id` |
| Custom/Lookalike audience **list** (counts) | `/customaudiences` | `ads_read` | 🟡 connector-extension | member-level PII never returned |
| Operate on arbitrary clients' accounts at scale | — | 🔼 Advanced/Full + App Review + Biz Verification | 🔼 elevated-access | not needed for own/managed AstroTime account |
| Audience member-level PII / raw per-user logs | — | — | ❌ not-available | aggregates/breakdowns only |
| Longer view-through attribution windows | — | — | ⚠ verify | Meta has been narrowing default attribution toward click-weighted windows — confirm the exact supported windows against the current Marketing API docs at connect time |
| Structured "recommendations" feed | — | — | ❌ not-available | UI-only, no clean API resource (unlike Google) |

> Meta restates recent days (attribution back-dating); confirm the current default attribution windows and data-retention limits against Meta's Marketing API docs at connect time (figures change — don't hard-code them).

### Shopify — `getRevenue()` (LIVE, REST `orders.json` `2025-10`) — the revenue source of truth

Custom single-store app (`shpat_…`) → **no app review, Level 1+2 protected fields granted on install**. Cancelled orders excluded; `current*` fields used (edit/refund-aware).

| Data point | API / field | Access needed | Available to us now? | Notes |
|---|---|---|---|---|
| Net revenue (truth) | `current_total_price`→`revenueNetCents` | `read_orders` | ✅ now | the ROAS denominator (post discount/refund/edit) |
| Gross revenue | `total_line_items_price` (fallback) | `read_orders` | ✅ now | top of gross→discount→refund→net waterfall |
| Discount amount + used flag | `total_discounts`, `discount_codes[]` | `read_orders` | ✅ now | |
| Refund amount | Σ `refunds[].transactions[]` (kind=`refund`) | `read_orders` | ✅ now | |
| Orders count, currency | order count, `currency` | `read_orders` | ✅ now | daily + total |
| AOV | net ÷ orders | — | ✅ now | derived |
| New vs returning | `customer.orders_count` (≤1→new) | `read_customers` | ✅ now (`unknown` on guest/no-scope) | current count ≈ point-in-time |
| LTV per customer | `amountSpent` / `total_spent` | `read_customers` | 🟡 connector-extension | available on Customer, not pulled today |
| UTM source/medium/campaign | parsed from `landing_site` | `read_orders` | ✅ now | null when landing URL had no UTMs |
| Last-click structured attribution | `customerJourneySummary.lastVisit.utmParameters` | `read_orders` | 🟡 connector-extension | robust upgrade over regex; async `ready` caveat |
| Products / line items | `line_items[]` (price×qty) | `read_orders` | ✅ now | not order-level allocated |
| Daily series | aggregated per `created_at` | — | ✅ now | client-side rollup |
| ncMER · nCAC · last-click split | derived | — | ✅ now | |
| Refund rate · discount % · revenue composition | derived | — | ✅ now | |
| Tax / shipping split | `total_tax`, `total_shipping_price_set` | `read_orders` | 🟡 connector-extension | pulled but not separately surfaced |
| Orders older than 60 days (deep backfill) | — | `read_all_orders` scope (**not currently granted**) | ❌ not-available | our app holds only `read_orders` + `read_customers`; deep history needs `read_all_orders`, and our poller caps at 40 pages — not wired today |
| Abandoned checkouts | `abandonedCheckouts` | `read_orders` + protected-customer-data | 🟡 connector-extension | only checkouts with contact info; **not a funnel-rate source** |
| Live feed (webhooks) | `orders/create|paid|updated|cancelled`, `refunds/create` | topic scope | 🟡 connector-extension | replaces 40-page poll; keeps net revenue truthful |
| Product COGS / margin at time-of-sale | `InventoryItem.unitCost` only | `read_inventory` + cost permission | ❌ not-available (reliable) | current cost only, often blank, not on Order → margin is an estimate |
| Inventory levels | `InventoryLevel` | `read_inventory` | 🟡 connector-extension | new pull |
| **Online-store sessions** | — (not on any Admin object) | ShopifyQL `read_reports` / GA4 | ❌ not-available | **dashboard must not claim this from Admin API** |
| **Store conversion rate / reached-checkout %** | ShopifyQL `conversion_rate` / GA4 | `read_reports` (often Plus-gated) | ❌ not-available | sessions ÷ orders; **needs GA4 or ShopifyQL, NOT Admin API** |
| Ad campaigns / bids / platform ROAS | — | — | ❌ not-available | Shopify is the ledger, not an ad platform |

### GA4 (Google Analytics 4) — NOT CONNECTED (no connector exists yet)

The only governed source for cross-channel sessions and last-non-direct attribution. All on a plain `analytics.readonly` token — **no elevated tier, no App Review**.

| Data point | API / field | Access needed | Available to us now? | Notes |
|---|---|---|---|---|
| Sessions / engaged sessions | `sessions`, `engagedSessions` (`runReport`) | `analytics.readonly` | ❌ not-available (no connector) | **the only true session denominator** |
| Cross-channel last-non-direct attribution | `sessionSource/Medium/Campaign` | `analytics.readonly` | ❌ not-available | credits last channel excl. direct |
| Default channel grouping | `sessionDefaultChannelGroup` | `analytics.readonly` | ❌ not-available | Paid Search / Paid Social / Organic / Direct — GA4-unique, unreproducible from one platform |
| Blended session conversion rate | `sessionConversionRate` / `sessionKeyEventRate` | `analytics.readonly` | ❌ not-available | ratio neither platforms nor Shopify can compute alone |
| GA4-side revenue (for reconciliation) | `purchaseRevenue`, `ecommercePurchases` | `analytics.readonly` | ❌ not-available | will **disagree with Shopify** (client-side events) — the gap is the signal |
| Landing page / device / country | `landingPage`, `deviceCategory`, `country` | `analytics.readonly` | ❌ not-available | LP-level cross-channel splits |
| Key events | `keyEvents` (renamed from `conversions`) | `analytics.readonly` | ❌ not-available | |
| Realtime (last 30–60 min) | `runRealtimeReport` | `analytics.readonly` | ❌ not-available | no revenue, no session source/medium |
| Intraday spend decisions | — | — | ❌ not-available | **24–48h latency** — reconciliation layer only, never intraday control |

> GA4 caveats to surface honestly: thresholding (`subjectToThresholding`) silently drops low-count rows; sampling + `(other)` rollups on big queries; attribution only as good as UTM hygiene on Meta/Google links.

## What we can build at each data tier

### Tier 0 — Today (Google live + Shopify live, Meta pending)

**The honest story today: Shopify revenue truth + Google spend efficiency — but no platform-vs-truth reconciliation yet.**

Dashboard features:
- **Shopify revenue cockpit (real):** net/gross/discount/refund waterfall, daily revenue series, AOV, orders, refund rate, discount %, new-vs-returning split — all from live orders.
- **Blended economics (partial):** MER, ncMER, nCAC, new-customer net — **spend denominator is Google-only today** (the only live spend source), so these are honest but Google-scoped, not yet truly blended-across-channels. Label them as such.
- **Last-click lens (real):** Shopify-side channel split from `landing_site` UTMs + unattributed %; the lens toggle works for *Last-click* and *blended (MER)*; *platform-reported* shows Google only.
- **Google efficiency views (real):** spend, clicks, impressions, CTR/CPC/CPM, conversions, network segment, funnel-stage heuristic — framed as **efficiency, not revenue** (Google = ₹0 purchase value here).
- **Truth-gap framing seeded:** show Shopify `revenue_net` as the north star; explicitly note Google reports ₹0 conversion value so its "ROAS" is undefined — this *introduces* the truth-vs-reported thesis even before Meta.

Engine capabilities:
- **Research & intelligence audit on the Google account** (real reads, ranked opportunity map) + Shopify revenue context.
- **Governed gate fully exercised:** dry-run, cap `0`, append-only log written before acting — the audit log is real and accruing in `engine_actions`/`engine_metrics` now.
- **Quick wins** derived from Google spend/efficiency trends + Shopify revenue (e.g., "spend rose, store revenue flat" alerts).

Honest Tier-0 ceiling: **no cross-platform reconciliation** (only one paid channel live, and it carries no revenue), **no Meta anything**, and **no sessions / store conversion-rate** (those need GA4/ShopifyQL). Age/gender/device/geo/search-terms are empty or not pulled.

### Tier 1 — Meta connected + Shopify extended

This is the tier where **the moat becomes demonstrable**.

Unlocked by setting `META_SYSTEM_USER_TOKEN` (own/managed account, Standard Access, no App Review) + small Shopify connector extensions:
- **Truth vs Reported, for real:** Meta `purchase_roas` / `action_values` (real ₹ revenue) shown beside Shopify `revenue_net`, with the **truth gap** called out — the headline contrast the whole product is built around. Reconcile Meta-reported purchase value against Shopify orders via last-click UTM join.
- **Genuinely blended economics:** MER/ncMER/nCAC across Google (efficiency/installs) + Meta (revenue) + Shopify (truth) — the "only honest cross-funnel number."
- **All three lenses live:** platform-reported now spans Google + Meta; Last-click and blended fully populated.
- **Meta age/gender/network breakdowns populate** (Shopify funnel) — the Segments tab finally fills.
- **Shopify extensions:** upgrade last-click to `customerJourneySummary`, surface LTV (`amountSpent`), tax/shipping split, webhooks for a live ledger.
- **Engine:** the research layer audits both platforms; reconciliation findings ("Meta claims ₹X, Shopify booked ₹Y, gap Z%") become governed recommendations and case-study material. CAPI recovery (usually via Shopify's native integration) tightens what Meta can attribute.

Still missing at Tier 1: sessions, store conversion rate, search-terms/device/geo, reach/frequency.

### Tier 2 — GA4 + full access + search-terms/device/geo + reach/frequency

The complete instrument panel.

- **GA4 connector** (new build, `analytics.readonly`): true **sessions / engaged-session** denominator → **blended store conversion rate**; **cross-channel last-non-direct attribution** and **default channel grouping** (Paid Search vs Paid Social vs Organic vs Direct on one denominator); GA4 revenue reconciled against Shopify (the delta surfaced as a measurement artifact). This is the **only** honest source for the sessions/CVR the current dashboard hints at — and it's a reconciliation layer (24–48h), never intraday.
- **Google deep reads (connector-extension):** `search_term_view` (wasted-spend hunting on Search/Shopping), `segments.device`, `geographic_view`, campaign impression-share + lost-IS (budget/rank) → real SCALING/CAPPED diagnosis instead of ROAS-trend heuristics; `change_event` + `recommendation` reads.
- **Meta deep reads (connector-extension):** reach/frequency/video-completion → **creative-fatigue module**; adset/ad-level granularity; placement-position/geo breakdowns; `/activities` change history.
- **Engine at full power:** wasted-spend pruning (search terms), creative-fatigue rotation (reach/frequency), geo/device bid logic, budget reallocation against impression-share headroom — all gated, all logged, all reconciled against Shopify truth and GA4 channel split. The case study becomes a full cross-channel reconciliation narrative.

## Feature volume map

Every feature the full data set could power, grouped, with the data dependency per feature.

**Analytics views**
- Revenue waterfall (gross→discount→refund→net) — *Shopify ✅*
- Daily revenue / orders / AOV series — *Shopify ✅*
- New-vs-returning + LTV — *Shopify ✅ / 🟡 (LTV)*
- Google efficiency (spend/CTR/CPC/CPM/conv/network) — *Google ✅*
- Meta delivery + purchase value/ROAS — *Meta ⏳*
- Age / gender / network segments — *Meta ⏳ (real) · Google ✅ (empty for app)*
- Device / geo splits — *Google 🟡 · Meta 🟡 · GA4 ❌-needs-connector*
- Search-terms / wasted spend — *Google 🟡 (none for App/PMax)*
- Reach / frequency / creative-fatigue — *Meta 🟡*
- Sessions / engaged sessions — *GA4 ❌* · ShopifyQL ❌
- Store conversion rate / funnel rate — *GA4 ❌ / ShopifyQL 🔼* (**not Admin API**)
- Default channel grouping (Paid Search/Social/Organic/Direct) — *GA4 ❌*

**Insight modules** (10 total; demo-complete, degrade to "awaiting data" live)
- Truth vs Reported / truth-gap — *Shopify ✅ + Meta ⏳ (needs both for the contrast)*
- Blended economics (MER/ncMER/nCAC) — *Shopify ✅ + spend (Google ✅ now, Meta ⏳ for true blend)*
- Last-click channel split + unattributed % — *Shopify ✅ (🟡 for structured journey)*
- Scaling/Capped diagnosis — *Google 🟡 (impression-share) · heuristic ✅ now*
- Creative fatigue — *Meta 🟡 (reach/freq)*
- Wasted-spend finder — *Google 🟡 (search terms)*
- New-customer efficiency (ncMER/nCAC) — *Shopify ✅*
- Discount/refund leakage — *Shopify ✅*
- Cross-channel attribution lens — *Shopify ✅ + Meta ⏳ + GA4 ❌ (richest at Tier 2)*
- Margin/contribution — *❌ (COGS not reliably available; estimate only)*

**Engine actions** (all behind the governance gate)
- Budget reallocation — *Google ✅ now (write) · Meta ⏳*
- Pause/launch campaigns — *Google ✅ · Meta ⏳*
- Bid/target adjustments — *Google ✅ · Meta ⏳*
- Creative rotation on fatigue — *Meta 🟡*
- Negative-keyword / wasted-spend pruning — *Google 🟡 (search terms)*
- Geo/device bid modifiers — *Google 🟡 · Meta 🟡*
- CAPI conversion recovery — *Meta 🟡 (often via Shopify integration)*

**Attribution lenses**
- Platform-reported — *Google ✅ (₹0 value) + Meta ⏳*
- Shopify Last-click (UTM) — *Shopify ✅ (🟡 structured)*
- Blended (MER) — *Shopify ✅ + spend*
- GA4 last-non-direct cross-channel — *GA4 ❌ (Tier 2)*

**Reconciliation**
- Meta purchase value vs Shopify net (truth gap) — *Meta ⏳ + Shopify ✅*
- GA4 revenue vs Shopify net (measurement artifact) — *GA4 ❌ + Shopify ✅*
- Platform conversions vs Shopify orders (last-click join) — *Shopify ✅ + Meta ⏳*
- Platform-side change log vs engine audit log — *Google `change_event` 🟡 · Meta `/activities` 🟡*

**Alerts**
- Spend up / store-revenue flat — *Google ✅ + Shopify ✅*
- Truth-gap widening — *Meta ⏳ + Shopify ✅*
- Refund/discount leakage spike — *Shopify ✅*
- Creative fatigue threshold — *Meta 🟡*
- Budget-lost impression share — *Google 🟡*
- Conversion-rate drop — *GA4 ❌*

## Recommended scope

**Build now (Tier 0 → Tier 1), defer the rest.** The positioning ("measured in revenue, not ROAS") and the data reality point to the same priority order.

1. **Connect Meta first — it is the single highest-leverage unlock.** It needs only `META_SYSTEM_USER_TOKEN` (own/managed account, Standard Access, no App Review), and it is the *only* way the truth-vs-reported contrast — the entire moat — becomes demonstrable. Until Meta lands, the product is half its thesis. This is already flagged "operator adding (Meta first)" in the credentials checklist.
2. **Ship the real Tier-0 Shopify cockpit honestly now:** revenue waterfall, blended economics labelled *Google-spend-scoped*, Last-click lens, Google efficiency framed as efficiency. Keep the truth-gap framing visible even with Google's ₹0 value.
3. **Cheap Shopify connector extensions** (high value, low cost): `customerJourneySummary` last-click upgrade, LTV, tax/shipping split, webhooks. Do these alongside Meta.
4. **Defer the GA4 connector and Google/Meta deep reads to Tier 2.** Sessions/CVR/search-terms/device-geo/reach-freq are real value but none are on the critical path to proving the core claim, and GA4 is a 24–48h reconciliation layer, not a decision driver. Build after the truth-gap story is live.
5. **Defer COGS/margin** — not reliably available from any API; treat margin as an explicit estimate or skip.
6. **Defer the AEO/GEO "LLM search" module** entirely (later phase per positioning).

**Implications for the `/engine` dashboard:**
- **Stop showing — or clearly mark as demo — any sessions / store-conversion-rate / search-terms / device / geo tile**, because we cannot extract them from current connectors (Shopify Admin API has no sessions; Google search-terms/device/geo aren't pulled). Showing them live without data is the one thing that breaks the "every number explains itself / never fabricates" promise. Either gate them behind "awaiting data — needs GA4/connector extension" or hide until Tier 2.
- **Label the blended metrics' spend scope** while only Google spend is live ("MER (Google spend only)") and flip to true blended on Meta connect.
- **Keep the lens toggle honest:** *platform-reported* = Google-only today; rename Shopify lens to **Last-click**.

**Implications for the marketing website (roilabs.in):**
- The **"measured in revenue, not ROAS"** headline is fully defensible — Shopify truth is live. Lead with it.
- **Soften "LLM search-based ads"** into the two-product split (paid where buyable + AEO/GEO elsewhere); it's a later phase, not a current capability.
- **The case study must be generated from the real `engine_actions`/`engine_metrics` log** — and today that log credibly covers Google reads + Shopify truth + governed gate. Don't claim cross-platform reconciliation results on the site until Meta is connected and the truth gap is real.
- Frame the engine's honesty (degrades to "awaiting data," never fabricates) as a credibility feature.

## Honest gaps & risks

What we **cannot truthfully claim yet**:

- **We cannot show platform-vs-Shopify reconciliation today.** It requires Meta (pending) — the one funnel that carries revenue. With only Google live (₹0 value), the truth-gap is asserted, not demonstrated.
- **We cannot extract sessions or store conversion rate from the Shopify Admin API — at all.** Any session count, store CVR, reached-checkout %, or funnel rate needs **GA4 or ShopifyQL** (ShopifyQL often Plus-gated, programmatic access inconsistent). The dashboard must not present these as live Shopify numbers.
- **We do not extract Google search-terms, device, geo, impression-share, or per-day breakdown deltas** — these are connector extensions, not current capability. And **search-terms are empty for App/PMax regardless of tier** (AstroTime's Google funnel).
- **Meta renders nothing today** — and even after connect, **reach/frequency/video (creative fatigue)** and **adset/ad-level granularity** are *not requested*, so there's no creative-fatigue module without a further field add.
- **True per-order margin/contribution is not reliably available** — COGS is only current `InventoryItem.unitCost` (often blank, not historical, not on the Order). Margin is an estimate, not truth.
- **Platform ROAS will never reconcile 1:1 with Shopify** even when everything is connected: Meta restates recent days and narrows attribution windows (verify the current windows at connect time); GA4 revenue is client-side and lags 24–48h with thresholding/sampling. We surface the gap as signal — we must not present any single number as exact.
- **Attribution is only as good as UTM hygiene** on Meta/Google links; bad UTMs misfile both the Shopify last-click lens and GA4 channel grouping.
- **Multi-tenant/agency scale needs elevated access** (Google Standard token; Meta Advanced/Full + App Review + Business Verification) — fine for The Astro Time's own/managed account, but a real gate before the "For Agencies" plan.

Relevant ground-truth files: `c:\Library\Projects\agency\src\lib\engine\connectors\google.ts`, `c:\Library\Projects\agency\src\lib\engine\connectors\meta.ts`, `c:\Library\Projects\agency\src\lib\engine\shopify.ts`, `c:\Library\Projects\agency\src\lib\engine\types.ts`, `c:\Library\Projects\agency\src\lib\engine\config.ts`, `c:\Library\Projects\agency\data-sources\CATALOG.md`, `c:\Library\Projects\agency\project-memory\CONTEXT.md`.