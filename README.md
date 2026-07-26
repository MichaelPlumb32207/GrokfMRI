# GrokfMRI

**Memory Observatory** — local-first dashboard for Grok experimental memory (`/flush`, `/remember`, `/dream`) across workspaces.

Read-only. No cloud required. Binds to `127.0.0.1` only.

## Quick start

```bash
npm install
npm run dev
# → http://127.0.0.1:3000
```

Data source: `~/.grok/memory/` (or `$GROK_HOME/memory/`).

**Activity scan:** stacked day×type chart on the home page, **Scan** tab, expand/fullscreen, and dedicated route `/scan`.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server (127.0.0.1) |
| `npm test` | Parse/ingest unit tests |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run build` | Production build (pre-push gate) |
| `npm start` | Serve build on 127.0.0.1 |

## Docs

Living product docs: [`docs/`](./docs/) — start with [`docs/USER_GUIDE.md`](./docs/USER_GUIDE.md) and [`docs/ROADMAP.md`](./docs/ROADMAP.md).

## Privacy

Does not commit or upload memory contents. Test fixtures only under `src/lib/memory/__fixtures__/`.
