"use client";

/**
 * Shown when GROK_HOME points at the repo's demo fixture (npm run demo).
 * Keeps screenshots honest — not claimed as live production memory.
 */
export function DemoBanner({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div
      role="status"
      className="border-b border-violet-500/35 bg-violet-500/12 px-4 py-2 text-center text-xs text-violet-100"
    >
      <strong className="font-semibold">Demo dataset</strong>
      {" — "}
      synthetic multi-day memory under{" "}
      <code className="text-violet-50">fixtures/demo-grok</code>. Not your real{" "}
      <code className="text-violet-50">~/.grok/memory</code>. Use for UI
      screenshots and tours.
    </div>
  );
}
