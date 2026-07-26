"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { MemoryEventType, ObservatorySnapshot } from "@/lib/memory";
import { ActivityScan, ActivityScanOverlay } from "./ActivityScan";
import { EVENT_COLORS } from "@/lib/format";

const ALL_TYPES: MemoryEventType[] = [
  "flush",
  "session_end",
  "remember",
  "dream",
  "unknown",
];

export function ScanPageClient() {
  const [snap, setSnap] = useState<ObservatorySnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [workspaceFilter, setWorkspaceFilter] = useState<string | null>(null);
  const [typeFilters, setTypeFilters] = useState<Set<MemoryEventType>>(
    () => new Set(ALL_TYPES),
  );
  const [expanded, setExpanded] = useState(false);

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

  const requestBrowserFullscreen = useCallback(() => {
    setExpanded(true);
    requestAnimationFrame(() => {
      void document.documentElement.requestFullscreen?.().catch(() => {});
    });
  }, []);

  const closeExpanded = useCallback(() => {
    setExpanded(false);
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href="/"
              className="text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-400/80 hover:text-emerald-300"
            >
              ← GrokfMRI
            </Link>
            <h1 className="mt-1 text-xl font-semibold tracking-tight">
              Activity scan
            </h1>
            <p className="text-xs text-zinc-500">
              Stacked daily signal by event type · workspace lanes · same
              palette as the observatory
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-4 sm:p-6">
        {error ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <section className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
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
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${
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
          </span>
        </section>

        {loading && !snap ? (
          <div className="rounded-xl border border-zinc-800 p-10 text-center text-sm text-zinc-500">
            Scanning…
          </div>
        ) : (
          <ActivityScan
            events={filteredEvents}
            size="full"
            onExpand={() => setExpanded(true)}
            onRequestFullscreen={requestBrowserFullscreen}
            fullPageHref={null}
          />
        )}
      </main>

      <ActivityScanOverlay
        events={filteredEvents}
        open={expanded}
        onClose={closeExpanded}
      />
    </div>
  );
}
