# vision/

The strategic layer for **ROI Engine** — what we're building, the journey, and where
we're headed. Read this alongside the technical alignment layer in
[`../project-memory/`](../project-memory/INDEX.md).

| File | What's in it |
|---|---|
| [VISION.md](VISION.md) | The product vision — what/why/who, the "measured in revenue" thesis, the Atlas/Terminal design philosophy, the north star. |
| [CHRONOLOGY.md](CHRONOLOGY.md) | Dated, detailed account of everything built so far, in order, with the reasoning at each phase. |
| [ROADMAP.md](ROADMAP.md) | What we're targeting next — the active **R1** round (2026-06-11 requests) in detail, plus parked/future work. |
| [DATA-SCOPE.md](DATA-SCOPE.md) | **Data availability & product scope** — what Google/Meta/Shopify/GA4 actually give us (vs the dashboard's demo data), the three data tiers, the full feature-volume map, and the recommended scope for `/engine` + the website. Adversarially fact-checked against our connectors. |

**Working mode:** local-first — implement and verify on `localhost`, deploy to Vercel
only when explicitly asked.

**One-line state (2026-06-11):** ROI Engine `/engine` is live in demo mode at
`roi-engine-six.vercel.app/engine` with the Atlas/Terminal two-mode design; the next
round (R1) adds source/platform scoping, a richer Revenue section, a platform→campaign
Runs drill-down, revenue-tied quick wins, attention highlights, and light-mode fixes.
