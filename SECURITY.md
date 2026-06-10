# ROI Labs Engine — security & safety

This engine manages a **real ad account with real money**. This documents the
threat model, the controls, the residual risks, and the go-live checklist.

## Trust boundary (the one thing to internalize)

**The LLM agent is UNTRUSTED.** It reads attacker-influenceable data (competitor
ad copy, campaign names, landing-page text) so prompt injection is possible. The
agent can *propose* anything; it can *do* nothing on its own. The
**governance gate** ([`governance.ts`](src/lib/engine/governance.ts)) is the sole
enforcement point — no code path mutates a platform except through it, and it does
**not** trust the agent's numbers.

```
agent proposes ─▶ GOVERNANCE GATE ─▶ platform
                  · server-derived spend (ignores agent's claim)
                  · dry-run kill switch
                  · per-mutation hard ceiling
                  · daily spend cap
                  · autonomy ladder + human approval
                  · logs the action BEFORE it acts
```

## Money controls (defense in depth — all default to "spend nothing")

1. **Dry-run kill switch** — `ENGINE_DRY_RUN=true` by default. Every mutation is
   logged and simulated, never sent. Overrides everything, including approvals
   (an approval while dry-run is on is simulated, not executed).
2. **Server-side spend derivation** — the cap is enforced against spend **derived
   from the mutation payload**, not the agent's self-reported `estimatedSpendCents`.
   A budget change is assessed at its real `dailyAmountCents`; enabling a campaign
   whose budget we can't see here is **forced to approval**, never auto-cleared.
3. **Per-mutation hard ceiling** — `ENGINE_MAX_SINGLE_MUTATION_SPEND_CENTS`. A
   single change above it is **rejected outright** (not even approvable). Backstop
   against a fat-finger or injected budget. Re-checked at approval-execution time.
4. **Daily spend cap** — `min(account.daily_spend_cap_cents, ENGINE_GLOBAL_…)`.
   Global default `0` = block all live spend. A change pushing today's committed
   spend over the cap goes to approval.
5. **Autonomy ladder** — `read_only` → `paused_writes` ($0, forced paused) →
   `live_approval` (spend-increasing needs a human; pausing a loser auto-runs) →
   `live_auto` (within cap only). Accounts start `read_only`.
6. **Append-only audit log** — every read/recommendation/mutation is written to
   `engine_actions` *before* it acts, stamped with the assessed spend and rationale.
   This is the compliance trail and the case-study source.
7. **No double-execution** — an approval acts only on a `proposed` action; a repeat
   call finds no matching row and no-ops.

## Access control & secrets

- **Ops routes are admin-guarded** ([`auth.ts`](src/lib/engine/auth.ts)): bearer
  token, **fail-closed** (no token configured ⇒ all requests rejected),
  **constant-time** comparison (no timing leak).
- **All secrets are server-only** env vars — none are `NEXT_PUBLIC_*`, so Next.js
  never ships them to the browser. Verified: no client file imports engine lib or
  references a secret.
- **Service-role key** bypasses RLS by design; it lives only in the server engine,
  never in the client. The browser uses the separate publishable key for lead forms.
- **DB lockdown** — all `engine_*` tables have RLS on with **no** anon/authenticated
  policies, so the publishable key can neither read nor write them.
- **Secrets never committed** — `.env*` and `*.log` are git-ignored. Connector
  error messages include platform response bodies but **not** tokens.

## Residual risks (known, accepted, or mitigated)

- **Enabling a campaign** turns spend on at a budget the gate doesn't look up →
  it is **forced to human approval**; the approver must verify the budget. (Future:
  look up the campaign budget to assess it automatically.)
- **Approval overrides the cap** — by design; a human signing off is the override.
  The hard ceiling (#3) still applies and the dry-run switch still applies.
- **Prompt injection** can make the agent *propose* a bad mutation, but cannot
  bypass the gate; worst case is a proposal caught by ceiling/cap/approval.
- **Admin token is a shared secret** — use a long random value, rotate it, and
  serve only over HTTPS in production. `12345` is for local dev only.

## Go-live checklist (staged ramp — do not skip)

1. ☐ Strong, random `ENGINE_ADMIN_TOKEN` (not `12345`); HTTPS only in prod.
2. ☐ Connect account at `read_only`; confirm reads via `/api/engine/status`.
3. ☐ Run an audit ($0); review the opportunity map.
4. ☐ Move to `paused_writes`; exercise the launch path — still $0 (forced paused).
5. ☐ Set `account.daily_spend_cap_cents`, `ENGINE_GLOBAL_DAILY_SPEND_CAP_CENTS`,
   and `ENGINE_MAX_SINGLE_MUTATION_SPEND_CENTS` to deliberate values.
6. ☐ Flip `ENGINE_DRY_RUN=false`; move to `live_approval`.
7. ☐ Approve the first spend-increasing change yourself; watch `engine_actions`.
8. ☐ Only consider `live_auto` after the log shows the gate behaving as expected.
9. ☐ Meta: assign **only** the one ad account to the System User (least privilege);
   Google: scope the OAuth user to the needed MCC. Rotate tokens on exposure.
