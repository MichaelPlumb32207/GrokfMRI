# CLAUDE.md — GrokfMRI

Authoritative agent guide for this repo. Root `/CLAUDE.md` may point here.

## Product

**GrokfMRI** (Memory Observatory): local-first, read-only dashboard over `~/.grok/memory/` so Michael can see `/flush`, `/remember`, and `/dream` activity across workspaces.

## Non-goals (v1)

- Do not replace Grok’s `/memory` TUI browser
- Do not write into Grok memory by default
- Do not require cloud/DB/Vercel for core value
- Do not scrape `~/.grok/sessions/` chat transcripts (memory store only)
- Do not dump project living docs (`docs/MEMORY.md`) into Grok’s experimental memory model

## Stack

- Next.js App Router, TypeScript, Tailwind v4
- Node filesystem reads via API routes (`runtime = "nodejs"`)
- Vitest for pure parse/ingest unit tests
- Bind `127.0.0.1` only (`npm run dev` / `npm start`)

## Data sources

Root: `~/.grok/memory/` or `$GROK_HOME/memory/`

| Path | Meaning |
|------|---------|
| `MEMORY.md` | Global curated long-term |
| `<slug>-<hash8>/MEMORY.md` | Workspace curated |
| `<slug>-<hash8>/sessions/*.md` | Flush + session-end logs |
| `index.sqlite` | Optional; not required for v1 UI |

Parsers live in `src/lib/memory/`. Scan aggregation: `src/lib/scan-aggregate.ts`. API: `/api/snapshot`, `/api/events`, `/api/workspaces`, `/api/files`. Routes: `/` dashboard, `/scan` full activity scan.

## Privacy

All content is personal/sensitive. No analytics. No outbound network for core features. Path API must stay under memory root (`safeResolveUnderRoot`).

## AI vendor

Default **xAI** for any future AI summaries. Gate behind explicit opt-in + API key. v1 has **no** AI calls.

### AI vendor verification table

| Capability | Endpoint | Model | Docs | Last verified |
|------------|----------|-------|------|---------------|
| *(none in v1)* | — | — | https://docs.x.ai/docs | n/a |

## Living docs protocol

On every code/feature/defect change: update **all eight** living docs (or note “no change”), then commit. Never commit real `~/.grok/memory` contents — only test fixtures under `src/lib/memory/__fixtures__/`.

## Commands

```bash
npm run dev          # http://127.0.0.1:3000
npm run typecheck
npm run lint
npm test
npm run build        # required before push to main
```

## Deploy

**Local only for core product.** Do not push memory contents to Vercel. If a marketing/docs site is ever deployed, keep it separate from the observatory process that reads `~/.grok/memory`.

## Git

- Private under `MichaelPlumb32207`
- Author: `Michael Plumb <meplumb@gmail.com>`
