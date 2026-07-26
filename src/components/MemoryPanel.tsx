"use client";

import { Suspense, use, useMemo, useState } from "react";
import type { GlobalMemoryInfo, WorkspaceInfo } from "@/lib/memory";

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

function FilePreview({ relativePath }: { relativePath: string }) {
  const result = use(getFilePromise(relativePath));
  if (result.error) {
    return <p className="text-xs text-red-400">{result.error}</p>;
  }
  return (
    <pre className="max-h-72 overflow-auto rounded-lg border border-zinc-800 bg-black/40 p-3 text-[11px] leading-relaxed text-zinc-300 whitespace-pre-wrap">
      {result.content || "(empty)"}
    </pre>
  );
}

export function MemoryPanel({
  global,
  workspaces,
  focusWorkspaceId,
}: {
  global: GlobalMemoryInfo | null;
  workspaces: WorkspaceInfo[];
  focusWorkspaceId: string | null;
}) {
  const options = useMemo(
    () => [
      {
        id: "global",
        label: "Global MEMORY.md",
        path: global?.relativePath ?? "MEMORY.md",
      },
      ...workspaces.map((w) => ({
        id: w.id,
        label: `${w.slug} MEMORY.md`,
        path: w.relativeMemoryPath,
      })),
    ],
    [global?.relativePath, workspaces],
  );

  const defaultId =
    focusWorkspaceId && options.some((o) => o.id === focusWorkspaceId)
      ? focusWorkspaceId
      : (options[0]?.id ?? "global");

  const [manualId, setManualId] = useState<string | null>(null);
  // When focus changes from parent, prefer it unless user picked manually after.
  // Reset manual when focusWorkspaceId changes by keying manual against focus.
  const selected =
    manualId && options.some((o) => o.id === manualId) ? manualId : defaultId;

  const opt = options.find((o) => o.id === selected);

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 p-3">
        <h2 className="text-sm font-semibold text-zinc-200">
          Curated MEMORY (read-only)
        </h2>
        <select
          value={selected}
          onChange={(e) => setManualId(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-200"
        >
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="p-3">
        {opt?.path ? (
          <Suspense
            fallback={<p className="text-xs text-zinc-500">Loading…</p>}
          >
            <FilePreview key={opt.path} relativePath={opt.path} />
          </Suspense>
        ) : (
          <p className="text-xs text-zinc-500">No MEMORY file selected</p>
        )}
      </div>
    </section>
  );
}
