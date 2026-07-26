# Contributing to GrokfMRI

Thanks for helping. This is a small local-first tool — keep changes focused and privacy-aware.

## Ground rules

1. **Never commit real `~/.grok/memory` contents.** Use fixtures under `src/lib/memory/__fixtures__/` or the synthetic tree in `fixtures/demo-grok/`.
2. **Local by default.** Prefer `127.0.0.1` binding; do not encourage public deploys of a process that can read personal memory files.
3. **Living docs.** If you change product behavior, update the eight files under `docs/` (or note no change required).
4. **Tests for parsers.** Pure parse/aggregate logic should have unit tests.

## Dev setup

```bash
npm install
npm run dev          # real ~/.grok/memory (or GROK_HOME)
npm run demo         # synthetic multi-day store (screenshots / tours)
```

## Checks before PR

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## Pull requests

- Describe **what** and **why** in complete sentences
- Prefer small PRs
- Include screenshots only of **demo** data or clearly redacted UI

## Support the project

Optional tips keep experiments like this going — see README **Support GrokfMRI**.
