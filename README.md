# GrokfMRI

**Memory Observatory** — a local-first, read-only dashboard for [Grok](https://x.ai) experimental memory (`/flush`, `/remember`, `/dream`) across workspaces.

See activity over time, filter by project, open the raw Markdown, and check system health — without uploading anything to the cloud.

| | |
|--|--|
| **Runs on** | `127.0.0.1` only (default scripts) |
| **Reads** | `~/.grok/memory/` (or `$GROK_HOME/memory/`) |
| **Writes** | Nothing (observer) |
| **License** | MIT |

## Quick start

```bash
git clone https://github.com/MichaelPlumb32207/GrokfMRI.git
cd GrokfMRI
npm install
npm run dev
# → http://127.0.0.1:3000
```

Enable Grok memory if you want real events:

```toml
# ~/.grok/config.toml
[memory]
enabled = true
```

Then run productive sessions with `/flush`, `/remember`, and (optionally) `/dream`, and hit **Refresh** in the UI.

## Features

- **Timeline** of flush / session-end / remember / dream events
- **Activity scan** — stacked day×type chart, workspace signal lanes, scan-line animation, expand / fullscreen / `/scan`
- **Workspace cards** and system health (last flush, pending session logs, empty/noisy)
- **Event detail** with path + excerpt + raw file preview
- **Path-safe** file API confined under the memory root

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server on 127.0.0.1 |
| `npm test` | Unit tests (parsers + scan aggregate) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run build` | Production build |
| `npm start` | Serve build on 127.0.0.1 |

## Share / press kit

Open [`public/share.html`](./public/share.html) in a browser (or via the dev server at `/share.html`) for a one-pager you can screenshot for social posts.

## Security

See [SECURITY.md](./SECURITY.md). **Do not** deploy this process against your real memory store to a public host.

## Docs

Living product docs under [`docs/`](./docs/) — start with [USER_GUIDE](./docs/USER_GUIDE.md) and [ROADMAP](./docs/ROADMAP.md).

## Privacy in this repository

- No real `~/.grok/memory` contents are committed
- Test fixtures use demo paths (`/home/demo/projects/...`)
- Your local absolute paths appear only in your running browser, not in the published source
