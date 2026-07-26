import { NextResponse } from "next/server";
import { ingestMemoryStore } from "@/lib/memory";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Full snapshot for the dashboard (one round-trip). */
export async function GET() {
  try {
    const snap = ingestMemoryStore();
    return NextResponse.json(snap);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
