# CLAUDE.md — ROI Labs

Read [`project-memory/INDEX.md`](project-memory/INDEX.md) at the start of any
non-trivial task. It's the alignment layer: objective, progress, decisions, file
map, and context. It keeps work consistent across sessions.

## ⚠️ Memory maintenance protocol (do this on every substantive change)

`project-memory/` must stay true. **After any change that alters behavior,
structure, status, or a decision, update it in the SAME turn as the code change** —
before you consider the task done:

1. **Always** add a dated entry to [`project-memory/PROGRESS.md`](project-memory/PROGRESS.md)
   (changelog, newest on top) and refresh its "Current state" if it shifted.
2. **If files were added/moved/removed/repurposed** → update
   [`project-memory/FILE-MAP.md`](project-memory/FILE-MAP.md).
3. **If a real choice was made** (architecture, tradeoff, scope) → add a `D#` entry
   to [`project-memory/DECISIONS.md`](project-memory/DECISIONS.md).
4. **If objective/audience/scope shifted** → update [`project-memory/OVERVIEW.md`](project-memory/OVERVIEW.md).
5. **If an external fact, credential state, or research finding changed** → update
   [`project-memory/CONTEXT.md`](project-memory/CONTEXT.md).

Skip only for trivial no-ops (typos, formatting). When unsure, add a PROGRESS line.
Use absolute dates. If you changed code and didn't touch `project-memory/`, you're
not done.

## Project facts worth keeping loaded

- **Two things in this repo:** the marketing site (roilabs.in) and the **engine**
  (the real 5-agent ad-ops backend + `/engine` dashboard). See `project-memory/OVERVIEW.md`.
- **Deploy is NOT automatic on git push.** Marketing site ships via
  `npm run deploy` (or `npx vercel@latest --prod --yes`). See `DEVELOPMENT.md`.
- **Two Supabase projects:** marketing leads (`gaulosvlnynoxgdjelgm`) and the
  engine (`Revenue_tech` / `xcszgeypiehclulltzoh`). Engine env points at `Revenue_tech`.
- **Engine safety defaults to "spend nothing":** `ENGINE_DRY_RUN=true`, global
  cap `0`, accounts start `read_only`. Never weaken these without explicit sign-off.
- **Secrets** live in `.env.local` (git-ignored) and Vercel — never commit them,
  never paste them into chat.
- Verify builds with `npm run verify` before claiming a change works.

## Canonical specs
- `ARCHITECTURE.md` — engine data flow + dashboard screens.
- `ENGINE.md` — operator guide + credential connection steps.
- `DEVELOPMENT.md` — marketing-site edit→verify→deploy loop.
