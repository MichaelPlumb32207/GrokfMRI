import {
  parseMemorySections,
  sectionsWithContent,
} from "./parse-sections";
import type { MemoryEvent } from "./types";

export interface ParseRememberOptions {
  markdown: string;
  path: string;
  relativePath: string;
  workspaceId: string;
  workspaceLabel: string;
  /** File mtime as ISO — used as best-effort timestamp */
  mtimeIso: string | null;
}

/**
 * Treat curated non-template content in MEMORY.md as remember-class events.
 * One event per section that has real content (not template placeholders).
 *
 * Note: we cannot reconstruct historical /remember timestamps from the file
 * alone without git history; mtime is a best-effort proxy for "last written."
 */
export function parseRememberEvents(
  opts: ParseRememberOptions,
): MemoryEvent[] {
  const {
    markdown,
    path: filePath,
    relativePath,
    workspaceId,
    workspaceLabel,
    mtimeIso,
  } = opts;

  if (!markdown?.trim()) return [];

  const sections = sectionsWithContent(parseMemorySections(markdown));
  const events: MemoryEvent[] = [];

  for (const section of sections) {
    const excerpt = section.contentLines.slice(0, 4).join(" · ");
    const id = `remember:${workspaceId}:${section.heading}`;

    events.push({
      id,
      type: "remember",
      timestamp: mtimeIso,
      workspaceId,
      workspaceLabel,
      path: filePath,
      relativePath,
      title: `${section.heading} (${section.contentLines.length} note${section.contentLines.length === 1 ? "" : "s"})`,
      excerpt: excerpt.length > 280 ? excerpt.slice(0, 279) + "…" : excerpt,
      headings: [section.heading],
      confidence: "medium",
      meta: {
        section: section.heading,
        noteCount: section.contentLines.length,
        notes: section.contentLines.slice(0, 20),
        timestampSource: "mtime",
      },
    });
  }

  return events;
}
