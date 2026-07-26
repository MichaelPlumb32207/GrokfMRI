import type { DreamConfidence, MemoryEvent } from "./types";
import { parseMemorySections, sectionsWithContent } from "./parse-sections";

export interface DreamHeuristicInput {
  /** Workspace MEMORY.md content */
  memoryMarkdown: string;
  memoryPath: string;
  relativeMemoryPath: string;
  workspaceId: string;
  workspaceLabel: string;
  memoryMtimeIso: string | null;
  /** Number of session log files present now */
  sessionFileCount: number;
  /**
   * Optional: prior known session count from a previous scan.
   * When sessions drop while MEMORY gains real sections → dream signal.
   */
  previousSessionFileCount?: number | null;
  /**
   * Optional: text of dream lock / meta files if discovered.
   */
  dreamMetaText?: string | null;
}

/**
 * Heuristic dream detection for v1.
 *
 * High confidence: explicit dream meta/lock content or dream markers in MEMORY.md.
 * Medium: MEMORY has organized non-template topics AND sessions appear consumed
 *   (previousSessionFileCount > current, or session dir empty while MEMORY rich).
 * Low: MEMORY title/body mentions dream consolidation but still template-ish.
 * none: no signal — returns no event.
 *
 * Documented limitation: without a durable dream log or git history of
 * session deletion, most dreams are not observable after the fact.
 */
export function detectDreamEvents(input: DreamHeuristicInput): MemoryEvent[] {
  const {
    memoryMarkdown,
    memoryPath,
    relativeMemoryPath,
    workspaceId,
    workspaceLabel,
    memoryMtimeIso,
    sessionFileCount,
    previousSessionFileCount = null,
    dreamMetaText = null,
  } = input;

  if (!memoryMarkdown?.trim() && !dreamMetaText) return [];

  const sections = parseMemorySections(memoryMarkdown);
  const contentSections = sectionsWithContent(sections);
  const metaLower = (dreamMetaText ?? "").toLowerCase();

  let confidence: DreamConfidence = "none";
  const signals: string[] = [];

  if (
    metaLower.includes("dream") ||
    /<!--\s*dream/i.test(dreamMetaText ?? "")
  ) {
    confidence = "high";
    signals.push("dream meta/lock present");
  }

  // Standard Grok template says "Auto-populated by dream consolidation" —
  // ignore that boilerplate. Only honor explicit dream markers / rich body.
  const hasBoilerplateOnly =
    contentSections.length === 0 &&
    /auto-populated by dream consolidation/i.test(memoryMarkdown);

  if (
    !hasBoilerplateOnly &&
    (/<!--\s*dream/i.test(memoryMarkdown) ||
      /\b(?:ran|after|via)\s+\/dream\b/i.test(memoryMarkdown) ||
      /\bdream\s+merged\b/i.test(memoryMarkdown))
  ) {
    if (confidence === "none") confidence = "low";
    signals.push("MEMORY has explicit dream marker");
  }

  const sessionsConsumed =
    previousSessionFileCount != null &&
    previousSessionFileCount > sessionFileCount;

  if (sessionsConsumed && contentSections.length > 0) {
    confidence = confidence === "high" ? "high" : "medium";
    signals.push(
      `session files decreased (${previousSessionFileCount} → ${sessionFileCount}) with curated MEMORY sections`,
    );
  }

  // Rich MEMORY + zero sessions after activity is a weak post-dream smell
  if (
    contentSections.length >= 2 &&
    sessionFileCount === 0 &&
    confidence === "none"
  ) {
    confidence = "low";
    signals.push(
      "multiple curated MEMORY sections with no pending session logs",
    );
  }

  if (confidence === "none" || signals.length === 0) {
    return [];
  }

  const title =
    confidence === "high"
      ? "Dream consolidation (detected)"
      : `Possible dream consolidation (${confidence} confidence)`;

  const excerpt = signals.join("; ");

  return [
    {
      id: `dream:${workspaceId}:${memoryMtimeIso ?? "unknown"}`,
      type: "dream",
      timestamp: memoryMtimeIso,
      workspaceId,
      workspaceLabel,
      path: memoryPath,
      relativePath: relativeMemoryPath,
      title,
      excerpt,
      headings: contentSections.map((s) => s.heading),
      confidence,
      meta: {
        signals,
        sessionFileCount,
        previousSessionFileCount,
        contentSectionCount: contentSections.length,
      },
    },
  ];
}
