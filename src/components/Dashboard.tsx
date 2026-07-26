"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  MemoryEvent,
  MemoryEventType,
  ObservatorySnapshot,
} from "@/lib/memory";
import { HealthBar } from "./HealthBar";
import { WorkspaceGrid } from "./WorkspaceGrid";
import { Timeline } from "./Timeline";
import { EventDetail } from "./EventDetail";
import { MemoryPanel } from "./MemoryPanel";
import { EVENT_COLORS } from "@/lib/format";

const ALL_TYPES: MemoryEventType[] = [
  "flush",
  "session_end",
  "remember",
  "dream",
  "unknown",
];

export function Dashboard() {
  const [snap, setSnap] = useState<ObservatorySnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [workspaceFilter, setWorkspaceFilter] = useState<string | null>(null);
  const [typeFilters, setTypeFilters] = useState<Set<MemoryEventType>>(
    () => new Set(ALL_TYPES),
  );
  const [selectedEvent, setSelectedEvent] = useState<MemoryEvent | null>(null);
  const [tab, setTab] = useState<"timeline" | "workspaces">("timeline");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/snapshot");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || res.statusText);
      setSnap(data as ObservatorySnapshot);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial filesystem scan — external system sync (memory store).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    void load();
  }, [load]);

  const filteredEvents = useMemo(() => {
    if (!snap) return [];
    return snap.events.filter((e) => {
      if (workspaceFilter && e.workspaceId !== workspaceFilter) return false;
      if (!typeFilters.has(e.type)) return false;
      return true;
    });
  }, [snap, workspaceFilter, typeFilters]);

  const toggleType = (t: MemoryEventType) => {
    setTypeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950/90 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-400/80">
              Local · read-only
            </p>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              GrokfMRI
              <span className="ml-2 text-base font-normal text-zinc-500">
                Memory Observatory
              </span>
            </h1>
            <p className="mt-0.5 text-xs text-zinc-500">
              Visualize <code className="text-zinc-400">/flush</code>,{" "}
              <code className="text-zinc-400">/remember</code>, and{" "}
              <code className="text-zinc-400">/dream</code> across workspaces
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void load()}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-4 sm:p-6">
        {error ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {loading && !snap ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-sm text-zinc-400">
            Scanning memory store…
          </div>
        ) : null}

        {snap ? <HealthBar health={snap.health} /> : null}

        <section className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
          <div className="flex items-center gap-1 rounded-lg bg-zinc-950 p-0.5">
            {(
              [
                ["timeline", "Timeline"],
                ["workspaces", "Workspaces"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  tab === id
                    ? "bg-zinc-800 text-zinc-50"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-zinc-800" />

          <label className="flex items-center gap-2 text-xs text-zinc-400">
            Workspace
            <select
              value={workspaceFilter ?? ""}
              onChange={(e) => setWorkspaceFilter(e.target.value || null)}
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-200"
            >
              <option value="">All</option>
              <option value="global">Global</option>
              {(snap?.workspaces ?? []).map((w) => (
                <option key={w.id} value={w.id}>
                  {w.slug}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap items-center gap-1.5">
            {ALL_TYPES.map((t) => {
              const on = typeFilters.has(t);
              const c = EVENT_COLORS[t];
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleType(t)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide transition ${
                    on
                      ? `${c.bg} ${c.text} ${c.border}`
                      : "border-zinc-800 bg-transparent text-zinc-600"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          <span className="ml-auto text-[11px] text-zinc-600">
            {filteredEvents.length} event
            {filteredEvents.length === 1 ? "" : "s"}
            {snap
              ? ` · scanned ${new Date(snap.generatedAt).toLocaleTimeString()}`
              : null}
          </span>
        </section>

        <div
          className={`grid flex-1 gap-4 ${
            selectedEvent ? "lg:grid-cols-[1fr_360px]" : "grid-cols-1"
          }`}
        >
          <div className="min-w-0 space-y-4">
            {tab === "timeline" ? (
              <Timeline
                events={filteredEvents}
                selectedId={selectedEvent?.id ?? null}
                onSelect={setSelectedEvent}
              />
            ) : (
              <WorkspaceGrid
                workspaces={snap?.workspaces ?? []}
                selectedId={workspaceFilter}
                onSelect={(id) => {
                  setWorkspaceFilter(id);
                  if (id) setTab("timeline");
                }}
              />
            )}

            {snap ? (
              <MemoryPanel
                global={snap.global}
                workspaces={snap.workspaces}
                focusWorkspaceId={
                  workspaceFilter && workspaceFilter !== "global"
                    ? workspaceFilter
                    : null
                }
              />
            ) : null}
          </div>

          {selectedEvent ? (
            <div className="min-h-[480px] overflow-hidden rounded-xl border border-zinc-800 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)]">
              <EventDetail
                key={selectedEvent.id}
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
              />
            </div>
          ) : null}
        </div>
      </main>

      <footer className="border-t border-zinc-900 px-4 py-3 text-center text-[11px] text-zinc-600">
        Read-only observer of{" "}
        <code className="text-zinc-500">~/.grok/memory</code> · never writes ·
        bind 127.0.0.1 · no cloud required
      </footer>
    </div>
  );
}
