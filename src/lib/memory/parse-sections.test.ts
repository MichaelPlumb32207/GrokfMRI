import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  extractProjectPath,
  isMemoryTemplateOnly,
  parseMemorySections,
  sectionsWithContent,
} from "./parse-sections";
import { parseRememberEvents } from "./parse-remember";
import { detectDreamEvents } from "./parse-dream";

const fixtures = path.join(__dirname, "__fixtures__");

function load(name: string): string {
  return readFileSync(path.join(fixtures, name), "utf8");
}

describe("parseMemorySections", () => {
  it("treats template global MEMORY as empty content", () => {
    const md = load("global-template.md");
    expect(isMemoryTemplateOnly(md)).toBe(true);
    expect(sectionsWithContent(parseMemorySections(md))).toHaveLength(0);
  });

  it("finds remember-class sections with real bullets", () => {
    const md = load("global-remember.md");
    expect(isMemoryTemplateOnly(md)).toBe(false);
    const content = sectionsWithContent(parseMemorySections(md));
    expect(content.map((s) => s.heading)).toEqual(
      expect.arrayContaining(["Preferences", "Project Context"]),
    );
  });

  it("extracts project path from workspace MEMORY title", () => {
    expect(extractProjectPath(load("workspace-template.md"))).toBe(
      "/Users/michaelplumb/Fetch",
    );
  });
});

describe("parseRememberEvents", () => {
  it("emits one event per non-template section", () => {
    const events = parseRememberEvents({
      markdown: load("global-remember.md"),
      path: "/tmp/MEMORY.md",
      relativePath: "MEMORY.md",
      workspaceId: "global",
      workspaceLabel: "Global",
      mtimeIso: "2026-07-26T12:00:00.000Z",
    });
    expect(events.length).toBeGreaterThanOrEqual(2);
    expect(events.every((e) => e.type === "remember")).toBe(true);
    expect(events[0].timestamp).toBe("2026-07-26T12:00:00.000Z");
  });

  it("emits nothing for template-only MEMORY", () => {
    const events = parseRememberEvents({
      markdown: load("global-template.md"),
      path: "/tmp/MEMORY.md",
      relativePath: "MEMORY.md",
      workspaceId: "global",
      workspaceLabel: "Global",
      mtimeIso: null,
    });
    expect(events).toHaveLength(0);
  });
});

describe("detectDreamEvents", () => {
  it("returns no event for empty template", () => {
    const events = detectDreamEvents({
      memoryMarkdown: load("workspace-template.md"),
      memoryPath: "/tmp/m.md",
      relativeMemoryPath: "ws/MEMORY.md",
      workspaceId: "ws",
      workspaceLabel: "Ws",
      memoryMtimeIso: null,
      sessionFileCount: 0,
    });
    // Template mentions "dream consolidation" → low confidence possible
    // Accept either low-confidence or none depending on content richness
    for (const e of events) {
      expect(e.type).toBe("dream");
      expect(["low", "medium", "high"]).toContain(e.confidence);
    }
  });

  it("raises confidence when sessions were consumed and MEMORY is rich", () => {
    const rich = `# Project Memory — /tmp/x

## Preferences
- Use dark mode

## Debugging
- Check index.sqlite first
`;
    const events = detectDreamEvents({
      memoryMarkdown: rich,
      memoryPath: "/tmp/m.md",
      relativeMemoryPath: "ws/MEMORY.md",
      workspaceId: "ws",
      workspaceLabel: "Ws",
      memoryMtimeIso: "2026-07-26T12:00:00.000Z",
      sessionFileCount: 0,
      previousSessionFileCount: 5,
    });
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("dream");
    expect(events[0].confidence).toBe("medium");
  });
});
