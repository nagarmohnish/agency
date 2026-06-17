-- ============================================================
-- D27 multi-tenant backfill — bring up the FIRST tenant (Astro Time).
-- Run BY HAND in the ENGINE Supabase SQL editor:
--   project "Revenue_tech" / ref xcszgeypiehclulltzoh
-- AFTER 20260617120000_engine_multitenant.sql has been applied.
--
-- Run STEP 0, READ the output, paste the real UUID into steps 1 & 2,
-- then run steps 1→3. Every step is re-runnable.
--
-- Why not the naive `update ... set slug='astrotime' where slug is null`?
--   slug is UNIQUE. If more than one account row has a null slug, that
--   blind update tries to set TWO rows to 'astrotime' and aborts with a
--   unique_violation — the whole backfill fails. So: target ONE row by id.
-- Why lower(trim(email))?
--   resolveTenant() looks up the membership with email.trim().toLowerCase().
--   The column has no lower() constraint, so a row stored as 'You@RoiLabs.in'
--   would NEVER match the lowercased lookup → silent "No access" with nothing
--   to debug. Storing it lowercased makes the gate match.
-- ============================================================

-- STEP 0 — INSPECT. How many accounts exist? Which is the real one?
--   Expect exactly ONE row: The Astro Time, id starting 6c51173e-, currency INR.
--   If you see MORE than one row, STOP and decide which id is correct.
select id, name, slug, default_currency, status, created_at
from public.engine_accounts
order by created_at;

-- >>> Copy the real account's full UUID from STEP 0 into both <ACCOUNT_ID> below. <<<

-- STEP 1 — SET THE SLUG on exactly ONE row, by id.
--   'astrotime' matches the astrotime.roilabs.in subdomain and the CHECK regex
--   (lowercase, 3–40 chars, no leading/trailing hyphen). The `and slug is null`
--   is a guard: it's a no-op if already set and can never clobber another row.
update public.engine_accounts
set slug = 'astrotime'
where id = '<ACCOUNT_ID>'
  and slug is null;

-- STEP 2 — GRANT yourself admin membership. Idempotent + forced lowercase.
--   Replace the email with your real ROI Labs login email.
insert into public.engine_account_users (account_id, email, role)
values ('<ACCOUNT_ID>', lower(trim('you@roilabs.in')), 'admin')
on conflict (account_id, email) do update set role = excluded.role;

-- STEP 3 — VERIFY. Must return exactly ONE row whose email is all-lowercase
--   and equals your login email, role = admin.
select a.id, a.name, a.slug, u.email, u.role
from public.engine_accounts a
join public.engine_account_users u on u.account_id = a.id
where a.slug = 'astrotime';

-- STEP 4 — (OPTIONAL hardening) reject any future non-lowercase email at the
--   DB layer, so this class of silent-denial bug can never recur.
-- alter table public.engine_account_users
--   add constraint engine_account_users_email_lc check (email = lower(email));
