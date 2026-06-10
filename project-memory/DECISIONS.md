# Decisions — what we chose and why

Append new decisions at the bottom with a date. If a decision is reversed, mark
it ~~struck~~ and add the replacement.

### D1 · Reuse platform rails, build the moat (2026-06-10)
2026 research found the ad platforms now ship official MCP servers/CLIs and
hosted creative models. So we **don't** rebuild connectors or creative models —
we build the three defensible layers the platforms don't give us: cross-platform
**orchestration**, a **governance/approval engine**, and a trustworthy
**attribution layer**. (Connectors are thin REST wrappers, intentionally.)

### D2 · Governance gate is non-bypassable (2026-06-10)
Nothing reaches a platform except through `governance.gatedMutate`. Three
independent brakes default to "spend nothing": `ENGINE_DRY_RUN` (master
kill-switch, on), spend cap (`min(account, global)`, global default 0), and a
4-level autonomy ladder (`read_only`→`paused_writes`→`live_approval`→`live_auto`).
Every action is logged *before* it acts.

### D3 · The audit log IS the case study (2026-06-10)
`engine_actions` is append-only and records every read/recommendation/mutation
with rationale. The case study is generated from real rows — no fabrication.
This is also the compliance audit trail.

### D4 · REST connectors, no heavy SDKs (2026-06-10)
Google Ads via REST (`searchStream` + `:mutate`) and Meta via Graph API over
`fetch`. Avoids gRPC/native build issues on Vercel and keeps the code transparent.

### D5 · Claude orchestration: manual tool-loop, not auto-runner (2026-06-10)
The gate is human-in-the-loop, so we own each turn (log tool calls, stop on
budget, never auto-execute an ungated mutation). Model `claude-opus-4-8`,
adaptive thinking, prompt-cached system prompt.

### D6 · Separate Supabase project for the engine (2026-06-10)
Engine data lives in the **`Revenue_tech`** project; the marketing site's lead
forms stay on their own project. Server-only `engine_*` tables use the
service-role key; public lead forms keep the anon publishable key. Clean blast-radius
separation.

### D7 · Honest "LLM search ads" split (2026-06-10)
Don't claim buyable ads across all AI engines (Perplexity killed ads; most
surfaces are citation-only). Split into **paid where buyable** (Google AI,
Copilot, ChatGPT) + **AEO/GEO citation optimization** elsewhere, with measurable
share-of-voice. Build both honestly; it's a later phase.

### D9 · The agent is untrusted; the gate enforces money safety (2026-06-10)
Treat the LLM as adversarial (prompt injection via ad data). The gate never
trusts agent-reported spend — it **derives** spend from the mutation payload and
takes the larger. Controls layer: dry-run kill switch, server-derived spend,
per-mutation hard ceiling (reject outright), daily cap, autonomy ladder + human
approval, append-only log written before acting, constant-time admin auth.
Documented in [`SECURITY.md`](../SECURITY.md). Residual: enabling a campaign with
an unknown budget is forced to approval (not auto-assessed) — acceptable for now.

### D8 · Connect credentials last (2026-06-10)
Build the entire backend credential-free (each connector errors only when called),
so the code deploys first and the brand's accounts are wired in as a final
paste-and-verify step. All secrets read in one place (`config.ts`).
