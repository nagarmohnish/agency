# GitHub Pages — live URLs

Static export of the **agency** repo, published to the `gh-pages` branch on the
**nagarmohnish** (Mohnish Nagar) GitHub account. Project site, so everything lives under
`/agency`. **GitHub Pages only** — these are static/demo (no live API; forms & live data
don't work here). Last published: 2026-06-15 (now serving the **redesigned v3 cockpit** +
the roilabs-themed **Aurora** variant).

**Base:** https://nagarmohnish.github.io/agency/

## Marketing site

| Page | URL |
|---|---|
| 🏠 **Landing page** (roilabs homepage) | https://nagarmohnish.github.io/agency/ |
| 🔌 **Integrations** (revenue-stack connectors) | https://nagarmohnish.github.io/agency/integrations/ |
| 🎬 **ROI Labs Promo** (animated, standalone) | https://nagarmohnish.github.io/agency/promo/ |
| Audit (free audit page) | https://nagarmohnish.github.io/agency/audit/ |
| About | https://nagarmohnish.github.io/agency/about/ |
| Demos (index) | https://nagarmohnish.github.io/agency/demos/ |
| Demo (homepage variant) | https://nagarmohnish.github.io/agency/demo/ |
| Demo · Blue (homepage variant) | https://nagarmohnish.github.io/agency/demo-blue/ |
| Stellar (design variant) | https://nagarmohnish.github.io/agency/stellar/ |
| Discord | https://nagarmohnish.github.io/agency/discord/ |
| 404 (not-found) | https://nagarmohnish.github.io/agency/404 |

## ROI Engine dashboard (redesigned v3)

The cockpit is a single-page app (demo data — "The Astro Time"; all screens render
with no token). Implemented in [`src/app/engine/v3.tsx`](../src/app/engine/v3.tsx) (via
`Shell.tsx`); the Aurora variant is the generated [`v3aurora.tsx`](../src/app/engine/v3aurora.tsx).

| View | URL |
|---|---|
| 📊 **Dashboard** (Atlas — indigo) | https://nagarmohnish.github.io/agency/engine/ |
| 🎨 **Dashboard · Aurora** (roilabs.in theme — cream/gold) | https://nagarmohnish.github.io/agency/engine/aurora/ |

> Nav (Overview · Google · Meta · Shopify · Runs · Activity · Approvals) is in-app.
> **The old `?view=` per-tab deep links no longer work** — they were a v2 feature and
> aren't re-wired into v3 yet (param is ignored → always opens Overview). Both routes
> boot into the two-funnel Overview. The integration logos under `/agency/logos/` are
> served too.

## How to republish

PowerShell (not git-bash) export build, pushed to `gh-pages` via a worktree on the
`nagarmohnish` account. Full steps live in the `gh-pages-deploy` note in auto-memory.
Key env for the build: `NEXT_BUILD_MODE=export`, `NEXT_BASE_PATH=/agency`,
`NEXT_PUBLIC_ENGINE_DEMO=1` (engine demo mode so it works without a backend).
**Next 16 quirk:** the export build emits an orphan `.next/dev/types/validator.ts` that imports a
`routes.js` only generated in dev — type-check then fails. Fix: `".next/dev/types"` is in the
tsconfig `exclude` so the build skips it (kept permanently). Manually-routed `<img src>` must
prepend `${BP}` (`process.env.NEXT_PUBLIC_BASE_PATH`) or it 404s under `/agency` — e.g. the
integration logos in `Integrations.tsx`.

> Not GitHub Pages (for reference, not listed above): the live site is on Vercel at
> **roilabs.in**, and the live/demo engine on Vercel at **roi-engine-six.vercel.app/engine**.
> Vercel deploys leave `NEXT_PUBLIC_ENGINE_DEMO` unset, so the real cockpit is untouched.
