-- ROI Labs engine — the backend that runs the 5-agent loop (Scout, Forge,
-- Pilot, Frame, Signal) on a REAL brand's Google + Meta ad accounts.
--
-- Everything here is server-only. Unlike `leads`/`audits` (which the browser
-- writes with the anon publishable key), these tables are touched exclusively
-- by the engine using the Supabase SERVICE-ROLE key. RLS is enabled with NO
-- anon policies, so the publishable key can neither read nor write them.
--
-- Credentials (Google refresh token, Meta system-user token, Anthropic key)
-- are NOT stored here — they live in server env vars. This table only holds
-- the non-secret account identifiers needed to address the platforms.

-- ------------------------------------------------------------------
-- accounts — one managed brand. Holds platform identifiers + the two
-- governance dials: a hard daily spend cap and the autonomy level.
-- ------------------------------------------------------------------
create table if not exists public.engine_accounts (
  id                      uuid primary key default gen_random_uuid(),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  name                    text not null,                 -- brand name
  -- Google Ads
  google_customer_id      text,                          -- client account, digits only
  google_login_customer_id text,                         -- MCC / manager id
  -- Meta
  meta_ad_account_id      text,                          -- e.g. act_1234567890
  meta_business_id        text,
  -- ops
  default_currency        text not null default 'EUR',
  daily_spend_cap_cents   bigint not null default 0,     -- 0 = nothing may go live
  autonomy_level          text not null default 'read_only'
                          check (autonomy_level in
                            ('read_only','paused_writes','live_approval','live_auto')),
  status                  text not null default 'active'
                          check (status in ('active','paused','archived'))
);

-- ------------------------------------------------------------------
-- campaigns — local mirror of campaigns the engine knows about, on
-- either platform. `external_id` is the platform's own id.
-- ------------------------------------------------------------------
create table if not exists public.engine_campaigns (
  id                uuid primary key default gen_random_uuid(),
  account_id        uuid not null references public.engine_accounts(id) on delete cascade,
  platform          text not null check (platform in ('google','meta')),
  external_id       text,                                -- null until created on platform
  name              text not null,
  objective         text,
  status            text not null default 'paused'
                    check (status in ('draft','paused','active','removed')),
  daily_budget_cents bigint not null default 0,
  raw               jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (platform, external_id)
);

-- ------------------------------------------------------------------
-- creatives — Forge's output. Tracks AI-generation + disclosure so we
-- can satisfy Google/Meta 2026 AI-labeling policy.
-- ------------------------------------------------------------------
create table if not exists public.engine_creatives (
  id            uuid primary key default gen_random_uuid(),
  account_id    uuid not null references public.engine_accounts(id) on delete cascade,
  campaign_id   uuid references public.engine_campaigns(id) on delete set null,
  platform      text not null check (platform in ('google','meta')),
  external_id   text,
  type          text not null check (type in ('image','video','rsa','text','carousel')),
  status        text not null default 'draft'
                check (status in ('draft','testing','scaled','paused','removed')),
  asset_url     text,
  headline      text,
  body          text,
  ai_generated  boolean not null default false,
  ai_disclosed  boolean not null default false,          -- platform AI label applied
  meta          jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- metrics — Signal's time-series. One row per entity per day.
-- ------------------------------------------------------------------
create table if not exists public.engine_metrics (
  id                    uuid primary key default gen_random_uuid(),
  account_id            uuid not null references public.engine_accounts(id) on delete cascade,
  platform              text not null check (platform in ('google','meta')),
  entity_type           text not null check (entity_type in ('account','campaign','adset','ad')),
  external_id           text not null,
  date                  date not null,
  impressions           bigint not null default 0,
  clicks                bigint not null default 0,
  spend_cents           bigint not null default 0,
  conversions           numeric not null default 0,
  conversion_value_cents bigint not null default 0,
  raw                   jsonb not null default '{}'::jsonb,
  created_at            timestamptz not null default now(),
  unique (platform, entity_type, external_id, date)
);

-- ------------------------------------------------------------------
-- actions — THE AUDIT LOG. Every decision the engine makes lands here:
-- reads, recommendations, and every mutation (proposed -> approved ->
-- executed). This table IS the case study: the proof of what the agents
-- did, why, and what happened. Nothing mutates a platform without a row.
-- ------------------------------------------------------------------
create table if not exists public.engine_actions (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  account_id            uuid not null references public.engine_accounts(id) on delete cascade,
  run_id                uuid,                            -- references engine_runs(id), nullable
  agent                 text not null
                        check (agent in ('scout','forge','pilot','frame','signal','orchestrator')),
  kind                  text not null,                   -- e.g. create_campaign, update_budget, read_insights
  platform              text check (platform in ('google','meta')),
  target_external_id    text,
  summary               text not null,                   -- human-readable what
  rationale             text,                            -- the agent's why
  payload               jsonb not null default '{}'::jsonb,   -- exact request sent / proposed
  result                jsonb,                           -- platform response
  estimated_spend_cents bigint not null default 0,       -- spend this action could cause/day
  dry_run               boolean not null default false,
  requires_approval     boolean not null default false,
  status                text not null default 'proposed'
                        check (status in
                          ('proposed','approved','rejected','executed','failed','skipped')),
  approved_by           text,
  approved_at           timestamptz,
  error                 text
);

create index if not exists engine_actions_account_idx on public.engine_actions (account_id, created_at desc);
create index if not exists engine_actions_run_idx     on public.engine_actions (run_id);
create index if not exists engine_actions_status_idx  on public.engine_actions (status) where status = 'proposed';

-- ------------------------------------------------------------------
-- runs — one orchestrator execution of a loop step (audit/creative/
-- launch/optimize). Groups the actions produced and tracks token use.
-- ------------------------------------------------------------------
create table if not exists public.engine_runs (
  id            uuid primary key default gen_random_uuid(),
  account_id    uuid not null references public.engine_accounts(id) on delete cascade,
  step          text not null
                check (step in ('audit','creative','launch','optimize','custom')),
  agent         text,
  model         text,
  status        text not null default 'running'
                check (status in ('running','done','error')),
  summary       text,
  input_tokens  bigint not null default 0,
  output_tokens bigint not null default 0,
  error         text,
  started_at    timestamptz not null default now(),
  finished_at   timestamptz
);

create index if not exists engine_runs_account_idx on public.engine_runs (account_id, started_at desc);

-- ------------------------------------------------------------------
-- audit_runs — Scout's structured "opportunity map" output (Step 1 of
-- the loop). Distinct from the public lead-gen `audits` table.
-- ------------------------------------------------------------------
create table if not exists public.engine_audit_runs (
  id            uuid primary key default gen_random_uuid(),
  account_id    uuid not null references public.engine_accounts(id) on delete cascade,
  run_id        uuid references public.engine_runs(id) on delete set null,
  created_at    timestamptz not null default now(),
  summary       text,
  score         integer,                                 -- 0-100 account health
  opportunities jsonb not null default '[]'::jsonb,       -- ranked [{title,impact,effort,detail}]
  raw           jsonb not null default '{}'::jsonb
);

create index if not exists engine_audit_runs_account_idx on public.engine_audit_runs (account_id, created_at desc);

-- ------------------------------------------------------------------
-- keep updated_at fresh on the two mutable tables
-- ------------------------------------------------------------------
create or replace function public.engine_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists engine_accounts_touch on public.engine_accounts;
create trigger engine_accounts_touch before update on public.engine_accounts
  for each row execute function public.engine_touch_updated_at();

drop trigger if exists engine_campaigns_touch on public.engine_campaigns;
create trigger engine_campaigns_touch before update on public.engine_campaigns
  for each row execute function public.engine_touch_updated_at();

-- ------------------------------------------------------------------
-- Lock everything down. RLS on, and NO anon/authenticated policies =>
-- the publishable key sees nothing. The engine uses the service-role
-- key, which bypasses RLS entirely.
-- ------------------------------------------------------------------
alter table public.engine_accounts   enable row level security;
alter table public.engine_campaigns  enable row level security;
alter table public.engine_creatives  enable row level security;
alter table public.engine_metrics    enable row level security;
alter table public.engine_actions    enable row level security;
alter table public.engine_runs       enable row level security;
alter table public.engine_audit_runs enable row level security;
