-- Lead capture table for the contact form on roilabs.in.
-- The website hits POST /api/leads with name, email, company, budget, message, source.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  company text,
  budget text,
  message text,
  source text not null default 'popup'
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_email_idx on public.leads (email);

alter table public.leads enable row level security;

-- Browser-side publishable key inserts only. No read/update/delete from anon.
drop policy if exists "anon can insert leads" on public.leads;
create policy "anon can insert leads"
  on public.leads
  for insert
  to anon
  with check (true);
