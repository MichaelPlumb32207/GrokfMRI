import { describe, expect, it } from "vitest";
import type { MemoryEvent } from "./memory";
import { buildScanSeries, dayKeyFromTimestamp } from "./scan-aggregate";

function ev(
  partial: Partial<MemoryEvent> & Pick<MemoryEvent, "id" | "type">,
): MemoryEvent {
  return {
    timestamp: null,
    workspaceId: "ws",
    workspaceLabel: "Ws",
    path: "/tmp",
    relativePath: "x",
    title: "t",
    excerpt: "",
    headings: [],
    ...partial,
  };
}

describe("dayKeyFromTimestamp", () => {
  it("extracts YYYY-MM-DD", () => {
    expect(dayKeyFromTimestamp("2026-07-26T16:01:43Z")).toBe("2026-07-26");
  });
  it("unknown for null", () => {
    expect(dayKeyFromTimestamp(null)).toBe("unknown");
  });
});

describe("buildScanSeries", () => {
  it("returns empty series for no events", () => {
    const s = buildScanSeries([]);
    expect(s.days).toEqual([]);
    expect(s.hours).toHaveLength(24);
    expect(s.hours.every((h) => h.counts.total === 0)).toBe(true);
    expect(s.totalEvents).toBe(0);
    expect(s.maxDayTotal).toBe(0);
    expect(s.workspaceSignals).toEqual([]);
  });

  it("stacks types per day and fills gaps", () => {
    const s = buildScanSeries([
      ev({
        id: "1",
        type: "flush",
        timestamp: "2026-07-25T10:00:00Z",
        workspaceId: "fetch-1",
        workspaceLabel: "Fetch",
      }),
      ev({
        id: "2",
        type: "remember",
        timestamp: "2026-07-27T10:00:00Z",
        workspaceId: "fetch-1",
        workspaceLabel: "Fetch",
      }),
      ev({
        id: "3",
        type: "session_end",
        timestamp: "2026-07-27T12:00:00Z",
        workspaceId: "g-1",
        workspaceLabel: "GrokfMRI",
      }),
    ]);
    expect(s.days.map((d) => d.day)).toEqual([
      "2026-07-25",
      "2026-07-26",
      "2026-07-27",
    ]);
    expect(s.days[0].counts.flush).toBe(1);
    expect(s.days[1].counts.total).toBe(0); // gap day
    expect(s.days[2].counts.total).toBe(2);
    expect(s.byType.flush).toBe(1);
    expect(s.byType.remember).toBe(1);
    expect(s.byType.session_end).toBe(1);
    expect(s.workspaceSignals).toHaveLength(2);
    expect(s.workspaceSignals[0].total).toBeGreaterThanOrEqual(
      s.workspaceSignals[1].total,
    );
    // 10:00 UTC twice, 12:00 once
    expect(s.hours[10].counts.total).toBe(2);
    expect(s.hours[12].counts.total).toBe(1);
    expect(s.maxHourTotal).toBe(2);
  });
});
