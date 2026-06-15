# ROI Engine — Roadmap / Targeting

> What we're building next and why. The active round is **R1** (requested 2026-06-11).
> Working mode: **local-first — implement and verify on `localhost`, deploy only when
> explicitly asked.** Status legend: ☐ todo · ◐ in progress · ☑ done.
> Last updated: 2026-06-11.

---

## Guiding principle for this round
Push hard on the north-star's second half — **"what's the single highest-value move
right now, and what does it cost to approve it."** Every item below should make a
revenue-tied action easier to *see* and faster to *act on*. Bias toward: clearer
source/platform scoping, deeper per-campaign engine runs, revenue-first quick wins, and
attention cues that pull the eye to what's broken or winnable.

---

## R1 — the requested changes (2026-06-11)

### R1.1 ☐ Source / platform division (Overall · Google · Shopify · Meta)
A clear, prominent **segmented toggle** to scope the whole dashboard by data source:
- **Overall** — combined/blended (default).
- **Google** — Google ad spend + Google-attributed revenue.
- **Shopify** — the store-truth view (revenue/orders, channel-agnostic).
- **Meta** — pending integration → shows the pending state, not zeros.

This is **distinct from the attribution lens** (which is *how* revenue is attributed).
This is *which source's data is in scope*. Selecting it re-scopes KPIs, charts, and
tables. Should persist in URL like the other controls. Meta excluded from blended until
connected, with the footnote.

**Decision (2026-06-11): keep BOTH** the source toggle (scope: what's on screen) and the
attribution lens (method: how revenue is credited) — they're orthogonal. To remove the
collision, the lens's **"Shopify"** option is renamed **"Last-click"**. Source semantics:
`all` = everything; `google`/`meta` = that platform's ad data + that platform's
UTM-attributed orders (meta → pending/empty); `shopify` = the store view (all orders, no
ad spend → spend-based metrics show "—").

### R1.2 ☐ Same source filter on the primary graph
The Overview **blended-performance chart** must respect R1.1 — when a source is
selected, the chart shows that source's series (or filters to it); on Overall, show the
combined revenue/spend (and ideally per-platform breakdown). The source toggle and the
chart stay in sync.

### R1.3 ☐ Upgrade the Revenue section
Bring **Revenue** up to the Atlas/Terminal visual quality of Overview. Add more advanced,
clean visualizations, e.g.:
- A divided **KPI strip** (Revenue net · Orders · AOV · Refund rate · Discount-assisted ·
  Unattributed) in the Terminal-cell style with sparklines + deltas.
- A **revenue composition** view: gross → discounts → refunds → **net** (waterfall or
  stacked area).
- **New vs returning** as a stacked area over time (not just a split bar).
- **MER / ncMER overlay** on the revenue trend.
- **Channel contribution** to Shopify revenue (paid vs email vs direct/unattributed).
- Keep: top products (paid), quality-by-source, unattributed-% tracking-health trend —
  restyled to match.

### R1.4 ☐ Runs: platform → campaign hierarchy with full per-campaign engine runs
Restructure the **Runs** section into a drill-down:
1. **By platform** first (Google / Meta-pending) — each platform groups its runs.
2. Then **by campaign** — pick a campaign to see its **full engine-run process**: the
   5-agent loop (Scout audit → Forge creative → Pilot launch → Frame → Signal) as a
   timeline, with the **analytics** each step produced and the **end decisions / CTAs**
   surfaced **immediately** (approve / pause / scale / add-negative, with ₹ impact).
3. A **"Run more analysis"** action per campaign to trigger deeper insight (more agent
   passes) and surface further opportunities.
Keep the existing ops wiring (the live/demo `/api/engine/*` calls) intact; this is an IA
+ presentation change layered on the run/action data.

### R1.5 ☐ Revenue-tied quick wins (lowest-hanging fruit)
A first-class **Quick Wins** surface that identifies the lowest-hanging fruit **directly
tied to revenue** and presents, crisply:
- the **metric(s)** at stake (e.g., ₹X/mo recoverable, Y% lost impression share on a
  6.4× campaign, mobile CVR gap),
- the **revenue impact** (ranked), and
- the **solution** in one line + an immediate CTA.
Source it from the insight modules (wasted spend, budget-capped winners, mobile-LP CVR,
tracking leaks, 18-24 over-CAC) but **frame everything as ₹ impact + the fix**, not as
analysis. This is the "highest-value move right now" made literal.

### R1.6 ☐ Fixes — light-mode logo + yellow primary buttons (light)
- **Logo not visible in light mode** — the ROI mark must read clearly on the white Atlas
  sidebar (check contrast/asset; pick the right variant or restyle).
- **Light-mode primary buttons → yellow.** In Atlas (light) mode the **primary CTA
  buttons** (Approve, Run, Apply, etc.) should be **brand yellow**, not indigo. Scope
  this to *buttons* — keep indigo as the light-mode accent for nav/links/chart unless we
  decide otherwise. (Dark/Terminal already uses amber.)

### R1.7 ☐ Attention highlights
A visual **attention system** that pulls the eye to what needs action now: highlight
cards/sections with flagged issues (anomalies, tracking spikes, wasted spend,
budget-capped winners) — e.g., a colored left-accent / subtle glow / "needs attention"
badge, consistent across views. Tie severity to the insight `status` (flag/ok/pending).

---

## Acceptance for R1
- Source toggle scopes KPIs + the primary graph; persists in URL; Meta shows pending.
- Revenue section visually matches Overview quality with ≥3 new advanced viz.
- Runs drills platform → campaign → full engine-run timeline + immediate CTAs + "run
  more analysis."
- Quick Wins ranks revenue-tied fixes with ₹ impact + one-line solution + CTA.
- Light-mode logo clearly visible; light-mode primary buttons are yellow.
- Attention highlights appear on flagged sections across views.
- Build green; verified on `localhost` (not deployed unless asked).

---

## Beyond R1 (parked / future)
- **Wire the live daily-fact pipeline** so analytics work in production (not just demo).
- **Meta** connect → fill placement/fatigue/Meta-claimed + reconciliation.
- Extend the Atlas/Terminal language fully across Segments + Insights.
- Persist theme/lens/source per user; make Approve/Run truly execute through the gate in
  a controlled pilot.
- Generate the **case-study page** from `engine_actions` + `engine_metrics`.
- Optional: make `roi-engine-six.vercel.app/` root serve the dashboard (currently `/engine`).
