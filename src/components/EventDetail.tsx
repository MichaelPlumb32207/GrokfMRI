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

function FileBody({ relativePath }: { relativePath: string }) {
  const result = use(getFilePromise(relativePath));
  if (result.error) {
    return <p className="text-xs text-red-400">{result.error}</p>;
  }
  return (
    <pre className="max-h-80 overflow-auto rounded-lg border border-zinc-800 bg-black/40 p-3 text-[11px] leading-relaxed text-zinc-300 whitespace-pre-wrap">
      {result.content}
    </pre>
  );
}

export function EventDetail({
  event,
  onClose,
}: {
  event: MemoryEvent;
  onClose: () => void;
}) {
  const topics = (event.meta?.topics as string[] | undefined) ?? [];
  const decisions = (event.meta?.decisions as string[] | undefined) ?? [];
  const notes = (event.meta?.notes as string[] | undefined) ?? [];

  return (
    <aside className="flex h-full flex-col border-l border-zinc-800 bg-zinc-950">
      <div className="flex items-start justify-between gap-2 border-b border-zinc-800 p-4">
        <div className="min-w-0">
          <EventTypeBadge type={event.type} confidence={event.confidence} />
          <h2 className="mt-2 text-base font-semibold text-zinc-50">
            {event.title}
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            {formatTimestamp(event.timestamp)} · {event.workspaceLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
        >
          Close
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4 text-sm">
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
        <Field label="Excerpt">
          <p className="text-zinc-400">{event.excerpt || "—"}</p>
        </Field>

        <Field label="Raw file">
          <Suspense
            fallback={<p className="text-xs text-zinc-500">Loading…</p>}
          >
            <FileBody relativePath={event.relativePath} />
          </Suspense>
        </Field>
      </div>
    </aside>
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
