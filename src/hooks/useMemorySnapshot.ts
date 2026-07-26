"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  MemoryEvent,
  MemoryEventType,
  ObservatorySnapshot,
} from "@/lib/memory";

const ALL_TYPES: MemoryEventType[] = [
  "flush",
  "session_end",
  "remember",
  "dream",
  "unknown",
];

export function useMemorySnapshot() {
  const [snap, setSnap] = useState<ObservatorySnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [workspaceFilter, setWorkspaceFilter] = useState<string | null>(null);
  const [typeFilters, setTypeFilters] = useState<Set<MemoryEventType>>(
    () => new Set(ALL_TYPES),
  );

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

  const filteredEvents: MemoryEvent[] = useMemo(() => {
    if (!snap) return [];
    return snap.events.filter((e) => {
      if (workspaceFilter && e.workspaceId !== workspaceFilter) return false;
      if (!typeFilters.has(e.type)) return false;
      return true;
    });
  }, [snap, workspaceFilter, typeFilters]);

  const toggleType = useCallback((t: MemoryEventType) => {
    setTypeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }, []);

  return {
    snap,
    error,
    loading,
    load,
    workspaceFilter,
    setWorkspaceFilter,
    typeFilters,
    toggleType,
    filteredEvents,
    allTypes: ALL_TYPES,
  };
}
