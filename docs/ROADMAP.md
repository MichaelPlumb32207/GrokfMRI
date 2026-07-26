# ROADMAP — place-first fishbone

**Product:** GrokfMRI (Memory Observatory)  
**Pattern:** place-first fishbone (outcome spine · enabler highways · capability ribs)

```
[ see activity over time ]──[ filter by project ]──[ open raw note ]──[ system health ]──▶ later
         │                        │                      │                    │
      parsers                  discovery              path API            aggregates
```

---

## Spine focus (v1)

**Legs 1–4 are the v1 spine.** Testable now once `npm run dev` is up against a real `~/.grok/memory`.

---

## Leg 1 — I can see memory activity over time

| | |
|--|--|
| **Outcome** | Timeline of flush / remember / dream / session-end across all workspaces |
| **Enabler** | Session log + MEMORY.md parsers → typed event stream |
| **Risk if deferred** | UI without trustworthy events is theater |
| **Unlocks** | Filtering, detail drawer, health aggregates |

**Ribs / exits**

- Colored event types on a day-grouped timeline
- Flush detection via `<!-- flush <id> -->` + rich headings
- Session-end vs flush heuristics
- Empty-store empty states

**Status:** v1 shipped · **testable now**

---

## Leg 2 — I can filter by project

| | |
|--|--|
| **Outcome** | Focus one workspace or compare across projects |
| **Enabler** | Workspace discovery (`slug-hash8`) + filter state |
| **Risk if deferred** | Multi-repo users cannot find signal |
| **Unlocks** | Health per workspace, targeted MEMORY panel |

**Ribs / exits**

- Workspace cards (last activity, flush count, MEMORY size, pending logs)
- Timeline workspace + type filters
- Global vs workspace scope labels

**Status:** v1 shipped · **testable now**

---

## Leg 3 — I can open the raw note

| | |
|--|--|
| **Outcome** | Jump from an event to the Markdown that produced it |
| **Enabler** | Path-safe `GET /api/files` under memory root |
| **Risk if deferred** | Trust gap — can’t verify parser claims |
| **Unlocks** | Future “copy path” / editor open |

**Ribs / exits**

- Event detail drawer: path, excerpt, topics, decisions
- Full file preview
- Curated MEMORY side panel (read-only)

**Status:** v1 shipped · **testable now**

---

## Leg 4 — I understand system health

| | |
|--|--|
| **Outcome** | Know what’s stale, empty, noisy, or pending dream |
| **Enabler** | Aggregates over workspaces + dream gate config display |
| **Risk if deferred** | Memory habits fail silently |
| **Unlocks** | Dream readiness signals, cleanup prompts |

**Ribs / exits**

- Health bar: last flush, pending session logs, empty/noisy counts
- Workspace empty/noisy badges
- Documented dream confidence (heuristic limits)

**Status:** v1 shipped · **testable now**

---

## Later legs (not v1)

| Leg | Outcome | Enabler notes |
|-----|---------|---------------|
| 5 | I can export a privacy-safe snapshot | JSON export of events (still local) |
| 6 | I get optional AI digests | xAI only, opt-in + API key |
| 7 | I run it from the menu bar | Tauri/desktop tray |
| 8 | I keep historical snapshots | Optional Neon — only if Michael asks |

---

## Testable now vs spine focus

| Area | State |
|------|--------|
| Ingest + timeline + filters + detail + health | **Testable now** |
| AI digests / Tauri / Neon history | Later |
