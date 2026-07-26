# PROGRESS

## 2026-07-26 — Support, optionals, honest demo data

- Support / donate handles in README, USER_GUIDE, app footer, share.html (BTC / Lightning / Cash App)
- CONTRIBUTING.md; non-localhost host safety banner; hour-of-day UTC heatmap on activity scan
- `npm run demo` + `fixtures/demo-grok` multi-day synthetic store with UI **Demo dataset** banner (screenshot-friendly without faking live history)

## 2026-07-26 — Public-readiness + scan-line polish

- Scan-line animation on activity chart (respects `prefers-reduced-motion`)
- Sanitized fixtures/docs (demo paths; no personal home paths in source)
- `/api/files` omits absolute paths unless `?absolute=1`
- Shared `useMemorySnapshot` hook; MIT LICENSE; SECURITY.md; public README; `public/share.html` one-pager

## 2026-07-26 — Activity scan visualization

Shipped:

- **Activity scan** data viz: stacked daily bars by event type + workspace signal lanes
- Palette-matched (emerald / sky / violet / amber / zinc on dark zinc-950)
- Embedded compact strip on home under health; **Scan** tab; expand overlay; browser full screen; dedicated `/scan` page
- Pure aggregation `src/lib/scan-aggregate.ts` + unit tests
- Respects existing workspace + type filters

## 2026-07-26 — v1 MVP scaffold

Shipped:

- Pure ingest/parse library under `src/lib/memory/` (discover, sessions, sections, remember, dream heuristic)
- Unit tests + fixtures (no real memory contents in repo)
- Local APIs: `/api/snapshot`, `/api/events`, `/api/workspaces`, `/api/files` (path-guarded)
- Dashboard: timeline, type/workspace filters, workspace cards, health bar, event detail with raw file, curated MEMORY panel
- Bind to `127.0.0.1`; dark UI
- Eight living docs + place-first fishbone ROADMAP

Acceptance path:

1. `npm run dev` → open http://127.0.0.1:3000
2. See Fetch workspace + flush from `sessions/2026-07-26.md` when `~/.grok/memory` is populated
3. Click event → path + excerpt + raw markdown
4. Empty stores → empty states, not crashes
