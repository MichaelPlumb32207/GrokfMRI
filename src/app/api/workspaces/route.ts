import { NextResponse } from "next/server";
import { ingestMemoryStore } from "@/lib/memory";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/workspaces
 * Returns workspace cards + global MEMORY summary + system health.
 */
export async function GET() {
  try {
    const snap = ingestMemoryStore();
    return NextResponse.json({
      generatedAt: snap.generatedAt,
      memoryRoot: snap.memoryRoot,
      global: snap.global,
      workspaces: snap.workspaces,
      health: snap.health,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
