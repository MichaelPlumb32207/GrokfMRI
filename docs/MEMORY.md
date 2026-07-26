# MEMORY — product continuity

## Purpose

GrokfMRI is a **read-only observer** of Grok’s experimental memory store (`~/.grok/memory/`). It does **not** replace project living docs or Claude global memory.

## Three layers (do not collapse)

| Layer | Path | Job |
|-------|------|-----|
| Project living docs | `<project>/docs/*` | Product truth / handover |
| Claude global | `~/.claude/memory/` | Cross-project agent patterns |
| Grok experimental | `~/.grok/memory/` | Auto-recall in Grok sessions |

This app only visualizes the third layer.

## Decisions (v1)

- **Name:** GrokfMRI (folder + product); subtitle “Memory Observatory”
- **Stack:** Next.js local app; filesystem ingest; no DB
- **Event model:** `flush` | `session_end` | `remember` | `dream` | `unknown`
- **Dream:** heuristic + confidence; full reconstruction after session deletion is limited without durable dream logs
- **Remember timestamps:** best-effort via MEMORY.md mtime (no git history in v1)
- **Never deploy memory contents** to Vercel unless explicitly requested later

## Don’t re-litigate

- Living docs stay git-tracked product continuity; dream does not replace them
- Core value is local; cloud is optional later
- Path-safe file reads only under memory root

## Visualization (2026-07-26)

- Primary data viz is **Activity scan**: stacked day×type bars + workspace intensity lanes
- Reuses event type palette (emerald flush, sky session-end, violet remember, amber dream)
- Surfaces: compact home strip, Scan tab, expand overlay, browser fullscreen, `/scan` page
- Aggregation is pure (`buildScanSeries`); chart is filter-aware
