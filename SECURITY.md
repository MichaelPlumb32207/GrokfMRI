# Security

## What this app does

GrokfMRI is a **local-only, read-only** dashboard that reads Markdown (and related) files under `~/.grok/memory/` (or `$GROK_HOME/memory/`) and serves them to a browser on **127.0.0.1**.

It is **not** a multi-user cloud product. Treat it like a developer tool that can surface personal notes.

## Do

- Run with `npm run dev` / `npm start` (bound to `127.0.0.1` by default)
- Keep the process off public interfaces
- Never deploy the app that reads your real `~/.grok/memory` to Vercel or any public host

## Do not

- Bind `0.0.0.0` and expose the port to a network you do not trust
- Commit real memory store contents, session logs, or env files
- Expect the UI to redact your local absolute paths from the **browser** (they appear for your own navigation; they are not uploaded by this app)

## Path safety

`GET /api/files` resolves paths with `safeResolveUnderRoot` and rejects traversal outside the memory root. Absolute filesystem paths are omitted from API JSON unless `?absolute=1`.

## Reporting

If you find a vulnerability in path handling or accidental exposure, open a private security advisory on the GitHub repo (or email the maintainer listed on GitHub).
