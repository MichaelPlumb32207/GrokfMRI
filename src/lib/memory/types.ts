/** Memory event types observed under ~/.grok/memory/ */
export type MemoryEventType =
  | "flush"
  | "session_end"
  | "remember"
  | "dream"
  | "unknown";

export type DreamConfidence = "high" | "medium" | "low" | "none";

export interface MemoryEvent {
  id: string;
  type: MemoryEventType;
  /** ISO-8601 UTC when known */
  timestamp: string | null;
  /** Workspace slug-hash, or "global" */
  workspaceId: string;
  /** Human-friendly label (slug or "Global") */
  workspaceLabel: string;
  sessionId?: string;
  /** Absolute path to source file */
  path: string;
  /** Path relative to memory root (for display / API) */
  relativePath: string;
  title: string;
  excerpt: string;
  headings: string[];
  /** Dream heuristic only */
  confidence?: DreamConfidence;
  /** Extra structured bits (topics, decisions, message counts) */
  meta?: Record<string, unknown>;
}

export interface MemorySection {
  heading: string;
  /** Level of heading (2 = ##) */
  level: number;
  /** Non-empty bullet/content lines under this heading */
  contentLines: string[];
  isTemplateOnly: boolean;
}

export interface WorkspaceInfo {
  id: string;
  slug: string;
  hash8: string;
  /** From MEMORY.md title if present */
  projectPath: string | null;
  memoryPath: string;
  relativeMemoryPath: string;
  sessionsDir: string | null;
  hasIndex: boolean;
  memoryBytes: number;
  memoryMtime: string | null;
  sessionFileCount: number;
  pendingSessionLogs: number;
  flushCount: number;
  sessionEndCount: number;
  lastActivity: string | null;
  lastFlush: string | null;
  sections: MemorySection[];
  isEmpty: boolean;
  isNoisy: boolean;
}

export interface GlobalMemoryInfo {
  path: string;
  relativePath: string;
  bytes: number;
  mtime: string | null;
  sections: MemorySection[];
  isTemplateOnly: boolean;
}

export interface SystemHealth {
  memoryRoot: string;
  workspaceCount: number;
  totalEvents: number;
  lastFlushAny: string | null;
  workspacesWithPendingSessions: number;
  emptyWorkspaces: number;
  noisyWorkspaces: number;
  globalIsTemplateOnly: boolean;
  dreamGates: {
    minHours: number;
    minSessions: number;
  };
}

export interface ObservatorySnapshot {
  generatedAt: string;
  memoryRoot: string;
  global: GlobalMemoryInfo | null;
  workspaces: WorkspaceInfo[];
  events: MemoryEvent[];
  health: SystemHealth;
}
