import { DONATION_LINKS, DONATIONS } from "@/lib/donations";

/** Compact support line for dashboard footers. */
export function SupportFooter() {
  return (
    <div className="mx-auto max-w-7xl space-y-1 px-4 py-3 text-center text-[11px] text-zinc-600 sm:px-6">
      <p>
        Read-only observer of{" "}
        <code className="text-zinc-500">~/.grok/memory</code> · never writes ·
        bind 127.0.0.1 · no cloud required
      </p>
      <p className="text-zinc-500">
        Like it?{" "}
        <span className="text-zinc-400">Support GrokfMRI</span>
        {" · "}
        <a
          href={DONATION_LINKS.btcUri}
          className="text-emerald-500/80 hover:text-emerald-400"
        >
          BTC
        </a>
        {" · "}
        <a
          href={DONATION_LINKS.lightningUri}
          className="text-emerald-500/80 hover:text-emerald-400"
        >
          Lightning
        </a>
        {" · "}
        <a
          href={DONATION_LINKS.cashAppUrl}
          className="text-emerald-500/80 hover:text-emerald-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          Cash App {DONATIONS.cashApp}
        </a>
      </p>
    </div>
  );
}
