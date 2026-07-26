import fs from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { resolveMemoryRoot, safeResolveUnderRoot, statSafe } from "@/lib/memory";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 512 * 1024; // 512 KiB read cap for v1

/**
 * GET /api/files?path=relative/or/absolute-under-memory-root
 * Read-only; path must resolve under the memory root.
 */
export async function GET(req: NextRequest) {
  try {
    const raw = req.nextUrl.searchParams.get("path");
    if (!raw) {
      return NextResponse.json(
        { error: "Missing path query parameter" },
        { status: 400 },
      );
    }

    const memoryRoot = resolveMemoryRoot();
    const resolved = safeResolveUnderRoot(memoryRoot, raw);
    if (!resolved) {
      return NextResponse.json(
        { error: "Path escapes memory root" },
        { status: 403 },
      );
    }

    const st = statSafe(resolved);
    if (!st || !st.isFile()) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (st.size > MAX_BYTES) {
      return NextResponse.json(
        {
          error: `File too large (${st.size} bytes; max ${MAX_BYTES})`,
          path: resolved,
          relativePath: path.relative(memoryRoot, resolved),
        },
        { status: 413 },
      );
    }

    // Only serve text-ish files
    const ext = path.extname(resolved).toLowerCase();
    if (ext && ![".md", ".txt", ".markdown", ".json"].includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${ext}` },
        { status: 415 },
      );
    }

    const content = fs.readFileSync(resolved, "utf8");
    return NextResponse.json({
      path: resolved,
      relativePath: path.relative(memoryRoot, resolved),
      bytes: st.size,
      mtime: st.mtime.toISOString(),
      content,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
