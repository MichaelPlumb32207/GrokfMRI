# USE CASE CATALOG

## Automated core coverage

| Suite | Command | Covers |
|-------|---------|--------|
| Parse + ingest unit tests | `npm test` | Session split/classify, sections, remember, dream heuristic, empty store, path safety, flush fixture |
| Typecheck | `npm run typecheck` | TS contracts |
| Lint | `npm run lint` | ESLint |
| Production build | `npm run build` | Next bundling |

---

## UC-001 · See memory activity over time

**Outcome leg:** I can see memory activity over time  
**Arch-significant:** yes (event model)

As Michael, I open the local dashboard and see a timeline of memory events across workspaces.

### UC-001·H Happy path

1. Ensure `~/.grok/memory/fetch-16b6e57e/sessions/2026-07-26.md` exists with a flush block  
2. `npm run dev` → http://127.0.0.1:3000  
3. Timeline shows at least one **flush** for Fetch  
4. Timestamp and title/excerpt are non-empty  

### UC-001·E1 Empty store

Given only template MEMORY files and no sessions, the timeline shows an empty state (not an error crash).

### UC-001·E2 Unknown markdown shapes

Odd/manual session markdown still loads; may classify as `unknown` or `session_end` without throwing.

---

## UC-002 · Filter by project

**Outcome leg:** I can filter by project

As Michael, I filter the timeline to one workspace or open the workspaces grid.

### UC-002·H Happy path

1. Open dashboard with ≥1 workspace  
2. Select workspace filter **Fetch**  
3. Only Fetch (and matching) events remain  
4. Workspace card shows flush count ≥ 1  

### UC-002·E1 No workspaces

Grid empty state explains how workspaces appear.

---

## UC-003 · Open the raw note

**Outcome leg:** I can open the raw note  
**Arch-significant:** yes (path safety)

As Michael, I click an event and see path + excerpt + raw file content.

### UC-003·H Happy path

1. Click flush event  
2. Detail drawer shows absolute path under `~/.grok/memory`  
3. Raw file preview loads via `/api/files`  

### UC-003·E1 Path traversal

`GET /api/files?path=../../../etc/passwd` → 403.

### UC-003·E2 Missing file

Deleted path → 404 JSON error; UI shows error string.

---

## UC-004 · System health at a glance

**Outcome leg:** I understand system health

As Michael, I see last flush, pending session logs, empty/noisy counts, and memory root path.

### UC-004·H Happy path

Health bar shows workspace count ≥ 1 and last flush when a flush exists.

### UC-004·E1 Fresh install

All zeros / “None yet” without crashing.

---

## UC-005 · Browse curated MEMORY

**Outcome leg:** I can open the raw note (rib)

As Michael, I switch the MEMORY panel between global and a workspace file and read content read-only.

### UC-005·H Happy path

Select Global → see template or curated content; select workspace → see that project MEMORY.md.
