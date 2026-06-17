# Progress — current state, changelog, next steps

Convert relative dates to absolute. Newest changelog entry on top.

## Changelog

### 2026-06-17 · Multi-tenant Phase 1 — tenant-subdomain routing + membership gate (additive)
Built the `<slug>.roilabs.in` dashboard surface. **Additive** — does NOT touch `/engine` or the apex
marketing (the funnel-split of `roilabs.in/engine` is a later sub-step).
- **`src/proxy.ts`** (Next 16 proxy, was middleware): host → slug → rewrite `<slug>.roilabs.in/*` →
  `/_tenant/<slug>/*`. Apex/`www`/`engine`/reserved + `/api/*` + assets pass through unchanged.
- **`src/app/_tenant/[slug]/{page,TenantShell}.tsx`**: client gate — no session → `Login`; session +
  member → `EngineV5` (cockpit=null modeled data for now); session + non-member → "no access" screen.
- **`src/app/api/engine/tenant-access/route.ts`**: server membership check (`principal` → `resolveTenant`/
  `adminResolveTenant`); unknown-slug == not-a-member (403). Browser never sees the membership table.
- **`auth.ts`**: added `principal(req)` (D27) → `{kind:"admin"}` or `{kind:"user", email}` from a verified
  Supabase JWT (membership checked separately, NOT the operator allowlist).
`npm run verify` clean. **To go live:** needs the Phase-0 migration + backfill applied (member email) +
deploy; then `astrotime.roilabs.in` → login → the Astro Time dashboard. Real per-tenant data + brand = Phase 2.

### 2026-06-17 · Multi-tenant Phase 0 (foundation) built — additive, Astro Time untouched
Built D27 Phase 0 (all additive — nothing wired into request paths yet, so the live single-account cockpit
keeps running off env):
- **Migration** `supabase/migrations/20260617120000_engine_multitenant.sql`: `slug` on `engine_accounts` +
  `engine_account_users` (email↔account↔role, invite-by-email) + `engine_account_credentials` (encrypted
  per-tenant secrets), RLS-on/no-policies like the rest. **Not applied yet** (user runs it; backfill SQL is
  in the file's trailing comment).
- **`src/lib/engine/tenancy.ts`** — `resolveTenant(slug,email)` (membership-join gate; unknown-slug ==
  not-a-member), `adminResolveTenant`, `tenantsForUser`.
- **`src/lib/engine/crypto.ts`** — AES-256-GCM via `config.creds.encKey` (`ENGINE_CRED_ENC_KEY`).
- **`src/lib/engine/credentials.ts`** — `googleCreds/metaCreds/shopifyCreds(accountId)`: read+decrypt the
  per-tenant row, **env fallback** when `ENGINE_CRED_ENV_FALLBACK=true` + no row (migration safety).
- **`config.ts`** — added `creds {encKey, envFallback}`.
- **Cross-tenant bug #1 FIXED:** `connectors/google.ts` token cache singleton → `Map` keyed by refresh
  token (per company). Bug #2 (`page.tsx` `unstable_cache` key needs `accountId`) lands in Phase 1/6 when
  `/engine` goes funnel-only + the per-tenant page threads `accountId` (no-op today, one account).
`npm run verify` clean. **User prereqs before Phase 1:** add `*.roilabs.in` wildcard on Vercel; apply the
migration + set `ENGINE_CRED_ENC_KEY` (`openssl rand -base64 32`) on the agency project + `.env.local`.

### 2026-06-17 · Multi-tenant architecture designed (D27) — subdomain per company
Ran a design pass (workflow: map existing engine/account model → 2 tenancy approaches → synthesis) and
locked the architecture for **per-company dashboards** with **per-company access + integrations**. Spec:
**`documentation/MULTI-TENANT.md`** (D27). Choices: **subdomain per company** (`<slug>.roilabs.in`); **both
clients + ROI Labs team log in** (role-gated); **only ROI Labs invites** (email-keyed membership). Key
finding: the engine DB is already `account_id`-partitioned, so it's 3 tables + a `resolveTenant` gate +
creds-off-env + a `*.roilabs.in` wildcard, not a rewrite. **Option 1** (funnel at roilabs.in/engine, Astro
Time → `astrotime.roilabs.in`) = Step 1 of a 9-step plan. **Not yet built** — awaiting go-ahead to start
Phase 0 (migrations + tenancy resolver + the 2 cross-tenant bug fixes).

### 2026-06-17 · Operator SSO — Google/email accounts unlock the cockpit (D26)
Built real single-sign-on for operators, on **both** surfaces, alongside the admin token. Code only —
needs the user's env + one Supabase redirect-URL add to go live.
- **`auth.ts`** `authorize()` is now **async** and accepts EITHER `ENGINE_ADMIN_TOKEN` (unchanged
  constant-time) **OR** an allowlisted operator's Supabase access token (validated via `getUser` against
  the leads project; allowlist `ENGINE_OPERATOR_EMAILS`). All 8 `/api/engine/*` routes `await authorize`.
  Still fail-closed (503 if neither configured). New `config.operator` block in `config.ts`.
- **`Shell.tsx`** collapsed 3 modes → 2: `demoOnly()` (internal static demo, no login) + **real-auth**
  (Supabase login + admin-token fallback, on both roilabs.in/engine and engine.roilabs.in). After sign-in
  it probes `/api/engine/status` with the session access token → allowlisted **operator** = full cockpit,
  else **locked teaser**. The Google "SSO isn't wired yet" dead-end on roilabs.in is gone.
- **Data-leak fix:** the locked teaser is now fed `cockpit=null` — real source data reaches **operators
  only** (previously the real payload shipped to every locked render; would have leaked real numbers once
  login opened on roilabs.in).
- **Verified:** `npm run verify` (next build + tsc) green; all 8 routes + Shell typecheck.
- **Remaining (user):** (1) `ENGINE_OPERATOR_EMAILS=…` on the **agency** Vercel project + `.env.local`
  (leave OFF roi-engine so engine.roilabs.in stays a teaser); (2) add `https://roilabs.in/engine` +
  local `localhost:<port>/engine` to Supabase → Auth → Redirect URLs (Google provider already configured);
  (3) redeploy agency (`vercel --prod`, not auto). See ENGINE.md "Operator sign-in".

### 2026-06-17 · Landing: Integrations preview section → live on roilabs.in
Added an **Integrations preview** to the homepage (`AuroraHome.tsx`, between How-it-works and Plans):
`#integrations-preview` — eyebrow + "Plugged into your **whole stack.**" + **8 logo cards** (Google, Meta,
Shopify, GA4, Stripe, Razorpay, HubSpot, TikTok) + a **"See all integrations →"** CTA to `/integrations`.
Aurora Light styling (`.iglogos`/`.iglogo`/`.ig-cta` in `aurora.css`). Built, shown on local for approval,
then **deployed to roilabs.in** (`vercel --prod`) and verified live (section + 8 cards + CTA present).

### 2026-06-17 · Shipped everything to roilabs.in production
Merged `feat/cockpit-darkmode-login` → **master** (fast-forward) and **deployed the agency project to
roilabs.in** (`vercel --prod` → `Aliased https://roilabs.in`, READY). Live now: the **Login** nav CTA
(→ `/engine?login=1`), the **charcoal header bar** (matches the login: `radial-gradient(#241e14→#141009)`),
the **Payments & subscriptions** integrations (Stripe/Razorpay/PayPal/UPI), the **redesigned login**, and
the **v5 cockpit w/ dark mode** — which stays **token-gated** on roilabs.in (no `engine.` host / no
`NEXT_PUBLIC_ENGINE_AUTH`, so the public Supabase teaser + dummy brand only run on engine.roilabs.in;
roilabs.in's gated cockpit keeps the real "The Astro Time" brand). Verified /, /engine, /integrations,
/audit all 200; header gradient + Login + payments confirmed live. The locked-teaser charcoal experiment
was **reverted** first (back to the blurred light card) per user. Active gh account left on **nagarmohnish**.

### 2026-06-17 · engine.roilabs.in shipped — brand isolation, Calendly, Google OAuth, redeploy (D25)
Continuation of the engine.roilabs.in build below — got it production-ready end-to-end.
- **Env-gated brand (`BRAND` in `tickets.ts`)** so a real client name never shows to public sign-ups:
  public (supabase) → **"Northwind Goods"** (dummy, gradient monogram, slug `northwind`); internal demo
  (`DEMO=1`, no auth flag) → **"The Astro Time"** + its logo. `v5.tsx` store card / Overview title /
  Shopify domain / disclaimer / Profile (workspace + derived email) all read `BRAND.*`; store-card logo is
  conditional. **Both modes headless-verified** (public: Northwind + monogram + Calendly, no astro;
  internal: Astro Time + logo).
- **Calendly**: `LockGate` "Book a demo call" → `NEXT_PUBLIC_BOOK_CALL_URL` default
  **`https://calendly.com/mohnish-nagar-roilabs/30min`**; opens in a new tab.
- **Email auth verified working end-to-end** against the live leads Supabase (`gaulosvlnynoxgdjelgm`):
  signup → instant session → locked teaser (user confirmed "Confirm email" OFF + set Site URL + redirect
  URLs `engine.roilabs.in/engine` & `localhost:3002/engine`). **Google OAuth** also configured by the user
  (Google Cloud "Google Auth Platform": create Web client w/ redirect
  `https://gaulosvlnynoxgdjelgm.supabase.co/auth/v1/callback` → publish; paste into Supabase → Providers →
  Google) and **tested working** (user logged in via Google).
- **Redeployed `roi-engine` `--prod`** with all of the above + updated `NEXT_PUBLIC_BOOK_CALL_URL` →
  Calendly; agency `.vercel` link restored. Code committed + pushed to `nagarmohnish/agency` branch
  `feat/cockpit-darkmode-login` (2 commits: supabase-auth/teaser, then brand/Calendly).
- **Remaining (user, one toggle):** Vercel → `roi-engine` → Settings → **Deployment Protection** →
  disable "Vercel Authentication" → `engine.roilabs.in` goes live (currently 401/404 behind the wall).
  Optional: delete the headless test user `claude-test-…@example.com` from Supabase → Users.

### 2026-06-17 · engine.roilabs.in — real Supabase accounts + blurred "book a demo call" teaser
Built the real-auth engine deployment, isolated from roilabs.in. **Code** (committed to
`nagarmohnish/agency` branch `feat/cockpit-darkmode-login`):
- `Login.tsx` — real **Supabase auth** (signUp / signInWithPassword / signInWithOAuth google / signOut)
  behind a `supabaseAuth` prop; busy state + error/confirm handling.
- `Shell.tsx` — `engineAuthMode()` = `NEXT_PUBLIC_ENGINE_AUTH==="supabase"` **OR** hostname starts with
  `engine.` → Supabase **session gate**; post-login renders the cockpit **locked**. roilabs.in unaffected.
- `v5.tsx` — `EngineV5({locked})` → `LockGate`: blurs metrics/sections + overlays a **"Book a demo call"**
  card (`NEXT_PUBLIC_BOOK_CALL_URL`, default `roilabs.in/#contact`). Both states headless-verified.
- Auth users live in the **leads Supabase project** `gaulosvlnynoxgdjelgm` (`NEXT_PUBLIC_SUPABASE_*`).

**Infra (done):** new Vercel project **`roi-engine`** (`prj_0gzzlePDEkHcYqY55cNEkClqee2D`, nishmos team),
separate from `agency`/roilabs.in. Prod env set (`NEXT_PUBLIC_ENGINE_AUTH=supabase`, `…_DEMO=1`,
`…_SUPABASE_URL/ANON`, `…_BOOK_CALL_URL`). Deployed `--prod`. Domain **`engine.roilabs.in`** added —
**DNS auto-managed** (roilabs.in on Vercel nameservers, no record to create). `.vercel` link restored to
`agency` (redeploy roi-engine via `vercel link --yes --project roi-engine` → `vercel --prod` → relink back).

**⏳ Blocked on user (dashboard):** (1) roi-engine **Deployment Protection ON** → 401/404; disable at
Vercel → roi-engine → Settings → Deployment Protection. (2) **Supabase** (`gaulosvlnynoxgdjelgm`): enable
Email auth, optionally turn OFF "Confirm email", set Site URL `https://engine.roilabs.in` + redirect `…/engine`.

### 2026-06-17 · Dark mode + header contrast · login gate/user-storage · integrations payments · Login nav · 80/90% zoom
**Dark mode (cockpit) — D24.** Retrofitted `v5.tsx` with a full light/dark theme. The ~18 colour tokens
became CSS variables (`THEME_CSS` defines a light set on `.v5root` + a dark set on
`.v5root[data-theme="dark"]`); ~30 scattered hex literals were mapped to those vars (a parallel workflow
first classified all 183 colour usages so nothing was missed). Split the overloaded `NAVY` → `--btn`
(navy buttons/chips/tooltip, lifts in dark) vs new `INK`=`--ink` (primary text, flips); cards get a
`--card-bd` border in dark for separation. **Sun/moon toggle** in the top bar; theme persists to
`localStorage` (`v5theme`) + honours `prefers-color-scheme`; `prefers-reduced-motion` respected.
**Header-contrast fix** (user: "headers too light") — `monoLabel` now uses `--label` (#5E6678 light, vs
the old washed-out #AAB2C3). Headless-verified Overview + Tickets in both modes, no errors.
**Login flash fix** (`Shell.tsx`) — gated all render paths on `ready` so the cockpit never flashes before
the sign-in screen (user-reported).
**Login user-storage + demo gate** — `Login.tsx` persists the signed-in user to `localStorage`
(`roi_user`) on Create-account / Sign-in / Continue-with-Google; demo `/engine` now **requires login**
(Shell gates the cockpit on the stored user), session survives reloads, **sign-out clears it**. Verified
the full flow (gate → login → cockpit → persist).
**Landing — Login button** — homepage + `/integrations` nav "Book your audit" pill → **Login** →
`/engine?login=1` (hero/form/popup audit CTAs kept as conversion).
**Integrations — payments** — added a **Payments & subscriptions** section to `/integrations` with
**Stripe, Razorpay, PayPal, UPI** (recurring-revenue partners; mirrors the cockpit subscriptions stream).
**Default zoom** — cockpit root `zoom:.8` (height/width ÷.8 → `125vh`/`125vw` to fill), login content
`zoom:.9` via a `.lg-stage` wrapper.
`npm run verify` clean throughout.
**Deployed (2026-06-17).** Code committed + pushed to `nagarmohnish/agency` branch
**`feat/cockpit-darkmode-login`**. Then a **preview** deploy of the `agency` Vercel project with
`--build-env NEXT_PUBLIC_ENGINE_DEMO=1` →
**https://agency-fijow8n29-nishmos-projects.vercel.app** (landing + login + full demo cockpit, public,
no auth wall). ⚠️ The `agency` Vercel project's **production** domain is **roilabs.in** — so this was a
*preview* (`target:null`) deliberately, to keep the roilabs.in apex untouched per the user. To go live on
roilabs.in: `vercel deploy --prod`; for a subdomain (e.g. `app.roilabs.in`): add it in the project's
Domains + a CNAME → `cname.vercel-dns.com`.

### 2026-06-17 · Login: animated gold-glow backdrop
Added a subtle animated background to the login (`Login.tsx`, CSS-only): a `.lg-bg` layer behind the card
with **3 drifting gold/amber glow orbs** (blurred radial gradients, 20–32s float+scale loops), a slow
rotating **conic light sweep**, and a faint masked **grid** that drifts — all ROI Labs gold at low opacity
so the card stays readable. Foreground (logo/card/footer) lifted to `zIndex:1`; `prefers-reduced-motion`
disables all of it. Headless-verified (3 orbs + sheen + grid present, no page errors); `npm run verify`
clean.

### 2026-06-17 · Login reskinned to the landing-header charcoal + logo fix
Login (`Login.tsx`) now sits on the **landing-page header colour** — the charcoal-brown of the homepage
nav capsule (`.nv` = `rgba(26,23,18,.94)` ≈ `#1A1712`), per user ("add the header background colour as
background for login page"). Background → `radial-gradient(#241e14 → #141009)`; card/fields retinted to the
warm-charcoal family (`#1e1a12` / `#19150d`, borders `#33301f`/`#34301f`); **primary actions → ROI Labs
gold** (`#FACC15` on `#1A1712` ink), matching the landing's gold primary button; links/toggles gold.
**Logo fix** ("logo not visible"): the old `roi-mark.png` was cropped by `objectFit:cover` in a 34×34
square (only "RO" showed). Now uses the landing header's **`roi-logo-dark.png`** (gold ROI + white LABS,
built for dark bg) rendered uncropped (`height:38, width:auto`) + a divider + "Engine". Headless-verified:
logo loads (1080×766, no failed requests), both Sign in / Create account views render, no page errors;
`npm run verify` clean; `/engine?login=1` 200. Local only.

### 2026-06-16 · Runs scoped to Audit + Creative · login redesign · GA4 Overview built — D23
**Runs = Audit + Creative only (D23, revises D22's 4-step loop).** Removed **Launch** + **Optimize** from
the Runs step-runner — they are not autonomous "runs" (Launch = operator action *post-approval*; Optimize =
automated). `v5.tsx`: `STEPS` → 2 cards (Run audit / Run creative; grid `repeat(2, minmax(0,380px))`); panel
**THE LOOP** → Audit (done) / Creative (active); Runs subtitle → "Audit → Creative"; dead `LOOP` const
trimmed; `RUN_HISTORY` + the Overview **engine-bar** reworded to audit/creative ("Creative phase", "Last
audit … surfaced 3 opportunities"). Headless-verified the Runs screen is pure (no Launch/Optimize text).
- *Landing page:* the marketing **"How it works"** still shows the full **4-stage service funnel**
  (Research → Creative → Launch → Optimize) — that is the customer-facing sales narrative (the team does
  launch + optimize), **left intact pending a call** on whether to mirror the engine's 2-step loop.
- **Login redesign** (`Login.tsx`) → **centered single-card** (replaced the split-screen cockpit-preview),
  per a Hookmaster-style reference: ROI Engine logo+wordmark, Continue-with-Google, email/password with
  field icons + show/hide, **Sign in ⇄ Create account** toggle (Full Name + ToS checkbox on signup),
  operator admin-token link preserved. Both views headless-verified; no page errors.
- **GA4 audience on Overview** (closes D22's last frontend item) — new `Ga4Audience` block: GA4 KPI row
  (Sessions / Active users / Engagement rate / Conversions), **demographics** (age brackets + gender split),
  **acquisition channels**, **device** tap-to-filter, **segment** chips (All / New / Returning). Reacts to
  the Overview date range *and* its own filters (verified: Returning → Sessions 86K→31K, Engagement 62%→79%).
  All modeled; live GA4 connector later.
- **Member rename:** `tickets.ts` **Rahul Dhali → Ishaan Gupta** (initials RD→IG) everywhere (real name).
`npm run verify` clean throughout; `/engine` and `/engine?login=1` 200. Local only.

### 2026-06-16 · Runs = interactive step-runner (frontend-first; backend later) — D22
Built the **Runs step-runner** frontend per D22 (user: "fully functional & interactable frontend first,
backend later"). `v5.tsx` Runs screen → **THE LOOP · RUN A STEP**: four step cards, each runs per its
rule —
- **Audit** [Run audit] → "Auditing…" generating state → **Audit report** (HEALTH 52/100 + 4 typed
  opportunities with impact chips). Each finding has **Create ticket** → adds an OPEN ticket to the board.
- **Creative** [Run creative] → "Generating…" → **3 AI creative variants** (placeholder image cards) +
  **Submit 3 for approval** → adds an AWAITING creative ticket.
- **Launch** → **[Post-approval →]** (gated, links to the board — launches only after a ticket is
  approved, per D21).
- **Optimize** → **[● Automated]** (runs after results).
Wired to `setTickets`/`viewer` so runs feed the tickets board (closes the loop with D21). All mock data
+ real interactions (`running`/`audit`/`creatives`/`used` state); backend (real agents + Anthropic /
image-gen) later. `npm run verify` clean (fixed a step-id union type error); headless-verified all four
behaviors. Local only. Remaining frontend: **GA4 data + demographics + filters on Overview** (next).

### 2026-06-16 · v5 cockpit: section-aware side panel + Overview trims (+ new reqs spec'd)
**Built this turn (`v5.tsx`):**
- **Section-aware secondary panel** — the 296px panel now switches content by section (store card stays
  on top in all): Overview/Sources → CONNECTED SOURCES + ENGINE spend; **Approvals → Tickets menu**
  (VIEWS: All/My approvals · BY TYPE: Budget/Creative/Campaign/Tracking with counts · TEAM list) that
  **filters the board** via a `tfilter` state (verified: Creative → only AT-141); Runs → THE LOOP +
  recent runs; Activity → agents list.
- **Overview trims** (user requests): removed the **tabs** (Overview/Sources/Runs), the whole **store
  header** (name + BLENDED + MER bar + source avatars + "View approvals"), and the page-header
  **AstroTime chip**. The orphaned date-range row left a **blank band** → moved the **7D/28D/90D toggle
  into the hero card** (top-right by the chart). Rail brand = ROI Labs; store = AstroTime logo
  (white card); rail icons collapse the panel; chart hover tooltip; real payment logos.
`/engine` 200, headless-verified, no errors. Local only.

**NEW requirements — spec'd, NOT yet built (see D22):**
- **Runs as a step-runner:** operator picks a step to run — **Audit** → model generates analytics from
  current DB data/inputs; **Creative** → generate AI creatives (images); **Launch** → operator action,
  **post-approval only**; **Optimize** → automated/after. (Involves the engine agents + Anthropic /
  image-gen — a backend build; demo-UI first.)
- **GA4-type data + demographics + filters on Overview:** add GA4 metrics (sessions, conversion rate,
  funnel) + **age/gender/network demographics** (the engine's `/api/engine/breakdowns` + GA4 already
  expose these) + filters. Wire into `cockpit-data.ts` (real where available, est otherwise).

### 2026-06-16 · Spec'd Tickets/Approvals (Jira-style) + granular access — building next
Designed the change-control workflow + access model before building (user asked to structure + log it
first). New canonical spec **`documentation/TICKETS.md`** + decision **D21**. Summary: a **Jira-style
board** (Open · Awaiting approval · Approved · Done) replaces the static Approvals screen; Operators
(ROI Labs / the client's ad-ops human) create tickets from engine insights, Approvers (client/admin)
sign off, Viewers consume analytics — **same board, two modes** (managed agency↔client, or standalone
single-operator). **Granular permissions** (chosen): atomic capabilities (`tickets.create`,
`approve.budget|creative|campaign|tracking`, `actions.execute`, `members.manage`, …), optionally
channel-scoped; **roles = preset bundles** (Admin/Operator/Viewer) **+ per-member grants** (e.g. a
finance lead = Viewer + budget-approver). Ticket **type** → required `approve.*`. Flow mirrors the
engine's gated-mutation + audit-log model (D2/D3). **Build is demo-first** (seeded members/tickets +
a "View as role" switcher; live auth wiring later).
**BUILT (same session):** `src/app/engine/tickets.ts` (Permission/Role/Ticket types, `ROLE_PERMS`,
`can()`/`canApprove()`/`effectivePerms()`, `APPROVE_FOR`, seeded MEMBERS [ROI Labs operator + client
admin + budget-approver + creative-approver + viewer] + 6 SEED_TICKETS across columns/types). `v5.tsx`
Approvals screen → **Jira board** (`TicketsBoard`): 4 columns (Open · Awaiting approval · Approved ·
Done), typed ticket cards (key, cap bar, channel logo, reporter→approver avatars), a right **detail
drawer** with role-gated **Submit / Approve / Reject / Request-changes / Execute** + activity/comments,
a **"Viewing as" role switcher**, and **+ New ticket** (gated by `tickets.create`). Rail "Approvals"
title → "Tickets". `npm run verify` clean. **Granular gating headless-verified:** Budget-approver →
budget ✓ / creative ✗; Viewer → ✗; Operator → ✗ (no self-approve). Local only. NB old `Approvals`
fn + `APPROVAL_CARDS` left unused (harmless). Next: live wiring (member-from-auth, server `can()`
re-checks, tickets↔`engine_actions`) + create-from-insight on Overview signals.

### 2026-06-16 · v5 cockpit: real logos (ROI Labs + AstroTime), white store card, collapse-on-rail-icon
Branding + UX polish on the v5 cockpit:
- **Rail brand mark** → real **ROI Labs** logo (`public/logos/roi-mark.png` from `brand-kit/logos/
  roi-labs--mark.png`) on the navy chip — the product brand up top (was a styled "R", briefly AstroTime).
- **Store** → real **AstroTime** logo (`public/logos/astrotime.png`, the purple zodiac mark) replaces the
  "AT" avatar in the panel store card + both page-header store chips; **removed the
  `theastrotime.myshopify.com` URL** from those tabs. Panel **store card background → white** (border +
  soft shadow, dark text) per request.
- **Collapsible panel via the rail:** clicking the **active** left-rail nav icon toggles the 296px panel
  (collapse/expand) — **removed the separate top-bar toggle button** (user: "don't add a separate icon").
Verified headless (URL gone, active-icon collapse+re-expand, no errors). Local only.

### 2026-06-16 · v5 cockpit: REAL data + subscriptions revenue + interactive range + collapsible panel
Four-part upgrade turning the v5 cockpit from static demo into a live, interactive tool.
- **Real data (live):** new server aggregator **`src/lib/engine/cockpit-data.ts`** (`getCockpitData`)
  pulls REAL **Shopify** (orders/revenue/AOV — the revenue truth) + **Google Ads** (spend/conversions)
  once over the max window and derives 7D/28D/90D aggregates from the daily series (2 API calls).
  `page.tsx` fetches it via `unstable_cache` (revalidate 600s → `/engine` is ISR, refreshes every 10m)
  with a try/catch fallback to modeled estimates (so the static Pages demo / CI still render). Verified:
  cockpit shows the **real ₹1.88L / 247 orders / ₹760 AOV** (28d) — not the old ₹42.8L placeholder.
  Wired `page.tsx → Shell(cockpit prop) → EngineV5(cockpit)`.
- **Subscriptions as a primary revenue source:** Overview now frames **two revenue streams — Shopify
  one-time purchases + recurring app-purchase subscriptions** (Stripe · PayPal · Razorpay · UPI). Added
  a Subscriptions source card (MRR/active/provider chips), a Subscription-MRR KPI, and a subscriptions
  row in "where spend goes → by outcome". **Estimated** (38% of store rev, India-weighted split) until
  the processors are wired — real Stripe/PayPal logos in `public/logos/`, styled chips for Razorpay/UPI.
- **Interactive date range:** the 7D/28D/90D toggle now drives **all** metrics + the chart (each range
  is a real aggregate from the daily series). Verified 28D ₹1.88L → 90D ₹2.16L on click.
- **Collapsible panel:** the 296px secondary panel toggles via a button in the top bar (`panelOpen`).
- **LIVE / EST badges** distinguish real (Shopify, Google) from estimated (Meta, subscriptions) data
  per the user's "fill estimations" ask. Decision **D20**. `npm run verify` clean; headless-verified all
  four behaviors. NB the real Google account is store search/PMax (not app-installs) — reframed the
  Overview from "two funnels (app/store)" to "revenue streams + ad spend driver" to match reality.

### 2026-06-16 · v5 cockpit: ROI Labs brand yellow in logo/wordmark (+ Login headline font fix)
Swapped the handoff's muted gold `#D9A441` → **ROI Labs brand yellow `#FACC15`** (from
`brand-kit/tokens.json`) via the `GOLD` token in `v5.tsx` + `Login.tsx` — applies to the navy rail "R"
mark, the "ROI" wordmark (panel + Login + preview), and the Login headline "measured in revenue."
Bold weight keeps yellow "ROI" legible on the white panel. **Also fixed a real bug:** the Login `<h1>`
was rendering in a serif (it inherited the marketing site's global `h1` Fraunces rule) — added inline
`fontFamily: Poppins` so the headline is the correct brand sans. Verified via headless (h1 font =
Poppins; yellow renders on navy/white/dark). Local only.

### 2026-06-16 · v5 cockpit: production polish — hover feedback + removed irrelevant chrome
User reported the cockpit felt "unresponsive / broken" — root cause was twofold: (1) a **stale browser
tab** bound to the dev server that got restarted during the production build (server was healthy;
verified rendering + nav interactivity Overview→Approvals→Runs + fonts loaded + build passing via
headless), and (2) **`v5.tsx` had no hover/interaction feedback** (the handoff specified hover states
everywhere; I'd shipped none), so clicking felt dead even though it worked. Fixes:
- **Added hover feedback** (CSS classes in the `<style>` block): nav icons (`.v5-nav` bg+accent),
  source rows (`.v5-src`), cards lift (`.v5-card`), tabs (`.v5-tab`), navy buttons (`.v5-navy`→#28345a),
  Reject (`.v5-ghost`→red), accent button (`.v5-accent` brightness), topbar icons (`.v5-ic`).
- **Removed irrelevant/redundant elements:** the duplicate "Engine" rail icon (mapped to Runs like the
  Runs icon), the "Connect store" dashed placeholder, the "+1" phantom source avatar, the "Signals" tab
  (no real destination; tabs now Overview/Sources/Runs), and the decorative "⋮" menus on signal cards.
`npm run verify` clean; headless-verified (no Connect store / +1 / Signals; no console errors). Tell the
user to **hard-refresh** the stale tab. Local only. http://localhost:3002/engine

### 2026-06-16 · New cockpit design (v5) from engine_design_new handoff — all pages
Implemented the **`engine_design_new/design_handoff_roi_engine`** Claude Design handoff (a "Dutask-style"
redesign of the cockpit) as the **new `/engine` look**, across every page. Same product content/IA +
demo data — new friendly, rounded, card-based aesthetic (navy `#1B2440` ink, indigo `#4F5BD5` accent,
gold ROI mark, **Poppins + DM Mono**). New file **`src/app/engine/v5.tsx`** (`EngineV5`, self-contained,
inline styles); **`Shell.tsx` now renders `EngineV5`** for the atlas/default cockpit (was `EngineV3`;
v3/v3aurora kept as legacy). **`Login.tsx` rewritten** to the handoff's dark split-screen (gold headline
"measured in revenue", Continue-with-Google/email, admin-token path preserved, animated cockpit preview).
- **Shared chrome:** 76px icon rail (navy "R", nav + red approvals badge) · 296px secondary panel
  (ROI Engine wordmark, store card, **CONNECTED SOURCES with real Google/Meta/Shopify logos**, daily-spend
  card) · 70px top bar (search, synced pill, bell, user).
- **Screens:** Overview (two-funnel hero + area chart, KPI sparkline cards, two source cards, "where spend
  goes vs returns", 4 attention signals, dark engine bar), Approvals (amber banner + 3 gated cards with
  cap meters; Approve/Reject **interactive** — decrements the rail badge), Runs (THE LOOP 4 stages, active
  Run #142 task rows, run history), Google/Meta/Shopify source pages (KPI cards + breakdown lists, new
  style), Activity (agent log). Nav via rail + clickable panel sources + Overview tabs (`page` state).
- **Real logos** from `public/logos/{google.jpg,meta.png,shopify.svg}` (README said swap lettermarks for
  real logos) — rendered in white rounded chips everywhere a source appears.
Decision logged as **D19**. `npm run verify` clean (also fixed a pre-existing v4 `Spark fill?: string`→
`boolean` type error that only surfaced in the full build). All pages headless-verified. Local only.
Live: **http://localhost:3002/engine** (+ `?login=1` for sign-in). `/engine/aurora` still on legacy v3.

### 2026-06-16 · New "ROI Studio" demo — Dutask-inspired dashboard (route /engine/v4)
Built a **separate design exploration** of the cockpit from a Behance "Dutask" project-management
reference (user asked for a separate demo design "on a different localhost"). Modern PM-dashboard
aesthetic: soft rounded white cards, **violet accent** (`#6C5CE7`), kanban board, task-style
approvals, sparkline stat cards, donut. Same ad-ops demo data ("The Astro Time"), brand-new visual
language — **fully isolated, doesn't touch v3/aurora**. New files: `src/app/engine/v4/EngineV4.tsx`
(self-contained client component, inline styles, Plus Jakarta Sans) + `src/app/engine/v4/page.tsx`
(route, themeColor `#F5F6FA`). Sections: sidebar (ROI Studio logo, active violet pill, "Engine active"
promo card), greeting topbar (search/bell/avatar), 4 sparkline stat cards (revenue/ROAS/spend/installs),
Performance area chart (rev vs spend · 7/28/90 tabs), Spend-by-source donut (Blended MER center),
**kanban Campaign board** (In review/Live/Optimizing with platform/priority/assignee/progress),
Approvals task-list (checkbox toggle + Approve), Activity feed + agent-avatar stack. Interactions via
`useState` (nav, range, approval checkboxes). **Local: http://localhost:3002/engine/v4** (200;
headless-verified top + bottom). Reference had no extractable specs (Behance is image-only) — built
from the modern-PM-dashboard genre. Local only; not pushed. NB "different localhost" delivered as an
isolated route on the same dev server — can run on a dedicated port on request.

### 2026-06-16 · Cockpit sidebar: white + 3 collapsible sections + Astro logo
`v3.tsx` — reworked the sidebar (supersedes the same-day warm-dark color change below):
- **Background → white** (`#FFFFFF`, `borderRight #ECEDF1`); flipped all sidebar text to light-theme
  (inactive nav `#5B5F6B`; section headers `#8A8F9A`;
  footer text darkened; avatar hover `rgba(15,17,28,.06)`).
- **3 collapsible primary sections** — Overview · Sources · Engine — each a **text-only header (no
  icon) + chevron** that toggles a dropdown of its items (`openSec` state, all open by default).
  Overview → [Overview]; Sources → Google/Meta/Shopify; Engine → Runs/Activity/Approvals. Driven by a
  new `sections` array (`iconKind` picks NavIcon vs SourceIcon; items keep their icons).
- **The Astro Time logo**: new `AstroMark` SVG component (purple zodiac wheel — 12 sign glyphs + center
  star) replaces the generic "T" initial in the topbar account badge (removed unused `clientInitial`).
  NB: recreated as SVG because the attached image's bytes weren't accessible from chat — swap in the
  exact PNG later if preferred.
Regenerated `v3aurora.tsx` (0 residual tokens; aurora sidebar also goes white, astro mark stays
purple). Both routes 200; verified via headless screenshot. Local only.

### 2026-06-16 · Cockpit: sidebar = roilabs header color + funnel cards moved up
`v3.tsx` (Overview) — two tweaks per request:
- **Sidebar background** `#1E1B4B` (deep indigo) → **`#1A1712`**, matching the landing-page header
  (`.nv` = `rgba(26,23,18,.94)` in `aurora.css`). Updated the palette comment + the aurora remap key
  (`#1A1712`→`#1A1710`) and regenerated `v3aurora.tsx` (0 residual Atlas tokens; aurora sidebar
  unchanged at `#1A1710`).
- **Reordered Overview**: the two **funnel cards** (Store · Meta → Shopify / App · Google) now render
  **above** "Where spend goes vs what it returns" (was below it), directly under the KPI strip.
Both `/engine` + `/engine/aurora` 200; verified via headless screenshot. Local only (not pushed).

### 2026-06-15 · Homepage lead popup: 20s timer only (dropped scroll trigger)
`AuroraHome.tsx` — the lead popup ("Put AI to work on your paid media") was opening after **20s OR
50% scroll depth**, so scrolling fired it early. Per request, removed the `scrollDepth` trigger (its
function + the `scroll` listener add/remove) so it now opens **only after 20s**, still once per session
(`sessionStorage` `roi_popup_shown`); Escape / overlay-click / close-button dismiss unchanged. Local
only (not pushed). Re-test in a fresh tab/incognito — the timer is per-session.

### 2026-06-15 · Repo restructure (clean root) + dev-indicator off + push to GitHub
Tidied the cluttered repo root and pushed the full session's work. **Nothing deleted** — every move
was `git mv` (history preserved); references updated so nothing breaks.
- **`documentation/`** ← `ARCHITECTURE.md`, `ENGINE.md`, `DEVELOPMENT.md`, `GITHUB-PAGES.md`.
- **`design/pages/`** ← standalone HTML exports (`roi-labs-home/about/header-banners/new-design.html`
  + the gitignored `roi-engine-dashboard.html`); **`design/logos/`** ← loose source logo art
  (`roi-labs-logo*.png`, `roi-logo-dark/light.png`); **`design/archive/`** ← `roi-labs-site.zip`,
  `images (3).jpg` (both gitignored).
- **Kept at root:** `README.md`, `CLAUDE.md`, `SECURITY.md` + build config only.
- **Refs updated:** `CLAUDE.md`/`INDEX.md` spec links → `documentation/…`; moved docs' own relative
  links got a `../` prefix; the 5 legacy generator scripts (`build-pages.js`, `build-standalone.js`,
  `build_standalone_new.py`, `gen-clean-logo.js`, `make-logo.js` — none in the `npm run` pipeline)
  repointed to `design/…`; `.gitignore` + `.vercelignore` patterns moved with their files. The Next
  build references none of the moved files → `npm run verify` unaffected. Decision logged as **D18**;
  FILE-MAP "Docs & repo layout" rewritten.
- Also this session: hid the Next dev-tools **"N" indicator** (`devIndicators:false` in
  `next.config.ts` — dev-only, never shipped); restarted a **wedged Turbopack dev server** (it had hit
  an internal cache error and hung on dynamic routes) — `/engine` + `/promo/index.html` 200 again
  (note: the promo's local URL is `/promo/index.html`, the bare `/promo/` 308-redirects to a
  non-route in dev). Pushed everything to **nagarmohnish/agency `master`**.

### 2026-06-15 · Unified nav across pages + homepage trims + centered cockpit wordmark + claims audit
Marketing↔product consistency pass (local-first; shipped in the restructure push above):
- **Unified the top-nav** to the final set — **How it works · Integrations · Free audit · Plans · FAQ**
  — across `Navbar.tsx`, `AuroraHome.tsx`, `AuditPage.tsx`, `Integrations.tsx` (it had been drifting
  per page).
- **Homepage** (`AuroraHome.tsx` / `aurora.css`): removed the **Free-audit** "how much is your paid
  media leaving on the table?" section; footer logo switched to `roi-logo-light.png` with the **dark
  tile/box removed** so "LABS" reads black on the light footer (`.fbrand img` stripped to a plain
  inline image).
- **Cockpit** (`v3.tsx`): center-aligned the sidebar **"ROI Engine"** wordmark; regenerated
  `v3aurora.tsx` via `scripts/make-aurora-theme.mjs`.
- **Claims audit** (`vision/CLAIMS-AUDIT.md`, NEW): a 5-agent workflow + adversarial verification of
  website↔cockpit alignment. Flagged high-severity mismatches — Meta badged "Live" but not connected;
  GA4/CAPI shown "Connected" with no connector; For-Brands/For-Agencies + white-label plans unbuilt;
  creative-at-volume / landing-pages shown only as *modeled*; €/$ testimonials vs the single ₹ brand.
  The adversarial pass corrected an overstated finding (the cockpit *does* show modeled creative/LP
  surfaces — it just doesn't generate them).

### 2026-06-15 · Refreshed promo dashboard screenshots (current cockpit data)
Re-captured the four cockpit views used in the animated promo (`public/promo/assets/dash-{overview,
google,meta,shopify}.png`) from the running dev cockpit so they show the **current** demo state
(date window now **May 18 – Jun 14, 2026** instead of the stale Jun 24). Method: headless Chrome
(`puppeteer-core`) drove `localhost:3002/engine`, clicked each sidebar source, screenshot at clean
**1920×1080** (was mismatched ~1740×1026 crops). Frames preserve aspect ratio (`BrowserFrame` uses
`width:100%;height:auto`), so the taller 16:9 caps just show a bit more dashboard. Verified the promo
still renders (no `[bundle]` error, assets 200) and scrubbed the timeline: overview frame (11.2–19.4s)
and the Google·Meta·Shopify fan (19.4–26.4s) both show the new captures. Local only — **Pages still
serves the old assets until a republish**. Capture was a one-off (temp scripts removed).

### 2026-06-15 · ROI Labs animated promo published to Pages
User dropped a Claude Design bundle in `demo assets/claude-design/` (a "ROI Labs Promo" — animated
HTML + the ROI Engine.dc.html dashboard design + jsx scenes). Took the self-contained
**`ROI Labs Promo (download).html`** (fully bundled — no external assets, scenes drawn in code),
copied it to `public/roi-promo.html`, published to gh-pages — **but the "download" bundle was broken**
(its in-browser Babel+base64 bundler threw `[bundle] error` — "Missing script tags", a bad/partial
export; same error on localhost + Pages). **Fix:** served the **raw source** instead — the design
tool's `support.js` runtime (self-contained: Babel Standalone + `window.React`, no design-tool API)
+ `roi-promo.html`(=the `.dc.html`) + `roi-promo.jsx`/`roi-scenes.jsx`/`animations.jsx` +
`assets/dash-*.png`, all under **`public/promo/`** (the dc-runtime fetches the .jsx + assets at
relative paths). **Verified with headless Chrome** (installed `puppeteer-core --no-save`, drove the
local Chrome): `[dc-runtime] x-import: loaded ./roi-promo.jsx`, no bundle-error in DOM, promo renders
+ animates (37.5s) — on BOTH localhost and the live Pages URL. Removed the broken `roi-promo.html`.
**Live: https://nagarmohnish.github.io/agency/promo/** ; dev: `http://localhost:3002/promo/`.
(The only Pages console 404 is the auto-requested favicon — harmless.) Lesson: Claude Design
"(download)" exports can ship a broken bundler — prefer the `.dc.html`+`support.js` raw source, and
verify client-render with headless Chrome (curl can't see it).

### 2026-06-15 · Published the new design to GitHub Pages (engine + Aurora + integrations)
Republished the static export to **gh-pages** (nagarmohnish account) so the **new v3 cockpit** is
live (was serving the old v2). Now live:
- **https://nagarmohnish.github.io/agency/engine/** — redesigned v3 (Atlas indigo).
- **https://nagarmohnish.github.io/agency/engine/aurora/** — roilabs Aurora variant (cream/gold).
- **/agency/integrations/** — 13 real platform logos (served from `/agency/logos/`).
Process: PowerShell export build (`NEXT_BUILD_MODE=export NEXT_BASE_PATH=/agency
NEXT_PUBLIC_ENGINE_DEMO=1 npm run build`) → `out/` → worktree publish to gh-pages →
push with nagarmohnish token (commit **44ae0e8**; Pages built ✓). **Two fixes required:**
(1) BP-prefixed the integration `<img src>` logos (`${BP}/logos/…`) so they resolve under
`/agency` (raw `/logos` 404s on Pages); (2) added `".next/dev/types"` to tsconfig `exclude` — the
Next-16 export build emits an orphan dev `validator.ts` importing a dev-only `routes.js`, which
broke the build type-check (kept as a permanent fix; documented in `GITHUB-PAGES.md`). **Caveat:**
the v2 `?view=` per-tab deep links no longer work (not re-wired into v3 — opens Overview always).
Vercel/roilabs.in untouched. master source unchanged (this only touched gh-pages + local docs).

### 2026-06-15 · Real platform logos on /integrations + dashboard sources
User added real brand logos under `demo assets/logos/` (gitignored). Copied the 13 served ones to
**`public/logos/`** (google.jpg · meta.png · shopify.svg · tiktok.png · linkedin.png · pinterest.png ·
snapchat.jpg · ga4.png · woo.png · highlevel.jpg · hubspot.png · salesforce.png · airtable.png) and
wired them in:
- **`/integrations`** (`Integrations.tsx`): the `L_*` logo constants now hold `/logos/…` paths; the
  `Logo` component renders `<img>` for paths (SVG fallback kept — **Pipedrive** has no file, keeps its
  inline SVG). Added `.ig-logo img{28px,object-fit:contain}` so each sits in the 46px white chip.
- **Dashboard** (`v3.tsx` `SourceIcon`): Google/Meta/Shopify use **transparent multicolor brand
  SVGs** (full Google G, Meta infinity, Shopify bag — ported from the legacy `Dashboard.tsx`
  `BrandIcon`), directly on the dark sidebar + on the white funnel cards (no white chip — per user
  screenshot). The provided white-bg JPGs only suit light cards, so the dashboard uses SVGs, not the
  image files. Regenerated `v3aurora.tsx` via `scripts/make-aurora-theme.mjs` (brand hexes aren't in
  the remap, so they survive). Homepage has no logo grid (text-only "Meta & Google") → unchanged.
`tsc` clean; `/integrations` (13/13 logos), `/engine`, `/engine/aurora` all 200; assets serve.
**Local only — not committed/pushed.**

### 2026-06-15 · Cleaned working tree + pushed master to GitHub (nagarmohnish/agency)
Reviewed the whole working tree, cleaned scratch, and pushed the session's work. Commit **73184d9**
(`02a5220..73184d9 master`, author Mohnish Nagar <mohnish238@gmail.com>, pushed with the
**nagarmohnish** token — active CLI account is the lh2 one which is denied). 68 files, +9636/−1043.
**Excluded as scratch/confidential** (added to `.gitignore`): `demo assets/` (WhatsApp exports + a
24MB mp4), `roi-engine-dashboard.html` (stale standalone export), `docs/` (going forward); removed
unused `public/roi-engine-logo.png`. Verified no secrets staged (`.env.local` ignored; only
`.env.example` tracked).
**⚠ Note:** `docs/` holds confidential business/legal material and the repo is **public**. Flagged to
the user, who chose to handle it themselves. The new commit did not add to it and `docs/` is now
gitignored so nothing new lands there; pre-existing files remain in tree + history. (Full removal
would need repo→private — may pause the free GitHub **Pages** demo — or a history rewrite + force-push.)
Per user: **left as-is.** Future sessions: do not add anything under `docs/`.

### 2026-06-15 · Aurora-themed cockpit variant (roilabs.in look) at /engine/aurora
Per user "a version of this dashboard in the roilabs theme (same as the landing page)". Generated
**`src/app/engine/v3aurora.tsx`** from `v3.tsx` via a scripted palette+font remap (no hand-rewrite):
indigo accent `#4F46E5` + the cool ramp → **gold `#AA7C09`** + a graded gold ramp; cool neutrals →
**warm** (ink `#1A1710`, muted `#6A6456/#9C968A`, borders `#ECE7DA`); page bg `#F4F5F7` → warm
near-white `#FAF7F0`; mini-tile bg → cream `#FBF6E6`; dark sidebar `#1E1B4B` → warm `#1A1710`; fonts
**Space Grotesk → Sora, Hanken → Manrope** (JetBrains Mono kept for tabular data); status warm-shifted
(green `#1E9E6A`, err `#CC4A3F`). **Brand/source colours preserved** (Google/Meta/Shopify icon hexes,
ROI wordmark yellow `#FACC15`, est-gold `#C9A23A`). Wiring: `Shell` gained a **`variant` prop**
(atlas|aurora) selecting the cockpit; new route **`src/app/engine/aurora/page.tsx`** → `<Shell
variant="aurora">`; Sora+Manrope added to the `engine.css` `@import`. The Atlas `/engine` is
untouched (v3.tsx unchanged; additive font import). `tsc` clean; `/engine/aurora` 200, SSR shows warm
bg + Sora + gold + the dual-outcome hero, **zero indigo leaks**. **Tradeoff:** it's a generated
duplicate (~1000 lines) — re-run `node scripts/make-aurora-theme.mjs` after editing v3.tsx to keep
them in sync (or later parameterise v3 with a theme object). **Local only.**

### 2026-06-15 · Two-funnel accuracy + big dashboard expansion (dummy data) + copy fixes
Per user: AstroTime runs TWO funnels — Google = app-install/CPI (₹0 store revenue), Meta→Shopify
= store revenue/ROAS — so "everything is Shopify revenue" was inaccurate. Ran a 5-agent spec
workflow, then implemented across surfaces (all `src/app/engine/v3.tsx` unless noted):
**Website copy (20 surgical edits, applied via node script):** kept the "Paid media, measured in
revenue" H1 lead but made everything else accurate — "measured by **the outcome that matters —
revenue, installs, or leads**" across `AuroraHome.tsx` (hero sub, why-AI, HIW sub, FAQ, HIW phase-04,
footer, popup), `Integrations.tsx` (header, hero, Google/TikTok/Shopify descs, footer), `layout.tsx`
+ `page.tsx` (SEO/OG/Twitter descriptions).
**Dashboard expansion (dummy, internally consistent at F=1):** new reusable helpers (`BarList`,
`StackBar`, `FunnelStrip`, `DualTrend`, `Waterfall`, `StatTiles`, `Legend`, `CardHead`, `daily()`).
- **Overview** — reframed to a **dual-outcome hero** (Store ₹42.8L / ROAS 3.22× **and** App 18.4K /
  CPI ₹34.8 / "no revenue → ROAS n/a"), MER fixed to **Blended MER 2.64× (all spend) + Store MER
  3.22× (Meta spend)** + Meta-ROAS*; new **"Where spend goes vs what it returns"** (spend split
  60.5/39.5 vs outcome split) and **"What needs attention"** insight list.
- **Google (app funnel)** — added App-install funnel (Impr→Clicks→Installs→In-app events),
  post-install quality strip, By-device / By-region breakdowns, spend-vs-installs trend.
- **Meta (modeled)** — spend-vs-revenue trend, delivery/creative-fatigue strip (Reach/Freq/CPM/CTR),
  placement + age×gender breakdowns, creative-performance table.
- **Shopify** — revenue waterfall (gross→discount→refund→net), new-vs-returning, revenue-by-channel
  (last-click, 4% unattributed), revenue/orders trend.
- Honesty kept: gold `*` on Meta (modeled) + last-click/GA4 estimates; live = Google spend/installs/
  CPI + Shopify orders/sales/AOV/products.
Also fixed the **Meta purchase-funnel bar misalignment** (rate-line placeholder so bars bottom-align)
and made the **account button avatar-only** (dropped "Operator/ROI Labs" text + chevron; dropdown
keeps the info). `tsc` clean; `/engine` + `/` 200; Overview SSR shows all new modules. **Local only.**

### 2026-06-15 · v3 cockpit: logo lockup, account menu, and a split sign-in screen
Per user, three cockpit changes (all in `src/app/engine/`):
1. **Logo.** Sidebar header now uses the **`roi-dark-bg.png`** mark (copied + sharp-`trim()`ed to
   `public/roi-engine-logo.png`) in a dark tile with **equal 8px padding all four sides** (tile
   `display:inline-flex` hugs the image, so margins are symmetric), with **"Engine" on the same
   line**; removed the "ROI LABS" mono caption.
2. **Account menu.** Dropped "senior strategist"; the footer user-chip is now a clickable
   **account button** (generic `Avatar` silhouette + "Operator / ROI Labs" + chevron) opening a
   **dropdown** — Profile · Settings · Help & docs · **Log out** (`MenuItem`/`MenuIcon` helpers,
   outside-click backdrop). `EngineV3` gained an optional `onSignOut`; default routes to the new
   sign-in.
3. **Sign-in screen.** New **`Login.tsx`** — split layout: left = ROI Engine logo + "Paid media,
   measured in revenue." + Continue-with-Google / email, with an **admin-token** path that still
   posts to `/api/engine/status`; right = an **animated cockpit preview** (`CockpitPreview`): KPI
   cards rise in, the revenue line draws (`stroke-dashoffset`), spend bars breathe, live/engine
   dots pulse, card floats. `Shell.tsx` rewired: demo shows the cockpit, **`/engine?login=1`
   previews the sign-in**; logout ↔ login round-trips; live mode gates via the Login token path
   (old `Gate` no longer used). `tsc` clean; `/engine` + `/engine?login=1` + the logo asset all
   200; dashboard SSR confirms no "senior strategist", logo image present, "ROI LABS" caption gone.
   **Local only.**

### 2026-06-15 · v3 cockpit aligned to the current (function-label) positioning
Per user "align the dashboard with the current approach": the marketing site had already retired the
named agents (D16) for **function labels** (the homepage how-it-works pills: *Research & intelligence
→ Creative production → Media buying & landing pages → Measurement & attribution*, mapping to the
Audit→Creative→Launch→Optimize loop), but the redesigned **v3 cockpit still showed Scout/Forge/Pilot/
Frame/Signal** (23 refs in Runs/Activity/Approvals/loop). Renamed the agent display map in
`src/app/engine/v3.tsx`: **Research & intelligence (RI) · Creative production (CP) · Media buying (MB)
· Landing pages (LP) · Measurement & attribution (MA)** (Pilot+Frame = the two halves of the site's
"Media buying & landing pages" pill), and updated every loop/run-timeline/run-history/activity-log/
approval string + the overview engine-running strip. **Backend untouched** — `engine_actions.agent`
+ the `AgentName` union keep the lowercase DB roles (live API routes, `demo.ts`, `v2/`); only the
operator-facing UI is de-named (D16 amendment). **Marketing was already aligned** (zero named agents,
revenue-truth thesis + function language all present) → no landing-page copy changed. Positioning
docs (`VISION.md`, `OVERVIEW.md`, `DATA-SCOPE.md`) de-named to match. `tsc` clean; `/engine` 200, zero
`Scout|Forge|Pilot|Frame|Signal` left in `v3.tsx`. **Local only.**

### 2026-06-15 · `vision/DATA-SCOPE.md` — data-availability + product-scope doc (8-agent workflow)
Ran an 8-agent **research workflow** (Google Ads / Meta Marketing / Shopify Admin / GA4 API docs
in parallel + a connector-source audit + positioning distillation → synthesis → **adversarial
overclaim fact-check**) and wrote the result to **[`vision/DATA-SCOPE.md`](../vision/DATA-SCOPE.md)**.
It maps, per source, exactly what we can extract **now** vs with a connector extension vs elevated
access vs not-at-all, then defines three build tiers and a recommended scope. Headline findings:
**Today = Shopify revenue truth (live) + Google spend efficiency (live, ₹0 purchase value — app/video
funnel); Meta is code-complete but NOT connected, so there's no platform-vs-truth reconciliation yet.
Sessions / store-conversion-rate need GA4 or ShopifyQL (NOT the Shopify Admin API); Google
search-terms/device/geo/impression-share and Meta reach/frequency are not pulled.** Recommendation:
**connect Meta first** (only `META_SYSTEM_USER_TOKEN`, Standard Access, no App Review — the single
unlock that makes the truth-vs-reported moat demonstrable), ship the honest Tier-0 Shopify cockpit,
do cheap Shopify extensions, **defer GA4 + deep reads to Tier 2**. The adversarial pass caught and I
fixed 3 overclaims in the draft (Google age/gender returns *empty* for this account not "✅ now";
Shopify deep backfill needs `read_all_orders` which we don't hold; an unsourced Meta attribution-date
claim softened to "verify at connect"). Indexed in [`vision/README.md`](../vision/README.md). The v3
dashboard's new GA4/Meta/"modeled" markers already implement the doc's "don't show data we can't
extract" recommendation. **Local only — doc + dashboard not deployed.**

### 2026-06-15 · v3 cockpit: dedup hero metrics, realistic graphs, honest data-availability markers
Per user feedback on the new v3 cockpit: (1) **revenue + spend were shown twice** (hero card
*and* the first two Overview KPI cards) — kept them in the **hero only** (it's the chosen
"Spend vs Revenue" hero) and changed the Overview KPI row to four non-duplicated metrics:
**Orders · AOV · New customers · App installs**. (2) **Graphs looked demo-like** — replaced the
pure-sine series + identical diagonal sparklines with a deterministic **mulberry32 PRNG**:
`buildSeries` now uses gentle uptrend + weekday seasonality (weekend dip / Fri lift) +
mean-reverting noise + periodic promo bump; each KPI gets a **unique organic sparkline**
(`sparkSeries`, seeded by label⊕value) instead of the same `trend(72,100)` line. (3) **Honest
data-availability** surfaced in-product (answering "verify what's available"): est-asterisk on
metrics not from a live connector (Shopify **Conversion rate → GA4**), a **Meta "isn't connected
yet — modeled"** banner, a **GA4 footnote** on the Shopify store-conversion funnel (Admin API has
orders, not sessions), and a **global footer** spelling out what's live for The Astro Time
(Google Ads spend/installs/CPI/types + Shopify orders/sales/AOV/products/customers) vs modeled.
All in `src/app/engine/v3.tsx`. `tsc` clean; `/engine` 200, single `>Store revenue<` /`>Orders<`
label node confirmed (dedup). **Local only.** (Companion: a research workflow is producing a
**Data Availability & Product Scope** doc — see next entry once written.)

### 2026-06-15 · Logo on white gets a dark rounded tile (matches the header nav pill)
Per user: wherever the ROI/LABS logo sits on white it now gets a **dark rounded-square backing**
in the same color/style as the header nav pill (`rgba(26,23,18,.94)`, hairline `#2C2820`,
rounded, soft shadow). Required switching those logos from the light variant (dark "LABS") to
**`roi-logo-dark.png`** (white "LABS") so they read on the dark tile. Touched: `aurora.css`
`.fbrand img` (homepage + integrations footers) + their img srcs; `AuditPage.tsx` header logo
(was the **light** logo on the dark `.nv` pill — a latent low-contrast bug, now dark variant);
`Demo.tsx` (/demo) header + footer logos + `demo.css` `.hhd .brand img` / `.hhd .fbr img` pills.
All four routes (`/`, `/audit`, `/integrations`, `/demo`) 200; zero `roi-logo-light` left in
marketing. **Local only.**

### 2026-06-15 · Homepage background → clean white
Per user: Aurora `--bg` token `#FCFBF7` (warm cream) → `#FFFFFF` in `aurora.css`. Page canvas +
input/tile fills now white; cards rely on hairline borders; `--surface-2` cream accent panels
unchanged. `/` 200 on dev. **Local only.**

### 2026-06-15 · Named-agent framing retired from marketing copy (site-wide) — local dev
Ran a 23-agent **workflow audit** of the whole marketing site for now-orphaned named-agent
positioning (Scout/Forge/Pilot/Frame/Signal), then implemented all recommendations. Changes:
**`AuroraHome.tsx`** — How-it-works phase pills → function labels (Research & intelligence /
Creative production / Media buying & landing pages / Measurement & attribution); 3 phase
descriptions + the "Why AI-native" line + hiw__sub + FAQ reworded from "Agents…/agents…" to
"AI". **`page.tsx` + `layout.tsx`** — SEO description "AI agents draft and test" → "AI drafts and
tests" (5 instances synced). **`Integrations.tsx`** — "by Scout" → "the research & intelligence
layer"; "Signal's measurement layer" → "the engine's measurement & attribution layer".
**`demos/page.tsx`** — dropped "the agent orbit system" (stale). **`Demo.tsx`** — 5 "agents/AI
agents" actor refs → "AI" (orbit-ring *visual* left as-is; noindex variant). Engine backend +
cockpit **untouched** (Scout/Forge/… are persisted DB roles — see [DECISIONS.md](DECISIONS.md)
D16). Verified: grep shows **zero proper-noun agents in marketing**; served homepage HTML reflects
every edit; `/` 200 on dev. **Local only** — not deployed. Kept on purpose: "AI-native" descriptor,
`/demo` orbit visual, legacy `ai-native/*` dead code.
**Note:** the Turbopack persistent-cache panic / stale-serve recurred mid-edit; clean restart
(kill node + `rm -rf .next`) fixed it — served HTML then matched source.

### 2026-06-15 · Engine cockpit fully redesigned (Claude Design "ROI Engine.dc.html") — local dev
Implemented the **ROI Engine.dc.html** Claude Design handoff as the new `/engine` cockpit.
Fetched the bundle (gzip→tar via WebFetch), read its README + chat transcript + the design
HTML (854 lines) + CONTEXT.md. The design was built on **our own brand kit** (the `brand-kit/`
folder we exported was the designer's upload) — Atlas light palette: white panels on `#F4F5F7`,
deep-indigo `#1E1B4B` sidebar, indigo `#4F46E5` working accent, brand yellow reserved for the
mark; Space Grotesk / Hanken Grotesk / JetBrains Mono. Faithful React port in
**`src/app/engine/v3.tsx`** (one self-contained client component, inline styles matching the
prototype). Seven pages: **Overview** (Store-revenue-vs-spend hero + area chart, blended KPI row,
two-funnel cards, engine-running strip), **Google** (honest "app/video funnel — no ROAS" banner +
3 KPIs + spend-by-type bars + installs/CPI campaign table), **Meta** (4 KPIs + Impr→LPV→ATC→
Purchase funnel + ROAS campaign table), **Shopify** (4 KPIs + top products + store-conversion
funnel), **Runs** (the Audit→Creative→Launch→Optimize loop + live Run #142 timeline + history),
**Activity** (decision log), **Approvals** (gated spend cards w/ cap meters; Approve/Reject
decrements the sidebar badge → "All caught up"). GA4-style 7D/28D/90D date toggle reflows every
metric. **Honest two-funnel framing** from CONTEXT.md: Google = app/video installs (₹0 purchase
revenue, no ROAS), Meta → Shopify = revenue+ROAS, Shopify = source of truth. Dummy data for
"The Astro Time" (₹). Wired via new **`src/app/engine/Shell.tsx`** (token gate + demo) →
`page.tsx` now renders `Shell` (was `Dashboard`). **Legacy `Dashboard.tsx` + `v2/` kept in tree,
no longer the route** (Gate reused from Dashboard). `tsc` clean; `/engine` SSR-renders all v3
markers, 200 on dev (port 3002, demo). **Local only — not deployed.** Not yet re-wired into v3:
the `?view=` deep-link + light/dark theme toggle (design is light-only).

### 2026-06-15 · Homepage "How it works" redesigned as auto-playing process engine; orbit removed
Implemented a **Claude Design handoff** (`how-it-works/index.html`, fetched from the design
share link `api.anthropic.com/v1/design/h/7UbzVIW-…`) into the homepage. The static 4-step
`#process` section is **replaced** by an **Adwize-style auto-player**: a left browser-chrome
"app" panel that builds cards per phase + a right step list with a filling progress bar, plus an
**App-flow / Timeline** toggle, auto-cycling every 4.6s through the four offerings — **Audit &
opportunity → Creative at volume → Launch across Meta & Google → Optimize until it works** (each
tied to Scout / Forge / Pilot·Frame / Signal). The five-agent **orbit** `#system` section was
**removed** (per user). Built on the existing Aurora system (Sora/Manrope, JetBrains-Mono-style
labels via Geist Mono, cream/ink/yellow, AA-safe gold). Files: new CSS scoped under
`.aurora .hiw` in `aurora.css` (old `.hiw`/`.step` rules swapped out); markup + ported vanilla
JS (PHASES array, render/auto-cycle/toggle, cleanup) in `src/app/AuroraHome.tsx` (also dropped
now-unused icon/logo consts + the orbit/4-step markup); 3 dummy creatives in `public/hiw/`. Nav
"The system" link → **Integrations**; footer Company column likewise. `/` compiles 200 on dev,
no errors; creatives + `/integrations` + engine deep links all 200. See [DECISIONS.md](DECISIONS.md) D14.
**Follow-up (same day):** restored the **per-element staggered build-up** in the app panel —
the design handoff had flattened it to all-blocks-at-once (transform-only) to dodge a
design-tool preview-iframe rAF bug that doesn't exist in real browsers. Now each block rises
then its inner rows/stats tick in sequentially (delays assigned in JS in document order;
`hiw-anim`/`hiw-anim2` classes + `hiwRise`/`hiwFade` keyframes in `aurora.css`), replaying on
every phase. Robust: `opacity:0` only comes from the JS-added classes (failure mode = visible),
plus a `prefers-reduced-motion` override.
**Local only** — not deployed to Vercel or Pages yet.
**Note:** recurring Turbopack persistent-cache panic (`static_sorted_file.rs`) when `.next` is
deleted mid-session; fix = kill node + `rm -rf .next` + restart dev.

### 2026-06-15 · New `/integrations` marketing page + engine tabs deep-linked + Pages republished
Added a new marketing route **`/integrations`** (Adwize-style "connect your stack" page),
rebuilt in the Aurora Light system (cream + brand yellow, Sora/Manrope) — NOT Adwize's
pink/orange. Reframed around ROI Labs' thesis: **"connect your revenue stack"**, every
platform measured against **Shopify revenue truth**, not platform-reported ROAS. 14 connectors
in 3 groups (Ad platforms · Revenue & e-commerce · Measurement & CRM); **Google / Meta /
Shopify = Live**, rest "Coming soon"; Shopify is the featured *source of truth* card. Live
search filter. Files: `src/app/integrations/{page.tsx,Integrations.tsx,integrations.css}`.
Nav (this page only): **Solutions · Blog · Integrations · Audit · Pricing · FAQ** (Blog →
`/blog`, which doesn't exist yet → 404). Global dark `Navbar`/`Footer` now hide on
`/integrations` (Aurora chrome ships inline). Brand-logo SVGs hand-built; the 4 cheap
monogram/blob placeholders (Shopify, Woo, GoHighLevel, Pipedrive) were replaced with proper
brand marks per user.

Also made the **engine dashboard tabs deep-linkable** via a `?view=` query param
(`Dashboard.tsx`: `ALL_VIEWS` + `viewFromUrl()` + URL-sync effect + popstate) so each tab is a
shareable URL (`/engine/?view=runs` etc.) — works on static Pages (client-read param). Valid:
overview·google·meta·shopify·runs·activity·approvals.

Republished **GitHub Pages** (gh-pages, nagarmohnish account) with both changes; all URLs +
per-tab deep links documented in [`GITHUB-PAGES.md`](../documentation/GITHUB-PAGES.md). Live:
https://nagarmohnish.github.io/agency/integrations/ and
https://nagarmohnish.github.io/agency/engine/?view=runs . Vercel/roilabs.in untouched (no deploy).

### 2026-06-15 · Sidebar polish: drop demo avatar, readable ROI wordmark, no red accents
Per user: (1) removed the `.useravatar` circle from the sidebar account chip (kept the
"The Astro Time / Growth plan" text). (2) Sidebar "ROI" wordmark was bright yellow `#FACC15`
on the white sidebar (low contrast) — added a light-mode-only override
`.eng:not(.dark) .wordmark .roi { color: #A16207 }` (deep gold, AA-readable); dark mode keeps
`#FACC15`. (3) Removed the red left-accent bar (`attn-neg`) from the **Anomaly feed** and the
high-impact **Proposed actions** card in Overview — both render as plain cards now (per-row
tone dots kept). `tsc` clean, `/engine` 200 on dev. **Local only.**
**Follow-up:** reverted the ROI wordmark to bright yellow `#FACC15` and instead gave the
light-mode **sidebar a deep indigo background** (`--sidebar: #1E1B4B`, on-brand with the Atlas
accent) so the yellow logo pops; added `.eng:not(.dark) .sidebar …` overrides to relight nav
labels / subheaders / account text / sign-out on the dark column. Dark mode unchanged.

### 2026-06-12 · Nav collapsed to Overview · Sources · Engine; analytics live inside each source
Per user: removed the generic **Analytics** nav group (Performance / Segments / Revenue /
Insights tabs) and stripped the abstract glyph symbols from the nav — the only nav marks now
are the three brand logos on the Sources rows. Each source tab is now the home for that
platform's full performance analytics: **Google** gained a second KPI row (Impressions ·
Clicks · CTR · CPC · CPM · CVR) on top of its spend/MER/ROAS/conv/CPA strip, truth check,
spend-vs-Shopify-rev trend, campaigns table and network/age/gender breakdowns; **Shopify**
keeps the full Revenue analytics; **Meta** stays the honest pending state. `View` type,
`ANALYTICS`, `NAV`, `TITLE`, router and command palette trimmed to the surviving views;
`Overview`'s "view all campaigns →" now routes to Google. The `Performance`/`Segments`/
`Insights` components remain exported (unused) in `views.tsx` for possible reuse; `Revenue`
is still used inside `ShopifySection`. `tsc` clean, `/engine` 200 on dev. **Local only.**

### 2026-06-12 · Dedicated platform sections (Google · Meta · Shopify) — local dev
Replaced the orthogonal **Source** toggle (Overall/Google/Shopify/Meta in the controlbar)
with **dedicated nav sections** per platform. Overview stays as the cumulative all-source
growth view. New sidebar groups: **Sources** (Google · Meta · Shopify) sit between Overview
and Analytics, each with its own subheader. New components in `engine/v2/views.tsx`:
`GoogleSection` (KCell strip: spend / Shopify-rev·Google / Google-MER / platform ROAS /
conversions / CPA + truth-check strip + spend-vs-Shopify-rev area + campaigns table +
by-network and by-age&gender `BreakdownTable`s), `MetaSection` (pending state — "isn't
connected yet" + ghost KCell strip + on-connect availability), `ShopifySection`
(`PlatformHeader` + existing `Revenue` view + availability). Shared helpers added:
`PlatformHeader` (colored letter badge + connection dot), `AvailabilityPanel` (two-column
"✓ Available now" / "+ Post-integration" from the `AVAIL` map — honest, no vain metrics),
`segGroup` + `BreakdownTable`. CSS: `.plathdr*`, `.availgrid`/`.avail-h`/`.availlist`,
`.kcell.metaghost`. Dashboard: View type + NAV groups (main/sources/analytics/ops) + router
cases + removed the `SOURCES` const and `.srcseg` controlbar block. `tsc --noEmit` clean,
`/engine` compiles + 200 on dev (port 3002, demo mode). Sidebar Sources items render real
brand logos (multicolor Google G · Meta infinity · Shopify bag) via the existing
`BrandIcon` component, sized to the 15px nav glyph. **Local only — not deployed.**

### 2026-06-11 · R1 shipped + Shopify extended + deployed
Built R1 on the real-data foundation and **deployed to roi-engine-six.vercel.app/engine**
(roi account, demo env): source toggle Overall/Google/Shopify/Meta (wired through metrics +
primary graph; Meta pending); lens "Shopify"→"Last-click"; **Revenue** rebuilt (KPI strip,
net-vs-gross area, composition bar, new-vs-returning over time, channel contribution —
all real via the extended Shopify connector); **Runs** = platform→campaign **engine-run
drill-down** (5-agent Scout→Forge→Pilot→Frame→Signal timeline per campaign + Approve/Skip
CTA + "run more analysis"); Scout **quick wins** from real signals (low-ROAS trim, top-ROAS
scale, CPA-rising); **Performance** redesigned (grouped Delivery/Economics/Trend columns +
per-campaign identity); **attention highlights** (left accent on flagged insight cards,
anomaly feed, high-impact proposals); logo ROI-yellow + Engine; **light-mode primary
buttons yellow**. **Real-data trim:** dropped Device/Geo/Search-terms tabs; search-terms +
creative-fatigue are honest "unlock" cards; campaign status from real ROAS (no impression-
share). Build green. (Note: under Source=Shopify, Overview shows spend ₹0 + empty campaign
table by design — store-truth view; candidate for a store-only layout later.)

### 2026-06-11 · Data-source audit + `data-sources/` raw-data layer
Audited the live connectors (`google.ts`, `meta.ts`, `shopify.ts`) and found the demo
fabricates more than we actually extract. Created **`data-sources/`** (CATALOG.md =
exact per-source fields + dashboard availability matrix; README.md = trim-vs-extend
decision; raw/ = sample shapes + live-dump store). **Real today:** spend, platform
revenue/ROAS/conv, CTR/CPC/CPM/CPA/CVR, Shopify daily revenue/orders/AOV, **MER**, **truth
gap**, Google network/age/gender (range-aggregate), insights truth-gap/CPA-decomp/
diminishing/DOW/anomalies. **Not extracted (demo-only):** ncMER/nCAC + new-vs-returning,
Shopify last-click lens/UTMs/unattributed%, refunds/discounts/products, search terms,
device/geo, reach/frequency. Most Shopify gaps are a `getRevenue` extension, not a new
integration. **Pending user call: trim dashboard to real-now vs extend Shopify connector.**

### 2026-06-11 · Vision folder + R1 roadmap; working mode = local-first
Created [`vision/`](../vision/README.md) — the strategic layer: `VISION.md` (what/why/who
+ the "measured in revenue" thesis + Atlas/Terminal design philosophy + north star),
`CHRONOLOGY.md` (dated journey of every phase built, with rationale), `ROADMAP.md` (the
active **R1** round + parked work). Indexed from `INDEX.md`.
**Working mode set by user: local-first — implement + verify on `localhost`, deploy to
Vercel only when explicitly asked.** Next up = **R1** (not yet started): (1) source/
platform toggle Overall/Google/Shopify/Meta, (2) same filter on the primary graph,
(3) richer Revenue section, (4) Runs platform→campaign drill-down with per-campaign engine
runs + immediate CTAs + "run more analysis", (5) revenue-tied quick wins, (6) fix light-mode
logo visibility + make light-mode **primary buttons yellow**, (7) attention highlights on
sections needing action. Details in [`vision/ROADMAP.md`](../vision/ROADMAP.md).

### 2026-06-11 · Atlas / Terminal redesign (Claude Design handoff → React /engine)
Implemented the **`ROI Engine Dashboard.dc.html`** design from a Claude Design
handoff bundle (fetched, gunzipped/un-tarred; README + chat transcript read). The
design redesigned our own standalone dashboard into a **single Overview with a
light/dark theme toggle**: Light = **Atlas** (indigo `#4F46E5`, white panels),
Dark = **Terminal** (amber `#FACC15`, near-black `#08090A`). Target chosen by user:
**React `/engine` app**, scope **whole dashboard, functional**.
- **Two-mode token system** in `engine.css`: light tokens on `.eng`, dark overrides
  on `.eng.dark`; old tokens kept as aliases (`--brand→--accent`, `--surface→
  --panel-2`, etc.) so every existing component inherits the theme. Fonts switched to
  **Space Grotesk / Hanken Grotesk / JetBrains Mono** (Google Fonts `@import`).
  Charts made theme-aware (`COL` → CSS vars; donut → ink-opacity ramp).
- **New chrome (all functional):** sidebar logo mark + icon nav + user chip; topbar
  with live integration status chips, lens segmented control, date pill, **live clock**,
  **⌘K command palette** (switch view/lens, toggle theme), **theme toggle** (persists to
  localStorage); **sync ticker** (MER/nCAC/window); **Scout rail** with real proposed
  actions (from the wasted-spend / scaling / tracking insights) + Approve/Later.
- **Overview rebuilt to match the design exactly:** divided 5-up KPI strip (Spend ·
  Revenue·truth · MER · nCAC · Orders) with mono values, deltas, and sparklines (real
  data, hover ⓘ retained); blended-performance **area chart** (revenue area+line vs
  spend); **anomaly feed** (from real insight flags); **campaign table** with derived
  status (SCALING/CAPPED/DRIFTING). Other views inherit the theme + chrome.
- **Density auto-scale:** the desktop layout is tuned for wide canvases and read as
  cluttered at 100% browser zoom on a 1920px monitor. Added `min-width`-gated CSS
  `zoom` steps on `.eng.shell`/`.eng.gate` (0.92 → 0.66 from 1500px → 2600px) so wide
  screens auto-render at the comfortable ~75-80% scale without manual browser zoom;
  laptops (<1500px) stay full size. `zoom` (not `transform`) keeps the layout filling
  the viewport, so no gaps and the ⌘K overlay still covers.
- **Logo** is the wordmark **ROI Engine** (no icon mark): "ROI" in accent + "Engine"
  in ink, Space Grotesk 700.
- **Deployed (2026-06-11):** the demo dashboard is **live at
  https://roi-engine-six.vercel.app/engine** — a separate Vercel project `roi-engine`
  on the "roi account" (team `mohnishnagar-6934s-projects`; token in `.env.local` as
  `VERCEL_ROI_ENGINE_TOKEN`) with `NEXT_PUBLIC_ENGINE_DEMO=1`. The marketing site
  (`agency` → roilabs.in) keeps `/engine` **token-gated** (demo env removed there). The
  dashboard is at **/engine** (the root serves the marketing homepage — same repo). See
  the [[roi-engine-deploy]] auto-memory + D12.

### 2026-06-11 · Standalone single-file dashboard export
`roi-engine-dashboard.html` at repo root — the entire ROI Engine v2 cockpit ported
to one self-contained file (embedded CSS + vanilla JS, zero dependencies, no build).
Re-implements the seeded 120-day demo dataset, metrics + attribution lens, all 10
insight modules, GA4 date picker (presets + dual-month calendar + compare),
granularity, filters, source health, and every view (Overview/Performance/Segments/
Revenue/Insights/Runs/Activity/Approvals) with working interactivity. Opens directly
in a browser via file://. Syntax-checked + runtime-smoke-tested (all views × lenses ×
tabs × granularities × presets). Mirrors the React app's DOM classes so it's visually
identical; intended as a shareable artifact, not wired to the live backend.

### 2026-06-11 · Dashboard v2 — IA rebuild (data model, controls, analytical depth)
A rebuild (not a restyle) of the analytics half of `/engine`, product renamed
**ROI Engine** (title + sidebar wordmark). New self-contained layer under
`src/app/engine/v2/`:
- **Daily-grain data model** (`types.ts`): facts stored only at daily grain
  (`fact_ad_daily`, `fact_ad_segment_daily`, `fact_orders` order-level w/ UTMs +
  new/returning + refunds + discounts, `fact_search_terms_daily`, integrations).
  All period totals/comparisons computed at query time.
- **Deterministic demo generator** (`demo-data.ts`): 120 days for "The Astro Time".
  Google + Shopify facts only; **Meta generates no facts** (status `in_progress`)
  so the pending pattern is real and blended excludes it.
- **Compute layer**: `metrics.ts` (canonical metrics + the 3-way **attribution
  lens**: platform-reported / Shopify last-click via UTMs / blended MER) and
  `insights.ts` (**all 10 insight modules** with real computed takeaways).
- **Global controls** (`controls.tsx`): GA4-style **dual-month date picker**
  (hand-rolled, presets + custom + 4 compare modes, Apply-gated), granularity,
  lens toggle, "+ Add filter" chips, source-health chips. State serialized to
  **URL params** via `state.ts`.
- **Views** (`views.tsx`): Overview (lead sentence, KPI row, truth strip,
  spend/revenue combo chart, top signals), Performance (sortable campaign table +
  row drawer), Segments (11 tabs), Revenue (Shopify truth), Insights (10 modules).
  Ops views (Runs/Activity/Approvals) ported to `ops.tsx` with **wiring
  unchanged**. Charts hand-built in `ui.tsx` (line/combo/waterfall/heatmap/scatter/
  donut/sparkline), ink lines + yellow annotation dots only.
- **Live degradation:** the live API exposes ~30% of the model (no order-level
  UTMs, no daily-per-campaign, no search terms, no device/geo daily). So v2 is
  fully realised in **demo mode**; in live mode the analytics views show an honest
  "awaiting the daily-fact pipeline" notice while ops views keep working live.
  Never fakes numbers. See D11.
- Build + typecheck green. One dependency considered (react-day-picker) but
  **not added** — calendar hand-rolled (zero new deps).

### 2026-06-11 · Cockpit visual redesign (light / Swiss instrument panel)
Visual-layer-only reskin of `/engine` — no data fetching, demo wiring, routing, or
business logic touched. `engine.css` fully rewritten to a white/ink token system
(deleted the dark sidebar, cream surfaces, yellow gradients, soft shadows). Brand
yellow `#FACC15` kept as the thread, confined to 5 allowed spots. `Dashboard.tsx`:
added the **metric anatomy** (`Kpi` now renders source chip · delta · explainer ·
keyboard-reachable ⓘ tooltip · sparkline), rewrote both charts to 1.5px ink lines
with y-gridlines, no fills, and a yellow latest-point dot; donut recoloured to a
monochrome ink ramp. Sidebar logo swapped `roi-logo-dark.png` → `roi-logo-light.png`.
`theme-color` overridden to `#FFFFFF` for the `/engine` route via a `viewport`
export in `page.tsx` (marketing site stays `#0a0a0a`). KPI deltas are derived from
the already-fetched daily series (trailing half vs leading half, labelled "vs prior
Nd") because the no-new-fetch constraint rules out a true prior-period pull — see D10.
Build verified green.

## Current state (as of 2026-06-11)

- ✅ **Google LIVE** on the real brand **The Astro Time** (customer `9924807033`,
  direct access, no manager link). Reading 47 campaigns; first Scout audit done
  (health 52/100). `read_only` + dry-run — cannot spend.
- ✅ **`/engine` is "ROI Engine" v2 with the Atlas / Terminal adaptive theme** —
  daily-grain data model, GA4 date picker, day/week/month granularity, 3-way
  **attribution lens** (topbar segmented), URL-persisted filters. Chrome: icon
  sidebar + user chip, topbar integration chips + **live clock** + **⌘K palette** +
  **light/dark theme toggle** (localStorage), **sync ticker**, **Scout rail** (real
  proposed actions). **Overview** matches the design (divided KPI strip + area chart +
  anomaly feed + campaign table). Views: Overview · Performance · Segments (11 cuts) ·
  Revenue · Insights (10 modules) — divider — Runs · Activity · Approvals (ops wiring
  unchanged). Theme tokens: Light=Atlas indigo / Dark=Terminal amber, on `.eng` /
  `.eng.dark`. **Fully exercisable in demo mode** (`NEXT_PUBLIC_ENGINE_DEMO=1`, 120
  days); live mode degrades analytics to an honest "awaiting daily-fact pipeline"
  notice. Code under `src/app/engine/v2/`. Build green; static-prerendered for Vercel.
- ✅ Engine on **`Revenue_tech`** Supabase project (`xcszgeypiehclulltzoh`) —
  separate from the marketing leads DB (`gaulosvlnynoxgdjelgm`).
- ✅ Security hardened (server-derived spend cap, per-mutation ceiling, dry-run on
  approvals, constant-time auth) — see `SECURITY.md`.
- ✅ **Shopify LIVE** (revenue source of truth): AstroTime Store, 160 orders /
  ₹120,787 / 30d. Revenue tab shows KPIs, trend, daily table, reconciliation.
- ⏳ **Meta pending**: app needs the Marketing API use case added (admin, ~next
  day) → generate System User token → pick 1 of 4 ad accounts → wire it. Once
  live, the Revenue reconciliation (Meta-reported vs Shopify-actual) populates.
- 🔒 Safety: `ENGINE_DRY_RUN=true`, global cap `0` — nothing can spend yet.

## Key facts / IDs (non-secret)

- Brand: **The Astro Time** (theastrotime.com). Engine account row id `6c51173e-…`.
- Google: client customer `9924807033` (Ads Account 1); MCC `1228513668`
  (not linked — direct access, so `GOOGLE_ADS_LOGIN_CUSTOMER_ID` is empty).
  API version `v21` (v18/v19 sunset). Currency INR.
- Meta: System User "Conversions API System User" (4 Astrotime ad accounts assigned).
- Secrets live ONLY in `.env.local` (git-ignored) — never commit them.

## What exists

- DB: `engine_accounts`, `engine_campaigns`, `engine_creatives`, `engine_metrics`,
  `engine_actions` (audit log), `engine_runs`, `engine_audit_runs`. RLS-locked.
- Engine lib: config, types, db, audit-log, governance gate, connectors
  (Google REST + Meta Graph, with `getBreakdowns`), agents (5 roles + orchestrator
  + tools), runner. Scout is the only fully-built agent.
- Routes: `/api/engine/{run,status,audits,campaigns,breakdowns,runs,approvals}` (admin-bearer).
- Helpers: `scripts/google-oauth.mjs`, `scripts/google-exchange.mjs`.

## Next steps

1. **Meta** (next day): admin adds Marketing API to the app → generate EAA token →
   pick the ad account (`act_…`) → add token to `.env.local` → wire account row → verify.
   Meta's age/gender breakdowns will populate the Segments tab.
2. Phase 3+: build Signal (fix conversion-value tracking — the #1 audit finding),
   then Pilot/Forge/Frame to act on findings (all via the governance gate).
3. The AEO/GEO AI-search module + the public case-study page generator.

## Changelog

### 2026-06-11 — 🖥️ Engine cockpit DEMO published to GitHub Pages
- Live (no backend, sample data): **https://nagarmohnish.github.io/agency/engine/**.
  All 8 screens render fully populated for a fictional "The Astro Time" account.
- Added `src/app/engine/demo.ts` + a `DEMO` branch in `Dashboard.tsx`: when built
  with `NEXT_PUBLIC_ENGINE_DEMO=1`, the token gate is skipped and `useApi` returns
  canned `demoCall(path)` data instead of fetching `/api/engine/*`. Vercel deploys
  leave the flag unset, so the live token-gated cockpit is untouched.
- Fixed: plain `/engine` on Pages threw a client-side exception (gate → failed
  fetch against a 404). Demo mode bypasses that path entirely. Also base-pathed the
  sidebar logo (`${NEXT_PUBLIC_BASE_PATH}/roi-logo-dark.png`).
- Build/publish: same flow as [[gh-pages-deploy]] but add `$env:NEXT_PUBLIC_ENGINE_DEMO='1'`
  to the export build. The real shareable engine with LIVE data is the Vercel deploy below.
- ⚠️ Source edits (Dashboard.tsx, demo.ts) are on master but **uncommitted** — commit
  them to make the demo reproducible.

### 2026-06-11 — 🚀 Engine deployed to a SEPARATE Vercel account (shareable)
- Live at **https://roilabs-engine.vercel.app/engine** (project `roilabs-engine`,
  team `mohnishnagar-6934s-projects`, **Hobby**). Account = mohnish.nagar@roilabs.in
  — fully isolated from nagarmohnish/roilabs.in (deployed from a `git archive HEAD`
  temp export with a scoped token, so the main `.vercel` link was untouched).
- Admin token lives in `.env.local` (`ENGINE_ADMIN_TOKEN`) — share it + the URL with
  viewers. NOT written to any committed file.
- Verified live: Google + Shopify connected; read views respond ~2s (fine on Hobby).
  The audit **Run** (30-90s agent loop) will time out on Hobby — run locally or go Pro.
- **Redeploy** (token in `.env.local` as `VERCEL_ROI_ENGINE_TOKEN`, project link in
  git-ignored `.vercel-engine.json` → projectId/orgId):
  `D=$(mktemp -d)/e && mkdir -p $D && git archive HEAD | tar -x -C $D && cd $D &&`
  `mkdir .vercel && cp <repo>/.vercel-engine.json .vercel/project.json &&`
  `npx --yes vercel@latest --prod --token <VERCEL_ROI_ENGINE_TOKEN>`.
  (New env vars: `npx vercel env add NAME production --token …` from that dir.)

### 2026-06-11 — Dashboard re-skinned to roilabs.in (Aurora) design
- `engine.css` rebuilt on the **Aurora Light tokens** (from `aurora.css`): cream
  `#FCFBF7` bg, white cards, brand-yellow gradient, ink, gold eyebrows, `--sh`
  shadows. Fonts: **Sora** (headings) + **Manrope** (body) — already on `<body>`.
- **Dark sidebar** with the real `roi-logo-dark.png` (ROI/LABS) — the site's
  dark-nav treatment; light content area. Pill gradient buttons, gold eyebrows.

### 2026-06-11 — 🎉 Shopify LIVE + Revenue tab sections
- Shopify connected on AstroTime Store (`fuwxki-13.myshopify.com`): **160 orders /
  ₹120,787 / 30d, AOV ₹755**. Connection green in `/status`.
- Token obtained via OAuth (Dev Dashboard apps are OAuth-only; the "App automation
  token" is for CI/CD, not the Admin API — it 401s). Client ID/secret →
  `scripts/shopify-exchange.mjs` minted a `shpat_` token (scope read_orders).
  Approved on Mac → redirect to example.com (the app URL) → pasted callback → exchanged.
- Revenue tab now has proper sections: KPIs (revenue/orders/AOV), revenue trend,
  **daily orders & revenue table**, and the Meta-vs-Shopify reconciliation
  (shows null until Meta connects).
- `.env.local`: SHOPIFY_API_KEY/SECRET kept only for re-minting (not read by engine).

### 2026-06-11 — Shopify integration (revenue source of truth)
- New `src/lib/engine/shopify.ts` (Admin API, `read_orders`): `getRevenue(days)`
  pulls real orders (paginated), daily series, AOV. Not an ad connector.
- New route `/api/engine/revenue`: Shopify actual + Meta-reported purchase-value
  **reconciliation** (discrepancy %). New `/engine` **Revenue** tab (KPIs, revenue
  trend, reconciliation card). Shopify ping added to `/status` connections.
- Config: `SHOPIFY_STORE_DOMAIN` / `SHOPIFY_ADMIN_TOKEN` / `SHOPIFY_API_VERSION`
  + `requireShopify`/`shopifyConfigured`. ENGINE.md "Connecting Shopify" added.
- Awaiting creds: custom-app `shpat_` token + store domain → `.env.local`.

### 2026-06-11 — Account-structure context
- Learned AstroTime runs two funnels: **Google = app/video** (₹0 conversion value),
  **Meta = Shopify store** (real purchase revenue). Meta will make ROAS computable.
  Captured in CONTEXT.md; flagged a future Shopify-connector idea (revenue truth).

### 2026-06-10 — Repo cleanup + pushed to GitHub
- Cleaned: gitignored `*.mp4`/`*.mov` (kept the screen recording out of git),
  reset `.env.example` admin token to empty, removed transient `*.log` files.
- Verified no secrets staged (`.env.local` ignored; secret scan clean).
- Pushed all engine + dashboard work to `origin/master` (github.com/nagarmohnish/agency).

### 2026-06-10 — Dashboard redesign (sidebar + charts + date range)
- Rebuilt `/engine`: **sidebar nav** (was top tabs), sticky header with a
  **7/14/30-day range toggle** wired through Overview/Campaigns/Segments.
- **Charts** (inline SVG, no dependency): donut for traffic-source spend split,
  spend+conversions **trend line**, KPI cards. Added `daily` time-series to
  `/api/engine/campaigns` to feed the trend.
- Restyle/polish: shadows, refined palette, hoverable tables, responsive collapse.
  Type-check clean; page 200; 7d trend returns real points.

### 2026-06-10 — Segment breakdowns (traffic source / age / gender)
- New connector method `getBreakdowns(days)`: Google via `segments.ad_network_type`,
  `gender_view`, `age_range_view` (each dimension resilient/skippable); Meta via
  insights breakdowns `publisher_platform`/`age`/`gender` (ready for when Meta connects).
- New route `/api/engine/breakdowns` — account-level + campaign-level rollups with
  spend + CAC. New `/engine` **Segments** tab (traffic sources, gender, age, per-campaign).
- Live result: AstroTime is ~72% YouTube spend (₹128k/₹178k), CAC ~₹2.35; Display ₹2.87,
  Search ₹2.14. **Age/gender = ₹0** because the account is App/Video-heavy (those campaign
  types don't populate Google's demographic views) — a real measurement finding, not a bug.
  Meta breakdowns will populate age/gender once connected.

### 2026-06-10 — Runs transparency dashboard
- Fetches now logged: `read_campaigns` / `read_metrics` actions written for every
  connector read (tools.ts) → the audit trail shows WHAT data fed the analysis.
- New route `/api/engine/runs` — groups each run with its fetches, proposed
  mutations, audit output, and token cost.
- New `/engine` **Runs** tab: per-run "What we fetched → What we concluded" with
  token/duration cost and a collapsible agent narrative. (Pre-existing run shows
  0 fetches since it predates fetch-logging; future runs populate it.)

### 2026-06-10 — 🎉 First real Scout audit ran (end-to-end works)
- `ANTHROPIC_API_KEY` added; ran Step 1 (Scout) on the live AstroTime account.
  Read-only, no platform changes. Run `f9865d07…`, stored in `engine_audit_runs`.
- **Result: health 52/100, 7 ranked opportunities.** Top finding = ₹0 conversion
  value on every campaign (the "measured in revenue" gate), then AI-creative
  disclosure risk, spend concentration (~51% one campaign), an enabled-but-not-
  serving iOS campaign, near-zero-delivery days, video fatigue, 38 paused shells.
- Proves the product thesis: real account → real loop Step 1 → real findings,
  fully logged. This is the case-study seed.

### 2026-06-10 — 🎉 Google LIVE on the real account
- **Google connected and reading the real AstroTime account** (Ads Account 1,
  customer `9924807033`), `read_only` + dry-run. `engine_accounts` row inserted
  (id `6c51173e…`, currency INR) via service-role key.
- Direct access (no manager link): cleared `GOOGLE_ADS_LOGIN_CUSTOMER_ID`; made
  it **optional** in `requireGoogle()` (config.ts). Dev token already works on the
  real account (no Basic-approval wait needed).
- **Fixed API version:** v18/v19 are sunset (404). Probed v20–v23 (all 200);
  set default `GOOGLE_ADS_API_VERSION` to **v21**.
- Live data confirmed: **47 campaigns, ₹178,936 spend / 30d, 75,228 conversions,
  ₹0 conversion value** → revenue/ROAS uncomputable. First real finding: conversion
  *value* tracking is missing (a "measured in revenue" gap for Scout/Signal).
- Blocker for first audit: `ANTHROPIC_API_KEY` not yet set.

### 2026-06-10 — Credentials in progress
- **Google:** OAuth client created (user's own Cloud project), `GOOGLE_OAUTH_CLIENT_ID/SECRET`
  in `.env.local`, and `GOOGLE_ADS_REFRESH_TOKEN` minted + written (consent approved on a
  Mac; helper redirect failed cross-machine, so exchanged the code via
  `scripts/google-exchange.mjs`). Still need: developer token (apply **Basic** access),
  MCC `login-customer-id`, brand client customer id → then insert `engine_accounts` row.
- **Meta:** parked — the selected app lacks the Marketing API use case; needs an app
  admin to add it (expected next day). System User "Conversions API System User" has the
  4 Astrotime ad accounts assigned. Token not yet generated.
- New helper: `scripts/google-exchange.mjs` (exchanges an auth code when the loopback
  redirect can't reach the local helper — e.g. browser on a different machine).

### 2026-06-10 — Security hardening (before real money)
- **Fixed spend-cap bypass:** gate now derives spend from the mutation *payload*
  (`assessSpendCents`), not the agent's self-reported number; enabling a campaign
  with an unknown budget is forced to approval.
- Added **per-mutation hard ceiling** (`ENGINE_MAX_SINGLE_MUTATION_SPEND_CENTS`) —
  rejects outright, re-checked at approval time.
- `executeApproved` now **respects the dry-run kill switch** + the ceiling.
- Admin-token compare is now **constant-time** (`auth.ts`).
- Gitignored `*.log` (dev logs). Confirmed no client code imports engine lib or
  secrets. Added `SECURITY.md` (threat model + go-live checklist). New decision D9.

### 2026-06-10 — Engine DB connected (local)
- `SUPABASE_SERVICE_ROLE_KEY` (Revenue_tech `sb_secret_…`) added to `.env.local`.
- `/api/engine/status` now reaches the DB (returns "No engine account configured"
  — expected). Next: insert the `engine_accounts` row + add `META_SYSTEM_USER_TOKEN`.

### 2026-06-10 — Dashboard gate UX + local env
- Token gate now admits a valid token even when downstream isn't configured
  (only 401/503 block); sections show their own setup state. `ENGINE_ADMIN_TOKEN`
  set locally to `12345` (placeholder — replace before production). Dev server on
  port 3001 (3000 in use).

### 2026-06-10 — Project memory layer
- Added `project-memory/` (this folder) + root `CLAUDE.md` maintenance rule.

### 2026-06-10 — Frontend + data architecture
- `ARCHITECTURE.md` (data flow + screens mapped to the 5 steps).
- API routes `/api/engine/audits` and `/api/engine/campaigns` (live KPIs:
  spend, revenue, ROAS, CAC, CTR, conversions).
- `/engine` dashboard: token gate + Overview/Audit/Campaigns/Activity/Approvals.
- Hid the marketing Navbar/Footer on `/engine`.

### 2026-06-10 — Backend engine (Phase 1)
- Migration `20260610130000_create_engine.sql` (applied to `Revenue_tech`).
- Engine lib (config/types/db/audit-log/governance/connectors/agents/runner).
- Ops routes (run/status/approvals). `ENGINE.md` + `.env.example` additions.
- Added `@anthropic-ai/sdk`. Orchestrator uses `claude-opus-4-8`, adaptive
  thinking, prompt caching, manual tool-loop (human-in-the-loop gate).
