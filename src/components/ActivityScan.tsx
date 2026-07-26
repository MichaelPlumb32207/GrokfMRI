"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import type { MemoryEvent, MemoryEventType } from "@/lib/memory";
import {
  buildScanSeries,
  EVENT_HEX,
  SCAN_TYPES,
  type ScanDayBucket,
} from "@/lib/scan-aggregate";
import { EVENT_COLORS } from "@/lib/format";

export type ActivityScanSize = "compact" | "default" | "full";

export function ActivityScan({
  events,
  size = "default",
  showChrome = true,
  onExpand,
  onRequestFullscreen,
  fullPageHref,
}: {
  events: MemoryEvent[];
  size?: ActivityScanSize;
  showChrome?: boolean;
  onExpand?: () => void;
  onRequestFullscreen?: () => void;
  /** Pass null to hide the /scan link (e.g. already on that page). Default: /scan */
  fullPageHref?: string | null;
}) {
  const scanHref = fullPageHref === null ? null : (fullPageHref ?? "/scan");
  const series = useMemo(() => buildScanSeries(events), [events]);
  const [hover, setHover] = useState<{
    day: string;
    x: number;
    y: number;
  } | null>(null);
  const gradientId = useId().replace(/:/g, "");

  const chartH =
    size === "compact" ? 120 : size === "full" ? 320 : 200;
  const chartPad = { top: 16, right: 12, bottom: 36, left: 36 };
  const width = size === "full" ? 960 : size === "compact" ? 640 : 720;
  const innerW = width - chartPad.left - chartPad.right;
  const innerH = chartH - chartPad.top - chartPad.bottom;

  const barGap = series.days.length > 40 ? 1 : series.days.length > 20 ? 2 : 4;
  const barW =
    series.days.length === 0
      ? 0
      : Math.max(3, (innerW - barGap * (series.days.length - 1)) / series.days.length);

  const hoveredBucket: ScanDayBucket | null = hover
    ? (series.days.find((d) => d.day === hover.day) ?? null)
    : null;

  return (
    <section
      className={`rounded-xl border border-zinc-800 bg-zinc-900/60 ${
        size === "full" ? "p-5" : "p-4"
      }`}
    >
      {showChrome ? (
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                aria-hidden
              />
              <h2
                className={`font-semibold tracking-wide text-zinc-100 ${
                  size === "compact" ? "text-sm" : "text-sm"
                }`}
              >
                Activity scan
              </h2>
            </div>
            <p className="mt-0.5 text-[11px] text-zinc-500">
              {series.totalEvents === 0
                ? "No events in current filter — empty scan is healthy"
                : `${series.totalEvents} event${series.totalEvents === 1 ? "" : "s"} · ${series.dayRangeLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {SCAN_TYPES.map((t) => {
              const n = series.byType[t];
              if (n === 0 && series.totalEvents > 0) return null;
              const c = EVENT_COLORS[t];
              return (
                <span
                  key={t}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${c.bg} ${c.text} ${c.border}`}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: EVENT_HEX[t] }}
                  />
                  {c.label}
                  {series.totalEvents > 0 ? (
                    <span className="opacity-70">{n}</span>
                  ) : null}
                </span>
              );
            })}
            {onExpand ? (
              <button
                type="button"
                onClick={onExpand}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-[11px] text-zinc-300 hover:border-zinc-500 hover:text-zinc-100"
              >
                Expand
              </button>
            ) : null}
            {onRequestFullscreen ? (
              <button
                type="button"
                onClick={onRequestFullscreen}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-[11px] text-zinc-300 hover:border-zinc-500 hover:text-zinc-100"
              >
                Full screen
              </button>
            ) : null}
            {scanHref ? (
              <Link
                href={scanHref}
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-300 hover:border-emerald-400/50"
              >
                Open /scan
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      {series.days.length === 0 ? (
        <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-lg border border-dashed border-zinc-800 bg-zinc-950/50 text-xs text-zinc-500">
          <div
            className="grokfmri-scan-line pointer-events-none absolute inset-y-0 w-px bg-emerald-400/70 shadow-[0_0_12px_2px_rgba(52,211,153,0.45)]"
            aria-hidden
          />
          Quiet field — flush or remember something, then refresh
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-lg">
          {/* Clinical grid backdrop */}
          <div
            className="pointer-events-none absolute inset-0 rounded-lg opacity-40"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(39,39,42,0.9) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(39,39,42,0.9) 1px, transparent 1px)
              `,
              backgroundSize: "24px 24px",
            }}
          />
          {/* Sweeping scan line (respects prefers-reduced-motion) */}
          <div
            className="grokfmri-scan-line pointer-events-none absolute inset-y-2 z-[1] w-px bg-gradient-to-b from-transparent via-emerald-400/90 to-transparent shadow-[0_0_14px_3px_rgba(52,211,153,0.35)]"
            style={{ left: 0 }}
            aria-hidden
          />
          <svg
            viewBox={`0 0 ${width} ${chartH}`}
            className="relative w-full"
            role="img"
            aria-label="Stacked bar chart of memory events by day and type"
            onMouseLeave={() => setHover(null)}
          >
            <defs>
              <linearGradient id={`scan-glow-${gradientId}`} x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Y axis ticks */}
            {[0, 0.5, 1].map((frac) => {
              const y = chartPad.top + innerH * (1 - frac);
              const val =
                series.maxDayTotal === 0
                  ? 0
                  : Math.round(series.maxDayTotal * frac);
              return (
                <g key={frac}>
                  <line
                    x1={chartPad.left}
                    x2={width - chartPad.right}
                    y1={y}
                    y2={y}
                    stroke="#27272a"
                    strokeDasharray={frac === 0 ? undefined : "3 4"}
                  />
                  <text
                    x={chartPad.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    fill="#71717a"
                    fontSize="10"
                    fontFamily="ui-monospace, monospace"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Soft scan field */}
            <rect
              x={chartPad.left}
              y={chartPad.top}
              width={innerW}
              height={innerH}
              fill={`url(#scan-glow-${gradientId})`}
              opacity={0.35}
            />

            {series.days.map((bucket, i) => {
              const x = chartPad.left + i * (barW + barGap);
              let yCursor = chartPad.top + innerH;
              const scale =
                series.maxDayTotal > 0 ? innerH / series.maxDayTotal : 0;
              const segments: {
                type: MemoryEventType;
                h: number;
                y: number;
              }[] = [];

              for (const t of SCAN_TYPES) {
                const n = bucket.counts[t];
                if (n <= 0) continue;
                const h = Math.max(n * scale, n > 0 ? 2 : 0);
                yCursor -= h;
                segments.push({ type: t, h, y: yCursor });
              }

              const labelEvery =
                series.days.length > 21
                  ? 7
                  : series.days.length > 12
                    ? 2
                    : 1;
              const showLabel =
                i % labelEvery === 0 || i === series.days.length - 1;

              return (
                <g
                  key={bucket.day}
                  onMouseEnter={(e) => {
                    const rect = (
                      e.currentTarget.ownerSVGElement as SVGSVGElement
                    ).getBoundingClientRect();
                    setHover({
                      day: bucket.day,
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                  }}
                  onMouseMove={(e) => {
                    const rect = (
                      e.currentTarget.ownerSVGElement as SVGSVGElement
                    ).getBoundingClientRect();
                    setHover({
                      day: bucket.day,
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                  }}
                >
                  {/* Hit area */}
                  <rect
                    x={x}
                    y={chartPad.top}
                    width={barW}
                    height={innerH}
                    fill="transparent"
                  />
                  {bucket.counts.total === 0 ? (
                    <line
                      x1={x + barW / 2}
                      x2={x + barW / 2}
                      y1={chartPad.top + innerH - 4}
                      y2={chartPad.top + innerH}
                      stroke="#3f3f46"
                      strokeWidth={1}
                    />
                  ) : (
                    segments.map((seg) => (
                      <rect
                        key={seg.type}
                        x={x}
                        y={seg.y}
                        width={barW}
                        height={seg.h}
                        fill={EVENT_HEX[seg.type]}
                        opacity={hover?.day === bucket.day ? 1 : 0.88}
                        rx={barW > 6 ? 1.5 : 0.5}
                        style={{
                          filter:
                            hover?.day === bucket.day
                              ? `drop-shadow(0 0 4px ${EVENT_HEX[seg.type]}88)`
                              : undefined,
                        }}
                      />
                    ))
                  )}
                  {showLabel ? (
                    <text
                      x={x + barW / 2}
                      y={chartH - 12}
                      textAnchor="middle"
                      fill="#52525b"
                      fontSize="9"
                      fontFamily="ui-monospace, monospace"
                    >
                      {bucket.day === "unknown"
                        ? "?"
                        : bucket.day.slice(5)}
                    </text>
                  ) : null}
                </g>
              );
            })}

            {/* Subtle baseline */}
            <line
              x1={chartPad.left}
              x2={width - chartPad.right}
              y1={chartPad.top + innerH}
              y2={chartPad.top + innerH}
              stroke="#3f3f46"
            />
          </svg>

          {hover && hoveredBucket ? (
            <div
              className="pointer-events-none absolute z-10 min-w-[140px] rounded-lg border border-zinc-700 bg-zinc-950/95 px-2.5 py-2 text-[11px] shadow-xl"
              style={{
                left: Math.min(hover.x + 12, 280),
                top: Math.max(8, hover.y - 8),
              }}
            >
              <div className="font-mono text-zinc-300">
                {hoveredBucket.day === "unknown"
                  ? "Undated"
                  : hoveredBucket.day}
              </div>
              <div className="mt-1 space-y-0.5">
                {SCAN_TYPES.filter((t) => hoveredBucket.counts[t] > 0).map(
                  (t) => (
                    <div
                      key={t}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="flex items-center gap-1.5 text-zinc-400">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: EVENT_HEX[t] }}
                        />
                        {EVENT_COLORS[t].label}
                      </span>
                      <span className="font-mono text-zinc-200">
                        {hoveredBucket.counts[t]}
                      </span>
                    </div>
                  ),
                )}
                {hoveredBucket.counts.total === 0 ? (
                  <span className="text-zinc-600">No activity</span>
                ) : (
                  <div className="mt-1 border-t border-zinc-800 pt-1 font-mono text-zinc-500">
                    total {hoveredBucket.counts.total}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Workspace signal lanes */}
      {series.workspaceSignals.length > 0 && size !== "compact" ? (
        <div className="mt-4 space-y-2 border-t border-zinc-800/80 pt-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Workspace signal
          </div>
          <ul className="space-y-1.5">
            {series.workspaceSignals.map((ws) => (
              <li
                key={ws.workspaceId}
                className="grid grid-cols-[100px_1fr_2rem] items-center gap-2 text-xs sm:grid-cols-[140px_1fr_2rem]"
              >
                <span className="truncate text-zinc-400">
                  {ws.workspaceLabel}
                </span>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-950 ring-1 ring-zinc-800">
                  <div
                    className="flex h-full"
                    style={{ width: `${Math.max(4, ws.intensity * 100)}%` }}
                  >
                    {SCAN_TYPES.map((t) => {
                      const n = ws.byType[t];
                      if (!n || ws.total === 0) return null;
                      return (
                        <div
                          key={t}
                          style={{
                            width: `${(n / ws.total) * 100}%`,
                            background: EVENT_HEX[t],
                            opacity: 0.9,
                          }}
                          title={`${EVENT_COLORS[t].label}: ${n}`}
                        />
                      );
                    })}
                  </div>
                </div>
                <span className="text-right font-mono text-[11px] text-zinc-500">
                  {ws.total}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

/** Full-viewport overlay for expanded / browser-fullscreen scan. */
export function ActivityScanOverlay({
  events,
  open,
  onClose,
}: {
  events: MemoryEvent[];
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-zinc-950/95 p-4 backdrop-blur-sm sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Activity scan expanded"
    >
      <div className="mx-auto mb-3 flex w-full max-w-6xl items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-400/80">
            Expanded scan
          </p>
          <p className="text-xs text-zinc-500">
            Esc to close · filters follow main dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/scan"
            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300"
          >
            Full page /scan
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800"
          >
            Close
          </button>
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl flex-1 overflow-auto">
        <ActivityScan
          events={events}
          size="full"
          showChrome
          fullPageHref="/scan"
        />
      </div>
    </div>
  );
}
