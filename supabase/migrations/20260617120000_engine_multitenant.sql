-- D27 multi-tenant: per-company slug (subdomain), email-keyed membership, and
-- per-company encrypted integration credentials. ADDITIVE — the existing single
-- account keeps working off env vars until the credential cutover (D27 phase 2).
-- All three live in the ENGINE project, service-role only like the other engine_* tables.

-- A: slug on accounts -> the company's subdomain (<slug>.roilabs.in)
alter table public.engine_accounts
  add column if not exists slug text unique
    check (slug ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$');

-- B: membership — who may access which company, and as what role. Keyed by EMAIL
--    (identity lives in a DIFFERENT Supabase project so we can't FK to auth.users;
--    and email lets you invite someone BEFORE they've ever signed up).
create table if not exists public.engine_account_users (
  account_id uuid not null references public.engine_accounts(id) on delete cascade,
  email      text not null,
  role       text not null default 'viewer' check (role in ('admin','operator','viewer')),
  invited_by text,
  created_at timestamptz not null default now(),
  primary key (account_id, email)
);
create index if not exists engine_account_users_email_idx on public.engine_account_users (email);

-- C: per-company integration secrets. `secret` is an AES-256-GCM blob, NEVER
--    plaintext. Read only via the service-role key; no authenticated policy ever.
create table if not exists public.engine_account_credentials (
  account_id uuid not null references public.engine_accounts(id) on delete cascade,
  platform   text not null check (platform in ('google','meta','shopify','anthropic')),
  secret     jsonb not null,
  meta       jsonb not null default '{}'::jsonb,  -- non-secret display (shop domain, expiry, key_version)
  updated_at timestamptz not null default now(),
  primary key (account_id, platform)
);

-- Lock down like the rest of the engine: RLS on, NO policies => the publishable
-- key sees nothing; the engine reaches these only with the service-role key.
alter table public.engine_account_users       enable row level security;
alter table public.engine_account_credentials enable row level security;

drop trigger if exists engine_account_credentials_touch on public.engine_account_credentials;
create trigger engine_account_credentials_touch before update on public.engine_account_credentials
  for each row execute function public.engine_touch_updated_at();

-- Backfill is data-specific and run separately (see ENGINE.md / the deploy notes):
--   update public.engine_accounts set slug = 'astrotime' where slug is null;   -- the one existing account
--   insert into public.engine_account_users (account_id, email, role)
--     select id, 'you@roilabs.in', 'admin' from public.engine_accounts where slug = 'astrotime';
