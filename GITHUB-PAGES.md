# GitHub Pages — live URLs

Static export of the **agency** repo, published to the `gh-pages` branch on the
**nagarmohnish** (Mohnish Nagar) GitHub account. Project site, so everything lives under
`/agency`. **GitHub Pages only** — these are static/demo (no live API; forms & live data
don't work here). Last published: 2026-06-15.

**Base:** https://nagarmohnish.github.io/agency/

## Marketing site

| Page | URL |
|---|---|
| 🏠 **Landing page** (roilabs homepage) | https://nagarmohnish.github.io/agency/ |
| 🔌 **Integrations** (revenue-stack connectors) | https://nagarmohnish.github.io/agency/integrations/ |
| Audit (free audit page) | https://nagarmohnish.github.io/agency/audit/ |
| About | https://nagarmohnish.github.io/agency/about/ |
| Demos (index) | https://nagarmohnish.github.io/agency/demos/ |
| Demo (homepage variant) | https://nagarmohnish.github.io/agency/demo/ |
| Demo · Blue (homepage variant) | https://nagarmohnish.github.io/agency/demo-blue/ |
| Stellar (design variant) | https://nagarmohnish.github.io/agency/stellar/ |
| Discord | https://nagarmohnish.github.io/agency/discord/ |
| 404 (not-found) | https://nagarmohnish.github.io/agency/404 |

## ROI Engine dashboard — per-tab deep links

The dashboard is one static page (`/agency/engine/`) that runs as a single-page app.
Each tab is deep-linked via a **`?view=`** query param, so every tab below is a
standalone shareable URL — open it and the dashboard boots straight into that tab
(no param = Overview). Demo data ("The Astro Time"); all 8 screens render with no
token. Implemented in [`src/app/engine/Dashboard.tsx`](src/app/engine/Dashboard.tsx).

| Tab | URL |
|---|---|
| 📊 **Overview** (default) | https://nagarmohnish.github.io/agency/engine/ |
| **Google** (performance) | https://nagarmohnish.github.io/agency/engine/?view=google |
| **Meta** (performance) | https://nagarmohnish.github.io/agency/engine/?view=meta |
| **Shopify** (revenue truth) | https://nagarmohnish.github.io/agency/engine/?view=shopify |
| ⚙️ **Runs** (engine run history) | https://nagarmohnish.github.io/agency/engine/?view=runs |
| 📜 **Activity** (audit log) | https://nagarmohnish.github.io/agency/engine/?view=activity |
| ✅ **Approvals** (pending approvals) | https://nagarmohnish.github.io/agency/engine/?view=approvals |

> Notes: the `?view=` value is read client-side, so the URL stays at
> `/agency/engine/` and only the param changes (no extra history entries). Valid
> values: `overview`, `google`, `meta`, `shopify`, `runs`, `activity`, `approvals`
> — anything else falls back to Overview. The `meta` tab shows "awaiting data"
> (Meta connector is pending), matching the live engine.

## How to republish

PowerShell (not git-bash) export build, pushed to `gh-pages` via a worktree on the
`nagarmohnish` account. Full steps live in the `gh-pages-deploy` note in auto-memory.
Key env for the build: `NEXT_BUILD_MODE=export`, `NEXT_BASE_PATH=/agency`,
`NEXT_PUBLIC_ENGINE_DEMO=1` (engine demo mode so it works without a backend).

> Not GitHub Pages (for reference, not listed above): the live site is on Vercel at
> **roilabs.in**, and the live/demo engine on Vercel at **roi-engine-six.vercel.app/engine**.
> Vercel deploys leave `NEXT_PUBLIC_ENGINE_DEMO` unset, so the real cockpit is untouched.
