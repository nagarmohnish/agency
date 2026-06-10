# Project Memory — ROI Labs

The alignment layer for this project. Read this first when picking up work; it
points to everything else. Version-controlled, in-repo, so it travels with the
code and stays true across sessions and contributors.

> **Maintenance rule:** every substantive change updates this folder. See the
> protocol in [`CLAUDE.md`](../CLAUDE.md) at the repo root. If you changed code
> and didn't touch `project-memory/`, you're not done.

## The docs

| File | What's in it |
|---|---|
| [OVERVIEW.md](OVERVIEW.md) | What we're building and why · objective · use case · audience · positioning |
| [PROGRESS.md](PROGRESS.md) | Changelog + current state + next steps (the live status) |
| [DECISIONS.md](DECISIONS.md) | Key decisions and the rationale behind them |
| [FILE-MAP.md](FILE-MAP.md) | Every engine file and what it's responsible for |
| [CONTEXT.md](CONTEXT.md) | External references: research findings, API constraints, credentials state |

## Canonical specs (the real source for these topics)

These live at the repo root and are referenced — don't duplicate them here:

- [ARCHITECTURE.md](../ARCHITECTURE.md) — data flow + the dashboard screens
- [ENGINE.md](../ENGINE.md) — operator guide + the connection (credential) steps
- [DEVELOPMENT.md](../DEVELOPMENT.md) — the marketing-site edit→verify→deploy loop

## One-line state

**Google is LIVE** on the real brand (The Astro Time): 47 campaigns read, first
Scout audit done (52/100), read-only + dry-run. `/engine` dashboard redesigned
(sidebar, charts, date toggle). **Meta pending** (app needs Marketing API). All
pushed to GitHub. See [PROGRESS.md](PROGRESS.md).
