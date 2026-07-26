import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ingestMemoryStore, listWorkspaceIds } from "./discover";
import { parseWorkspaceDirName, safeResolveUnderRoot } from "./paths";

const tmpDirs: string[] = [];

function makeTmp(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "grokfmri-"));
  tmpDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const d of tmpDirs.splice(0)) {
    fs.rmSync(d, { recursive: true, force: true });
  }
});

describe("parseWorkspaceDirName", () => {
  it("parses slug-hash8", () => {
    expect(parseWorkspaceDirName("fetch-16b6e57e")).toEqual({
      slug: "fetch",
      hash8: "16b6e57e",
    });
    expect(parseWorkspaceDirName("grokfmri-0975f252")?.slug).toBe("grokfmri");
    expect(parseWorkspaceDirName("MEMORY.md")).toBeNull();
    expect(parseWorkspaceDirName("not-a-workspace")).toBeNull();
  });
});

describe("safeResolveUnderRoot", () => {
  it("blocks path traversal", () => {
    const root = "/tmp/memory-root";
    expect(safeResolveUnderRoot(root, "../../../etc/passwd")).toBeNull();
    expect(safeResolveUnderRoot(root, "fetch-16b6e57e/MEMORY.md")).toContain(
      "fetch-16b6e57e",
    );
  });
});

describe("ingestMemoryStore", () => {
  it("handles empty / missing memory root", () => {
    const root = path.join(makeTmp(), "missing");
    const snap = ingestMemoryStore({ memoryRoot: root });
    expect(snap.workspaces).toEqual([]);
    expect(snap.events).toEqual([]);
    expect(snap.health.workspaceCount).toBe(0);
  });

  it("handles template-only store without crashing", () => {
    const root = makeTmp();
    fs.writeFileSync(
      path.join(root, "MEMORY.md"),
      `# Global Memory

> This file is automatically managed by Grok's memory system.

## Preferences

<!-- Add any cross-project preferences here -->
`,
    );
    const ws = path.join(root, "fetch-16b6e57e");
    fs.mkdirSync(ws);
    fs.writeFileSync(
      path.join(ws, "MEMORY.md"),
      `# Project Memory — /Users/michaelplumb/Fetch

> Auto-populated by dream consolidation. Edit freely.
`,
    );

    const snap = ingestMemoryStore({ memoryRoot: root });
    expect(snap.workspaces).toHaveLength(1);
    expect(snap.workspaces[0].id).toBe("fetch-16b6e57e");
    expect(snap.workspaces[0].projectPath).toBe("/Users/michaelplumb/Fetch");
    expect(snap.global?.isTemplateOnly).toBe(true);
    expect(snap.events.filter((e) => e.type === "flush")).toHaveLength(0);
  });

  it("ingests flush from sessions daily log", () => {
    const root = makeTmp();
    fs.writeFileSync(path.join(root, "MEMORY.md"), "# Global Memory\n");
    const ws = path.join(root, "fetch-16b6e57e");
    const sessions = path.join(ws, "sessions");
    fs.mkdirSync(sessions, { recursive: true });
    fs.writeFileSync(
      path.join(ws, "MEMORY.md"),
      "# Project Memory — /Users/michaelplumb/Fetch\n",
    );
    fs.writeFileSync(
      path.join(sessions, "2026-07-26.md"),
      `## 16:01:43 UTC
<!-- flush 019f9f22-2ce7-7770-ba4c-b3e389066498 -->

## Session Summary
- **Date:** 2026-07-26 16:01 UTC
- **Session:** 019f9f22-2ce7-7770-ba4c-b3e389066498

## Topics Discussed
- Memory habits rule

## Key Decisions
- Enable memory
`,
    );

    const snap = ingestMemoryStore({ memoryRoot: root });
    const flushes = snap.events.filter((e) => e.type === "flush");
    expect(flushes).toHaveLength(1);
    expect(flushes[0].timestamp).toBe("2026-07-26T16:01:43Z");
    expect(snap.workspaces[0].flushCount).toBe(1);
    expect(snap.workspaces[0].pendingSessionLogs).toBe(1);
    expect(listWorkspaceIds(root)).toEqual(["fetch-16b6e57e"]);
  });
});
