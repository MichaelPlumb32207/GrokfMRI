import path from "node:path";
import {
  fileExists,
  listDirSafe,
  parseWorkspaceDirName,
  readTextFile,
  resolveMemoryRoot,
  statSafe,
  toIso,
} from "./paths";
import {
  extractProjectPath,
  isMemoryTemplateOnly,
  parseMemorySections,
} from "./parse-sections";
import {
  dateFromSessionFilename,
  parseSessionFile,
} from "./parse-sessions";
import { parseRememberEvents } from "./parse-remember";
import { detectDreamEvents } from "./parse-dream";
import type {
  GlobalMemoryInfo,
  MemoryEvent,
  ObservatorySnapshot,
  SystemHealth,
  WorkspaceInfo,
} from "./types";

export interface IngestOptions {
  /** Override Grok home (default ~/.grok or GROK_HOME) */
  grokHome?: string;
  /** Override memory root directly (tests) */
  memoryRoot?: string;
  /** Optional prior session counts by workspace id for dream heuristic */
  previousSessionCounts?: Record<string, number>;
}

function labelFromSlug(slug: string): string {
  // fetch → Fetch; grokfmri → GrokfMRI-ish
  if (slug.toLowerCase() === "grokfmri") return "GrokfMRI";
  return slug
    .split(/[-_]/)
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
    .join(" ");
}

function scanWorkspace(
  memoryRoot: string,
  dirName: string,
  previousSessionCounts?: Record<string, number>,
): { workspace: WorkspaceInfo; events: MemoryEvent[] } | null {
  const parsed = parseWorkspaceDirName(dirName);
  if (!parsed) return null;

  const { slug, hash8 } = parsed;
  const id = dirName;
  const label = labelFromSlug(slug);
  const wsDir = path.join(memoryRoot, dirName);
  const memoryPath = path.join(wsDir, "MEMORY.md");
  const sessionsDir = path.join(wsDir, "sessions");
  const indexPath = path.join(wsDir, "index.sqlite");

  const memoryText = readTextFile(memoryPath) ?? "";
  const memoryStat = statSafe(memoryPath);
  const sections = parseMemorySections(memoryText);
  const projectPath = extractProjectPath(memoryText);
  const hasSessionsDir = fileExists(sessionsDir);
  const sessionFiles = hasSessionsDir
    ? listDirSafe(sessionsDir).filter((f) => f.endsWith(".md"))
    : [];

  const events: MemoryEvent[] = [];
  let flushCount = 0;
  let sessionEndCount = 0;
  let lastFlush: string | null = null;
  let lastActivity: string | null = null;

  for (const file of sessionFiles) {
    const abs = path.join(sessionsDir, file);
    const rel = path.join(dirName, "sessions", file);
    const text = readTextFile(abs);
    if (text == null) continue;
    const date = dateFromSessionFilename(file);
    const parsedEvents = parseSessionFile({
      markdown: text,
      path: abs,
      relativePath: rel,
      workspaceId: id,
      workspaceLabel: label,
      dateFromFilename: date,
    });
    for (const ev of parsedEvents) {
      events.push(ev);
      if (ev.type === "flush") {
        flushCount += 1;
        if (ev.timestamp && (!lastFlush || ev.timestamp > lastFlush)) {
          lastFlush = ev.timestamp;
        }
      }
      if (ev.type === "session_end") sessionEndCount += 1;
      if (ev.timestamp && (!lastActivity || ev.timestamp > lastActivity)) {
        lastActivity = ev.timestamp;
      }
    }
  }

  const mtimeIso = toIso(memoryStat?.mtime);
  if (mtimeIso && (!lastActivity || mtimeIso > lastActivity)) {
    lastActivity = mtimeIso;
  }

  const rememberEvents = parseRememberEvents({
    markdown: memoryText,
    path: memoryPath,
    relativePath: path.join(dirName, "MEMORY.md"),
    workspaceId: id,
    workspaceLabel: label,
    mtimeIso,
  });
  events.push(...rememberEvents);

  const dreamEvents = detectDreamEvents({
    memoryMarkdown: memoryText,
    memoryPath,
    relativeMemoryPath: path.join(dirName, "MEMORY.md"),
    workspaceId: id,
    workspaceLabel: label,
    memoryMtimeIso: mtimeIso,
    sessionFileCount: sessionFiles.length,
    previousSessionFileCount: previousSessionCounts?.[id] ?? null,
  });
  events.push(...dreamEvents);

  const memoryBytes = memoryStat?.size ?? 0;
  const isTemplate = isMemoryTemplateOnly(memoryText, sections);
  // Noisy: many session logs pending without flush, or huge session pile
  const isNoisy =
    sessionFiles.length >= 8 ||
    (sessionFiles.length >= 3 && flushCount === 0 && isTemplate);

  const workspace: WorkspaceInfo = {
    id,
    slug,
    hash8,
    projectPath,
    memoryPath,
    relativeMemoryPath: path.join(dirName, "MEMORY.md"),
    sessionsDir: hasSessionsDir ? sessionsDir : null,
    hasIndex: fileExists(indexPath),
    memoryBytes,
    memoryMtime: mtimeIso,
    sessionFileCount: sessionFiles.length,
    pendingSessionLogs: sessionFiles.length,
    flushCount,
    sessionEndCount,
    lastActivity,
    lastFlush,
    sections,
    isEmpty: isTemplate && sessionFiles.length === 0 && events.length === 0,
    isNoisy,
  };

  return { workspace, events };
}

function scanGlobal(memoryRoot: string): {
  global: GlobalMemoryInfo | null;
  events: MemoryEvent[];
} {
  const memoryPath = path.join(memoryRoot, "MEMORY.md");
  if (!fileExists(memoryPath)) {
    return { global: null, events: [] };
  }
  const text = readTextFile(memoryPath) ?? "";
  const st = statSafe(memoryPath);
  const sections = parseMemorySections(text);
  const mtimeIso = toIso(st?.mtime);
  const isTemplateOnly = isMemoryTemplateOnly(text, sections);

  const global: GlobalMemoryInfo = {
    path: memoryPath,
    relativePath: "MEMORY.md",
    bytes: st?.size ?? 0,
    mtime: mtimeIso,
    sections,
    isTemplateOnly,
  };

  const events = parseRememberEvents({
    markdown: text,
    path: memoryPath,
    relativePath: "MEMORY.md",
    workspaceId: "global",
    workspaceLabel: "Global",
    mtimeIso,
  });

  return { global, events };
}

/**
 * Full read-only ingest of the Grok memory store.
 */
export function ingestMemoryStore(
  options: IngestOptions = {},
): ObservatorySnapshot {
  const memoryRoot =
    options.memoryRoot ?? resolveMemoryRoot(options.grokHome);

  const events: MemoryEvent[] = [];
  const workspaces: WorkspaceInfo[] = [];

  const isDemoDataset = detectDemoDataset(memoryRoot);

  if (!fileExists(memoryRoot)) {
    const health: SystemHealth = {
      memoryRoot,
      workspaceCount: 0,
      totalEvents: 0,
      lastFlushAny: null,
      workspacesWithPendingSessions: 0,
      emptyWorkspaces: 0,
      noisyWorkspaces: 0,
      globalIsTemplateOnly: true,
      dreamGates: { minHours: 4, minSessions: 3 },
      isDemoDataset,
    };
    return {
      generatedAt: new Date().toISOString(),
      memoryRoot,
      global: null,
      workspaces: [],
      events: [],
      health,
      isDemoDataset,
    };
  }

  const { global, events: globalEvents } = scanGlobal(memoryRoot);
  events.push(...globalEvents);

  const entries = listDirSafe(memoryRoot);
  for (const name of entries) {
    const full = path.join(memoryRoot, name);
    const st = statSafe(full);
    if (!st?.isDirectory()) continue;
    const result = scanWorkspace(
      memoryRoot,
      name,
      options.previousSessionCounts,
    );
    if (!result) continue;
    workspaces.push(result.workspace);
    events.push(...result.events);
  }

  workspaces.sort((a, b) => {
    const ta = a.lastActivity ?? "";
    const tb = b.lastActivity ?? "";
    return tb.localeCompare(ta);
  });

  events.sort((a, b) => {
    const ta = a.timestamp ?? "";
    const tb = b.timestamp ?? "";
    if (ta !== tb) return tb.localeCompare(ta);
    return a.id.localeCompare(b.id);
  });

  let lastFlushAny: string | null = null;
  for (const ev of events) {
    if (ev.type === "flush" && ev.timestamp) {
      if (!lastFlushAny || ev.timestamp > lastFlushAny) {
        lastFlushAny = ev.timestamp;
      }
    }
  }

  const health: SystemHealth = {
    memoryRoot,
    workspaceCount: workspaces.length,
    totalEvents: events.length,
    lastFlushAny,
    workspacesWithPendingSessions: workspaces.filter(
      (w) => w.pendingSessionLogs > 0,
    ).length,
    emptyWorkspaces: workspaces.filter((w) => w.isEmpty).length,
    noisyWorkspaces: workspaces.filter((w) => w.isNoisy).length,
    globalIsTemplateOnly: global?.isTemplateOnly ?? true,
    dreamGates: { minHours: 4, minSessions: 3 },
    isDemoDataset,
  };

  return {
    generatedAt: new Date().toISOString(),
    memoryRoot,
    global,
    workspaces,
    events,
    health,
    isDemoDataset,
  };
}

/** Demo tree ships under fixtures/demo-grok/memory (npm run demo). */
function detectDemoDataset(memoryRoot: string): boolean {
  const normalized = memoryRoot.replace(/\\/g, "/");
  return (
    normalized.includes("/fixtures/demo-grok/memory") ||
    normalized.endsWith("fixtures/demo-grok/memory")
  );
}

/** Discover workspace directory names only (light). */
export function listWorkspaceIds(memoryRoot?: string): string[] {
  const root = memoryRoot ?? resolveMemoryRoot();
  return listDirSafe(root).filter((name) => {
    if (!parseWorkspaceDirName(name)) return false;
    const st = statSafe(path.join(root, name));
    return st?.isDirectory() ?? false;
  });
}
