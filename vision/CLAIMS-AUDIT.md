> Generated 2026-06-15 by a 5-agent audit workflow (extract marketing claims · product reality · ground truth → synthesize → adversarial verify). The verification pass refined two findings — see "Verification notes" at the end before acting.

# ROI Labs — Marketing ↔ Product Alignment Audit

The marketing site sells a fully-operational, multi-channel, end-to-end paid-media engine; the product is a single-brand pilot cockpit running on **rich dummy data** with two genuinely live connectors (Google Ads + Shopify) and a real governed audit log. The biggest gaps: (1) **Meta is sold as "Live" everywhere** but is code-complete-not-connected — and Meta is the *only* revenue/ROAS funnel for the live brand, so the headline "measured in revenue" is currently backed by Shopify alone, not by Meta spend tied to revenue. (2) **GA4/server-side attribution is shown "Connected"** on the homepage/Demo but no connector exists — and Shopify Admin API *cannot* yield sessions or store CVR at all. (3) **"For Brands" and "For Agencies" plans + white-label** are named but unbuilt, and white-label is hard-blocked behind elevated platform access the product doesn't hold. (4) **Creative-at-volume ("60+ creatives/mo", static/motion/UGC)** has zero product surface — no creative is generated, shown, or tested anywhere in the cockpit. (5) **"LLM search-based ads"** is materially overstated against the buyable reality. What *is* honestly aligned: the "revenue, not ROAS" thesis (Shopify truth is live), the two-funnel CPI-vs-ROAS logic, the governance/approvals moat, and the function-label (non-named-agent) framing.

## Mismatch table

| Claim (marketing) | Product backing | Ground truth | Verdict | Severity |
|---|---|---|---|---|
| "We run Meta and Google end-to-end" (SEO/OG, FAQ) | Meta connector coded but **not connected**; all Meta figures `modeled *`. Google live. | Meta is "CODE-COMPLETE, NOT CONNECTED… nothing renders until token is set." "Until Meta lands, the product is half its thesis." | ❌ mismatch | high |
| Meta Ads — **"Live"** badge (Integrations.tsx) | Meta renders nothing live; awaiting System-User token. | Meta status = not connected. | ❌ mismatch | high |
| "GA4 + server-side · Connected" (HIW Phase 03); "GA4, server-side tracking" live (Demo) | **No GA4 connector exists.** Shopify CVR/sessions are `GA4 *` placeholders. Integrations.tsx itself badges GA4 "Coming soon." | "No connector exists yet"; "cannot extract sessions or store CVR from Shopify Admin API — at all." | ❌ mismatch | high |
| "Pixel & CAPI · Connected" (HIW Phase 03) | Pixel/CAPI is Meta-side; Meta not connected. | Pixel purchase actions coded in `meta.ts`, inert until Meta connects. | ❌ mismatch | high |
| "60+ creatives produced & tested / month"; "static, motion, UGC at a volume no studio can match" | **No creative generation/display/testing anywhere in the cockpit.** | Creative production is a marketing-loop discipline, not a live capability. Insight "creative fatigue" module is demo-only and needs Meta + extra fields. | ❌ mismatch | high |
| "AI drafts and tests creative at scale" (SEO/OG); "tested at the asset level" | No asset-level creative testing surface in product. | Not built. | ❌ mismatch | high |
| "Landing pages & CRO included"; "we ship landing pages that convert" | No landing-page / CRO feature, builder, or output in the cockpit. | Not present in any inventory of live capability. | ❌ mismatch | high |
| "We white-label the whole engine" (hero, FAQ, For Agencies plan) | No client branding/white-label; `atlas`/`aurora` are internal skins, not tenant themes. | White-label "gated by access the product does not have" (Google Standard token; Meta Advanced + App Review + Business Verification). "A real gate before the 'For Agencies' plan." | 🔜 promised-but-future | high |
| "For Brands" / "For Agencies" — "Two ways to work with us" | No plans, tiers, billing, or multi-tenant buyer surface in product. | Plans are "ASPIRATIONAL, not live"; real audience now is "ROI Labs itself — internal operators." | 🔜 promised-but-future | high |
| "Paid media, measured in revenue" (H1) | Revenue truth = live Shopify net. But blended/MER spend is **Google-only**; Meta (the revenue funnel) not connected. | "Fully defensible — Shopify truth is live," BUT MER is "Google-scoped, not yet truly blended"; doc says label "MER (Google spend only)." Google funnel = ₹0 store value. | ⚠ partial/overstated | high |
| "every dollar of spend back to revenue — not ROAS"; "attribution that ties every dollar to revenue" (Demo, GA4 card) | Attribution = Shopify last-click UTM only; no GA4; no platform-vs-truth reconciliation. | "We cannot show platform-vs-Shopify reconciliation today"; "truth-gap is asserted, not demonstrated." | ⚠ partial/overstated | high |
| "store revenue reconciled to Shopify… not vanity metrics" (Integrations hero) | Shopify net is real; reconciliation *against platforms* lights up only when Meta connects. | "platform-vs-truth reconciliation lights up the moment Meta connects." | ⚠ partial/overstated | high |
| "researches, produces, launches, and optimizes… runs itself" (hero); "An engine, not a campaign" | Governed loop (Audit→Creative→Launch→Optimize) is real backend; but Creative produces nothing, and writes default to dry-run / read-only / cap 0. | Loop + governed gate real and accruing; engine "proposes, not unilaterally spends." Creative discipline not live. | ⚠ partial/overstated | med |
| "bids and budget managed automatically"; "optimized daily by AI" | Google mutations coded behind gate; default `ENGINE_DRY_RUN=true`, global cap `0`, accounts `read_only`. | Writes are real but gated/off by default ("spend nothing"). Not running unattended today. | ⚠ partial/overstated | med |
| "Optimized daily by AI, reviewed weekly by senior operators" | Approvals/Runs path real in `ops.tsx`; v3 cockpit static. Single brand. | Real audit log accruing; single-brand pilot, operator-driven. | ⚠ partial/overstated | med |
| Google Ads — **"Live"** (Integrations) | Google connector live for The Astro Time. | LIVE — but app/video **install** funnel: ₹0 conversion value, empty age/gender. | ✅ aligned (with caveat) | low |
| Google "Search + PMax" / "Search, Performance Max, app-install and YouTube" (HIW, Integrations) | Live account is the **app/video install** funnel. | "App/video campaign types"; search-terms empty for App/PMax regardless of tier. | ⚠ overstated | med |
| Shopify — **"Live" (featured)**; "revenue source of truth" | `shopify.ts` live: orders, net/gross/discount/refund, AOV, products, new-vs-returning. | LIVE and defensible. (Caveat: `read_orders` only, no deep >60-day backfill, poller caps 40 pages.) | ✅ aligned | low |
| Audit pillars: "GA4, the pixel, CAPI, server-side — can you even measure" | /audit scores *public* signals; product can't itself extract these. (Audit is a separate lead tool, scoring prospects.) | Consistent as a prospect-scoring tool; only risk is implying ROI Labs has these wired. | ⚠ partial | low |
| /audit: "branded PDF… in minutes," "competitor teardown up to 3," overall letter grade | No audit-PDF generator present in product inventory; mock shows "B+". | Not in product-reality inventory; cannot confirm live PDF/teardown pipeline. | ⚠ unverified/likely-future | med |
| "Revenue & CAC reporting, weekly"; "MER, CAC, contribution margin… on your P&L" (plan, Demo) | MER/ncMER/nCAC computed (Google-spend-only). **Contribution margin not reliably available.** | "Margin is an estimate, not truth (COGS not reliably available)." MER blend Google-only. | ⚠ overstated | med |
| "LLM search-based ads" (positioning) | No LLM-ads capability in product. | Buyable only on Google AI surfaces, Copilot, ChatGPT (no API); "Perplexity abandoned ads." "Later phase, not current capability"; soften the claim, defer AEO/GEO. | ❌ mismatch | high |
| "Live in under two weeks… attribution clean from day one" (Demo, FAQ) | Onboarding speed unproven in product; attribution = UTM-dependent, no day-one cross-channel truth. | "Attribution only as good as UTM hygiene"; no day-one reconciliation. | ⚠ overstated | med |
| Demo testimonials ("−47% CAC", "$284K net new", Priya M. et al.) | Illustrative/placeholder; not attributed to verifiable clients. | One live brand (The Astro Time); no client results inventory. | ⚠ overstated | med |
| HIW/audit mock numbers ("31% at risk", "3.2x ROAS", "B+") | Demo-seeded from PRNGs, scaled by date factor. | Demo data; honesty markers required to distinguish live vs modeled. | ✅ aligned (if labeled "illustrative") | low |
| "measured by the outcome that matters — revenue, installs, or leads" (footer, popup) | Two-funnel logic (ROAS for store, CPI for app) is the product's real spine. **"Leads" funnel has no live backing** (no CRM connector). | D17 H1 correction matches "revenue, installs, or leads." CRM/HubSpot/LinkedIn pipeline = all "Coming soon." | ⚠ partial | med |
| "Agents propose, not spend"; governance / approvals / ₹6K cap | `governance.ts` fully implemented: 4 autonomy levels, dry-run, cap = min(account, global). | Real and accruing; the product's core moat. | ✅ aligned | low |
| Named-agents dropped; "AI / the engine" everywhere | Marketing uses function labels; v3 cockpit de-named (D16). | Matches D16. | ✅ aligned | low |
| CRM-pipeline claims: HubSpot "quality pipeline," LinkedIn "tied to pipeline" | All CRM connectors "Coming soon"; no pipeline data. | GA4/HubSpot/Salesforce/etc. deferred (Tier 2). | 🔜 promised-but-future | med |
| Connector breadth: TikTok/LinkedIn/Pinterest/Snapchat/Woo/HubSpot/SF/GHL/Pipedrive/Airtable | None built; factory only switches Google/Meta. | Correctly badged "Coming soon" — honest. | ✅ aligned (labeled) | low |

## Findings by category

**FEATURES.** The widest divergence. Marketing presents a four-discipline engine — research, creative-at-volume, launch + landing pages, daily optimization — as operational. The product backs **two of four**: the Audit/research layer (real Google reads + Shopify context + ranked opportunities) and the measurement layer (Shopify net, MER, last-click). The **Creative discipline has no product surface at all** — "60+ creatives/month," "static/motion/UGC," "tested at the asset level" describe an output the cockpit never produces or displays. **Landing pages & CRO** likewise have no builder or artifact. "Bids and budget managed automatically… optimized daily" is technically real (Google mutations exist) but defaults to dry-run / read-only / cap-0 ("spend nothing"), so unattended daily optimization isn't happening yet. The genuinely strong feature — the governed approval gate — is *under*-marketed relative to its actual completeness.

**OFFERINGS.** Marketing sells a two-sided commercial product ("Two ways to work with us," For Brands + For Agencies, white-label, budget tiers, "fee credited to engagement"). The product has **no pricing, plans, billing, or tenant model** — it's a single-operator, token-gated cockpit for one internal brand. White-label is not merely unbuilt; it's **blocked behind elevated Google/Meta access (Standard token, App Review, Business Verification)** the company doesn't hold. The plans aren't lies, but they're roadmap presented in the present tense.

**POSITIONING.** Strong alignment on the *thesis*. "Paid media, measured in revenue. Scaled by AI," the "revenue, not ROAS" moat, the two-funnel honesty (ROAS for store, CPI for app), and the retirement of named agents in favor of "the engine" all match ground truth. The overstatement is in *scope*: the H1 reads as a fully-delivered, cross-channel, autonomous system, when today it's a Shopify-truth + Google-efficiency pilot with the revenue-bearing channel (Meta) still dark. "A team that never logs off" / "runs itself" oversells autonomy that is deliberately gated off.

**CHANNELS/INTEGRATIONS.** Two surfaces contradict each other. **Integrations.tsx is honest** (only Google, Meta… wait — Meta is wrongly badged Live; Shopify Live; everything else "Coming soon"). The **homepage/Demo are not**: they assert "Meta and Google end-to-end" and "GA4 + server-side · Connected." Reality: Google live (install funnel, ₹0 value), Shopify live, **Meta connected nowhere**, **GA4 connector nonexistent**. The single most damaging line is Meta's "Live" badge plus "We run Meta and Google end-to-end," because Meta is the *only* path to the revenue/ROAS story the whole site is built on.

**MEASUREMENT/DATA.** The defensible core ("Shopify is the only number nobody self-reports") is real and live. Everything layered on top is overstated: **MER is Google-spend-only** (must be labeled as such), **contribution margin is an estimate** (COGS unavailable) yet sold as "the numbers on your P&L," **sessions and store CVR cannot come from Shopify** (shown as `GA4 *` placeholders while GA4 isn't connected), and **platform-vs-Shopify reconciliation — the headline differentiator — cannot be demonstrated today** ("asserted, not demonstrated"). The product's own honesty markers (`modeled *`, `est`, "Meta isn't connected yet") are more truthful than the marketing site.

## The honest gaps (highest-risk overclaims)

1. **Meta as a live channel.** Badged "Live" and "end-to-end" across the site; actually code-complete-not-connected. Highest risk because Meta is the live brand's *only* revenue/ROAS funnel — without it, "measured in revenue" is half-delivered.
2. **GA4 / server-side / "Pixel & CAPI · Connected."** Shown wired on homepage and Demo; **no GA4 connector exists**, and Shopify Admin API *cannot* return sessions/CVR. The site presents modeled placeholders as connected truth.
3. **Platform-vs-truth reconciliation.** The whole "ad platforms grade their own homework, we don't" moat is **asserted, not demonstrated** — it requires Meta. Today the cockpit reconciles nothing against platforms.
4. **Creative at volume, in-product.** "60+ creatives/mo, static/motion/UGC, tested at the asset level" — no generation, display, or testing surface exists anywhere in the cockpit.
5. **Multi-connector breadth implied as near-term.** 11 "Coming soon" connectors plus "if revenue flows through it, we can measure against it" implies imminent breadth; only Google + Shopify + (pending) Meta are real, and the factory only switches Google/Meta.
6. **Agency / white-label plans.** Sold in the present tense; unbuilt *and* blocked behind elevated platform access (App Review, Business Verification) not yet held.
7. **Contribution margin / "numbers on your P&L."** COGS not reliably available — margin is explicitly an estimate, not truth.
8. **"LLM search-based ads."** Buyable only on a few surfaces (Google AI, Copilot, ChatGPT UI; no API), Perplexity dropped ads; this is a later phase, not a capability.
9. **Testimonials / hard results** ("−47% CAC," "$284K net new," named clients) presented as social proof from a single-brand pilot.
10. **"Leads" funnel.** Marketed as a measured outcome ("cost-per-lead," CRM-tied pipeline) with no CRM connector live.

## Recommendations

Prioritized; each maps to a mismatch with the chosen fix (copy / build / reframe).

**P0 — fix now (false "connected/live" claims, lowest effort, highest liability):**
1. **Meta "Live" badge → "Coming soon" / "Connecting"** on Integrations.tsx. *(Copy fix.)*
2. **Drop "We run Meta and Google end-to-end"** from SEO/OG/Twitter/FAQ → "We run Google paid media end-to-end today; Meta is connecting." *(Copy fix / reframe.)*
3. **Remove "GA4 + server-side · Connected" and "Pixel & CAPI · Connected"** from HIW Phase 03 and the Demo "live attribution" copy → "Attribution: Shopify last-click today; GA4 + server-side on the roadmap." *(Copy fix.)* This also resolves the homepage↔Integrations contradiction.
4. **Reframe "every dollar tied to revenue / reconciled to Shopify"** → "Store revenue measured against live Shopify truth; cross-platform reconciliation lands with Meta." *(Reframe.)*

**P1 — reframe overstated scope (keep the thesis, qualify the delivery):**
5. **H1 stays**, but add the live-scope qualifier already blessed by D17 ("revenue, installs, or leads") and avoid implying full autonomy; soften "runs itself" → "runs the loop, you approve the spend" (also showcases the real governance moat). *(Reframe + promote a real strength.)*
6. **Label MER honestly**: "MER (Google spend today; blended as Meta connects)." *(Copy fix.)*
7. **"Contribution margin… on your P&L"** → "revenue, CAC, and MER… with margin as an estimate where COGS is available." *(Copy fix.)*
8. **Google "Search + PMax"** → reflect the live install/app-video funnel, or genuinely caveat that search/PMax breakdowns aren't extracted yet. *(Reframe.)*
9. **"LLM search-based ads"** → "paid placement where AI search is buyable, plus AEO/GEO citation optimization" and mark as roadmap. *(Reframe per D7.)*

**P2 — move plans/features to roadmap framing (or build):**
10. **For Agencies / white-label**: add "Early access" / "On the roadmap," or gate behind a waitlist, until elevated access is secured. Don't sell present-tense. *(Reframe; build is multi-quarter.)*
11. **For Brands plan claims that have no product surface** — "60+ creatives/mo," "Landing pages & CRO included" — either **mark as service deliverables** (if done by operators off-product) or **reframe as roadmap**. Do not imply they're shown in-product. *(Reframe; or build the creative/LP surfaces.)*
12. **CRM/pipeline + "leads" outcome**: keep "Coming soon" on Integrations; on homepage, stop implying live cost-per-lead/pipeline until a CRM connector exists. *(Copy fix.)*

**P3 — credibility hygiene:**
13. **Testimonials/hard numbers**: relabel Demo testimonials and HIW/audit figures as "Illustrative" (the cockpit already does this in its own footer), or replace with The Astro Time results you can actually defend. *(Copy fix.)*
14. **/audit PDF + competitor teardown**: confirm the generator/teardown pipeline actually ships a PDF; if not yet live, change "in minutes" to set correct expectations. *(Verify, then copy/build.)*

**Where marketing already matches product — leave alone:** the "revenue, not ROAS" thesis (Shopify live), the two-funnel ROAS-vs-CPI logic, the governance/approval/₹-cap moat, the "AI / the engine" function-label framing, and the correctly "Coming soon"-badged long tail of connectors. These are the assets to lead with while the overclaims above are corrected.

Relevant files for any copy fixes: `c:\Library\Projects\agency\src\app\AuroraHome.tsx` (hero, HIW, plans, FAQ, footer), `c:\Library\Projects\agency\src\app\integrations\Integrations.tsx` (Meta badge, connector list), `c:\Library\Projects\agency\src\app\layout.tsx` + `c:\Library\Projects\agency\src\app\page.tsx` (SEO/OG "Meta and Google end-to-end"), `c:\Library\Projects\agency\src\app\Demo.tsx` (GA4-live + testimonials), `c:\Library\Projects\agency\src\app\AuditPage.tsx` (PDF/teardown promises).
---

## Verification notes (adversarial pass — apply these to the report above)

Now I have the key facts. The cockpit has a "Landing pages" agent (line 167) and Activity log entries for both creative shipping and CRO variant publishing. So the report's claims that creative and landing-page/CRO have "zero product surface" / "no builder or artifact" are partly false — there ARE display surfaces (all modeled/dummy), though no actual generation. Let me note the nuance carefully.

Now let me verify the remaining items I want to nail down: the "leads" funnel claim, MER labeling in product, and whether the ground truth actually supports the report on a couple of items. Let me check the ground truth's exact wording on a few report claims that I want to confirm aren't overstated by the report itself. I have enough from the inventories already provided inline. Let me verify one thing — whether the marketing inventory's "leads" claims have any "Coming soon" hedge that the report missed, and double-check the GA4 homepage vs integrations contradiction is real.

I have sufficient evidence. Let me compose the corrections.

Based on the source inventories and direct verification of `v3.tsx`, here are the material corrections.

---

## False positives to drop

**1. "Creative at volume has *zero product surface* — no creative is generated, shown, or tested anywhere in the cockpit." (and the related "no asset-level creative testing surface in product")**

This is overstated to the point of being wrong on the "shown/tested" half. The product inventory itself lists creative surfaces, and `v3.tsx` confirms multiple:
- A loop step: `{ phase: "Creative", agent: "Creative production", detail: "Shipped 6 variants to asset-level testing", status: "done" }` (v3.tsx:310) — i.e. an explicit **asset-level testing** surface.
- An Approvals card: `"Publish 3 UGC variants" … "3 assets" … "AI-disclosed"` (v3.tsx:332).
- An Activity entry: `"shipped 8 creative variants to" "Testing"` (v3.tsx:323).
- A Meta **"Creative performance — top ads by ROAS"** table with named UGC/Static/Motion creatives (v3.tsx:400-403, 797-811).
- The product inventory's own Meta description: "creative-fatigue tiles," and the Insights doc lists a "creative fatigue" module.

The defensible claim is narrower: **no creative is actually *generated* by the cockpit, and every creative figure is `modeled *`/dummy** (ground truth: "no creative-fatigue module without a further field add"; creative is a marketing-loop discipline). So the correct verdict is "display surface exists but is modeled/dummy, no generation" — not "zero product surface." The report's P2 recommendation even concedes creative may be an off-product operator deliverable, which contradicts its own "zero surface" finding.

**2. "Landing pages & CRO … have no builder, output, or artifact in the cockpit." ("no landing-page/CRO feature, builder, or output")**

Same error. `v3.tsx` defines a dedicated **"Landing pages"** agent (v3.tsx:167, short "LP") and an Activity entry: `["Landing pages", "published CRO variant B on", "Consultation LP", "1d ago", "auto"]` (v3.tsx:325). There is a CRO output surface shown in-cockpit (modeled/dummy). "No builder" is fair; "no feature or output" is false. Downgrade from "no surface" to "modeled CRO activity shown, no real builder/generation."

These two are the report's biggest factual misses — it rates both "high" severity "❌ mismatch," partly on a false premise.

**3. "Pixel & CAPI · Connected" listed as a *separate* high-severity mismatch from the Meta mismatch.**

Not wrong, but double-counted. The ground truth/product confirm Pixel/CAPI is purely Meta-side and inert until Meta connects ("Pixel `purchase` actions coded in `meta.ts`, inert"). It is the *same* root cause as the Meta "Live" badge and the GA4 row, already each booked as separate high-severity rows. Flagging it as a fourth independent high-severity item inflates the count; it should fold into the Meta/attribution finding. Minor, but it pads severity.

---

## Missed mismatches to add

**1. The "Landing pages" discipline is sold *and* shown as an autonomous agent acting "auto" — with no product or ground-truth backing for landing-page *capability* at all.**

The report flags landing pages only as a marketing *feature* claim. But it misses that the cockpit *also* asserts it: the Activity log shows the "Landing pages" agent publishing a "CRO variant B … auto" (v3.tsx:325). Ground truth lists the four disciplines as "research & intelligence · creative production · media buying & landing pages · measurement & attribution" but backs **none of the landing-page execution** — there is no LP/CRO connector, builder, or generation anywhere in product or ground truth. So this is a case where *both* surfaces overclaim in lockstep, which is more severe than "marketing-only" — the report should note the product cockpit reinforces the unbacked claim rather than hedging it.

**2. Marketing claims an automated **"Landing & CRO"** service in the footer/plan, and the cockpit shows it running "auto" — yet `read_orders`-only Shopify + Google reads cannot observe LP/CRO performance at all.**

Tied to the above: ground truth is explicit that "We cannot extract sessions or store conversion rate from the Shopify Admin API — at all" and GA4 isn't connected. CRO measurement *requires* session/conversion-rate data the stack provably cannot get today. So "published CRO variant B" being measured is doubly unbacked (no LP execution + no CVR measurement). The report flags CVR-from-Shopify generally but never connects it to the CRO claim.

**3. Marketing's "leads / cost-per-lead" outcome is named in the **HIW Phase 04 product mock and the live two-funnel positioning**, not just CRM cards — and has no funnel in the cockpit.**

The report books the "leads" gap as ⚠ partial/med and ties it to CRM connectors. But it under-rates it: the cockpit's own Overview is a **two-funnel** hero (store ROAS + app CPI) with *no leads funnel at all*, while marketing's HIW Phase 04 and footer promise "cost-per-lead for lead-gen" as a measured, live outcome. Ground truth confirms there is one live brand (e-commerce + app) and no lead-gen/CRM data path. This is a present-tense capability claim ("we measure … cost-per-lead") with zero product surface — closer to the creative/LP class (high) than a "partial."

**4. Demo testimonials use **€ budget tiers and named euro/dollar results** while the only live brand is Indian (₹, The Astro Time).**

The report flags the testimonials as illustrative (good) but misses the internal inconsistency the inventories expose: marketing's contact form offers **"€5,000 … €50,000+"** budgets and Demo quotes "**$284K net new**," whereas the entire product and ground truth operate in **₹** for a single Indian astrology brand. The currency/persona mismatch is independent evidence the testimonials and pricing tiers are fabricated placeholders, strengthening the credibility-hygiene finding.

---

Net: the audit's *direction* is sound (Meta-not-live, GA4-not-connected, MER-Google-only, margin-estimate, white-label-blocked, plans-aspirational, LLM-ads-overstated are all correctly flagged and well-evidenced). The corrections are: **drop/soften the two "zero creative/LP surface" high-severity findings** (the cockpit does show modeled creative + CRO surfaces; the true gap is "modeled, not generated"), **fold Pixel/CAPI into the Meta finding**, and **add** that the cockpit itself reinforces the landing-pages/CRO and leads overclaims (not marketing-only), plus the €/$ vs ₹ testimonial-and-pricing inconsistency.