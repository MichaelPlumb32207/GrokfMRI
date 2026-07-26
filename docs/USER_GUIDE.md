# USER GUIDE — GrokfMRI

## What this is

A **local-only** dashboard that reads Grok’s experimental memory store and shows activity over time. It never writes to memory.

## Prerequisites

- Node 20+ recommended
- Grok memory enabled (`~/.grok/config.toml` → `[memory] enabled = true`) optional for empty-state testing; needed for real events
- Memory root: `~/.grok/memory/` (override with `GROK_HOME`)

## Run

```bash
cd /path/to/GrokfMRI
npm install
npm run dev
```

Open **http://127.0.0.1:3000** (bound to localhost only).

Production-ish local:

```bash
npm run build
npm start
```

## Using the UI

1. **Timeline** — default view; day-grouped events  
2. **Activity scan** — stacked bars by day × type (same colors as type chips) + workspace signal lanes  
   - Compact strip under system health on the home page  
   - **Scan** tab for a larger embed  
   - **Expand** — modal overlay; **Full screen** — browser fullscreen when allowed  
   - **Open /scan** or header link — dedicated full page  
3. **Type chips** — toggle flush / session-end / remember / dream / unknown (timeline *and* scan)  
4. **Workspace filter** — All, Global, or a project slug  
5. **Workspaces tab** — cards with counts; click to filter timeline  
6. **Event click** — detail drawer: path, topics, decisions, raw markdown  
7. **MEMORY panel** — read-only view of global or workspace curated files  
8. **Refresh** — re-scan the filesystem  

## Generating data in Grok

Inside a project:

- Productive session → `/flush` (or accept the habit offer)
- Standing preference → `/remember …`
- Noisy session pile → `/dream` (or wait for auto-dream gates)

Then hit **Refresh** in GrokfMRI.

## Privacy

- Content stays on your machine
- `/api/files` refuses paths outside the memory root
- Do not point a public deploy at this server
- Share one-pager: open `/share.html` while `npm run dev` is running (or open `public/share.html` as a file)

## Security notes

See root [SECURITY.md](../SECURITY.md). Scripts bind `127.0.0.1` by default.

## Troubleshooting

| Symptom | Check |
|---------|--------|
| No workspaces | Has Grok created `~/.grok/memory/<slug>-<hash>/`? Run Grok **inside** a git project |
| No flush events | Open `/memory` in Grok; confirm `sessions/*.md` exists |
| Wrong root | Set `GROK_HOME` before `npm run dev` |
| Port in use | `next dev -p 3001 --hostname 127.0.0.1` |
