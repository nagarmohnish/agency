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

## Project infrastructure facts

- Marketing site: Next.js 16 + React 19 + Tailwind 4 + Supabase, on Vercel.
  Deploy is **not** auto on git push — `npm run deploy` / `npx vercel --prod`.
- Two Supabase projects: marketing leads (`gaulosvlnynoxgdjelgm`) and the engine
  (`Revenue_tech` / `xcszgeypiehclulltzoh`).
- Helper: `scripts/google-oauth.mjs` mints the Google Ads refresh token (loopback
  OAuth flow on localhost:53682).

## Credentials checklist (operator-owned; secrets live in `.env.local`)

| Need | Status |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` (Revenue_tech) | operator adding |
| `ANTHROPIC_API_KEY` | operator adding |
| `ENGINE_ADMIN_TOKEN` | operator adding |
| `META_SYSTEM_USER_TOKEN` + ad account id | operator adding (Meta first) |
| Google dev token / OAuth / refresh / MCC id | after Basic token approved |
