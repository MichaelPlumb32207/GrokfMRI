# USER GUIDE — GrokfMRI

## What this is

A **local-only** dashboard that reads Grok’s experimental memory store and shows activity over time. It never writes to memory.

## Prerequisites

- Node 20+ recommended
- Grok memory enabled (`~/.grok/config.toml` → `[memory] enabled = true`) optional for empty-state testing; needed for **your** events
- Memory root: `~/.grok/memory/` (override with `GROK_HOME`)

## Run

```bash
cd /path/to/GrokfMRI
npm install
npm run dev
```

Open **http://127.0.0.1:3000** (bound to localhost only).

### Demo multi-day dataset

If your real store only has a day of history, use the **synthetic** demo tree for tours and screenshots (UI shows a violet **Demo dataset** banner):

```bash
npm run demo
```

This sets `GROK_HOME=./fixtures/demo-grok`. It is **not** claimed as live production memory.

Production-ish local:

```bash
npm run build
npm start
```

## Using the UI

1. **Health bar** — workspace counts, last flush, pending logs  
2. **Filters** — Timeline / Workspaces · workspace dropdown · type chips  
3. **Main row (desktop)**  
   - **Left:** clickable event list (timeline) or workspace cards  
   - **Right:** small **activity scan** (sidebar) — Expand / Full screen / `/scan` to blow it up  
4. **Detail (full width below)** — click an event; topics, decisions, paths, raw file span the page under the list+scan  
5. **MEMORY panel** — read-only curated files  
6. **Refresh** — re-scan the filesystem  
7. **Host safety** — amber banner if not on localhost  

Sparse charts use capped bar widths so one day does not become a full-width green slab.

## Generating data in Grok

Inside a project:

- Productive session → `/flush` (or accept the habit offer)
- Standing preference → `/remember …`
- Noisy session pile → `/dream` (or wait for auto-dream gates)

Then hit **Refresh** in GrokfMRI.

## Support GrokfMRI

Optional tips keep tools like this going:

| Method | Handle |
|--------|--------|
| **Bitcoin** | `bc1qvh99yk40uhw9atsxlfgu6z6zveur7c23n4m2xj` |
| **Lightning** | `four_plums@strike.me` |
| **Cash App** | `$mep32207` → https://cash.app/$mep32207 |

Also linked in the app footer.

## Privacy

- Content stays on your machine
- `/api/files` refuses paths outside the memory root
- Do not point a public deploy at this server
- Share one-pager: open `/share.html` while `npm run dev` is running (or open `public/share.html` as a file)

## Security notes

See root [SECURITY.md](../SECURITY.md). Scripts bind `127.0.0.1` by default. A non-localhost host shows a warning banner.

## Troubleshooting

| Symptom | Check |
|---------|--------|
| No workspaces | Has Grok created `~/.grok/memory/<slug>-<hash>/`? Run Grok **inside** a git project |
| No flush events | Open `/memory` in Grok; confirm `sessions/*.md` exists · or try `npm run demo` |
| Wrong root | Set `GROK_HOME` before `npm run dev` |
| Port in use | `next dev -p 3001 --hostname 127.0.0.1` |
