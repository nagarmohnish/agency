# Context — external references & research

Background that shaped the build but isn't in the code. Update when new research
or external facts change our approach.

## Research findings (June 2026)

**AI-native ad-agency landscape.** Platforms shipped official MCP servers/CLIs
(Meta Ads MCP — read/write, creates entities paused by default; Google Ads MCP —
read-only; Meta Ads CLI for agents). Creative models (Veo 3.1, Kling 3.0,
Seedance) are API-accessible. Conclusion: reuse rails, build orchestration +
governance + attribution. Platforms are moving up-stack (Meta acquired Manus AI),
so durable value = cross-platform + attribution truth + governance. AI-creative
disclosure labels are required (Google/Meta 2026; EU AI Act Art. 50 from Aug 2026).

**Meta Marketing API.** Permissions: `ads_read`/`ads_management`/`business_management`.
Standard Access (no App Review) works on accounts your business owns; Advanced
Access + App Review needed for *clients'* accounts. Production = System User +
non-expiring token in Business Manager. Fully automatable: campaign/adset/creative
create, budget, insights. CAPI is separate, server-side.

**Google Ads API.** Developer token tiers: Test (own test accounts only) → Basic
(~days) → Standard (~weeks; early-2026 backlog). OAuth + MCC (`login-customer-id`)
for client accounts. Fully automatable: Search/PMax, RSAs, budgets, conversions,
GAQL reporting. **Reading a real account needs Basic-access token, not Test.**

**Fastest path to one real account:** Meta own/managed account works ~immediately
under Standard Access; Google test MCC works today but serves no real ads (so for
real results, get Basic token). We have the brand's Google MCC + Meta BM access.

**LLM / AI-search ads (the "LLM search" claim).**
- Buyable: Google AI Overviews/AI Mode (standard Google Ads API), Microsoft
  Copilot (Microsoft Advertising API), ChatGPT (self-serve UI, no API).
- **Perplexity abandoned ads** (FT, Feb 2026). Claude/Gemini-app: no in-answer ads.
- Everything else = **AEO/GEO** (earn citations; measure share-of-voice). Tools
  with APIs: Profound (REST + MCP), Peec AI, Scrunch.
- → Treat as two products: paid where buyable + citation optimization elsewhere.

## The Astro Time — account structure (non-obvious)

The brand runs two funnels on different platforms:
- **Google = app / video** (app installs, YouTube-heavy). This is why Google shows
  conversions but **₹0 conversion value** — app campaigns don't report purchase
  revenue, and these campaign types also don't populate Google's age/gender views.
- **Meta = the Shopify store** (ecommerce purchases). Shopify orders fire as pixel
  `purchase` events → so Meta WILL carry real conversion value (revenue) and ROAS
  becomes computable once connected. Our Meta connector already reads `purchase` /
  `offsite_conversion.fb_pixel_purchase` for conversions + value. Meta age/gender
  breakdowns will populate the Segments tab.

**Idea (Phase 3 / Signal):** add a Shopify Admin-API connector as the *revenue
source of truth* — reconcile platform-reported purchase value against actual
Shopify orders. The most defensible version of "measured in revenue, not ROAS."

## Project infrastructure facts

- Marketing site: Next.js 16 + React 19 + Tailwind 4 + Supabase, on Vercel.
  Deploy is **not** auto on git push — `npm run deploy` / `npx vercel --prod`.
- Two Supabase projects: marketing leads (`gaulosvlnynoxgdjelgm`) and the engine
  (`Revenue_tech` / `xcszgeypiehclulltzoh`).
- Helper: `scripts/google-oauth.mjs` mints the Google Ads refresh token (loopback
  OAuth flow on localhost:53682).

### engine.roilabs.in deployment (D25, 2026-06-17)
- **Two Vercel projects, same repo, different env** (under team `nishmos-projects` /
  `team_scI4Xid4VRlWuh35Sq5Z9AzF`, Vercel CLI authed as `nagarmohnish`):
  - **`agency`** (`prj_2rQDxonqnO9VAVJFPUgALg6Ao0pj`) → production domain **roilabs.in** (marketing,
    token-gated engine). The repo's `.vercel` is linked here by default.
  - **`roi-engine`** (`prj_0gzzlePDEkHcYqY55cNEkClqee2D`) → domain **engine.roilabs.in**; env
    `NEXT_PUBLIC_ENGINE_AUTH=supabase`, `NEXT_PUBLIC_ENGINE_DEMO=1`, `NEXT_PUBLIC_SUPABASE_URL/ANON`
    (leads project), `NEXT_PUBLIC_BOOK_CALL_URL=https://calendly.com/mohnish-nagar-roilabs/30min`.
  - To deploy roi-engine: `vercel link --yes --project roi-engine` → `vercel --prod` → relink back to
    agency (`.vercel/project.json`). DNS auto (roilabs.in on Vercel nameservers — no records to add).
- **End-user auth = Supabase `gaulosvlnynoxgdjelgm`** (the *leads* project; browser client
  `getSupabase()` reads `NEXT_PUBLIC_SUPABASE_URL/ANON`). User did the dashboard config: Email enabled +
  **Confirm-email OFF**, Site URL `https://engine.roilabs.in`, redirect URLs `…/engine` & `localhost:3002/engine`;
  **Google** provider on (reuses the existing `GOOGLE_OAUTH_CLIENT_ID/SECRET` Ads client, with the Supabase
  callback `https://gaulosvlnynoxgdjelgm.supabase.co/auth/v1/callback` added in Google Cloud). The Google
  client ID/secret live in the **Supabase dashboard**, not app env.
- ⚠️ **Go-live blocker:** `roi-engine` has Vercel **Deployment Protection** ON (401) — must be disabled in
  the dashboard before engine.roilabs.in is publicly reachable. (Couldn't be toggled via CLI/token.)

### Operator SSO (D26, 2026-06-17)
- **Reuses the existing leads-project Google/email auth** — the Supabase Google provider + callback were
  already configured & tested for engine.roilabs.in (see above), so SSO needed **no new provider setup**.
- **To enable operator access on roilabs.in (the real cockpit):** the user must (1) set
  `ENGINE_OPERATOR_EMAILS=<comma-separated emails>` on the **agency** Vercel project + `.env.local` (leave it
  **off** roi-engine so engine.roilabs.in stays a teaser); (2) add `https://roilabs.in/engine` and the local
  `http://localhost:<port>/engine` to Supabase → Auth → **Redirect URLs** (current list has
  `engine.roilabs.in/engine` + `localhost:3002/engine` only). Agency already has `NEXT_PUBLIC_SUPABASE_*`.
- **Local testing:** `.env.local` has no `NEXT_PUBLIC_ENGINE_DEMO`, so local `/engine` is already real-auth —
  add `ENGINE_OPERATOR_EMAILS` locally + ensure the dev port's `/engine` is in the Supabase redirect list.

## Credentials checklist (operator-owned; secrets live in `.env.local`)

| Need | Status |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` (Revenue_tech) | operator adding |
| `ANTHROPIC_API_KEY` | operator adding |
| `ENGINE_ADMIN_TOKEN` | operator adding |
| `ENGINE_OPERATOR_EMAILS` (SSO allowlist, D26) | operator adding (agency project + `.env.local`) |
| `META_SYSTEM_USER_TOKEN` + ad account id | operator adding (Meta first) |
| Google dev token / OAuth / refresh / MCC id | after Basic token approved |
