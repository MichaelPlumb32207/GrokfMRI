import type { MemoryEventType } from "./memory";

export const EVENT_COLORS: Record<
  MemoryEventType,
  { bg: string; text: string; border: string; label: string }
> = {
  flush: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-300",
    border: "border-emerald-500/40",
    label: "flush",
  },
  session_end: {
    bg: "bg-sky-500/15",
    text: "text-sky-300",
    border: "border-sky-500/40",
    label: "session-end",
  },
  remember: {
    bg: "bg-violet-500/15",
    text: "text-violet-300",
    border: "border-violet-500/40",
    label: "remember",
  },
  dream: {
    bg: "bg-amber-500/15",
    text: "text-amber-300",
    border: "border-amber-500/40",
    label: "dream",
  },
  unknown: {
    bg: "bg-zinc-500/15",
    text: "text-zinc-300",
    border: "border-zinc-500/40",
    label: "unknown",
  },
};

export function formatTimestamp(iso: string | null | undefined): string {
  if (!iso) return "Unknown time";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return iso;
  }
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function relativeDay(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}
