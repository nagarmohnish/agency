-- Audit-tool lead capture: every run of the public ROI Labs Auditor
-- (audit.roilabs.in) writes a row here and uploads the PDF to the
-- `audit-reports` bucket. Browser-side publishable key is enough to insert.

create table if not exists public.audits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  target_url text not null,
  vertical text,
  overall_score integer,
  overall_grade text,
  measurement_score integer,
  strategy_score integer,
  landing_pages_score integer,
  creative_score integer,
  competitors text[],
  pdf_path text,                          -- key inside the audit-reports bucket
  client_ip text,                         -- best-effort; for rate-limit forensics
  user_agent text
);

create index if not exists audits_created_at_idx  on public.audits (created_at desc);
create index if not exists audits_email_idx       on public.audits (email);
create index if not exists audits_target_url_idx  on public.audits (target_url);

alter table public.audits enable row level security;

-- Anonymous browser inserts allowed. No reads — admins use the dashboard.
drop policy if exists "anon can insert audits" on public.audits;
create policy "anon can insert audits"
  on public.audits
  for insert
  to anon
  with check (true);

-- ------------------------------------------------------------------
-- Storage bucket for the generated PDFs.
-- Bucket is private; the audit tool serves PDFs via signed URLs that
-- it generates server-side (5 min TTL, fresh per request).
-- ------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('audit-reports', 'audit-reports', false)
on conflict (id) do nothing;

-- Allow anon to upload into the audit-reports bucket. (Browser users
-- never upload directly; the audit tool's server does, but using the
-- publishable key, so it counts as the anon role.)
drop policy if exists "anon upload audit-reports" on storage.objects;
create policy "anon upload audit-reports"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'audit-reports');
