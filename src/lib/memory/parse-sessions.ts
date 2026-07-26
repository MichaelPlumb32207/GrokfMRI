import type { MemoryEvent, MemoryEventType } from "./types";

/** Split daily session logs into timed blocks. */
const TIME_HEADING_RE = /^##\s+(\d{1,2}:\d{2}:\d{2})\s+UTC\s*$/i;
const FLUSH_COMMENT_RE = /<!--\s*flush\s+([0-9a-f-]+)\s*-->/i;
const SESSION_ID_RE =
  /\*\*Session:\*\*\s*`?([0-9a-f]{8}-[0-9a-f-]+)`?/i;
const DATE_IN_SUMMARY_RE =
  /\*\*Date:\*\*\s*(\d{4}-\d{2}-\d{2})\s+(\d{1,2}:\d{2})(?:\s*UTC)?/i;

const RICH_HEADINGS = [
  "session summary",
  "topics discussed",
  "key decisions",
  "changes made",
  "clarifications",
  "still open",
  "do not store",
];

const THIN_MARKERS = [
  "message count",
  "user messages",
  "assistant messages",
  "tool results",
  "substantive prompts",
];

export interface SessionBlock {
  timeUtc: string; // HH:MM:SS
  body: string;
  startLine: number;
}

/**
 * Split a daily session log into blocks starting at ## HH:MM:SS UTC.
 * Content before the first time heading is ignored (rare preamble).
 */
export function splitSessionBlocks(markdown: string): SessionBlock[] {
  if (!markdown?.trim()) return [];
  const lines = markdown.split(/\r?\n/);
  const blocks: SessionBlock[] = [];
  let current: SessionBlock | null = null;
  const bodyLines: string[] = [];

  const push = () => {
    if (!current) return;
    current.body = bodyLines.join("\n").trim();
    blocks.push(current);
    bodyLines.length = 0;
    current = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(TIME_HEADING_RE);
    if (m) {
      push();
      current = {
        timeUtc: m[1],
        body: "",
        startLine: i + 1,
      };
      continue;
    }
    if (current) bodyLines.push(line);
  }
  push();
  return blocks;
}

export function extractHeadings(markdown: string): string[] {
  const out: string[] = [];
  for (const line of markdown.split(/\r?\n/)) {
    const m = line.match(/^#{2,3}\s+(.+?)\s*$/);
    if (m) out.push(m[1].trim());
  }
  return out;
}

function extractListItems(markdown: string, heading: string): string[] {
  const lines = markdown.split(/\r?\n/);
  const target = heading.toLowerCase();
  let inSection = false;
  const items: string[] = [];
  for (const line of lines) {
    const h = line.match(/^#{2,3}\s+(.+?)\s*$/);
    if (h) {
      inSection = h[1].trim().toLowerCase() === target;
      continue;
    }
    if (!inSection) continue;
    const bullet = line.match(/^\s*[-*]\s+(.+)/);
    if (bullet) items.push(bullet[1].replace(/\*\*/g, "").trim());
  }
  return items;
}

export function classifySessionBlock(body: string): {
  type: MemoryEventType;
  sessionId?: string;
  confidence?: "high" | "medium" | "low" | "none";
} {
  const flushMatch = body.match(FLUSH_COMMENT_RE);
  if (flushMatch) {
    return {
      type: "flush",
      sessionId: flushMatch[1],
      confidence: "high",
    };
  }

  const sessionId = body.match(SESSION_ID_RE)?.[1];
  const headings = extractHeadings(body).map((h) => h.toLowerCase());
  const lower = body.toLowerCase();

  const richHits = RICH_HEADINGS.filter(
    (h) => headings.includes(h) || lower.includes(`## ${h}`),
  ).length;
  const thinHits = THIN_MARKERS.filter((m) => lower.includes(m)).length;

  // Rich flush-like content without the HTML comment (manual or variant)
  if (richHits >= 2 || headings.includes("key decisions")) {
    return { type: "flush", sessionId, confidence: "medium" };
  }

  if (thinHits >= 1 && richHits === 0) {
    return { type: "session_end", sessionId, confidence: "medium" };
  }

  // Short block with only topics / metadata → session_end
  const nonEmpty = body
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean).length;
  if (nonEmpty > 0 && nonEmpty <= 15 && richHits === 0) {
    return { type: "session_end", sessionId, confidence: "low" };
  }

  if (nonEmpty > 0) {
    return { type: "unknown", sessionId, confidence: "low" };
  }

  return { type: "unknown", confidence: "none" };
}

function buildTimestamp(
  dateFromFilename: string | null,
  timeUtc: string,
  body: string,
): string | null {
  const fromSummary = body.match(DATE_IN_SUMMARY_RE);
  if (fromSummary) {
    const date = fromSummary[1];
    const hm = fromSummary[2];
    const sec = timeUtc.split(":").length === 3 ? timeUtc.split(":")[2] : "00";
    // Prefer precise time heading when available
    if (timeUtc) {
      return `${date}T${padTime(timeUtc)}Z`;
    }
    return `${date}T${padTime(`${hm}:${sec}`)}Z`;
  }
  if (dateFromFilename && timeUtc) {
    return `${dateFromFilename}T${padTime(timeUtc)}Z`;
  }
  return null;
}

function padTime(t: string): string {
  const parts = t.split(":").map((p) => p.padStart(2, "0"));
  while (parts.length < 3) parts.push("00");
  return parts.slice(0, 3).join(":");
}

function excerptFrom(body: string, max = 280): string {
  const cleaned = body
    .replace(/<!--[\s\S]*?-->/g, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length <= max) return cleaned;
  return cleaned.slice(0, max - 1) + "…";
}

function titleFor(
  type: MemoryEventType,
  topics: string[],
  timeUtc: string,
): string {
  if (topics.length > 0) {
    const first = topics[0].replace(/^[*_]+|[*_]+$/g, "");
    const short = first.length > 72 ? first.slice(0, 71) + "…" : first;
    return short;
  }
  switch (type) {
    case "flush":
      return `Flush at ${timeUtc} UTC`;
    case "session_end":
      return `Session end at ${timeUtc} UTC`;
    default:
      return `Session block at ${timeUtc} UTC`;
  }
}

export interface ParseSessionFileOptions {
  markdown: string;
  /** Absolute path */
  path: string;
  /** Relative to memory root */
  relativePath: string;
  workspaceId: string;
  workspaceLabel: string;
  /** YYYY-MM-DD from filename when present */
  dateFromFilename?: string | null;
}

/**
 * Parse one daily (or multi-entry) session markdown file into events.
 */
export function parseSessionFile(
  opts: ParseSessionFileOptions,
): MemoryEvent[] {
  const {
    markdown,
    path: filePath,
    relativePath,
    workspaceId,
    workspaceLabel,
    dateFromFilename = null,
  } = opts;

  const dateGuess =
    dateFromFilename ??
    (relativePath.match(/(\d{4}-\d{2}-\d{2})/)?.[1] ?? null);

  const blocks = splitSessionBlocks(markdown);
  const events: MemoryEvent[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const classification = classifySessionBlock(block.body);
    if (classification.type === "unknown" && !block.body.trim()) continue;

    const headings = extractHeadings(block.body);
    const topics = extractListItems(block.body, "Topics Discussed");
    const decisions = extractListItems(block.body, "Key Decisions");
    const timestamp = buildTimestamp(
      dateGuess,
      block.timeUtc,
      block.body,
    );

    const id = [
      workspaceId,
      relativePath,
      block.timeUtc,
      classification.type,
      classification.sessionId ?? i,
    ].join(":");

    events.push({
      id,
      type: classification.type,
      timestamp,
      workspaceId,
      workspaceLabel,
      sessionId: classification.sessionId,
      path: filePath,
      relativePath,
      title: titleFor(classification.type, topics, block.timeUtc),
      excerpt: excerptFrom(block.body),
      headings,
      confidence:
        !classification.confidence || classification.confidence === "none"
          ? undefined
          : classification.confidence,
      meta: {
        topics,
        decisions,
        startLine: block.startLine,
        timeUtc: block.timeUtc,
      },
    });
  }

  return events;
}

/** YYYY-MM-DD from a session filename like 2026-07-26.md */
export function dateFromSessionFilename(filename: string): string | null {
  const m = filename.match(/^(\d{4}-\d{2}-\d{2})(?:\.md)?$/i);
  return m ? m[1] : null;
}
