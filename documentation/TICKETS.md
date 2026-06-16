# ROI Engine — Tickets & Approvals (Jira-style) + granular access

Canonical spec for the cockpit's ticketing/approval workflow and its access model.
Decided 2026-06-16 (see `project-memory/DECISIONS.md` **D21**). Replaces the old static
"Approvals" screen with a managed board.

## 1. Why / the two modes
ROI Engine is used by **two kinds of people**, and the same system serves both:

- **Managed (ROI Labs ↔ client):** ROI Labs runs the ad-ops as **Operators** (create tickets,
  run the engine, execute approved changes). The client's decision-makers are **Approvers**
  (sign off on spend/creative); other client folks are **Viewers** (analytics & reports).
- **Standalone (client-only):** the client's own ad-ops human is the **Operator**; a
  manager/owner is the **Approver**. If one person does both, they hold Admin (create + approve) —
  the gate still records an explicit, logged decision.

The client experience is fundamentally an **analytics + reporting** tool; the **tickets** layer is
how spend-/creative-affecting changes get proposed (by us or the operator) and approved (by the
client/admin). The board is **flat** — everyone sees the same tickets — but **permissions** gate
who can do what, so it stays clearly manageable.

## 2. Entities (data model)
- **Workspace** — one engine account / store (e.g. *The Astro Time*). Owns members, tickets, the
  spend cap, and the connected sources (Google/Meta/Shopify/Subscriptions).
- **Member** — a user in a workspace. Has a **base role** (preset bundle) **+ optional extra grants**
  (individual permissions), each optionally **scoped to channels**. `effectivePermissions(member)`
  = `rolePermissions(base) ∪ grants`.
- **Ticket** — an approval item (see §5).
- **Comment / Activity** — append-only timeline on each ticket (the audit trail): created,
  submitted, commented, approved, rejected, changes-requested, executed, closed.

## 3. Permissions (granular capabilities)
Atomic rights — roles are just named bundles of these, so we can also grant a single capability to
one person (e.g. a finance lead who can **only** approve budgets).

| Permission | Meaning |
|---|---|
| `analytics.view` | See analytics / reports / Overview |
| `tickets.view` | See the board + ticket details |
| `tickets.create` | Create tickets |
| `tickets.edit` | Edit ticket fields |
| `tickets.comment` | Comment |
| `tickets.transition` | Non-approval status moves (submit, mark done) |
| `approve.budget` | Approve / reject **Budget** tickets |
| `approve.creative` | Approve / reject **Creative** tickets |
| `approve.campaign` | Approve / reject **Campaign / launch** tickets |
| `approve.tracking` | Approve / reject **Tracking / measurement** tickets |
| `actions.execute` | Execute an approved change on the platform |
| `members.manage` | Invite members, assign roles & grants |
| `settings.manage` | Spend cap, autonomy, integrations |

**Channel scope (optional):** any permission may be limited to a subset of
`{ meta, google, shopify, subscriptions }`. Unset = all channels. E.g. *approve.budget on Meta only*.

## 4. Roles (presets) + custom grants
Presets are permission bundles; individual **grants** layer on top for granularity.

- **Admin** — all permissions. (Client owner / standalone account owner.)
- **Operator** — `analytics.view`, `tickets.view|create|edit|comment|transition`, `actions.execute`.
  **No `approve.*`** (separation of duties — can't approve own spend). (Us, or the client's ad-ops human.)
- **Viewer** — `analytics.view`, `tickets.view`, `tickets.comment`. (Client stakeholders.)
- **Custom approvers** (grants on top of Viewer): e.g. *Budget Approver* = Viewer + `approve.budget`;
  *Creative Approver* = Viewer + `approve.creative`. Optionally channel-scoped.

## 5. Ticket model
Fields: `key` (e.g. `AT-142`), `type`, `title`, `description`, `status`, `priority`
(High/Med/Low), `reporter` (who created), `approver` (assigned decision-maker), `channel`
(meta/google/shopify/subscriptions), `data` (type-specific payload, e.g. budget current→proposed +
cap usage; creative = variant count + spend impact), `createdAt`, `decidedAt`, `comments[]`,
`activity[]`.

**Types → required approval permission** (enforcement):

| Type | Approve needs |
|---|---|
| **Budget** (scale/reallocate spend) | `approve.budget` |
| **Creative** (publish/refresh assets) | `approve.creative` |
| **Campaign** (launch/pause/new) | `approve.campaign` |
| **Tracking** (measurement/UTM/conversion value) | `approve.tracking` |

A ticket is approvable only by a member whose effective permissions include the matching
`approve.<type>` for the ticket's channel.

## 6. Statuses & transitions (the flow)
**Board columns:** `Open` → `Awaiting approval` → `Approved` → `Done`.
Side states: `Changes requested`, `Rejected`.

1. **Operator** sees an engine insight ("what needs attention" → "what to do next").
2. Creates a ticket (or "create from insight" — engine pre-fills rationale, current→proposed, cap
   check). Status **Open**.
3. Operator **submits** → **Awaiting approval**, assigned to a qualified **Approver**.
4. **Approver** (matching `approve.<type>`): **Approve** → `Approved`; **Reject** → `Rejected`;
   **Request changes** → `Changes requested` (→ Operator revises → back to Open/Awaiting). Checked
   against the ₹ spend cap.
5. On Approve, an Operator with `actions.execute` runs the change → **Done**. Every step appended to
   the ticket's activity (audit trail). Mirrors the engine's existing gated-mutation model.

Transition rights: submit/mark-done need `tickets.transition`; approve/reject/request-changes need
`approve.<type>`.

## 7. UI (Jira-style board — replaces "Approvals")
- The rail **Approvals** item → the **Tickets** board.
- **Board:** 4 columns (Open · Awaiting approval · Approved · Done); ticket **cards** = type chip,
  key, title, priority dot, channel logo, reporter→approver avatars, a progress/cap hint for budgets.
- **Detail drawer:** header (key · type · status), description, the type-specific data (e.g. budget
  current→proposed + cap bar), required approver, **role-gated** Approve / Reject / Request-changes
  buttons, comments + activity timeline.
- **Create ticket** (Operator) + **Create from insight** (from the Overview "what needs attention").
- **"View as role"** switcher (demo): preview the board/actions as Admin / Operator / Viewer /
  Budget-Approver / Creative-Approver — since the demo has no real auth, this shows how permissions
  gate the UI. In live mode the role comes from the authenticated member.
- **Members & roles:** a Settings/Members view listing members with role + grant badges +
  channel scope.

## 8. Access enforcement
- A single `can(member, permission, channel?)` helper drives every gated control (buttons, create,
  transitions). UI hides/disables what the current member can't do.
- **Demo mode:** members + the "current member" are seeded; the "View as role" switcher swaps the
  current member so all permission paths are previewable. No real auth.
- **Live mode (later):** the current member resolves from the authenticated session (extends the
  existing admin-token gate); server routes re-check `can()` before any mutation (never trust the UI).

## 9. Build plan (phased)
1. **Data + permissions (demo):** `tickets.ts` — permission/role constants, `can()`, seeded
   members + tickets (from the existing agent proposals: budget/creative/campaign + a tracking one).
2. **Board UI:** replace the Approvals screen in `v5.tsx` with the columns + cards + detail drawer +
   role-gated actions + "View as role" + create-from-insight. Interactive (approve/reject moves
   cards, updates the rail badge).
3. **Members view** (Settings) — role + grant badges.
4. **Live wiring (later):** map tickets ↔ `engine_actions`/approvals; resolve the member from auth;
   server-side `can()` re-checks. Out of scope for the first build (demo first).
