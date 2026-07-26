import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  classifySessionBlock,
  parseSessionFile,
  splitSessionBlocks,
} from "./parse-sessions";

const fixtures = path.join(__dirname, "__fixtures__");

function load(name: string): string {
  return readFileSync(path.join(fixtures, name), "utf8");
}

describe("splitSessionBlocks", () => {
  it("splits multi-block daily logs", () => {
    const blocks = splitSessionBlocks(load("multi-block.md"));
    expect(blocks).toHaveLength(2);
    expect(blocks[0].timeUtc).toBe("10:00:00");
    expect(blocks[1].timeUtc).toBe("16:01:43");
  });

  it("returns empty for empty input", () => {
    expect(splitSessionBlocks("")).toEqual([]);
    expect(splitSessionBlocks("   \n")).toEqual([]);
  });
});

describe("classifySessionBlock", () => {
  it("detects flush via HTML comment", () => {
    const body = load("flush-session.md").replace(/^## 16:01:43 UTC\n/, "");
    const c = classifySessionBlock(body);
    expect(c.type).toBe("flush");
    expect(c.sessionId).toBe("019f9f22-2ce7-7770-ba4c-b3e389066498");
    expect(c.confidence).toBe("high");
  });

  it("detects thin session-end summaries", () => {
    const body = load("session-end.md").replace(/^## 18:22:10 UTC\n/, "");
    const c = classifySessionBlock(body);
    expect(c.type).toBe("session_end");
  });
});

describe("parseSessionFile", () => {
  it("parses a flush event with topics and timestamp", () => {
    const events = parseSessionFile({
      markdown: load("flush-session.md"),
      path: "/tmp/memory/fetch-16b6e57e/sessions/2026-07-26.md",
      relativePath: "fetch-16b6e57e/sessions/2026-07-26.md",
      workspaceId: "fetch-16b6e57e",
      workspaceLabel: "Fetch",
      dateFromFilename: "2026-07-26",
    });
    expect(events).toHaveLength(1);
    const ev = events[0];
    expect(ev.type).toBe("flush");
    expect(ev.timestamp).toBe("2026-07-26T16:01:43Z");
    expect(ev.sessionId).toBe("019f9f22-2ce7-7770-ba4c-b3e389066498");
    expect(ev.headings).toContain("Topics Discussed");
    expect(ev.headings).toContain("Key Decisions");
    expect(ev.excerpt.length).toBeGreaterThan(20);
    expect(ev.meta?.topics).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Grok memory"),
      ]),
    );
  });

  it("parses mixed flush + session_end blocks", () => {
    const events = parseSessionFile({
      markdown: load("multi-block.md"),
      path: "/tmp/x.md",
      relativePath: "ws/sessions/2026-07-26.md",
      workspaceId: "ws",
      workspaceLabel: "Ws",
      dateFromFilename: "2026-07-26",
    });
    expect(events).toHaveLength(2);
    expect(events.map((e) => e.type).sort()).toEqual([
      "flush",
      "session_end",
    ]);
  });
});
