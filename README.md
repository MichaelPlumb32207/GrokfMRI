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

### Demo dataset (multi-day, for screenshots)

Real Grok memory may only have a day or two of history. For an honest **synthetic** tour (violet banner in the UI):

```bash
npm run demo
# → reads fixtures/demo-grok/memory — not your real ~/.grok
```

Enable Grok memory if you want **your** events:

```toml
# ~/.grok/config.toml
[memory]
enabled = true
```

Then run productive sessions with `/flush`, `/remember`, and (optionally) `/dream`, and hit **Refresh** in the UI.

## Features

- **Timeline** of flush / session-end / remember / dream events
- **Activity scan** — stacked day×type chart, hour-of-day heatmap (UTC), workspace signal lanes, scan-line animation, expand / fullscreen / `/scan`
- **Workspace cards** and system health (last flush, pending session logs, empty/noisy)
- **Event detail** with path + excerpt + raw file preview
- **Path-safe** file API confined under the memory root
- **Host safety banner** if the UI is not on localhost

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server on 127.0.0.1 (real memory via `GROK_HOME` or `~/.grok`) |
| `npm run demo` | Same, but synthetic multi-day store under `fixtures/demo-grok` |
| `npm test` | Unit tests (parsers + scan aggregate) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run build` | Production build |
| `npm start` | Serve build on 127.0.0.1 |

## Support GrokfMRI

If this tool saves you time, optional tips keep experiments like it going (same tip jar family as Smooth):

| Method | Handle |
|--------|--------|
| **Bitcoin** | [`bc1qvh99yk40uhw9atsxlfgu6z6zveur7c23n4m2xj`](bitcoin:bc1qvh99yk40uhw9atsxlfgu6z6zveur7c23n4m2xj) |
| **Lightning** | [`four_plums@strike.me`](lightning:four_plums@strike.me) |
| **Cash App** | [`$mep32207`](https://cash.app/$mep32207) |

No account required. Thank you.

## Share / press kit

- One-pager: [`public/share.html`](./public/share.html) → `/share.html` under the dev server  
- Hero art: [`public/share-hero.jpg`](./public/share-hero.jpg)  
- **UI screenshots:** prefer `npm run demo` and note “demo dataset” — don’t imply synthetic data is your production memory  

## Security

See [SECURITY.md](./SECURITY.md). **Do not** deploy this process against your real memory store to a public host.

## Docs

- [USER_GUIDE](./docs/USER_GUIDE.md) — runbook  
- [ROADMAP](./docs/ROADMAP.md) — place-first fishbone  
- [CONTRIBUTING](./CONTRIBUTING.md) — PRs and fixtures  

## Privacy in this repository

- No real `~/.grok/memory` contents are committed  
- Unit fixtures use demo paths (`/home/demo/projects/...`)  
- `fixtures/demo-grok` is synthetic and labeled in the UI  
- Your local absolute paths appear only in your running browser, not in published source  
