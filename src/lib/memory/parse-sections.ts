import type { MemorySection } from "./types";

const TEMPLATE_MARKERS = [
  "add any cross-project preferences here",
  "auto-populated by dream consolidation",
  "this file is automatically managed by grok",
  "edit freely",
  "you can also edit it manually",
];

function isTemplateLine(line: string): boolean {
  const t = line.trim().toLowerCase();
  if (!t) return true;
  if (t.startsWith("<!--") && t.endsWith("-->")) return true;
  if (t.startsWith(">")) {
    return TEMPLATE_MARKERS.some((m) => t.includes(m));
  }
  return TEMPLATE_MARKERS.some((m) => t.includes(m));
}

/**
 * Inventory ## / ### sections and whether they hold real content
 * (non-template bullets / paragraphs).
 */
export function parseMemorySections(markdown: string): MemorySection[] {
  if (!markdown || !markdown.trim()) return [];

  const lines = markdown.split(/\r?\n/);
  const sections: MemorySection[] = [];
  let current: MemorySection | null = null;

  const flush = () => {
    if (!current) return;
    current.isTemplateOnly =
      current.contentLines.length === 0 ||
      current.contentLines.every(isTemplateLine);
    sections.push(current);
    current = null;
  };

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.+?)\s*$/);
    if (headingMatch) {
      flush();
      const level = headingMatch[1].length;
      // Skip top-level title for inventory of curated sections
      if (level === 1) {
        current = null;
        continue;
      }
      current = {
        heading: headingMatch[2].trim(),
        level,
        contentLines: [],
        isTemplateOnly: true,
      };
      continue;
    }

    if (!current) continue;
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#")) continue;
    current.contentLines.push(trimmed);
  }
  flush();

  return sections;
}

export function sectionsWithContent(sections: MemorySection[]): MemorySection[] {
  return sections.filter((s) => !s.isTemplateOnly && s.contentLines.length > 0);
}

export function isMemoryTemplateOnly(
  markdown: string,
  sections?: MemorySection[],
): boolean {
  const secs = sections ?? parseMemorySections(markdown);
  const body = markdown
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !l.startsWith("#"))
    .filter((l) => !isTemplateLine(l));
  if (body.length === 0) return true;
  return sectionsWithContent(secs).length === 0;
}

/** Extract project path from "# Project Memory — /path" */
export function extractProjectPath(markdown: string): string | null {
  const m = markdown.match(/^#\s+Project Memory\s*[—–-]\s*(.+)\s*$/m);
  if (!m) return null;
  const p = m[1].trim();
  return p || null;
}
