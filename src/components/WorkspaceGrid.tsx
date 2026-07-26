import type { WorkspaceInfo } from "@/lib/memory";
import { formatBytes, formatTimestamp } from "@/lib/format";

export function WorkspaceGrid({
  workspaces,
  selectedId,
  onSelect,
}: {
  workspaces: WorkspaceInfo[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  if (workspaces.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-8 text-center text-sm text-zinc-400">
        No workspace memory directories found. Enable Grok memory and run a
        session inside a project to create{" "}
        <code className="text-zinc-300">~/.grok/memory/&lt;slug&gt;-&lt;hash&gt;/</code>
        .
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {workspaces.map((ws) => {
        const selected = selectedId === ws.id;
        return (
          <button
            key={ws.id}
            type="button"
            onClick={() => onSelect(selected ? null : ws.id)}
            className={`rounded-xl border p-4 text-left transition ${
              selected
                ? "border-emerald-500/50 bg-emerald-500/10"
                : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-600"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-zinc-100">
                  {ws.slug}
                  <span className="ml-1 font-mono text-xs font-normal text-zinc-500">
                    {ws.hash8}
                  </span>
                </div>
                {ws.projectPath ? (
                  <div className="mt-0.5 truncate text-[11px] text-zinc-500">
                    {ws.projectPath}
                  </div>
                ) : null}
              </div>
              {ws.isEmpty ? (
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase text-zinc-400">
                  empty
                </span>
              ) : null}
              {ws.isNoisy ? (
                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] uppercase text-amber-300">
                  noisy
                </span>
              ) : null}
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
              <div>
                <dt className="text-zinc-500">Flushes</dt>
                <dd className="font-medium text-emerald-300">{ws.flushCount}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Session logs</dt>
                <dd className="font-medium text-zinc-200">
                  {ws.pendingSessionLogs}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">MEMORY</dt>
                <dd className="font-medium text-zinc-200">
                  {formatBytes(ws.memoryBytes)}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Index</dt>
                <dd className="font-medium text-zinc-200">
                  {ws.hasIndex ? "yes" : "no"}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-zinc-500">Last activity</dt>
                <dd className="font-medium text-zinc-300">
                  {formatTimestamp(ws.lastActivity)}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-zinc-500">Last flush</dt>
                <dd className="font-medium text-zinc-300">
                  {ws.lastFlush ? formatTimestamp(ws.lastFlush) : "—"}
                </dd>
              </div>
            </dl>
          </button>
        );
      })}
    </div>
  );
}
