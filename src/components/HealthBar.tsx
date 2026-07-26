import type { SystemHealth } from "@/lib/memory";
import { formatTimestamp } from "@/lib/format";

export function HealthBar({ health }: { health: SystemHealth }) {
  const chips = [
    {
      label: "Workspaces",
      value: String(health.workspaceCount),
    },
    {
      label: "Events",
      value: String(health.totalEvents),
    },
    {
      label: "Last flush",
      value: health.lastFlushAny
        ? formatTimestamp(health.lastFlushAny)
        : "None yet",
    },
    {
      label: "Pending session logs",
      value: String(health.workspacesWithPendingSessions),
      warn: health.workspacesWithPendingSessions > 0,
    },
    {
      label: "Empty stores",
      value: String(health.emptyWorkspaces),
    },
    {
      label: "Noisy",
      value: String(health.noisyWorkspaces),
      warn: health.noisyWorkspaces > 0,
    },
    {
      label: "Global MEMORY",
      value: health.globalIsTemplateOnly ? "template" : "curated",
    },
    {
      label: "Dream gates",
      value: `${health.dreamGates.minHours}h / ${health.dreamGates.minSessions} sessions`,
    },
  ];

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-200">
          System health
        </h2>
        <code className="truncate text-[11px] text-zinc-500">
          {health.memoryRoot}
        </code>
      </div>
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <div
            key={c.label}
            className={`rounded-lg border px-3 py-2 ${
              c.warn
                ? "border-amber-500/30 bg-amber-500/10"
                : "border-zinc-800 bg-zinc-950/50"
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">
              {c.label}
            </div>
            <div className="mt-0.5 text-sm font-medium text-zinc-100">
              {c.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
