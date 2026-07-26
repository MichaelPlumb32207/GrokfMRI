"use client";

import { Suspense, use } from "react";
import type { MemoryEvent } from "@/lib/memory";
import { formatTimestamp } from "@/lib/format";
import { EventTypeBadge } from "./EventTypeBadge";

type FileResult = { content?: string; error?: string };

const fileCache = new Map<string, Promise<FileResult>>();

function loadFile(relativePath: string): Promise<FileResult> {
  return fetch(`/api/files?path=${encodeURIComponent(relativePath)}`).then(
    async (res) => {
      const data = await res.json();
      if (!res.ok) return { error: (data.error as string) || res.statusText };
      return { content: data.content as string };
    },
  );
}

function getFilePromise(relativePath: string): Promise<FileResult> {
  let p = fileCache.get(relativePath);
  if (!p) {
    p = loadFile(relativePath);
    fileCache.set(relativePath, p);
  }
  return p;
}

function FileBody({
  relativePath,
  maxClass = "max-h-80",
}: {
  relativePath: string;
  maxClass?: string;
}) {
  const result = use(getFilePromise(relativePath));
  if (result.error) {
    return <p className="text-xs text-red-400">{result.error}</p>;
  }
  return (
    <pre
      className={`${maxClass} overflow-auto rounded-lg border border-zinc-800 bg-black/40 p-3 text-[11px] leading-relaxed text-zinc-300 whitespace-pre-wrap`}
    >
      {result.content}
    </pre>
  );
}

export function EventDetail({
  event,
  onClose,
  /** full = below main columns; drawer = narrow side panel (legacy) */
  layout = "full",
}: {
  event: MemoryEvent;
  onClose: () => void;
  layout?: "full" | "drawer";
}) {
  const topics = (event.meta?.topics as string[] | undefined) ?? [];
  const decisions = (event.meta?.decisions as string[] | undefined) ?? [];
  const notes = (event.meta?.notes as string[] | undefined) ?? [];
  const isFull = layout === "full";

  return (
    <section
      className={
        isFull
          ? "rounded-xl border border-zinc-800 bg-zinc-950"
          : "flex h-full flex-col border-l border-zinc-800 bg-zinc-950"
      }
      aria-label="Event detail"
    >
      <div className="flex items-start justify-between gap-2 border-b border-zinc-800 p-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <EventTypeBadge type={event.type} confidence={event.confidence} />
            <span className="text-[11px] text-zinc-500">
              {formatTimestamp(event.timestamp)} · {event.workspaceLabel}
            </span>
          </div>
          <h2 className="mt-2 text-base font-semibold text-zinc-50">
            {event.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
        >
          Close
        </button>
      </div>

      <div
        className={
          isFull
            ? "grid gap-4 p-4 text-sm lg:grid-cols-3"
            : "flex-1 space-y-4 overflow-y-auto p-4 text-sm"
        }
      >
        <div className="space-y-4">
          <Field label="Path (under memory root)">
            <code className="break-all text-xs text-emerald-300/90">
              {event.relativePath}
            </code>
          </Field>
          <Field label="Local absolute">
            <code className="break-all text-xs text-zinc-500">{event.path}</code>
          </Field>
          {event.sessionId ? (
            <Field label="Session ID">
              <code className="text-xs text-zinc-300">{event.sessionId}</code>
            </Field>
          ) : null}
          {event.headings.length > 0 ? (
            <Field label="Headings">
              <div className="flex flex-wrap gap-1">
                {event.headings.map((h) => (
                  <span
                    key={h}
                    className="rounded bg-zinc-800 px-1.5 py-0.5 text-[11px] text-zinc-300"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </Field>
          ) : null}
          <Field label="Excerpt">
            <p className="text-zinc-400">{event.excerpt || "—"}</p>
          </Field>
        </div>

        <div className="space-y-4">
          {topics.length > 0 ? (
            <Field label="Topics">
              <ul className="list-disc space-y-1 pl-4 text-zinc-300">
                {topics.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </Field>
          ) : null}
          {decisions.length > 0 ? (
            <Field label="Key decisions">
              <ul className="list-disc space-y-1 pl-4 text-zinc-300">
                {decisions.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </Field>
          ) : null}
          {notes.length > 0 ? (
            <Field label="Notes">
              <ul className="list-disc space-y-1 pl-4 text-zinc-300">
                {notes.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </Field>
          ) : null}
          {topics.length === 0 &&
          decisions.length === 0 &&
          notes.length === 0 ? (
            <p className="text-xs text-zinc-600">
              No structured topics/decisions parsed for this event.
            </p>
          ) : null}
        </div>

        <div className={isFull ? "min-w-0 lg:col-span-1" : ""}>
          <Field label="Raw file">
            <Suspense
              fallback={<p className="text-xs text-zinc-500">Loading…</p>}
            >
              <FileBody
                relativePath={event.relativePath}
                maxClass={isFull ? "max-h-72" : "max-h-80"}
              />
            </Suspense>
          </Field>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      {children}
    </div>
  );
}
