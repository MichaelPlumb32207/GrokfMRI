import type { MemoryEvent, MemoryEventType } from "./memory";

export const SCAN_TYPES: MemoryEventType[] = [
  "flush",
  "session_end",
  "remember",
  "dream",
  "unknown",
];

/** SVG-friendly hex matching dashboard type chips (emerald / sky / violet / amber / zinc). */
export const EVENT_HEX: Record<MemoryEventType, string> = {
  flush: "#34d399",
  session_end: "#38bdf8",
  remember: "#a78bfa",
  dream: "#fbbf24",
  unknown: "#71717a",
};

export type DayCounts = Record<MemoryEventType, number> & { total: number };

export interface ScanDayBucket {
  /** YYYY-MM-DD or "unknown" */
  day: string;
  counts: DayCounts;
}

export interface WorkspaceSignal {
  workspaceId: string;
  workspaceLabel: string;
  total: number;
  byType: Record<MemoryEventType, number>;
  /** 0–1 relative to busiest workspace in the set */
  intensity: number;
}

export interface HourBucket {
  /** 0–23 UTC */
  hour: number;
  counts: DayCounts;
}

export interface ScanSeries {
  days: ScanDayBucket[];
  hours: HourBucket[];
  maxDayTotal: number;
  maxHourTotal: number;
  totalEvents: number;
  byType: Record<MemoryEventType, number>;
  workspaceSignals: WorkspaceSignal[];
  dayRangeLabel: string;
}

function emptyCounts(): DayCounts {
  return {
    flush: 0,
    session_end: 0,
    remember: 0,
    dream: 0,
    unknown: 0,
    total: 0,
  };
}

export function dayKeyFromTimestamp(iso: string | null): string {
  if (!iso) return "unknown";
  const d = iso.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  return "unknown";
}

function eachDayInclusive(start: string, end: string): string[] {
  if (start === "unknown" || end === "unknown") return [];
  const out: string[] = [];
  const cur = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  if (Number.isNaN(cur.getTime()) || Number.isNaN(last.getTime())) return [];
  while (cur <= last) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

/**
 * Aggregate filtered events into day stacks + workspace signal lanes.
 * Fills calendar gaps between first and last dated event (cap 90 days).
 */
export function hourFromTimestamp(iso: string | null): number | null {
  if (!iso) return null;
  const m = iso.match(/T(\d{2}):/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  if (Number.isNaN(h) || h < 0 || h > 23) return null;
  return h;
}

export function buildScanSeries(events: MemoryEvent[]): ScanSeries {
  const byDay = new Map<string, DayCounts>();
  const byHour = new Map<number, DayCounts>();
  const byType = emptyCounts();
  const byWorkspace = new Map<
    string,
    { label: string; byType: DayCounts }
  >();

  for (const ev of events) {
    const day = dayKeyFromTimestamp(ev.timestamp);
    const dayBucket = byDay.get(day) ?? emptyCounts();
    dayBucket[ev.type] += 1;
    dayBucket.total += 1;
    byDay.set(day, dayBucket);

    const hour = hourFromTimestamp(ev.timestamp);
    if (hour != null) {
      const hourBucket = byHour.get(hour) ?? emptyCounts();
      hourBucket[ev.type] += 1;
      hourBucket.total += 1;
      byHour.set(hour, hourBucket);
    }

    byType[ev.type] += 1;
    byType.total += 1;

    const ws = byWorkspace.get(ev.workspaceId) ?? {
      label: ev.workspaceLabel,
      byType: emptyCounts(),
    };
    ws.byType[ev.type] += 1;
    ws.byType.total += 1;
    byWorkspace.set(ev.workspaceId, ws);
  }

  const dated = [...byDay.keys()]
    .filter((d) => d !== "unknown")
    .sort();

  let dayKeys: string[];
  if (dated.length === 0) {
    dayKeys = byDay.has("unknown") ? ["unknown"] : [];
  } else {
    const filled = eachDayInclusive(dated[0], dated[dated.length - 1]);
    // Cap long empty ranges: if span > 90, only show days that have data + edges
    if (filled.length > 90) {
      dayKeys = dated;
    } else {
      dayKeys = filled;
    }
    if (byDay.has("unknown")) dayKeys.push("unknown");
  }

  const days: ScanDayBucket[] = dayKeys.map((day) => ({
    day,
    counts: byDay.get(day) ?? emptyCounts(),
  }));

  const maxDayTotal = days.reduce((m, d) => Math.max(m, d.counts.total), 0);

  const hours: HourBucket[] = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    counts: byHour.get(hour) ?? emptyCounts(),
  }));
  const maxHourTotal = hours.reduce((m, h) => Math.max(m, h.counts.total), 0);

  const maxWs = Math.max(
    0,
    ...[...byWorkspace.values()].map((w) => w.byType.total),
  );

  const workspaceSignals: WorkspaceSignal[] = [...byWorkspace.entries()]
    .map(([workspaceId, v]) => ({
      workspaceId,
      workspaceLabel: v.label,
      total: v.byType.total,
      byType: {
        flush: v.byType.flush,
        session_end: v.byType.session_end,
        remember: v.byType.remember,
        dream: v.byType.dream,
        unknown: v.byType.unknown,
      },
      intensity: maxWs > 0 ? v.byType.total / maxWs : 0,
    }))
    .sort((a, b) => b.total - a.total);

  let dayRangeLabel = "No dated events";
  if (dated.length === 1) dayRangeLabel = dated[0];
  else if (dated.length > 1) {
    dayRangeLabel = `${dated[0]} → ${dated[dated.length - 1]}`;
  } else if (byDay.has("unknown")) {
    dayRangeLabel = "Undated events only";
  }

  return {
    days,
    hours,
    maxDayTotal,
    maxHourTotal,
    totalEvents: byType.total,
    byType: {
      flush: byType.flush,
      session_end: byType.session_end,
      remember: byType.remember,
      dream: byType.dream,
      unknown: byType.unknown,
    },
    workspaceSignals,
    dayRangeLabel,
  };
}
