# Multi-Tenant Engine — Architecture (D27)

Each company gets its **own dashboard, own access, own integrations**. Decided 2026-06-17 from a design
pass grounded in the existing code (the engine DB is already `account_id`-partitioned across all 7
`engine_*` tables — multi-tenancy is mostly "turn it on" + 3 tables, not a rewrite).

## Decisions (locked)

| Decision | Choice |
|---|---|
| **Addressing** | **Subdomain per company** — `astrotime.roilabs.in`, `acme.roilabs.in`, … |
| **Who logs in** | **Both** — the company's own people (clients) *and* the ROI Labs team, **role-gated** |
| **Who invites** | **Only ROI Labs** (internal member management for v1) |
| Membership key | **email** (invite works before first sign-up) |
| Identity provider | the **LEADS** Supabase project `gaulosvlnynoxgdjelgm` (same as the funnel/login) |
| Tenant data + creds | the **ENGINE** Supabase project `Revenue_tech` / `xcszgeypiehclulltzoh` |
| Credential encryption | app-level **AES-256-GCM** (one `ENGINE_CRED_ENC_KEY`), v1 |
| RLS | **app-enforced** for v1 (service-role + membership-checked `account_id`); DB-native RLS is a v2 hardening |

## Surfaces

| Surface | URL | Role |
|---|---|---|
| Marketing + **public funnel** | `roilabs.in` / `roilabs.in/engine` | Supabase signup → blurred **"book a demo call"** teaser. **Never imports `getCockpitData`** → no real numbers can leak. (Option 1) |
| **Per-company dashboards** | `<slug>.roilabs.in` | Real v5 cockpit, **membership-gated**. Astro Time = `astrotime.roilabs.in`. Clients see a viewer-safe view; operators get full control. |
| Tenant picker | `app.roilabs.in` | Lists companies the logged-in email belongs to (for the ROI Labs team / multi-company users). |
| `engine.roilabs.in` | → redirect to `roilabs.in/engine` | its env-flag teaser role folds into the funnel. |

**Routing:** a wildcard **`*.roilabs.in`** domain on Vercel (roilabs.in is already on Vercel nameservers →
auto TLS) + a thin **`middleware.ts`** that maps `Host → slug` and rewrites to the tenant route. The slug is
**UX, never a trust boundary** — membership is the gate.

## Data model — 3 additions to the ENGINE project

```sql
-- A: slug on the existing accounts table → the company's subdomain
alter table public.engine_accounts add column slug text unique
  check (slug ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$');

-- B: membership — the access table (email ↔ company ↔ role); invite-by-email
create table public.engine_account_users (
  account_id uuid not null references public.engine_accounts(id) on delete cascade,
  email      text not null,                      -- lowercased
  role       text not null default 'viewer' check (role in ('admin','operator','viewer')),
  invited_by text, created_at timestamptz not null default now(),
  primary key (account_id, email)
);
create index on public.engine_account_users (email);

-- C: per-company integration secrets (encrypted; service-role only, NO read policy ever)
create table public.engine_account_credentials (
  account_id uuid not null references public.engine_accounts(id) on delete cascade,
  platform   text not null check (platform in ('google','meta','shopify','anthropic')),
  secret     jsonb not null,                     -- AES-256-GCM {ciphertext,iv,tag}
  meta       jsonb not null default '{}'::jsonb, -- non-secret display (shop domain, token expiry, key_version)
  updated_at timestamptz not null default now(),
  primary key (account_id, platform)
);
-- all three: enable RLS, no authenticated policies (reached only via service-role db()).
```

`email` is the membership key (identity lives in a *different* Supabase project → can't FK; and it lets you
invite before sign-up). Normalize lowercase/trim everywhere.

## Auth & access control

1. User logs in via Supabase (LEADS project) on `<slug>.roilabs.in` (or `app.roilabs.in`).
2. Browser sends the Supabase access token as `Authorization: Bearer …` to `/api/engine/*`.
3. **`authorize()`** (`src/lib/engine/auth.ts`) returns a **principal**: `{kind:"admin"}` (admin token,
   god-mode, for ROI Labs/scripts) or `{kind:"user", email}` (Supabase JWT — **only honor a *verified*
   email**).
4. **`resolveTenant(slug, email)`** (new `src/lib/engine/tenancy.ts`) does slug→account + membership + role
   in one query (`engine_accounts … engine_account_users!inner` filtered by slug + lowercased email).
   Unknown slug **and** not-a-member both `notFound()` → no IDOR / no enumeration. Used by the tenant
   layout (SSR gate) and **every** API route.
5. **Roles reuse `tickets.ts`** (3 roles, 13 permissions, `ROLE_PERMS`, `can()`): store `role` on the
   membership row, derive permissions server-side, replace the demo `MEMBERS` + "view as role" switcher
   with the real role. **Clients** = `viewer` (revenue/metrics, no internal ticket/RBAC controls);
   **ROI Labs team** = `operator`/`admin`.

**Granting access (invite, ROI-Labs-only for v1):** insert `engine_account_users(account_id, email, role)`
— one row, works before the person signs up. They redeem by logging in with that email; `resolveTenant`
matches them in. Internal member screen behind the `members.manage` permission. `ENGINE_OPERATOR_EMAILS`
(the current env-list gate) is **retired** — membership replaces it.

## Per-company integrations (off env, resolved per request)

- Each company connects its own via **"Connect" OAuth routes** `/api/engine/connect/{google,meta,shopify}`
  → on callback, **encrypt + upsert** into `engine_account_credentials` for that `account_id`.
  - **google**: `{ refresh_token, login_customer_id? }` (client id/secret/dev token stay **global** — it's
    *your* OAuth app); **meta**: `{ system_user_token }`; **shopify**: `{ store_domain, admin_token }`.
- New `src/lib/engine/credentials.ts` `credsFor(accountId, platform)` reads+decrypts + merges global google
  bits; replaces the global `require{Google,Meta,Shopify}()` in `config.ts`.
- Connector seams already pass the account: refactor `connectors/{google,meta}.ts` + `shopify.ts` (thread
  `accountId` through `base/shopFetch/getRevenue`) + `cockpit-data.ts getCockpitData(accountId)`.
- Governance unchanged: global `ENGINE_DRY_RUN` + global cap stay the process-wide kill-switch.

### ⚠️ Two non-optional correctness fixes (silent cross-tenant leaks at company #2)
- `connectors/google.ts` module-level `accessTokenCache` singleton → **`Map<accountId,…>`** (today it hands
  company B company A's OAuth token).
- `engine/page.tsx` `unstable_cache` key → **must include `accountId`** (else tenants share cached numbers).

## Migration plan — ordered; **Option 1 = Step 1**

| # | Step | Size |
|---|---|---|
| **1** | **Option 1** — `roilabs.in/engine` funnel-only (signup→teaser, never import `getCockpitData`); collapse `Shell.tsx` hostname/env branching. Stand up `*.roilabs.in` wildcard + `middleware.ts`. Astro Time stays live in parallel. | Medium |
| 2 | Migrations A/B/C. Backfill `slug='astrotime'` + insert ROI Labs operator emails as `admin`. (table exists, unused — no behavior change) | Quick |
| 3 | `crypto.ts` + `credsFor()` **with `ENGINE_CRED_ENV_FALLBACK=true`**; refactor config/connectors/shopify; **fix the 2 cache bugs**. Astro Time still runs off env. (riskiest plumbing — behind the flag) | Large |
| 4 | Encrypt + insert Astro Time's real creds into the DB; flip fallback off; remove per-tenant env vars from Vercel. | Medium |
| 5 | `authorize()` → principal; `resolveTenant` in all 8 API routes; **stop reading `?accountId`** (closes IDOR); retire `ENGINE_OPERATOR_EMAILS`. | Large |
| 6 | `<slug>.roilabs.in` route tree: tenant layout (gate) + cockpit; **`unstable_cache` key includes `accountId`**; `getCockpitData(accountId)`; `app.roilabs.in` picker. | Large |
| 7 | Internal invite UI (`members.manage`) + `/api/engine/connect/*` OAuth + promote `tickets.ts` RBAC server-side + **client-safe viewer view**. | Medium |
| 8 | **Onboard company #2 = pure data** (account row + slug + creds + member emails, no code/deploy). Acceptance test. | Quick |
| 9 | *(v2)* consolidate identity into the ENGINE project → native per-table RLS. | Large |

## What ROI Labs must do (not code)
- Add the **`*.roilabs.in` wildcard domain** to the Vercel project (auto-TLS).
- Apply the 3 **migrations** to the ENGINE Supabase project; set `ENGINE_CRED_ENC_KEY` (+ later, per-tenant
  creds via the Connect flow).
- Decide each new company's **slug** + the **member emails** to invite.
