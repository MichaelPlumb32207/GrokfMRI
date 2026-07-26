import type { MemoryEvent, MemoryEventType } from "@/lib/memory";
import { EVENT_COLORS, formatTimestamp, relativeDay } from "@/lib/format";
import { EventTypeBadge } from "./EventTypeBadge";

export function Timeline({
  events,
  selectedId,
  onSelect,
}: {
  events: MemoryEvent[];
  selectedId: string | null;
  onSelect: (ev: MemoryEvent) => void;
}) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-10 text-center">
        <p className="text-sm font-medium text-zinc-300">No events match</p>
        <p className="mt-1 text-xs text-zinc-500">
          Clear filters, run a Grok session with{" "}
          <code className="text-zinc-400">/flush</code>, or{" "}
          <code className="text-zinc-400">/remember</code> a note. Empty stores
          are healthy — not an error.
        </p>
      </div>
    );
  }

  // Group by calendar day (UTC date part)
  const groups = new Map<string, MemoryEvent[]>();
  for (const ev of events) {
    const day = ev.timestamp?.slice(0, 10) ?? "unknown";
    const list = groups.get(day) ?? [];
    list.push(ev);
    groups.set(day, list);
  }

  return (
    <div className="space-y-6">
      {[...groups.entries()].map(([day, dayEvents]) => (
        <div key={day}>
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {day === "unknown" ? "Unknown date" : relativeDay(day + "T00:00:00Z")}
            </h3>
            <span className="text-[11px] text-zinc-600">{day}</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>
          <ul className="space-y-2">
            {dayEvents.map((ev) => {
              const c = EVENT_COLORS[ev.type as MemoryEventType];
              const selected = selectedId === ev.id;
              return (
                <li key={ev.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(ev)}
                    className={`flex w-full gap-3 rounded-xl border p-3 text-left transition ${
                      selected
                        ? `${c.border} ${c.bg}`
                        : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600"
                    }`}
                  >
                    <div
                      className={`mt-1 h-3 w-3 shrink-0 rounded-full border ${c.border} ${c.bg}`}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <EventTypeBadge
                          type={ev.type}
                          confidence={ev.confidence}
                        />
                        <span className="text-[11px] text-zinc-500">
                          {formatTimestamp(ev.timestamp)}
                        </span>
                        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
                          {ev.workspaceLabel}
                        </span>
                      </div>
                      <div className="mt-1 truncate text-sm font-medium text-zinc-100">
                        {ev.title}
                      </div>
                      <div className="mt-0.5 line-clamp-2 text-xs text-zinc-500">
                        {ev.excerpt || "—"}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
