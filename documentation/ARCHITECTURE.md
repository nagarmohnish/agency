# ROI Labs Engine — data architecture & frontend

How data moves through the engine and what the operator sees. The dashboard at
**`/engine`** is the cockpit: it makes the 5-agent loop on roilabs.in visible on
a real account, and the screens map 1:1 to the five steps the homepage sells.

## Data flow (one picture)

```
            Google Ads API ┐                      ┌─ engine_campaigns  (mirror)
                           ├─ connectors (read) ──┼─ engine_metrics    (daily KPIs)
              Meta Graph API┘                      └─ (live pulls, cached in UI)
                                   │
   Claude agents (Scout…Signal) ───┤ read tools
                                   │ propose_mutation
                                   ▼
                          GOVERNANCE GATE ──────────► engine_actions   (AUDIT LOG)
                          (dry-run · cap · approval)   every decision, append-only
                                   │                          │
                            submit_audit                      │
                                   ▼                          ▼
                          engine_audit_runs           engine_runs (token spend)
                          (ranked opportunity map)
                                   │
                                   ▼
        ┌──────────────────────────────────────────────────────────────┐
        │  /api/engine/*  (admin-bearer-guarded read/write endpoints)     │
        └──────────────────────────────────────────────────────────────┘
                                   ▼
                    /engine dashboard  (token-gated, client-side)
```

**Source of truth:** the ad platforms for *live state*; `engine_actions` for *what
we did and why*. The case study is generated from `engine_actions` + `engine_metrics`
— real decisions, real numbers, nothing fabricated.

## What each table feeds

| Table | Written by | Read by (screen) |
|---|---|---|
| `engine_accounts` | you (SQL) | Overview — name, autonomy, cap |
| `engine_campaigns` | Pilot (future) / live pulls | Campaigns |
| `engine_metrics` | Signal (future) / live pulls | Campaigns KPIs, case study |
| `engine_actions` | governance gate (every call) | Activity log, Approvals |
| `engine_audit_runs` | Scout (`submit_audit`) | Audit / Opportunity map |
| `engine_runs` | runner | Overview — last run, token cost |

## Endpoints (all under `Authorization: Bearer ENGINE_ADMIN_TOKEN`)

| Method | Route | Returns / does |
|---|---|---|
| GET | `/api/engine/status` | account, connector pings, recent actions, pending count |
| GET | `/api/engine/audits` | latest opportunity map (Scout) |
| GET | `/api/engine/campaigns` | live campaigns + computed revenue KPIs per platform |
| GET | `/api/engine/approvals` | mutations awaiting sign-off |
| POST | `/api/engine/approvals` | approve/reject → executes through the gate |
| POST | `/api/engine/run` | kick off a loop step (v1: `audit`) |

## The dashboard — screens mapped to the 5 steps

`/engine` is a single token-gated cockpit (paste `ENGINE_ADMIN_TOKEN` once; held
in `sessionStorage`, sent as a Bearer header on every call). Sections:

1. **Overview** — connection health (Google/Meta ping), the three safety badges
   (dry-run, autonomy, daily cap), last run + token spend, and the **Run audit**
   button. The control surface.
2. **Audit & opportunity** *(Step 1 · Scout)* — the latest opportunity map: a
   0–100 health score and the ranked fixes (impact × effort, owner agent).
3. **Campaigns** *(Step 3 · Pilot/Frame)* — live campaigns per platform with the
   numbers that matter: spend, revenue (conversion value), **ROAS**, **CAC**,
   conversions, CTR. "Measured in revenue, not ROAS" made literal.
4. **Activity log** *(Step 4 · Signal + the gate)* — the append-only audit trail:
   every read, recommendation, and mutation, with status (proposed / executed /
   simulated / skipped), the agent, the rationale, and estimated spend.
5. **Approvals** — pending spend-increasing mutations with approve/reject. The
   human-in-the-loop control; approving executes the change through the gate.

Creative (Forge, Step 2) and landing/CRO (Frame) get panels once those agents
are built — the shell leaves room for them.

## Why this shape

- **Read-heavy, mutation-gated.** The dashboard reads freely; the only writes are
  approvals, which re-enter the same gate. No UI path bypasses governance.
- **The log is the product.** Because every decision is persisted before it acts,
  the Activity log doubles as the audit trail for compliance *and* the raw
  material for the public case-study page (a later render of the same data).
- **Live vs stored.** Campaigns/metrics are pulled live for accuracy; Scout's audit
  and all actions are stored so history and the case study survive.
