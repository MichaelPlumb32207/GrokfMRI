import { NextRequest, NextResponse } from "next/server";
import { ingestMemoryStore } from "@/lib/memory";
import type { MemoryEventType } from "@/lib/memory";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_TYPES = new Set<MemoryEventType>([
  "flush",
  "session_end",
  "remember",
  "dream",
  "unknown",
]);

/**
 * GET /api/events
 * Query: workspace, type (comma-separated), limit
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const workspace = searchParams.get("workspace");
    const typeParam = searchParams.get("type");
    const limitRaw = searchParams.get("limit");
    const limit = limitRaw ? Math.min(Math.max(parseInt(limitRaw, 10) || 0, 0), 1000) : 0;

    const types = typeParam
      ? typeParam
          .split(",")
          .map((t) => t.trim())
          .filter((t): t is MemoryEventType => VALID_TYPES.has(t as MemoryEventType))
      : null;

    const snap = ingestMemoryStore();
    let events = snap.events;

    if (workspace) {
      events = events.filter((e) => e.workspaceId === workspace);
    }
    if (types && types.length > 0) {
      events = events.filter((e) => types.includes(e.type));
    }
    if (limit > 0) {
      events = events.slice(0, limit);
    }

    return NextResponse.json({
      generatedAt: snap.generatedAt,
      memoryRoot: snap.memoryRoot,
      count: events.length,
      events,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
