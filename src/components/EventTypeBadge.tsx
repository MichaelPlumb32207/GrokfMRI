import type { MemoryEventType } from "@/lib/memory";
import { EVENT_COLORS } from "@/lib/format";

export function EventTypeBadge({
  type,
  confidence,
}: {
  type: MemoryEventType;
  confidence?: string;
}) {
  const c = EVENT_COLORS[type] ?? EVENT_COLORS.unknown;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${c.bg} ${c.text} ${c.border}`}
    >
      {c.label}
      {confidence && type === "dream" ? (
        <span className="opacity-70 normal-case">· {confidence}</span>
      ) : null}
    </span>
  );
}
