import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/** Expand ~ and resolve absolute path. */
export function expandHome(input: string): string {
  if (input === "~") return os.homedir();
  if (input.startsWith("~/") || input.startsWith("~\\")) {
    return path.join(os.homedir(), input.slice(2));
  }
  return input;
}

/**
 * Resolve Grok home directory.
 * Priority: explicit override → GROK_HOME env → ~/.grok
 */
export function resolveGrokHome(override?: string): string {
  const raw = override ?? process.env.GROK_HOME ?? path.join(os.homedir(), ".grok");
  return path.resolve(expandHome(raw));
}

export function resolveMemoryRoot(override?: string): string {
  return path.join(resolveGrokHome(override), "memory");
}

/** Workspace dir pattern: <slug>-<8 hex chars> */
export const WORKSPACE_DIR_RE = /^(.+)-([a-f0-9]{8})$/i;

export function parseWorkspaceDirName(
  name: string,
): { slug: string; hash8: string } | null {
  const m = name.match(WORKSPACE_DIR_RE);
  if (!m) return null;
  return { slug: m[1], hash8: m[2].toLowerCase() };
}

/**
 * Ensure candidate stays under root (no path traversal).
 * Returns absolute resolved path or null if unsafe / outside root.
 */
export function safeResolveUnderRoot(
  root: string,
  relativeOrAbsolute: string,
): string | null {
  const rootResolved = path.resolve(root);
  const candidate = path.isAbsolute(relativeOrAbsolute)
    ? path.resolve(relativeOrAbsolute)
    : path.resolve(rootResolved, relativeOrAbsolute);

  const rel = path.relative(rootResolved, candidate);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    return null;
  }
  return candidate;
}

export function fileExists(p: string): boolean {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

export function readTextFile(p: string): string | null {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

export function statSafe(p: string): fs.Stats | null {
  try {
    return fs.statSync(p);
  } catch {
    return null;
  }
}

export function listDirSafe(p: string): string[] {
  try {
    return fs.readdirSync(p);
  } catch {
    return [];
  }
}

export function toIso(mtimeMs: number | Date | null | undefined): string | null {
  if (mtimeMs == null) return null;
  const d = mtimeMs instanceof Date ? mtimeMs : new Date(mtimeMs);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}
